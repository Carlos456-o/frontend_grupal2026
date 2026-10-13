// Funciones para la colección "usuarios" de Firebase (inicio de sesión y registro).
// Campos: telefono, contrasena, rol ("cliente", "empleado" o "administrador"),
//         perfil_id (id en "clientes" o "empleados"), fecha_registro
// Dentro de la app el rol "administrador" se llama "admin".

import { collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { obtenerCliente } from './clientes';
import { obtenerEmpleado } from './empleados';
import { timestampATexto } from './utilidades';

const coleccion = collection(db, 'usuarios');

async function buscarPorTelefono(telefono) {
  const resultado = await getDocs(query(coleccion, where('telefono', '==', telefono)));
  return resultado.docs;
}

export async function telefonoRegistrado(telefono) {
  return (await buscarPorTelefono(telefono)).length > 0;
}

// Devuelve el usuario con su perfil (cliente o empleado), o null si el
// teléfono y la contraseña no coinciden.
export async function buscarUsuario(telefono, contrasena) {
  const documentos = await buscarPorTelefono(telefono);
  // Comparamos sin espacios en los extremos por si el dato se guardó con un espacio de más.
  const documento = documentos.find((d) => String(d.data().contrasena).trim() === contrasena.trim());
  if (!documento) return null;

  const datos = documento.data();
  const rol = datos.rol === 'administrador' ? 'admin' : datos.rol;
  const perfil = rol === 'cliente' ? await obtenerCliente(datos.perfil_id) : await obtenerEmpleado(datos.perfil_id);

  return {
    id: documento.id,
    telefono: datos.telefono,
    rol,
    perfilId: datos.perfil_id,
    fechaRegistro: timestampATexto(datos.fecha_registro),
    perfil,
  };
}

// Registra un cliente nuevo: crea su documento en "clientes" y su
// usuario en "usuarios" para que pueda iniciar sesión.
export async function registrarCliente({ nombre, telefono, correo, vehiculo, contrasena }) {
  const cliente = await addDoc(collection(db, 'clientes'), {
    nombre,
    telefono,
    email: correo,
    vehiculos: vehiculo ? [vehiculo] : [],
    fecha_registro: serverTimestamp(),
  });
  await crearUsuario({ telefono, contrasena, rol: 'cliente', perfilId: cliente.id });
}

export async function crearUsuario({ telefono, contrasena, rol, perfilId }) {
  await addDoc(coleccion, {
    telefono,
    contrasena,
    rol,
    perfil_id: perfilId,
    fecha_registro: serverTimestamp(),
  });
}
