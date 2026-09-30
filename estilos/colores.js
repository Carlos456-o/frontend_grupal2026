// Aquí guardamos los colores que usa toda la app.
// Así, si queremos cambiar el color principal, lo cambiamos en un solo lugar
// y se actualiza en todas las pantallas que lo usen.

export const colores = {
  principal: '#2563eb', // azul, color principal de botones y títulos
  fondo: '#f8fafc', // fondo gris muy claro de las pantallas
  tarjeta: '#ffffff', // fondo blanco de las tarjetas
  borde: '#e2e8f0', // color de los bordes
  texto: '#0f172a', // color del texto principal (casi negro)
  textoSuave: '#64748b', // color del texto secundario (gris)
  peligro: '#dc2626', // rojo, para botones de cancelar/eliminar
  exito: '#16a34a', // verde, para mensajes de éxito
  fondoTab: '#eef1f6', // fondo gris del selector "Cliente / Administrador"
};

// Los dos colores de cada degradado (gradiente) que usamos con
// <LinearGradient colors={...}>. El primero va arriba/izquierda,
// el segundo abajo/derecha.
export const degradados = {
  login: ['#1e2a6b', '#3457d5'], // azul oscuro -> azul (encabezado de Iniciar sesión)
  registro: ['#7c3aed', '#06b6d4'], // morado -> celeste (encabezado y botón de Registro)
  inicio: ['#4c1d95', '#4338ca'], // morado -> azul (encabezado de Inicio y Catálogo del cliente)
};

// Colores según el estado de una cita (pendiente, confirmada, etc.)
export const coloresPorEstado = {
  pendiente: { fondo: '#fef3c7', texto: '#92400e' },
  confirmada: { fondo: '#dbeafe', texto: '#1e40af' },
  en_proceso: { fondo: '#e0e7ff', texto: '#3730a3' },
  completada: { fondo: '#dcfce7', texto: '#166534' },
  cancelada: { fondo: '#fee2e2', texto: '#991b1b' },
};
