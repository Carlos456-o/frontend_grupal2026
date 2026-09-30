// DATOS DE PRUEBA (simulados).
// Todavía no tenemos una base de datos real conectada, así que usamos este
// arreglo (array) como si fuera la colección "clientes" del diagrama.
// Cada cliente tiene sus vehículos guardados adentro (vehiculos: []).
// "color" es el color del círculo con las iniciales en Gestión de clientes.

export const clientes = [
  {
    id: 'cli1',
    nombre: 'Andrea Salazar',
    telefono: '0981112233',
    correo: 'andrea@example.com',
    fechaRegistro: '2026-01-15',
    color: '#7c3aed',
    vehiculos: [
      { placa: 'PBA-1234', modelo: 'Chevrolet Sail' },
      { placa: 'PCD-5678', modelo: 'Kia Sportage' },
    ],
  },
  {
    id: 'cli2',
    nombre: 'Jorge Ramírez',
    telefono: '0982223344',
    correo: 'jorge@example.com',
    fechaRegistro: '2026-02-02',
    color: '#0891b2',
    vehiculos: [{ placa: 'PEF-9012', modelo: 'Toyota Hilux' }],
  },
];
