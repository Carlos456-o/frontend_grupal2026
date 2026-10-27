// Funciones para la colección "promociones" de Firebase.
// Campos:
//   titulo, descripcion,
//   tipo ("porcentaje" o "monto"), valor (20 = 20 % o C$20 según el tipo),
//   servicio_id (null = aplica a todos los servicios), servicio_nombre,
//   fecha_inicio, fecha_fin (Timestamp), activa (bool), fecha_creacion
// Dentro de la app usamos servicioId, servicioNombre y las fechas como
// texto "AAAA-MM-DD".
//
// CRUD: crearPromocion, obtenerPromociones / escucharPromociones,
//       cambiarEstadoPromocion, eliminarPromocion.

import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { timestampATexto, textoATimestamp, hoyISO } from './utilidades';

const coleccion = collection(db, 'promociones');

function aPromocion(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    titulo: datos.titulo ?? '',
    descripcion: datos.descripcion ?? '',
    tipo: datos.tipo === 'monto' ? 'monto' : 'porcentaje',
    valor: Number(datos.valor) || 0,
    servicioId: datos.servicio_id ?? null,
    servicioNombre: datos.servicio_nombre ?? '',
    fechaInicio: timestampATexto(datos.fecha_inicio),
    fechaFin: timestampATexto(datos.fecha_fin),
    activa: datos.activa ?? true,
  };
}

// Las que terminan más tarde, primero.
function ordenar(promociones) {
  return promociones.sort((a, b) => (a.fechaFin < b.fechaFin ? 1 : -1));
}

export async function obtenerPromociones() {
  const resultado = await getDocs(coleccion);
  return ordenar(resultado.docs.map(aPromocion));
}

// Escucha en tiempo real las promociones. Devuelve una función para dejar de escuchar.
export function escucharPromociones(alCambiar) {
  return onSnapshot(
    coleccion,
    (resultado) => alCambiar(ordenar(resultado.docs.map(aPromocion))),
    () => {} // si se cae la conexión no hacemos nada; Firebase reintenta solo
  );
}

export async function crearPromocion({ titulo, descripcion, tipo, valor, servicioId, servicioNombre, fechaInicio, fechaFin }) {
  await addDoc(coleccion, {
    titulo,
    descripcion: descripcion ?? '',
    tipo,
    valor,
    servicio_id: servicioId ?? null,
    servicio_nombre: servicioNombre ?? '',
    fecha_inicio: textoATimestamp(fechaInicio),
    fecha_fin: textoATimestamp(fechaFin),
    activa: true,
    fecha_creacion: serverTimestamp(),
  });
}

export async function cambiarEstadoPromocion(id, activa) {
  await updateDoc(doc(db, 'promociones', id), { activa });
}

export async function eliminarPromocion(id) {
  await deleteDoc(doc(db, 'promociones', id));
}

// ---- Reglas de los descuentos (no tocan Firebase) ----

// "vigente", "programada" (aún no empieza), "vencida" o "pausada".
export function estadoPromocion(promocion, hoy = hoyISO()) {
  if (!promocion.activa) return 'pausada';
  if (hoy < promocion.fechaInicio) return 'programada';
  if (hoy > promocion.fechaFin) return 'vencida';
  return 'vigente';
}

export function promocionesVigentes(promociones) {
  return (promociones ?? []).filter((p) => estadoPromocion(p) === 'vigente');
}

// Cuántos córdobas descuenta una promoción sobre un precio (nunca más que el precio).
export function montoDescuento(promocion, precio) {
  const monto = promocion.tipo === 'porcentaje' ? Math.round((precio * promocion.valor) / 100) : promocion.valor;
  return Math.max(0, Math.min(monto, precio));
}

// La promoción vigente que más descuenta para un servicio, o null si no hay.
// Devuelve { promocion, monto, precioFinal }.
export function mejorDescuento(promociones, servicio) {
  if (!servicio) return null;
  let mejor = null;
  for (const promocion of promocionesVigentes(promociones)) {
    if (promocion.servicioId && promocion.servicioId !== servicio.id) continue;
    const monto = montoDescuento(promocion, servicio.precio);
    if (monto > 0 && (!mejor || monto > mejor.monto)) {
      mejor = { promocion, monto, precioFinal: servicio.precio - monto };
    }
  }
  return mejor;
}

// Texto corto del descuento: "20 % de descuento" o "C$50 de descuento".
export function textoDescuento(promocion) {
  return promocion.tipo === 'porcentaje' ? `${promocion.valor} % de descuento` : `C$${promocion.valor} de descuento`;
}

// "2026-10-31" -> "31/10/2026"
export function fechaCorta(fechaISO) {
  if (!fechaISO) return '';
  const [anio, mes, dia] = fechaISO.split('-');
  return `${dia}/${mes}/${anio}`;
}
