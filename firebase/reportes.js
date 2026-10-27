// Funciones para la colección "reportes" de Firebase (HF11 Reportar problema).
// Campos:
//   cliente_id, cliente_nombre, cliente_telefono,
//   tipo ("servicio", "cita", "app" u "otro"),
//   cita_id (opcional: la cita de la que trata el reporte),
//   descripcion, estado ("abierto" o "resuelto"),
//   respuesta (lo que contesta el negocio), fecha, fecha_respuesta (Timestamp)
//
// CRUD: crearReporte, obtenerReportes / escucharReportes /
//       escucharReportesDeCliente, responderReporte.

import { collection, getDocs, addDoc, updateDoc, doc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

const coleccion = collection(db, 'reportes');

export const TIPOS_REPORTE = [
  { clave: 'servicio', texto: 'Problema con el lavado' },
  { clave: 'cita', texto: 'Problema con mi cita' },
  { clave: 'app', texto: 'Falla en la app' },
  { clave: 'otro', texto: 'Otro' },
];

export function nombreTipoReporte(clave) {
  return TIPOS_REPORTE.find((t) => t.clave === clave)?.texto ?? 'Otro';
}

// Fecha y hora legibles: "26/10/2026 10:58". Mientras Firebase aún no
// confirma la hora del servidor, el valor llega vacío: mostramos "Ahora".
export function fechaHoraTexto(valor) {
  if (!valor?.toDate) return 'Ahora';
  const f = valor.toDate();
  const dos = (n) => String(n).padStart(2, '0');
  return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${f.getFullYear()} ${dos(f.getHours())}:${dos(f.getMinutes())}`;
}

function aReporte(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    clienteId: datos.cliente_id ?? '',
    clienteNombre: datos.cliente_nombre ?? '',
    clienteTelefono: datos.cliente_telefono ?? '',
    tipo: datos.tipo ?? 'otro',
    citaId: datos.cita_id ?? null,
    descripcion: datos.descripcion ?? '',
    estado: datos.estado === 'resuelto' ? 'resuelto' : 'abierto',
    respuesta: datos.respuesta ?? '',
    fecha: datos.fecha ?? null,
    fechaRespuesta: datos.fecha_respuesta ?? null,
  };
}

// Los más recientes primero (los recién creados, sin hora aún, arriba del todo).
function ordenarRecientesPrimero(reportes) {
  const milis = (r) => (r.fecha?.toMillis ? r.fecha.toMillis() : Number.MAX_SAFE_INTEGER);
  return reportes.sort((a, b) => milis(b) - milis(a));
}

export async function crearReporte({ clienteId, clienteNombre, clienteTelefono, tipo, citaId, descripcion }) {
  await addDoc(coleccion, {
    cliente_id: clienteId,
    cliente_nombre: clienteNombre ?? '',
    cliente_telefono: clienteTelefono ?? '',
    tipo,
    cita_id: citaId ?? null,
    descripcion,
    estado: 'abierto',
    respuesta: '',
    fecha: serverTimestamp(),
  });
}

export async function obtenerReportes() {
  const resultado = await getDocs(coleccion);
  return ordenarRecientesPrimero(resultado.docs.map(aReporte));
}

// Todos los reportes, en tiempo real (para el admin).
export function escucharReportes(alCambiar) {
  return onSnapshot(
    coleccion,
    (resultado) => alCambiar(ordenarRecientesPrimero(resultado.docs.map(aReporte))),
    () => {}
  );
}

// Los reportes de un cliente, en tiempo real (para que vea la respuesta en cuanto llega).
export function escucharReportesDeCliente(clienteId, alCambiar) {
  return onSnapshot(
    query(coleccion, where('cliente_id', '==', clienteId)),
    (resultado) => alCambiar(ordenarRecientesPrimero(resultado.docs.map(aReporte))),
    () => {}
  );
}

// El admin contesta y el reporte queda resuelto.
export async function responderReporte(id, respuesta) {
  await updateDoc(doc(db, 'reportes', id), {
    respuesta: respuesta.trim(),
    estado: 'resuelto',
    fecha_respuesta: serverTimestamp(),
  });
}
