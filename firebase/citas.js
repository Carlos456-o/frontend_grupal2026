// Funciones para la colección "citas" de Firebase.
// Campos:
//   cliente_id, empleado_id, fecha (Timestamp), hora ("08:30"),
//   estado ("pendiente", "confirmada", "en_proceso", "terminado" o "cancelada"),
//   servicio ({ id, nombre, precio }), vehiculo ({ placa, modelo }), solicitud_especial,
//   pasos ([{ nombre, hecho, hora }]) -> avance del lavado que marca el empleado
//   aviso_listo_visto (bool) -> false cuando la cita termina y el cliente aún
//                                no ha visto el aviso de "tu carro está listo"
//   calificacion ({ estrellas 1-5, comentario, fecha Timestamp }) -> la deja el cliente
// Dentro de la app usamos clienteId, empleadoId, solicitudEspecial y la
// fecha como texto "AAAA-MM-DD".
//
// CRUD completo:
//   Crear      -> crearCita
//   Leer       -> obtenerCitas, obtenerCita, obtenerCitasDeCliente/Empleado/Fecha
//   Actualizar -> actualizarCita (y sus atajos: reprogramarCita, asignarEmpleado,
//                 cambiarEstadoCita, guardarPasos)
//   Eliminar   -> eliminarCita

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { timestampATexto, textoATimestamp } from './utilidades';

const coleccion = collection(db, 'citas');

function aCita(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    clienteId: datos.cliente_id ?? '',
    empleadoId: datos.empleado_id ?? null,
    fecha: timestampATexto(datos.fecha),
    hora: datos.hora ?? '',
    estado: datos.estado ?? 'pendiente',
    servicio: datos.servicio ?? { id: '', nombre: '', precio: 0 },
    vehiculo: datos.vehiculo ?? { placa: '', modelo: '' },
    solicitudEspecial: datos.solicitud_especial ?? '',
    pasos: datos.pasos ?? [],
    // Las citas viejas no tienen este campo: las tomamos como ya vistas
    // para que no le salten avisos antiguos al cliente.
    avisoListoVisto: datos.aviso_listo_visto ?? true,
    calificacion: datos.calificacion
      ? {
          estrellas: datos.calificacion.estrellas ?? 0,
          comentario: datos.calificacion.comentario ?? '',
          fecha: timestampATexto(datos.calificacion.fecha),
        }
      : null,
  };
}

// Estados en los que la cita ya no ocupa su hora.
const ESTADOS_LIBRES = ['cancelada'];

function ordenarRecientesPrimero(citas) {
  return citas.sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1));
}

export async function obtenerCitas() {
  const resultado = await getDocs(coleccion);
  return ordenarRecientesPrimero(resultado.docs.map(aCita));
}

export async function obtenerCitasDeCliente(clienteId) {
  const resultado = await getDocs(query(coleccion, where('cliente_id', '==', clienteId)));
  return ordenarRecientesPrimero(resultado.docs.map(aCita));
}

export async function obtenerCitasDeEmpleado(empleadoId) {
  const resultado = await getDocs(query(coleccion, where('empleado_id', '==', empleadoId)));
  return ordenarRecientesPrimero(resultado.docs.map(aCita));
}

export async function obtenerCitasDeFecha(fechaISO) {
  const resultado = await getDocs(query(coleccion, where('fecha', '==', textoATimestamp(fechaISO))));
  return resultado.docs.map(aCita).sort((a, b) => (a.hora > b.hora ? 1 : -1));
}

export async function obtenerCita(id) {
  const documento = await getDoc(doc(db, 'citas', id));
  return documento.exists() ? aCita(documento) : null;
}

// Devuelve true si ya hay otra cita activa ese día a esa hora.
// "excluirId" sirve al reprogramar, para no chocar con la misma cita.
export async function horaOcupada(fecha, hora, excluirId = null) {
  const citasDelDia = await obtenerCitasDeFecha(fecha);
  return citasDelDia.some((c) => c.id !== excluirId && c.hora === hora && !ESTADOS_LIBRES.includes(c.estado));
}

// Lanza este error cuando la hora ya fue tomada por otra cita.
export const ERROR_HORA_OCUPADA = 'hora-ocupada';

export async function crearCita({ clienteId, empleadoId, fecha, hora, servicio, vehiculo, solicitudEspecial }) {
  if (await horaOcupada(fecha, hora)) throw new Error(ERROR_HORA_OCUPADA);
  const referencia = await addDoc(coleccion, {
    cliente_id: clienteId,
    empleado_id: empleadoId ?? null,
    fecha: textoATimestamp(fecha),
    hora,
    estado: 'pendiente',
    servicio: { id: servicio.id, nombre: servicio.nombre, precio: servicio.precio },
    vehiculo,
    solicitud_especial: solicitudEspecial ?? '',
    pasos: [],
  });
  return referencia.id;
}

// Actualiza solo los campos que se manden (con los nombres de la app),
// traduciéndolos a los nombres que usa Firebase.
export async function actualizarCita(id, cambios) {
  const datos = {};
  if (cambios.empleadoId !== undefined) datos.empleado_id = cambios.empleadoId;
  if (cambios.fecha !== undefined) datos.fecha = textoATimestamp(cambios.fecha);
  if (cambios.hora !== undefined) datos.hora = cambios.hora;
  if (cambios.estado !== undefined) datos.estado = cambios.estado;
  if (cambios.servicio !== undefined) {
    datos.servicio = { id: cambios.servicio.id, nombre: cambios.servicio.nombre, precio: cambios.servicio.precio };
  }
  if (cambios.vehiculo !== undefined) datos.vehiculo = { placa: cambios.vehiculo.placa, modelo: cambios.vehiculo.modelo };
  if (cambios.solicitudEspecial !== undefined) datos.solicitud_especial = cambios.solicitudEspecial;
  if (cambios.pasos !== undefined) datos.pasos = cambios.pasos;
  if (cambios.avisoListoVisto !== undefined) datos.aviso_listo_visto = cambios.avisoListoVisto;
  await updateDoc(doc(db, 'citas', id), datos);
}

// Cambia fecha/hora (y opcionalmente vehículo y solicitud). Vuelve a "pendiente"
// para que el negocio confirme el nuevo horario.
export async function reprogramarCita(id, { fecha, hora, vehiculo, solicitudEspecial }) {
  if (await horaOcupada(fecha, hora, id)) throw new Error(ERROR_HORA_OCUPADA);
  await actualizarCita(id, { fecha, hora, vehiculo, solicitudEspecial, estado: 'pendiente' });
}

export async function asignarEmpleado(id, empleadoId) {
  await actualizarCita(id, { empleadoId });
}

// Al terminar, dejamos el aviso como "no visto" para que al cliente le
// aparezca la notificación de que su carro está listo.
export async function cambiarEstadoCita(id, estado) {
  const cambios = { estado };
  if (estado === 'terminado') cambios.avisoListoVisto = false;
  await actualizarCita(id, cambios);
}

export async function marcarAvisoVisto(id) {
  await actualizarCita(id, { avisoListoVisto: true });
}

// Guarda la calificación del cliente (y de paso marca el aviso como visto).
export async function calificarCita(id, estrellas, comentario) {
  await updateDoc(doc(db, 'citas', id), {
    calificacion: { estrellas, comentario: comentario.trim(), fecha: serverTimestamp() },
    aviso_listo_visto: true,
  });
}

// Citas que ya fueron calificadas, las más recientes primero (para el admin).
export async function obtenerCalificaciones() {
  const citas = await obtenerCitas();
  return citas
    .filter((c) => c.calificacion)
    .sort((a, b) => (a.calificacion.fecha < b.calificacion.fecha ? 1 : -1));
}

// Escucha en tiempo real las citas de un cliente: "alCambiar" se llama con
// la lista cada vez que algo cambia en Firebase (por ejemplo, cuando el
// empleado marca la cita como terminada). Devuelve una función para dejar
// de escuchar.
export function escucharCitasDeCliente(clienteId, alCambiar) {
  return onSnapshot(
    query(coleccion, where('cliente_id', '==', clienteId)),
    (resultado) => alCambiar(resultado.docs.map(aCita)),
    () => {} // si se cae la conexión no hacemos nada; Firebase reintenta solo
  );
}

export async function guardarPasos(id, pasos) {
  await actualizarCita(id, { pasos });
}

export async function eliminarCita(id) {
  await deleteDoc(doc(db, 'citas', id));
}
