// DATOS DE PRUEBA (simulados) del "catálogo de actividades".
// Son las tareas individuales con las que se arman los servicios
// (por ejemplo, "Lavado Completo" se arma con las actividades
// Exterior + Interior + Encerado). Cada servicio guarda en
// "actividadesIds" (ver datos/servicios.js) cuáles usa.

export const actividades = [
  {
    id: 'act1',
    nombre: 'Exterior',
    descripcion: 'Lavado de carrocería con jabón y agua a presión',
    icono: 'car-outline',
    colorIcono: '#3b82f6',
    colorFondoIcono: '#dbeafe',
  },
  {
    id: 'act2',
    nombre: 'Interior',
    descripcion: 'Limpieza de tablero, vidrios y puertas',
    icono: 'square-outline',
    colorIcono: '#7c3aed',
    colorFondoIcono: '#ede9fe',
  },
  {
    id: 'act3',
    nombre: 'Encerado',
    descripcion: 'Aplicación de cera para brillo y protección',
    icono: 'color-wand-outline',
    colorIcono: '#ea580c',
    colorFondoIcono: '#ffedd5',
  },
  {
    id: 'act4',
    nombre: 'Aspirado',
    descripcion: 'Aspirado de alfombras y asientos',
    icono: 'vacuum',
    iconoSet: 'material',
    colorIcono: '#16a34a',
    colorFondoIcono: '#dcfce7',
  },
  {
    id: 'act5',
    nombre: 'Llantas y rines',
    descripcion: 'Limpieza y brillo de llantas',
    icono: 'disc-outline',
    colorIcono: '#dc2626',
    colorFondoIcono: '#fee2e2',
  },
  {
    id: 'act6',
    nombre: 'Secado final',
    descripcion: 'Secado con microfibra antes de entregar',
    icono: 'checkmark-circle-outline',
    colorIcono: '#c2703d',
    colorFondoIcono: '#fde8d0',
  },
];
