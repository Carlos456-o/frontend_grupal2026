// Carga (o borra) en Firebase las citas simuladas del cubo OLAP.
//
// Solo toca la colección "citas". No crea usuarios ni cambia clientes,
// empleados ni servicios. Cada cita simulada lleva "simulado: true" y un id
// fijo ("simulada_sim0001"...), así que correrlo dos veces no duplica nada y
// se pueden borrar todas de un solo golpe sin tocar las citas reales.
//
// Uso (desde la carpeta del proyecto):
//   node scripts/citas_simuladas.mjs prueba <citas_simuladas.json>   -> revisa sin escribir nada
//   node scripts/citas_simuladas.mjs cargar <citas_simuladas.json>   -> sube las citas (pide cuenta de admin)
//   node scripts/citas_simuladas.mjs borrar                          -> borra solo las simuladas (pide cuenta de admin)
//
// El archivo JSON sale de la carpeta del cubo: cubo_olap_divino_nino/datos/citas_simuladas.json

import fs from 'node:fs';
import readline from 'node:readline';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  getFirestore, collection, doc, getDoc, getDocs, query, where, writeBatch, Timestamp,
} from 'firebase/firestore';

const LOTE = 20; // escrituras por lote (pequeño para no pasar los límites de las reglas)

// ---------- Configuración (la misma del .env de la app) ----------
function leerEnv() {
  const texto = fs.readFileSync(new URL('../.env', import.meta.url), 'utf8');
  const env = {};
  for (const linea of texto.split(/\r?\n/)) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}
const env = leerEnv();
const app = initializeApp({
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const auth = getAuth(app);

// ---------- Preguntas en la terminal ----------
function preguntar(texto, oculto = false) {
  return new Promise((resolver) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (oculto) {
      rl._writeToOutput = (s) => rl.output.write(s.includes(texto) ? s : s.replace(/[^\r\n]/g, '*'));
    }
    rl.question(texto, (respuesta) => {
      rl.close();
      if (oculto) process.stdout.write('\n');
      resolver(respuesta.trim());
    });
  });
}

// ---------- Inicio de sesión como administrador ----------
async function entrarComoAdmin() {
  const identificador = await preguntar('Correo o teléfono del administrador: ');
  const contrasena = await preguntar('Contraseña: ', true);

  let correo = identificador.toLowerCase();
  if (!identificador.includes('@')) {
    const telefono = await getDoc(doc(db, 'telefonos', identificador.replace(/[\s-]/g, '')));
    if (!telefono.exists()) throw new Error('Ese teléfono no está registrado.');
    correo = telefono.data().correo;
  }

  const credencial = await signInWithEmailAndPassword(auth, correo, contrasena);
  const cuenta = await getDoc(doc(db, 'usuarios', credencial.user.uid));
  if (cuenta.data()?.rol !== 'administrador') {
    await signOut(auth);
    throw new Error('Esa cuenta no es de administrador.');
  }
  console.log('Sesión iniciada como administrador.\n');
}

// ---------- Construcción de cada cita (igual que las crea la app) ----------
const COMENTARIOS = {
  5: ['Excelente servicio, quedó impecable.', 'Muy buena atención y rápido.', 'Todo perfecto, volveré.', ''],
  4: ['Buen trabajo.', 'Quedó bien, solo tardó un poco.', ''],
  3: ['Estuvo bien, pero se puede mejorar.', ''],
  2: ['Quedaron partes sin limpiar.'],
  1: ['No quedé conforme con el servicio.'],
};

const sumarMinutos = (hora, minutos) => {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const fechaUTC = (fechaISO, hora = '00:00') => {
  const [a, mes, d] = fechaISO.split('-').map(Number);
  const [h, m] = hora.split(':').map(Number);
  return Timestamp.fromDate(new Date(Date.UTC(a, mes - 1, d, h, m)));
};

function construirCita(s, numero, empleadoId, actividades) {
  const terminado = s.estado === 'terminado';
  const pasos = terminado
    ? actividades.map((nombre, i) => ({ nombre, hecho: true, hora: sumarMinutos(s.hora, 10 * (i + 1)) }))
    : [];

  const cita = {
    cliente_id: s.cliente_id,
    empleado_id: empleadoId,
    fecha: fechaUTC(s.fecha), // medianoche UTC, igual que textoATimestamp()
    hora: s.hora,
    estado: s.estado, // "terminado" o "cancelada"
    servicio: s.servicio,
    descuento: null,
    vehiculo: s.vehiculo,
    solicitud_especial: '',
    pasos,
    aviso_listo_visto: true, // para que a ningún cliente le salte el aviso de "tu carro está listo"
    simulado: true,
  };

  if (s.estrellas > 0) {
    const opciones = COMENTARIOS[s.estrellas];
    cita.calificacion = {
      estrellas: s.estrellas,
      comentario: opciones[numero % opciones.length],
      fecha: fechaUTC(s.fecha, sumarMinutos(s.hora, 120)),
    };
  }
  return cita;
}

const idDocumento = (s) => 'simulada_' + s.id.toLowerCase();

async function actividadesPorServicio() {
  const resultado = await getDocs(collection(db, 'servicios'));
  const mapa = {};
  resultado.docs.forEach((d) => (mapa[d.id] = d.data().actividades_incluidas ?? []));
  return mapa;
}

function leerSimuladas(archivo) {
  if (!archivo) throw new Error('Falta la ruta de citas_simuladas.json.');
  return JSON.parse(fs.readFileSync(archivo, 'utf8'));
}

async function escribirEnLotes(operaciones, accion) {
  let hechas = 0;
  for (let i = 0; i < operaciones.length; i += LOTE) {
    const lote = writeBatch(db);
    operaciones.slice(i, i + LOTE).forEach((op) => op(lote));
    await lote.commit();
    hechas += Math.min(LOTE, operaciones.length - i);
    process.stdout.write(`\r${accion}: ${hechas} de ${operaciones.length}`);
  }
  process.stdout.write('\n');
}

// ---------- Modos ----------
async function prueba(archivo) {
  const simuladas = leerSimuladas(archivo);
  const actividades = await actividadesPorServicio();
  const faltan = [...new Set(simuladas.map((s) => s.servicio.id))].filter((id) => !actividades[id]);
  if (faltan.length) throw new Error('Servicios que no existen en Firebase: ' + faltan.join(', '));

  const conteo = (campo) => simuladas.reduce((m, s) => ((m[s[campo]] = (m[s[campo]] ?? 0) + 1), m), {});
  console.log(`${simuladas.length} citas simuladas, del ${simuladas[0].fecha} al ${simuladas.at(-1).fecha}.`);
  console.log('Por estado:', conteo('estado'));
  console.log('Por empleado:', conteo('empleado'));
  console.log('\nEjemplo de cómo quedaría una cita en Firebase:');
  const ejemplo = simuladas.find((s) => s.estrellas > 0) ?? simuladas[0];
  console.log(idDocumento(ejemplo), JSON.stringify(
    construirCita(ejemplo, 0, '<id de ' + ejemplo.empleado + '>', actividades[ejemplo.servicio.id]), null, 2));
  console.log('\nNo se escribió nada. Para subirlas usa el modo "cargar".');
}

async function cargar(archivo) {
  const simuladas = leerSimuladas(archivo);
  await entrarComoAdmin();

  const [actividades, empleados, clientes, citas] = await Promise.all([
    actividadesPorServicio(),
    getDocs(collection(db, 'empleados')),
    getDocs(collection(db, 'clientes')),
    getDocs(collection(db, 'citas')),
  ]);

  const idEmpleado = Object.fromEntries(empleados.docs.map((d) => [d.data().nombre, d.id]));
  const idsClientes = new Set(clientes.docs.map((d) => d.id));
  const faltanEmpleados = [...new Set(simuladas.map((s) => s.empleado))].filter((n) => !idEmpleado[n]);
  const faltanClientes = [...new Set(simuladas.map((s) => s.cliente_id))].filter((id) => !idsClientes.has(id));
  const faltanServicios = [...new Set(simuladas.map((s) => s.servicio.id))].filter((id) => !actividades[id]);
  if (faltanEmpleados.length || faltanClientes.length || faltanServicios.length) {
    throw new Error('No coinciden con Firebase. Empleados: ' + faltanEmpleados.join(', ')
      + ' | Clientes: ' + faltanClientes.join(', ') + ' | Servicios: ' + faltanServicios.join(', '));
  }

  // Horas ocupadas por citas reales activas, para no chocar con ellas.
  const ocupadas = new Set();
  const yaCargadas = new Set();
  citas.docs.forEach((d) => {
    const c = d.data();
    if (c.simulado) yaCargadas.add(d.id);
    else if (c.estado !== 'cancelada' && c.fecha?.toDate) ocupadas.add(c.fecha.toDate().toISOString().slice(0, 10) + ' ' + c.hora);
  });

  const pendientes = [];
  let choques = 0;
  simuladas.forEach((s, i) => {
    if (yaCargadas.has(idDocumento(s))) return;
    if (ocupadas.has(s.fecha + ' ' + s.hora)) {
      choques++;
      return;
    }
    pendientes.push({ s, i });
  });

  console.log(`Citas en Firebase ahora: ${citas.size} (${yaCargadas.size} simuladas ya cargadas).`);
  console.log(`Se van a subir ${pendientes.length} citas simuladas.${choques ? ` Se saltan ${choques} porque esa hora ya la tiene una cita real.` : ''}`);
  if (pendientes.length === 0) return;

  const ok = await preguntar('Escribe SI para continuar: ');
  if (ok.toUpperCase() !== 'SI') {
    console.log('Cancelado. No se escribió nada.');
    return;
  }

  await escribirEnLotes(
    pendientes.map(({ s, i }) => (lote) => lote.set(
      doc(db, 'citas', idDocumento(s)),
      construirCita(s, i, idEmpleado[s.empleado], actividades[s.servicio.id]),
    )),
    'Subiendo',
  );
  console.log('Listo. Las citas simuladas ya están en Firebase.');
}

async function borrar() {
  await entrarComoAdmin();
  const resultado = await getDocs(query(collection(db, 'citas'), where('simulado', '==', true)));
  console.log(`Hay ${resultado.size} citas simuladas. Las citas reales no se tocan.`);
  if (resultado.size === 0) return;

  const ok = await preguntar('Escribe BORRAR para eliminarlas: ');
  if (ok.toUpperCase() !== 'BORRAR') {
    console.log('Cancelado. No se borró nada.');
    return;
  }
  await escribirEnLotes(resultado.docs.map((d) => (lote) => lote.delete(d.ref)), 'Borrando');
  console.log('Listo. Se borraron todas las citas simuladas.');
}

// ---------- Inicio ----------
const [modo, archivo] = process.argv.slice(2);
const modos = { prueba, cargar, borrar };

if (!modos[modo]) {
  console.log('Uso: node scripts/citas_simuladas.mjs prueba|cargar <citas_simuladas.json>');
  console.log('     node scripts/citas_simuladas.mjs borrar');
  process.exit(1);
}

try {
  await modos[modo](archivo);
} catch (e) {
  const mensaje = e.code === 'auth/invalid-credential' ? 'Usuario o contraseña incorrectos.' : e.message;
  console.error('\nError: ' + mensaje);
  process.exitCode = 1;
} finally {
  await signOut(auth).catch(() => {});
  process.exit();
}
