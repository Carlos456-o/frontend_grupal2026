// DATOS DE PRUEBA (simulados) de la colección "citas".
// clienteId y empleadoId conectan esta cita con un cliente y un empleado
// de los otros archivos (clientes.js y empleados.js).

export const citas = [
  {
    id: 'cit1',
    clienteId: 'cli1',
    empleadoId: 'emp1',
    vehiculo: { placa: 'PBA-1234', modelo: 'Chevrolet Sail' },
    servicio: { id: 'srv3', nombre: 'Lavado Completo', precio: 300 },
    fecha: '2026-09-10',
    hora: '09:00',
    estado: 'confirmada', // pendiente | confirmada | en_proceso | completada | cancelada
    solicitudEspecial: 'Cuidado con el retrovisor izquierdo, está flojo.',
  },
  {
    id: 'cit2',
    clienteId: 'cli2',
    empleadoId: 'emp2',
    vehiculo: { placa: 'PEF-9012', modelo: 'Toyota Hilux' },
    servicio: { id: 'srv1', nombre: 'Lavado Normal', precio: 120 },
    fecha: '2026-09-09',
    hora: '14:30',
    estado: 'confirmada',
    solicitudEspecial: '',
  },
  {
    id: 'cit3',
    clienteId: 'cli1',
    empleadoId: 'emp1',
    vehiculo: { placa: 'PCD-5678', modelo: 'Kia Sportage' },
    servicio: { id: 'srv4', nombre: 'Encerado y pulido', precio: 180 },
    fecha: '2026-09-05',
    hora: '11:00',
    estado: 'completada',
    solicitudEspecial: '',
  },
  // Estas 3 tienen fecha de "hoy" para poder mostrar la pantalla
  // "Citas de hoy" del panel del administrador con varios ejemplos.
  {
    id: 'cit4',
    clienteId: 'cli1',
    empleadoId: 'emp2',
    vehiculo: { placa: 'PCD-5678', modelo: 'Kia Sportage' },
    servicio: { id: 'srv2', nombre: 'Lavado Intermedio', precio: 200 },
    fecha: '2026-09-09',
    hora: '10:30',
    estado: 'en_proceso',
    solicitudEspecial: '',
  },
  {
    id: 'cit5',
    clienteId: 'cli2',
    empleadoId: 'emp1',
    vehiculo: { placa: 'PEF-9012', modelo: 'Toyota Hilux' },
    servicio: { id: 'srv3', nombre: 'Lavado Completo', precio: 300 },
    fecha: '2026-09-09',
    hora: '09:00',
    estado: 'completada',
    solicitudEspecial: '',
  },
  {
    id: 'cit6',
    clienteId: 'cli1',
    empleadoId: 'emp1',
    vehiculo: { placa: 'PBA-1234', modelo: 'Chevrolet Sail' },
    servicio: { id: 'srv1', nombre: 'Lavado Normal', precio: 120 },
    fecha: '2026-09-09',
    hora: '13:00',
    estado: 'pendiente',
    solicitudEspecial: '',
  },
];
