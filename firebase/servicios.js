// Funciones para las colecciones "servicios" y "catalogo" de Firebase.
//
// "servicios" tiene los datos reales de cada servicio:
//   nombre, descripcion, precio, duracion_min, actividades_incluidas (lista de textos)
// "catalogo" es la lista que se muestra al cliente; cada documento apunta a
// un servicio por su nombre:
//   nombre, descripcion, servicio
//
// Las "actividades" no tienen colección propia: son los textos de
// actividades_incluidas de todos los servicios.
//
// Dentro de la app usamos duracionMinutos y actividades para no tener
// que cambiar el nombre en todas las pantallas.

import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from './config';

const coleccionServicios = collection(db, 'servicios');
const coleccionCatalogo = collection(db, 'catalogo');

function aServicio(documento) {
  const datos = documento.data();
  return {
    id: documento.id,
    nombre: datos.nombre ?? '',
    descripcion: datos.descripcion ?? '',
    precio: datos.precio ?? 0,
    duracionMinutos: datos.duracion_min ?? null,
    actividades: datos.actividades_incluidas ?? [],
  };
}

export async function obtenerServicios() {
  const resultado = await getDocs(coleccionServicios);
  return resultado.docs.map(aServicio).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function obtenerServicio(id) {
  if (!id) return null;
  const documento = await getDoc(doc(db, 'servicios', id));
  return documento.exists() ? aServicio(documento) : null;
}

// El catálogo con los datos de su servicio (precio, duración, actividades).
// El "id" de cada elemento es el id del servicio, para poder agendarlo.
export async function obtenerCatalogo() {
  const [resultadoCatalogo, servicios] = await Promise.all([getDocs(coleccionCatalogo), obtenerServicios()]);
  return resultadoCatalogo.docs
    .map((documento) => {
      const datos = documento.data();
      const servicio = servicios.find((s) => s.nombre === datos.servicio);
      if (!servicio) return null;
      return { ...servicio, catalogoId: documento.id, nombre: datos.nombre ?? servicio.nombre };
    })
    .filter(Boolean)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// Lista de actividades sin repetir (a partir de una lista de servicios),
// con cuántos servicios la usan.
export function actividadesDe(servicios) {
  const conteo = {};
  servicios.forEach((s) => s.actividades.forEach((a) => (conteo[a] = (conteo[a] ?? 0) + 1)));
  return Object.keys(conteo)
    .sort((a, b) => a.localeCompare(b))
    .map((nombre) => ({ nombre, cantidadServicios: conteo[nombre] }));
}

function aDocumento({ nombre, descripcion, precio, duracionMinutos, actividades }) {
  return {
    nombre,
    descripcion,
    precio,
    duracion_min: duracionMinutos,
    actividades_incluidas: actividades,
  };
}

async function documentosCatalogoDe(nombreServicio) {
  const resultado = await getDocs(query(coleccionCatalogo, where('servicio', '==', nombreServicio)));
  return resultado.docs;
}

// Crea el servicio y su entrada en el catálogo, igual que los que ya existen.
export async function crearServicio(servicio) {
  const referencia = await addDoc(coleccionServicios, aDocumento(servicio));
  await addDoc(coleccionCatalogo, {
    nombre: servicio.nombre,
    servicio: servicio.nombre,
    descripcion: `Catálogo del servicio ${servicio.nombre}`,
  });
  return referencia.id;
}

// Si cambia el nombre, también se actualiza su entrada en el catálogo.
export async function actualizarServicio(id, nombreAnterior, servicio) {
  await updateDoc(doc(db, 'servicios', id), aDocumento(servicio));
  if (nombreAnterior !== servicio.nombre) {
    const entradas = await documentosCatalogoDe(nombreAnterior);
    await Promise.all(
      entradas.map((d) =>
        updateDoc(d.ref, {
          nombre: servicio.nombre,
          servicio: servicio.nombre,
          descripcion: `Catálogo del servicio ${servicio.nombre}`,
        })
      )
    );
  }
}

// Borra el servicio y su entrada en el catálogo.
export async function eliminarServicio(servicio) {
  await deleteDoc(doc(db, 'servicios', servicio.id));
  const entradas = await documentosCatalogoDe(servicio.nombre);
  await Promise.all(entradas.map((d) => deleteDoc(d.ref)));
}
