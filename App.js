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

import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  iniciarSesion as entrarConFirebase,
  cerrarSesion as salirDeFirebase,
  mensajeDeError,
} from './firebase/autenticacion';
import { escucharCitasDeCliente, marcarAvisoVisto } from './firebase/citas';

import MenuInferior from './componentes/MenuInferior';
import AvisoCarroListo from './componentes/AvisoCarroListo';
import { colores } from './estilos/colores';

// Pantallas
import IniciarSesion from './pantallas/IniciarSesion';
import Registro from './pantallas/Registro';
import RecuperarContrasena from './pantallas/RecuperarContrasena';
import ReportarProblema from './pantallas/ReportarProblema';
import Reportes from './pantallas/Reportes';
import Promociones from './pantallas/Promociones';

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
import ListaEmpleados from './pantallas/ListaEmpleados';
import NuevoEmpleado from './pantallas/NuevoEmpleado';
import NuevoServicio from './pantallas/NuevoServicio';
import ListaClientes from './pantallas/ListaClientes';
import DetalleCliente from './pantallas/DetalleCliente';
import PerfilAdmin from './pantallas/PerfilAdmin';
import Mas from './pantallas/Mas';
import Calificaciones from './pantallas/Calificaciones';

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
  // Citas del cliente que acaban de terminar y cuyo aviso aún no ha visto.
  const [citasListas, setCitasListas] = useState([]);

  // Mientras un cliente tiene la sesión abierta, escuchamos sus citas en
  // tiempo real: si una pasa a "terminado", le mostramos el aviso de que su
  // carro está listo (sin importar en qué pantalla esté).
  const clienteId = usuario?.rol === 'cliente' ? usuario.perfil.id : null;
  useEffect(() => {
    if (!clienteId) {
      setCitasListas([]);
      return undefined;
    }
    const dejarDeEscuchar = escucharCitasDeCliente(clienteId, (citas) => {
      setCitasListas(citas.filter((c) => c.estado === 'terminado' && !c.avisoListoVisto && !c.calificacion));
    });
    return dejarDeEscuchar;
  }, [clienteId]);

  function alCerrarAviso() {
    const cita = citasListas[0];
    // Lo quitamos de inmediato; Firebase lo guarda en segundo plano.
    setCitasListas((anteriores) => anteriores.slice(1));
    marcarAvisoVisto(cita.id).catch(() => {});
  }

  // Cambia de pantalla. Es la función que le pasamos a todas las
  // pantallas para que puedan "navegar" a otra.
  function navegarA(nuevaPantalla, nuevosParametros = {}) {
    setPantalla(nuevaPantalla);
    setParametros(nuevosParametros);
  }

  // Inicia sesión con Firebase Authentication (correo o teléfono + contraseña).
  // El tipo de usuario (cliente, empleado o admin) NO lo elige la persona:
  // viene de su cuenta en "usuarios/{uid}", y según eso va a su inicio.
  async function iniciarSesion(identificador, contrasena) {
    let usuarioEncontrado;
    try {
      usuarioEncontrado = await entrarConFirebase(identificador, contrasena);
    } catch (e) {
      return { ok: false, error: mensajeDeError(e.message) };
    }

    setUsuario(usuarioEncontrado);
    if (usuarioEncontrado.rol === 'cliente') navegarA('clienteInicio');
    else if (usuarioEncontrado.rol === 'empleado') navegarA('empleadoInicio');
    else navegarA('adminInicio');
    return { ok: true };
  }

  function cerrarSesion() {
    salirDeFirebase();
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
      case 'recuperarContrasena':
        return <RecuperarContrasena navegarA={navegarA} />;

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
      case 'clienteReportar':
        return <ReportarProblema {...propsComunes} />;

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
      case 'adminCalificaciones':
        return <Calificaciones {...propsComunes} />;
      case 'adminPromociones':
        return <Promociones {...propsComunes} />;
      case 'adminReportes':
        return <Reportes {...propsComunes} />;

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
    <SafeAreaProvider>
      <SafeAreaView style={estilos.contenedor}>
        <StatusBar style="dark" />
        <View style={estilos.contenido}>{renderizarPantalla()}</View>
        {menuOpciones ? (
          <MenuInferior opciones={menuOpciones} pantallaActiva={pantalla} alCambiarPantalla={navegarA} />
        ) : null}
        <AvisoCarroListo cita={citasListas[0] ?? null} alCerrar={alCerrarAviso} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  contenido: { flex: 1 },
});
