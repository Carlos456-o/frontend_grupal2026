// ===================================================================
// App.js — el "cerebro" de la aplicación
// ===================================================================
// Aquí decidimos QUÉ PANTALLA se muestra en cada momento.
// No usamos ninguna librería de navegación: simplemente guardamos en
// una variable de estado (useState) el nombre de la pantalla actual,
// y más abajo hay un switch que decide qué componente dibujar según
// ese nombre. Es la forma más sencilla de "navegar" entre pantallas.
//
// También aquí vive el usuario que inició sesión (useState "usuario"),
// para no repetir esa información en cada pantalla.
// ===================================================================

import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';

import { usuarios } from './datos/usuarios';
import { clientes } from './datos/clientes';
import { empleados } from './datos/empleados';

import MenuInferior from './componentes/MenuInferior';
import { colores } from './estilos/colores';

// Pantallas
import IniciarSesion from './pantallas/IniciarSesion';
import Registro from './pantallas/Registro';

import InicioCliente from './pantallas/InicioCliente';
import MisCitas from './pantallas/MisCitas';
import Calculadora from './pantallas/Calculadora';
import AgendarCita from './pantallas/AgendarCita';
import DetalleCita from './pantallas/DetalleCita';
import MisVehiculos from './pantallas/MisVehiculos';
import CatalogoServicios from './pantallas/CatalogoServicios';
import PerfilCliente from './pantallas/PerfilCliente';

import InicioEmpleado from './pantallas/InicioEmpleado';
import CitasAsignadas from './pantallas/CitasAsignadas';
import SeguimientoLavado from './pantallas/SeguimientoLavado';
import PerfilEmpleado from './pantallas/PerfilEmpleado';

import InicioAdmin from './pantallas/InicioAdmin';
import CitasDeHoy from './pantallas/CitasDeHoy';
import GestionCatalogo from './pantallas/GestionCatalogo';
import NuevaActividad from './pantallas/NuevaActividad';
import ListaEmpleados from './pantallas/ListaEmpleados';
import NuevoEmpleado from './pantallas/NuevoEmpleado';
import NuevoServicio from './pantallas/NuevoServicio';
import ListaClientes from './pantallas/ListaClientes';
import DetalleCliente from './pantallas/DetalleCliente';
import PerfilAdmin from './pantallas/PerfilAdmin';
import Mas from './pantallas/Mas';

// Botones del menú de abajo, uno por cada rol.
const MENU_CLIENTE = [
  { clave: 'clienteInicio', texto: 'Inicio', icono: '🏠' },
  { clave: 'clienteCitas', texto: 'Citas', icono: '📅' },
  { clave: 'clienteVehiculos', texto: 'Vehículos', icono: '🚙' },
  { clave: 'clienteServicios', texto: 'Servicios', icono: '🧽' },
  { clave: 'clientePerfil', texto: 'Perfil', icono: '👤' },
];
const MENU_EMPLEADO = [
  { clave: 'empleadoInicio', texto: 'Inicio', icono: '🏠' },
  { clave: 'empleadoCitas', texto: 'Mis citas', icono: '🧾' },
  { clave: 'empleadoPerfil', texto: 'Perfil', icono: '👤' },
];
const MENU_ADMIN = [
  { clave: 'adminInicio', texto: 'Inicio', icono: '🏠' },
  { clave: 'adminCitas', texto: 'Citas', icono: '📅' },
  { clave: 'adminCatalogo', texto: 'Catálogo', icono: '🧽' },
  { clave: 'adminMas', texto: 'Más', icono: '⚙️' },
];

export default function App() {
  // "pantalla" guarda el nombre de la pantalla que se está mostrando ahora.
  const [pantalla, setPantalla] = useState('iniciarSesion');
  // "parametros" guarda datos extra que una pantalla le pasa a otra,
  // por ejemplo el id de la cita que se quiere ver en detalle.
  const [parametros, setParametros] = useState({});
  // "usuario" guarda quién inició sesión (o null si nadie ha entrado).
  const [usuario, setUsuario] = useState(null);

  // Cambia de pantalla. Es la función que le pasamos a todas las
  // pantallas para que puedan "navegar" a otra.
  function navegarA(nuevaPantalla, nuevosParametros = {}) {
    setPantalla(nuevaPantalla);
    setParametros(nuevosParametros);
  }

  // Busca el usuario en datos/usuarios.js y, si el teléfono y la
  // contraseña coinciden, guarda la sesión y lo manda a su pantalla de inicio.
  // "tipoCuenta" viene del selector "Cliente / Empleado / Administrador" del
  // login: sirve para avisar si alguien intenta entrar por la pestaña equivocada.
  function iniciarSesion(telefono, contrasena, tipoCuenta) {
    const usuarioEncontrado = usuarios.find((u) => u.telefono === telefono && u.contrasena === contrasena);

    if (!usuarioEncontrado) {
      return { ok: false, error: 'Teléfono o contraseña incorrectos' };
    }

    const tipoCuentaPorRol = { cliente: 'cliente', empleado: 'empleado', admin: 'administrador' };
    const NOMBRES_TIPO_CUENTA = { cliente: 'Cliente', empleado: 'Empleado', administrador: 'Administrador' };
    const tipoCuentaReal = tipoCuentaPorRol[usuarioEncontrado.rol];
    if (tipoCuentaReal !== tipoCuenta) {
      return {
        ok: false,
        error: `Esta cuenta es de ${NOMBRES_TIPO_CUENTA[tipoCuentaReal]}. Cambia a esa pestaña.`,
      };
    }

    const perfil =
      usuarioEncontrado.rol === 'cliente'
        ? clientes.find((c) => c.id === usuarioEncontrado.perfilId)
        : empleados.find((e) => e.id === usuarioEncontrado.perfilId);

    setUsuario({ ...usuarioEncontrado, perfil });

    if (usuarioEncontrado.rol === 'cliente') navegarA('clienteInicio');
    else if (usuarioEncontrado.rol === 'empleado') navegarA('empleadoInicio');
    else navegarA('adminInicio');

    return { ok: true };
  }

  function cerrarSesion() {
    setUsuario(null);
    navegarA('iniciarSesion');
  }

  // Estas son las props que le mandamos a (casi) todas las pantallas.
  const propsComunes = { usuario, parametros, navegarA, cerrarSesion };

  // Aquí decidimos qué componente dibujar según el valor de "pantalla".
  function renderizarPantalla() {
    switch (pantalla) {
      // ---- Antes de iniciar sesión ----
      case 'iniciarSesion':
        return <IniciarSesion iniciarSesion={iniciarSesion} navegarA={navegarA} />;
      case 'registro':
        return <Registro navegarA={navegarA} />;
      case 'invitadoServicios':
        return <CatalogoServicios {...propsComunes} />;

      // ---- Cliente ----
      case 'clienteInicio':
        return <InicioCliente {...propsComunes} />;
      case 'clienteCitas':
        return <MisCitas {...propsComunes} />;
      case 'clienteCalculadora':
        return <Calculadora {...propsComunes} />;
      case 'clienteAgendarCita':
        return <AgendarCita {...propsComunes} />;
      case 'clienteDetalleCita':
        return <DetalleCita {...propsComunes} />;
      case 'clienteVehiculos':
        return <MisVehiculos {...propsComunes} />;
      case 'clienteServicios':
        return <CatalogoServicios {...propsComunes} />;
      case 'clientePerfil':
        return <PerfilCliente {...propsComunes} />;

      // ---- Empleado ----
      case 'empleadoInicio':
        return <InicioEmpleado {...propsComunes} />;
      case 'empleadoCitas':
        return <CitasAsignadas {...propsComunes} />;
      case 'empleadoDetalleCita':
        return <SeguimientoLavado {...propsComunes} />;
      case 'empleadoPerfil':
        return <PerfilEmpleado {...propsComunes} />;

      // ---- Admin ----
      case 'adminInicio':
        return <InicioAdmin {...propsComunes} />;
      case 'adminCitas':
        return <CitasDeHoy {...propsComunes} />;
      case 'adminSeguimientoLavado':
        return <SeguimientoLavado {...propsComunes} />;
      case 'adminCatalogo':
        return <GestionCatalogo {...propsComunes} />;
      case 'adminNuevaActividad':
        return <NuevaActividad {...propsComunes} />;
      case 'adminEmpleados':
        return <ListaEmpleados {...propsComunes} />;
      case 'adminNuevoEmpleado':
        return <NuevoEmpleado {...propsComunes} />;
      case 'adminNuevoServicio':
        return <NuevoServicio {...propsComunes} />;
      case 'adminClientes':
        return <ListaClientes {...propsComunes} />;
      case 'adminDetalleCliente':
        return <DetalleCliente {...propsComunes} />;
      case 'adminPerfil':
        return <PerfilAdmin {...propsComunes} />;
      case 'adminMas':
        return <Mas {...propsComunes} />;

      default:
        return <IniciarSesion iniciarSesion={iniciarSesion} navegarA={navegarA} />;
    }
  }

  // El menú de abajo solo se muestra en las pantallas "principales" de
  // cada rol (no en formularios como "nueva cita" o "detalle de cita").
  let menuOpciones = null;
  if (usuario?.rol === 'cliente' && MENU_CLIENTE.some((o) => o.clave === pantalla)) {
    menuOpciones = MENU_CLIENTE;
  } else if (usuario?.rol === 'empleado' && MENU_EMPLEADO.some((o) => o.clave === pantalla)) {
    menuOpciones = MENU_EMPLEADO;
  } else if (usuario?.rol === 'admin' && MENU_ADMIN.some((o) => o.clave === pantalla)) {
    menuOpciones = MENU_ADMIN;
  }

  return (
    <SafeAreaView style={estilos.contenedor}>
      <StatusBar style="dark" />
      <View style={estilos.contenido}>{renderizarPantalla()}</View>
      {menuOpciones ? (
        <MenuInferior opciones={menuOpciones} pantallaActiva={pantalla} alCambiarPantalla={navegarA} />
      ) : null}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  contenido: { flex: 1 },
});
