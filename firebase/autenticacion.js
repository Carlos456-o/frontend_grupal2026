// Cuentas de la app con Firebase Authentication (HF01, HF02, HF04).
//
// Quién es quién:
//   - Firebase Authentication guarda el correo y la contraseña de cada
//     persona (la contraseña ya NO se guarda en Firestore).
//   - "usuarios/{uid}" en Firestore guarda su rol ("cliente", "empleado" o
//     "administrador"), su teléfono, su correo y el id de su perfil.
//     El uid es el id que Firebase Authentication le da a la cuenta.
//   - "telefonos/{telefono}" guarda el correo de cada teléfono, para poder
//     iniciar sesión escribiendo el teléfono en vez del correo.
//
// El rol nunca lo elige la persona: se lee de "usuarios/{uid}" al entrar,
// y las reglas de Firestore (archivo firestore.rules) lo usan para decidir
// qué puede leer y cambiar cada quien.

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail,
  EmailAuthProvider,
  signOut,
  deleteUser,
} from 'firebase/auth';
import { doc, getDoc, writeBatch, collection, serverTimestamp } from 'firebase/firestore';
import { auth, authSecundaria, db } from './config';
import { obtenerCliente } from './clientes';
import { obtenerEmpleado } from './empleados';
import { timestampATexto } from './utilidades';

export const LARGO_MINIMO_CONTRASENA = 6; // lo que exige Firebase Authentication

// Errores que las pantallas saben explicar.
export const ERRORES = {
  datosIncorrectos: 'datos-incorrectos',
  telefonoEnUso: 'telefono-en-uso',
  correoEnUso: 'correo-en-uso',
  correoInvalido: 'correo-invalido',
  contrasenaCorta: 'contrasena-corta',
  demasiadosIntentos: 'demasiados-intentos',
  sinConexion: 'sin-conexion',
  sinCuenta: 'sin-cuenta',
};

// Traduce los códigos de Firebase a los nuestros.
function traducirError(e) {
  const codigo = e?.code ?? '';
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'].includes(codigo)) {
    return ERRORES.datosIncorrectos;
  }
  if (codigo === 'auth/email-already-in-use') return ERRORES.correoEnUso;
  if (codigo === 'auth/weak-password') return ERRORES.contrasenaCorta;
  if (codigo === 'auth/too-many-requests') return ERRORES.demasiadosIntentos;
  if (codigo === 'auth/network-request-failed') return ERRORES.sinConexion;
  return e?.message && Object.values(ERRORES).includes(e.message) ? e.message : ERRORES.sinConexion;
}

function lanzar(codigo) {
  throw new Error(codigo);
}

export function esCorreo(texto) {
  return /^\S+@\S+\.\S+$/.test(texto);
}

// Quita espacios y guiones del teléfono: "8812-3456" -> "88123456"
export function limpiarTelefono(telefono) {
  return telefono.replace(/[\s-]/g, '');
}

// Busca el correo de un teléfono (para entrar o recuperar con el teléfono).
async function correoDeTelefono(telefono) {
  return (await correosDeTelefono(telefono))?.correo ?? null;
}

// Igual, pero también devuelve el correo "pendiente": el que la persona
// pidió poner desde su perfil y quizás ya confirmó en el enlace.
async function correosDeTelefono(telefono) {
  const documento = await getDoc(doc(db, 'telefonos', limpiarTelefono(telefono)));
  if (!documento.exists()) return null;
  return { correo: documento.data().correo, pendiente: documento.data().correo_pendiente ?? null };
}

export async function telefonoRegistrado(telefono) {
  return Boolean(await correoDeTelefono(telefono));
}

// Arma el usuario de la sesión a partir de su documento en "usuarios/{uid}".
async function cargarUsuario(uid) {
  const documento = await getDoc(doc(db, 'usuarios', uid));
  if (!documento.exists()) return null;
  const datos = documento.data();
  const rol = datos.rol === 'administrador' ? 'admin' : datos.rol;
  const perfil = rol === 'cliente' ? await obtenerCliente(datos.perfil_id) : await obtenerEmpleado(datos.perfil_id);

  // Si cambió su correo desde el perfil (y ya lo confirmó en el enlace),
  // lo copiamos a Firestore para que también pueda entrar con el nuevo.
  const correoActual = auth.currentUser?.email;
  if (correoActual && correoActual !== datos.correo) {
    await actualizarCorreoGuardado(uid, datos, correoActual).catch(() => {});
  }

  return {
    id: uid,
    telefono: datos.telefono ?? '',
    correo: correoActual ?? datos.correo ?? '',
    rol,
    perfilId: datos.perfil_id,
    fechaRegistro: timestampATexto(datos.fecha_registro),
    perfil,
  };
}

async function actualizarCorreoGuardado(uid, datos, correo) {
  const lote = writeBatch(db);
  lote.update(doc(db, 'usuarios', uid), { correo, correo_pendiente: null });
  if (datos.telefono) lote.set(doc(db, 'telefonos', datos.telefono), { correo, uid });
  if (datos.rol === 'cliente' && datos.perfil_id) lote.update(doc(db, 'clientes', datos.perfil_id), { email: correo });
  await lote.commit();
}

// Inicia sesión con correo o teléfono y contraseña. Devuelve el usuario
// con su rol y su perfil. Si algo no coincide lanza ERRORES.datosIncorrectos
// (el mismo error para todo, para no revelar si la cuenta existe).
export async function iniciarSesion(identificador, contrasena) {
  const texto = identificador.trim();
  try {
    let credencial;
    if (esCorreo(texto)) {
      credencial = await signInWithEmailAndPassword(auth, texto.toLowerCase(), contrasena);
    } else {
      const correos = await correosDeTelefono(texto);
      if (!correos) lanzar(ERRORES.datosIncorrectos);
      try {
        credencial = await signInWithEmailAndPassword(auth, correos.correo, contrasena);
      } catch (e) {
        // Si cambió su correo y ya lo confirmó, la cuenta ahora usa el nuevo.
        if (!correos.pendiente) throw e;
        credencial = await signInWithEmailAndPassword(auth, correos.pendiente, contrasena);
      }
    }
    const usuario = await cargarUsuario(credencial.user.uid);
    if (!usuario?.perfil) {
      await signOut(auth);
      lanzar(ERRORES.sinCuenta);
    }
    return usuario;
  } catch (e) {
    throw new Error(traducirError(e));
  }
}

export async function cerrarSesion() {
  try {
    await signOut(auth);
  } catch (e) {
    // nada que hacer
  }
}

// Registro de un cliente nuevo: crea la cuenta en Firebase Authentication
// y sus documentos en "clientes", "usuarios" y "telefonos".
export async function registrarCliente({ nombre, telefono, correo, contrasena }) {
  const tel = limpiarTelefono(telefono);
  const email = correo.trim().toLowerCase();
  try {
    if (await telefonoRegistrado(tel)) lanzar(ERRORES.telefonoEnUso);
    const credencial = await createUserWithEmailAndPassword(auth, email, contrasena);
    const uid = credencial.user.uid;

    const lote = writeBatch(db);
    const cliente = doc(collection(db, 'clientes'));
    lote.set(cliente, { nombre, telefono: tel, email, vehiculos: [], fecha_registro: serverTimestamp() });
    lote.set(doc(db, 'usuarios', uid), {
      telefono: tel,
      correo: email,
      rol: 'cliente',
      perfil_id: cliente.id,
      fecha_registro: serverTimestamp(),
    });
    lote.set(doc(db, 'telefonos', tel), { correo: email, uid });
    try {
      await lote.commit();
    } catch (errorGuardando) {
      // Si no se pudieron guardar los datos, borramos la cuenta recién
      // creada para que pueda volver a intentarlo con el mismo correo.
      await deleteUser(credencial.user).catch(() => {});
      throw errorGuardando;
    }

    // Lo dejamos fuera: entra desde la pantalla de inicio de sesión.
    await signOut(auth);
  } catch (e) {
    throw new Error(traducirError(e));
  }
}

// El admin crea la cuenta de un empleado (con la "copia" secundaria, para
// no perder su propia sesión). Devuelve el id del empleado.
export async function crearCuentaEmpleado({ nombre, telefono, correo, contrasena, puesto }) {
  const tel = limpiarTelefono(telefono);
  const email = correo.trim().toLowerCase();
  try {
    if (await telefonoRegistrado(tel)) lanzar(ERRORES.telefonoEnUso);
    const credencial = await createUserWithEmailAndPassword(authSecundaria, email, contrasena);
    const uid = credencial.user.uid;
    await signOut(authSecundaria);

    // Los documentos los escribe el admin (las reglas solo se lo permiten a él).
    const lote = writeBatch(db);
    const empleado = doc(collection(db, 'empleados'));
    lote.set(empleado, { nombre, telefono: tel, rol: puesto, correo: email });
    lote.set(doc(db, 'usuarios', uid), {
      telefono: tel,
      correo: email,
      rol: 'empleado',
      perfil_id: empleado.id,
      fecha_registro: serverTimestamp(),
    });
    lote.set(doc(db, 'telefonos', tel), { correo: email, uid });
    await lote.commit();
    return empleado.id;
  } catch (e) {
    throw new Error(traducirError(e));
  }
}

// Recuperar contraseña: Firebase le manda al correo de la cuenta un enlace
// para elegir una nueva. Acepta correo o teléfono. Devuelve el correo
// oculto ("an***@gmail.com") para mostrarlo.
export async function enviarCorreoRecuperacion(identificador) {
  const texto = identificador.trim();
  try {
    const correo = esCorreo(texto) ? texto.toLowerCase() : await correoDeTelefono(texto);
    if (!correo) lanzar(ERRORES.sinCuenta);
    await sendPasswordResetEmail(auth, correo);
    return ocultarCorreo(correo);
  } catch (e) {
    throw new Error(traducirError(e));
  }
}

// Cambiar la contraseña desde el perfil: Firebase pide confirmar la actual.
export async function cambiarContrasena(actual, nueva) {
  const usuario = auth.currentUser;
  if (!usuario) lanzar(ERRORES.sinCuenta);
  try {
    await reauthenticateWithCredential(usuario, EmailAuthProvider.credential(usuario.email, actual));
    await updatePassword(usuario, nueva);
  } catch (e) {
    throw new Error(traducirError(e));
  }
}

// Cambiar el correo desde el perfil: Firebase manda un enlace al correo
// NUEVO y solo lo cambia cuando la persona lo abre. La próxima vez que
// entre, cargarUsuario copia el correo nuevo a Firestore.
export async function cambiarCorreo(contrasena, nuevoCorreo) {
  const usuario = auth.currentUser;
  if (!usuario) lanzar(ERRORES.sinCuenta);
  if (!esCorreo(nuevoCorreo.trim())) lanzar(ERRORES.correoInvalido);
  const correo = nuevoCorreo.trim().toLowerCase();
  try {
    await reauthenticateWithCredential(usuario, EmailAuthProvider.credential(usuario.email, contrasena));
    await verifyBeforeUpdateEmail(usuario, correo);
    // Lo anotamos como "pendiente" para que pueda seguir entrando con su
    // teléfono apenas confirme el enlace (ver iniciarSesion).
    const cuenta = await getDoc(doc(db, 'usuarios', usuario.uid));
    const telefono = cuenta.data()?.telefono;
    const lote = writeBatch(db);
    lote.update(doc(db, 'usuarios', usuario.uid), { correo_pendiente: correo });
    if (telefono) lote.update(doc(db, 'telefonos', telefono), { correo_pendiente: correo });
    await lote.commit();
  } catch (e) {
    throw new Error(traducirError(e));
  }
}

// true si el correo es de los provisionales que puso la migración
// (empleados o admin que no tenían correo): con esos no se puede recuperar.
export function esCorreoProvisional(correo) {
  return (correo ?? '').endsWith('@sin-correo.divinonino.app');
}

// "andrea.salazar@gmail.com" -> "an***@gmail.com"
export function ocultarCorreo(correo) {
  const [usuario, dominio] = correo.split('@');
  if (!dominio) return correo;
  return `${usuario.slice(0, 2)}***@${dominio}`;
}

// Mensaje para mostrar en pantalla según el error.
export function mensajeDeError(codigo) {
  switch (codigo) {
    case ERRORES.datosIncorrectos:
      return 'Correo, teléfono o contraseña incorrectos.';
    case ERRORES.telefonoEnUso:
      return 'Ya existe una cuenta con ese teléfono.';
    case ERRORES.correoEnUso:
      return 'Ya existe una cuenta con ese correo.';
    case ERRORES.correoInvalido:
      return 'Revisa el correo: no parece válido.';
    case ERRORES.contrasenaCorta:
      return `La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`;
    case ERRORES.demasiadosIntentos:
      return 'Demasiados intentos. Espera unos minutos y vuelve a probar.';
    case ERRORES.sinCuenta:
      return 'No encontramos una cuenta con esos datos.';
    default:
      return 'No se pudo conectar con el servidor. Intenta de nuevo.';
  }
}
