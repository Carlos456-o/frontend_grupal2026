// Funciones para la colección "citas" de Firebase.
// Campos:
//   cliente_id, empleado_id, fecha (Timestamp), hora ("08:30"),
//   estado ("pendiente", "confirmada", "en_proceso", "terminado" o "cancelada"),
//   servicio ({ id, nombre, precio }), vehiculo ({ placa, modelo }), solicitud_especial
// Dentro de la app usamos clienteId, empleadoId, solicitudEspecial y la
// fecha como texto "AAAA-MM-DD".

import { collection, getDocs, getDoc, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
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
  };
}

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

export async function crearCita({ clienteId, empleadoId, fecha, hora, servicio, vehiculo, solicitudEspecial }) {
  const referencia = await addDoc(coleccion, {
    cliente_id: clienteId,
    empleado_id: empleadoId ?? null,
    fecha: textoATimestamp(fecha),
    hora,
    estado: 'pendiente',
    servicio: { id: servicio.id, nombre: servicio.nombre, precio: servicio.precio },
    vehiculo,
    solicitud_especial: solicitudEspecial ?? '',
  });
  return referencia.id;
}

export async function cambiarEstadoCita(id, estado) {
  await updateDoc(doc(db, 'citas', id), { estado });
}
