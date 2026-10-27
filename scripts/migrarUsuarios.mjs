// Migración de cuentas: de "usuarios" con contraseña en Firestore a Firebase Authentication.
// Se corre UNA sola vez, ANTES de publicar las reglas nuevas (firestore.rules).
//
//   node scripts/migrarUsuarios.mjs            -> modo prueba: solo muestra qué haría
//   node scripts/migrarUsuarios.mjs --aplicar  -> hace la migración
//
// Por cada documento viejo de "usuarios" (los que tienen el campo "contrasena"):
//   1. Crea la cuenta en Firebase Authentication:
//        - correo: el del cliente si tiene uno válido; si no (empleados, admin
//          o clientes sin correo), uno provisional TELEFONO@sin-correo.divinonino.app
//        - contraseña: la misma. Si tiene menos de 6 caracteres (mínimo de
//          Firebase) se completa con ceros: "1234" -> "123400".
//   2. Crea usuarios/{uid} (sin contraseña) y telefonos/{telefono}.
//   3. Borra el documento viejo, que tenía la contraseña a la vista.
// Lee la configuración de Firebase del archivo .env del proyecto.

import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc, writeBatch } from 'firebase/firestore';
import { initializeAuth, inMemoryPersistence, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const APLICAR = process.argv.includes('--aplicar');
const DOMINIO_PROVISIONAL = 'sin-correo.divinonino.app';

// --- Configuración desde .env ---
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((linea) => linea.includes('=') && !linea.trim().startsWith('#'))
    .map((linea) => {
      const i = linea.indexOf('=');
      return [linea.slice(0, i).trim(), linea.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    })
);
const app = initializeApp({
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);
const auth = initializeAuth(app, { persistence: inMemoryPersistence });

const esCorreo = (texto) => /^\S+@\S+\.\S+$/.test(texto ?? '');
const limpiarTelefono = (t) => String(t ?? '').replace(/[\s-]/g, '');

async function crearOEntrar(correo, contrasena) {
  try {
    return (await createUserWithEmailAndPassword(auth, correo, contrasena)).user.uid;
  } catch (e) {
    if (e.code !== 'auth/email-already-in-use') throw e;
    // Ya existe (por ejemplo, si el script se corrió antes a medias): entramos para saber su uid.
    return (await signInWithEmailAndPassword(auth, correo, contrasena)).user.uid;
  }
}

const viejos = (await getDocs(collection(db, 'usuarios'))).docs.filter((d) => 'contrasena' in d.data());
console.log(`${APLICAR ? 'MIGRANDO' : 'MODO PRUEBA (no cambia nada)'}: ${viejos.length} cuentas viejas\n`);

const resultados = [];
for (const viejo of viejos) {
  const datos = viejo.data();
  const telefono = limpiarTelefono(datos.telefono);
  const rol = datos.rol;

  let correo = null;
  if (rol === 'cliente' && datos.perfil_id) {
    const cliente = await getDoc(doc(db, 'clientes', datos.perfil_id));
    const email = cliente.exists() ? String(cliente.data().email ?? '').trim().toLowerCase() : '';
    if (esCorreo(email)) correo = email;
  }
  const provisional = !correo;
  if (provisional) correo = `${telefono}@${DOMINIO_PROVISIONAL}`;

  const original = String(datos.contrasena ?? '').trim();
  const contrasena = original.length >= 6 ? original : original.padEnd(6, '0');
  const fila = {
    telefono,
    rol,
    correo,
    correoProvisional: provisional ? 'sí' : 'no',
    contrasena: contrasena === original ? '(igual)' : `cambia a ${contrasena}`,
    estado: 'pendiente',
  };

  if (APLICAR) {
    try {
      const uid = await crearOEntrar(correo, contrasena);
      const lote = writeBatch(db);
      lote.set(doc(db, 'usuarios', uid), {
        telefono,
        correo,
        rol,
        perfil_id: datos.perfil_id ?? null,
        fecha_registro: datos.fecha_registro ?? null,
      });
      lote.set(doc(db, 'telefonos', telefono), { correo, uid });
      if (rol !== 'cliente' && datos.perfil_id) {
        lote.set(doc(db, 'empleados', datos.perfil_id), { correo }, { merge: true });
      }
      lote.delete(viejo.ref);
      await lote.commit();
      await signOut(auth);
      fila.estado = 'migrada';
    } catch (e) {
      fila.estado = `ERROR: ${e.code ?? e.message}`;
    }
  }
  resultados.push(fila);
}

console.table(resultados);
if (!APLICAR) console.log('\nPara migrar de verdad: node scripts/migrarUsuarios.mjs --aplicar');
process.exit(0);
