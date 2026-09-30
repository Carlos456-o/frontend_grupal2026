// DATOS DE PRUEBA (simulados) de la colección "usuario".
// "rol" nos dice si la persona es cliente, empleado o admin.
// "perfilId" apunta al cliente o empleado correspondiente en los otros archivos.
// Usuarios para probar el login:
//   cliente -> telefono: 0981112233, contrasena: 1234
//   empleado -> telefono: 11111111, contrasena: 1234
//   admin -> telefono: 85129988, contrasena: 123456789

export const usuarios = [
  { id: 'usr1', telefono: '0981112233', contrasena: '1234', rol: 'cliente', perfilId: 'cli1' },
  { id: 'usr2', telefono: '0982223344', contrasena: '1234', rol: 'cliente', perfilId: 'cli2' },
  { id: 'usr3', telefono: '11111111', contrasena: '1234', rol: 'empleado', perfilId: 'emp1' },
  { id: 'usr4', telefono: '85129988', contrasena: '123456789', rol: 'admin', perfilId: 'emp3' },
];
