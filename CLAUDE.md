# Contexto del proyecto: Car Wash "Divino Niño"

Archivo de contexto para Claude Code. Resume lo trabajado con el equipo en el chat. Si algo contradice el código real del repositorio, manda el código y avisa de la diferencia.

## Idioma y estilo de trabajo
- Todo en **español** (código comentado, mensajes, documentos).
- El usuario pide entregables terminados y pulidos, con instrucciones cortas y directas. No dar rodeos ni explicar de más.
- Documentos académicos: **APA 7** (Times New Roman 12, interlineado 1.5, índices de contenido, tablas y figuras).

## Qué es el proyecto
App móvil para el autolavado **"Divino Niño"**: digitaliza la gestión de citas y el catálogo de servicios, que hoy se hacen por llamada telefónica y cuaderno.
- Cliente: ve el catálogo de 3 servicios de lavado (Completo, Intermedio, Normal) con precio, registra sus datos y su vehículo, y agenda citas (servicio, fecha, hora, solicitud especial).
- Empleado: atiende las citas asignadas.
- Administrador/propietario: panel para ver y organizar citas, actualizar su estado y hacer CRUD de clientes, servicios y empleados.
- Fuera de alcance: pasarela de pagos, varias sucursales, nómina/turnos, fidelización/descuentos automáticos, seguimiento en tiempo real del lavado, inventario de insumos.

## Equipo y contexto académico
- Carrera: Ingeniería en Sistemas de Información, UNAN-Managua, CUR Chontales "Cornelio Silva Argüello". III año, II semestre, Grupo #9, Proyecto TI II (Integrador).
- Integrantes: **Carlos Jhocksoan Oporta Burgos** (planificación Scrum, BOA, base de datos), **Kristing Milagros Tablada Alemán** (planificación del documento, comunicación del equipo, frontend e interfaces), **Vily Dominic Vargas Marín** (base de datos).
- Docente integradora: Miriam Patricia Téllez. Docentes/componentes: Yesenia Téllez Gómez, Eliab Selva Cruz, Jonathán Moreno Castro, Miriam Téllez Marín.
- Repositorios (GitHub, cuenta Carlos456-o): `frontend_grupal2026` y `backend_grupal2026`.
- Gestión: Scrum en **Taiga** (proyecto "Divino niño", 5 sprints) y tablero en **Trello** ("Cronograma de una aplicación móvil Divino niño", organizado en 6 fases).

## Stack técnico
- Frontend: **React Native con Expo** (se prueba también en web con `localhost:8081`).
- Backend: **Node.js + Express** (API REST).
- Base de datos NoSQL en la nube. **Ojo:** la BOA y el esquema documental están escritos para **MongoDB**, pero el usuario indicó después que ya **no usan MongoDB y migraron a Firebase**. Verificar en el código cuál está en uso antes de asumir nada.
- Control de versiones: Git y GitHub.

## Modelo de datos (esquema documental original)
Colecciones: `clientes`, `catalogo`, `servicio`, `empleado`, `citas`.
- `clientes`: nombre, telefono, email (opcional), vehiculos[{placa, marca, modelo, color}], fecha_registro.
- `catalogo`: actividades que componen un servicio (lavado, secado, engrase, limpieza interior, aromatizante, encerado): nombre, descripcion.
- `servicio`: nombre (Completo / Intermedio / Normal), descripcion, precio, duracion_min, actividades_incluidas[].
- `empleado`: nombre, telefono, rol (Lavador, Encargado).
- `citas`: cliente_id, vehiculo (copia embebida), servicio (copia embebida con precio al agendar), empleado_id (opcional), fecha, hora, estado (Pendiente / Confirmada / En proceso / Completada / Cancelada), solicitud_especial.
- Criterio de modelado: se referencia al cliente y al empleado, y se **embebe** una copia del vehículo y del servicio dentro de la cita.

## Usuarios de prueba (datos semilla del proyecto, no son credenciales reales)
- Cliente: teléfono `0981112233`, contraseña `1234`
- Empleado: `11111111` / `1234`
- Administrador: `85129988` / `123456789`

## Historias de usuario (17) y estado
HF01 iniciar sesión con teléfono · HF02 recuperar contraseña · HF03 agendar cita · HF04 registrar datos del cliente y vehículo · HF05 actualizar datos · HF06 ver catálogo y precios · HF07 servicio favorito · HF08 reagendar cita · HF09 valorar servicio · HF10 ver promociones · HF11 reportar problema · HF12 notificar estado del servicio · HF13 buscar y filtrar · HF14 historial de servicios · HF15 CRUD de administrador · HF16 cálculo del servicio según vehículo y extras · HF17 CRUD de empleados.

Avance en Taiga: Sprint 1 100 % (260/260) · Sprint 2 76 % (134/176) · Sprint 3 71 % (110/156) · Sprint 4 22 % (30/138) · Sprint 5 30 % (33/111, corte al 5 oct 2026; el sprint terminaba el 19 oct).

Diferencias conocidas entre Taiga y la app real (revisar antes de dar algo por hecho):
- Taiga marca como hecho "Favoritos" y "Actualizar datos", pero la app no tiene esa interfaz.
- "Reagendar" es solo un botón o marcador de posición.
- No existen Notificaciones, Promociones, Valorar servicio ni Reportar problema.

## Pantallas y roles en la app
Se capturaron y documentaron las pantallas de cliente, empleado y administrador en el "Entregable funcional" ordenado por sprint.

## Entregables ya producidos
- BOA "Car Wash Divino Niño" en APA 7 (PDF y Word, 37 páginas, con índices).
- Entregable funcional por sprint (Word) e informes de retrospectiva (Sprints 1 a 5).
- Plan 8.1 de arquitectura y modelo de datos.
- Sección 5.1 "Analítica de Datos Propuesta" (indicadores: servicios más solicitados, horas pico, ocupación, ingresos, etc.).
- **JUDC 2026**: ensayo científico "Digitalización de citas en el autolavado Divino Niño mediante una aplicación móvil" (estructura de ensayo de la guía JUDC), consentimiento informado firmado y formulario de inscripción. Jornada: 30 oct 2026; exposición de 5 minutos; entrega del documento 23 oct; revisión de la app móvil el 4 nov 2026.

## Presupuesto
C$ 36,624 (cambio oficial BCN: C$ 36.6243 por US$ 1), aproximadamente US$ 1,000. Los montos se trabajan en córdobas.

## Pendientes y cosas por vigilar
- Confirmar si la base de datos actual es Firebase o MongoDB y alinear el código, la BOA y las explicaciones.
- Seis citas del apartado 1.2 de la BOA no tienen referencia en la lista bibliográfica.
- Inconsistencias en la BOA: fechas del Sprint 2 en HF16 e importancias de HF16/HF17 que no coinciden entre tablas.
- Antes de la revisión de la app (4 nov): cerrar las historias que Taiga da por hechas y la app no tiene.
