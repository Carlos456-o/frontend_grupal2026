// DATOS DE PRUEBA (simulados) de la colección "servicio".
// "categoriaId" conecta cada servicio con una categoría de datos/catalogo.js.
// Los precios están en córdobas (C$), como se muestra en la app.
//
// "icono" es el nombre de un ícono de Ionicons (@expo/vector-icons),
// y "colorIcono" / "colorFondoIcono" son los colores de ese icono y su
// cuadrito de fondo en las tarjetas del catálogo.
// "destacado: true" marca el servicio que se resalta con un borde morado
// (como el "más pedido"), igual que en el diseño del catálogo.
// "actividadesIds" dice con cuáles actividades de datos/actividades.js
// se arma ese servicio (se usa en la Gestión de servicios del admin).

export const servicios = [
  // ---- Lavados ----
  {
    id: 'srv1',
    nombre: 'Lavado Normal',
    descripcion: 'Solo exterior',
    precio: 120,
    duracionMinutos: 20,
    categoriaId: 'cat1',
    icono: 'car-outline',
    colorIcono: '#c2703d',
    colorFondoIcono: '#fde8d0',
    actividadesIds: ['act1'],
  },
  {
    id: 'srv2',
    nombre: 'Lavado Intermedio',
    descripcion: 'Exterior + aspirado',
    precio: 200,
    duracionMinutos: 30,
    categoriaId: 'cat1',
    icono: 'car-outline',
    colorIcono: '#3b82f6',
    colorFondoIcono: '#dbeafe',
    actividadesIds: ['act1', 'act4'],
  },
  {
    id: 'srv3',
    nombre: 'Lavado Completo',
    descripcion: 'Kit ext.+int.+encerado',
    precio: 300,
    duracionMinutos: 45,
    categoriaId: 'cat1',
    icono: 'car-sport-outline',
    colorIcono: '#7c3aed',
    colorFondoIcono: '#ede9fe',
    destacado: true,
    actividadesIds: ['act1', 'act2', 'act3'],
  },

  // ---- Estética ----
  {
    id: 'srv4',
    nombre: 'Encerado y pulido',
    descripcion: 'Brillo y protección',
    precio: 180,
    duracionMinutos: 40,
    categoriaId: 'cat2',
    icono: 'color-wand-outline',
    colorIcono: '#db2777',
    colorFondoIcono: '#fce7f3',
  },
  {
    id: 'srv5',
    nombre: 'Limpieza de tapicería',
    descripcion: 'Asientos y alfombras',
    precio: 220,
    duracionMinutos: 50,
    categoriaId: 'cat2',
    icono: 'shirt-outline',
    colorIcono: '#db2777',
    colorFondoIcono: '#fce7f3',
  },

  // ---- Mantenimiento básico ----
  {
    id: 'srv6',
    nombre: 'Revisión de fluidos',
    descripcion: 'Agua, aceite y limpiaparabrisas',
    precio: 60,
    duracionMinutos: 15,
    categoriaId: 'cat3',
    icono: 'sunny-outline',
    colorIcono: '#16a34a',
    colorFondoIcono: '#dcfce7',
  },
  {
    id: 'srv7',
    nombre: 'Presión de llantas',
    descripcion: 'Revisión y ajuste de aire',
    precio: 40,
    duracionMinutos: 10,
    categoriaId: 'cat3',
    icono: 'time-outline',
    colorIcono: '#16a34a',
    colorFondoIcono: '#dcfce7',
  },
];
