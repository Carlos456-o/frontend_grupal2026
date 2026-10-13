// Funciones para la colección "empleados" de Firebase.
// Campos: nombre, telefono, rol ("lavador", "recepcionista", "cajero" o "supervisor")

import { collection, getDocs, getDoc, addDoc, doc } from 'firebase/firestore';
import { db } from './config';

export function aEmpleado(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    nombre: datos.nombre ?? '',
    telefono: datos.telefono ?? '',
    rol: datos.rol ?? '',
  };
}

export async function obtenerEmpleados() {
  const resultado = await getDocs(collection(db, 'empleados'));
  return resultado.docs.map(aEmpleado).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function obtenerEmpleado(id) {
  if (!id) return null;
  const documento = await getDoc(doc(db, 'empleados', id));
  return documento.exists() ? aEmpleado(documento) : null;
}

export async function crearEmpleado({ nombre, telefono, rol }) {
  const referencia = await addDoc(collection(db, 'empleados'), { nombre, telefono, rol });
  return referencia.id;
}
