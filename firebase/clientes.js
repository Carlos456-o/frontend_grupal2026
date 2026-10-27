// Funciones para la colección "clientes" de Firebase.
// Campos: nombre, telefono, email, vehiculos ([{ placa, modelo }]), fecha_registro
// Dentro de la app usamos "correo" y "fechaRegistro" (texto "AAAA-MM-DD").

import { collection, getDocs, getDoc, updateDoc, doc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import { timestampATexto } from './utilidades';

export function aCliente(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    nombre: datos.nombre ?? '',
    telefono: datos.telefono ?? '',
    correo: datos.email ?? '',
    vehiculos: datos.vehiculos ?? [],
    fechaRegistro: timestampATexto(datos.fecha_registro),
  };
}

export async function obtenerClientes() {
  const resultado = await getDocs(collection(db, 'clientes'));
  return resultado.docs.map(aCliente).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// Escucha en tiempo real la lista de clientes, para que el admin vea el
// nombre de un cliente recién registrado sin recargar la pantalla.
// Devuelve una función para dejar de escuchar.
export function escucharClientes(alCambiar) {
  return onSnapshot(
    collection(db, 'clientes'),
    (resultado) => alCambiar(resultado.docs.map(aCliente).sort((a, b) => a.nombre.localeCompare(b.nombre))),
    () => {} // si se cae la conexión no hacemos nada; Firebase reintenta solo
  );
}

export async function obtenerCliente(id) {
  const documento = await getDoc(doc(db, 'clientes', id));
  return documento.exists() ? aCliente(documento) : null;
}

export async function agregarVehiculo(clienteId, vehiculo) {
  await updateDoc(doc(db, 'clientes', clienteId), { vehiculos: arrayUnion(vehiculo) });
}
