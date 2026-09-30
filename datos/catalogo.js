// DATOS DE PRUEBA (simulados) de la colección "catalogo".
// Son las categorías bajo las que se agrupan los servicios (ver datos/servicios.js,
// que usa "categoriaId" para decir a cuál de estas categorías pertenece).
// "icono" y los colores son solo para pintar el cuadrito de color en las tarjetas.

export const catalogo = [
  {
    id: 'cat1',
    nombre: 'Lavados',
    descripcion: 'Servicios de lavado exterior e interior.',
    icono: '🚗',
    color: '#3b82f6',
    colorClaro: '#dbeafe',
  },
  {
    id: 'cat2',
    nombre: 'Estética',
    descripcion: 'Servicios de brillo, encerado y limpieza fina.',
    icono: '✨',
    color: '#ec4899',
    colorClaro: '#fce7f3',
  },
  {
    id: 'cat3',
    nombre: 'Mantenimiento Básico',
    descripcion: 'Revisiones rápidas para que el vehículo ande bien.',
    icono: '🧰',
    color: '#16a34a',
    colorClaro: '#dcfce7',
  },
];
