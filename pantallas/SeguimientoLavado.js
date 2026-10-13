// PANTALLA: Seguimiento del lavado
// La usa el empleado para ir marcando los pasos del servicio conforme los
// termina, y también el administrador para ver cómo va cada cita (desde
// "Citas de hoy"). Los pasos son las "actividades_incluidas" del servicio
// de la cita en Firebase.
//
// Los pasos marcados solo viven en la pantalla (Firebase no los guarda);
// lo que sí se guarda es el estado de la cita: "en_proceso" al iniciar
// y "terminado" al finalizar.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerCita, cambiarEstadoCita } from '../firebase/citas';
import { obtenerCliente } from '../firebase/clientes';
import { obtenerEmpleado } from '../firebase/empleados';
import { obtenerServicio } from '../firebase/servicios';
import { useDatos } from '../firebase/utilidades';
import Tarjeta from '../componentes/Tarjeta';
import InsigniaEstado from '../componentes/InsigniaEstado';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import Boton from '../componentes/Boton';
import { colores, colorAvatar } from '../estilos/colores';

// Si el servicio no tiene actividades registradas, usamos estos pasos.
const PASOS_POR_DEFECTO = ['Lavado exterior', 'Aspirado interior', 'Secado y entrega'];

function horaActual() {
  const ahora = new Date();
  return `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
}

// Trae la cita y todo lo relacionado (cliente, empleado y servicio).
async function cargarSeguimiento(citaId) {
  const cita = await obtenerCita(citaId);
  if (!cita) return { cita: null };
  const [cliente, empleado, servicio] = await Promise.all([
    obtenerCliente(cita.clienteId),
    obtenerEmpleado(cita.empleadoId),
    obtenerServicio(cita.servicio.id),
  ]);
  return { cita, cliente, empleado, servicio };
}

export default function SeguimientoLavado({ usuario, parametros, navegarA }) {
  const { datos, cargando, error, recargar } = useDatos(() => cargarSeguimiento(parametros.citaId), [parametros.citaId]);

  function alVolver() {
    navegarA(usuario?.rol === 'admin' ? 'adminCitas' : 'empleadoCitas');
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Pressable onPress={alVolver} style={estilos.botonAtras}>
          <Ionicons name="chevron-back" size={26} color={colores.texto} />
        </Pressable>
        <View>
          <Text style={estilos.titulo}>Seguimiento del lavado</Text>
          <Text style={estilos.subtitulo}>{usuario?.rol === 'admin' ? 'Panel del administrador' : 'Panel del empleado'}</Text>
        </View>
      </View>

      {cargando || error ? (
        <Cargando error={error} alReintentar={recargar} />
      ) : !datos.cita ? (
        <SinResultados texto="Cita no encontrada" />
      ) : (
        <Seguimiento {...datos} alCambiarEstado={recargar} />
      )}
    </View>
  );
}

// Se dibuja cuando ya tenemos los datos, así los pasos arrancan con las
// actividades correctas del servicio.
function Seguimiento({ cita, cliente, empleado, servicio, alCambiarEstado }) {
  const nombresPasos = servicio?.actividades?.length ? servicio.actividades : PASOS_POR_DEFECTO;
  const yaTerminada = cita.estado === 'terminado';
  const [pasos, setPasos] = useState(
    nombresPasos.map((nombre) => ({ nombre, hecho: yaTerminada, hora: null }))
  );
  const [guardando, setGuardando] = useState(false);

  const pasosCompletados = pasos.filter((p) => p.hecho).length;

  function alternarPaso(indice, hecho) {
    setPasos((anteriores) =>
      anteriores.map((paso, i) => (i === indice ? { ...paso, hecho, hora: hecho ? horaActual() : null } : paso))
    );
  }

  async function cambiarEstado(estado) {
    if (guardando) return;
    setGuardando(true);
    try {
      await cambiarEstadoCita(cita.id, estado);
      alCambiarEstado();
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar la cita. Intenta de nuevo.');
    }
    setGuardando(false);
  }

  function alTerminar() {
    if (pasosCompletados < pasos.length) {
      Alert.alert('Faltan pasos', '¿Marcar el lavado como terminado aunque falten pasos?', [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, terminar', onPress: () => cambiarEstado('terminado') },
      ]);
      return;
    }
    cambiarEstado('terminado');
  }

  const iniciales = (cliente?.nombre || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Tarjeta estilo={estilos.filaCliente}>
        <View style={[estilos.avatar, { backgroundColor: colorAvatar(cliente?.id) }]}>
          <Text style={estilos.textoAvatar}>{iniciales}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={estilos.nombreCliente}>{cliente?.nombre || 'Cliente'}</Text>
          <Text style={estilos.detalleCliente}>
            {cita.servicio.nombre} · {cita.vehiculo.modelo} · Placa {cita.vehiculo.placa}
          </Text>
          <Text style={estilos.detalleCliente}>
            {cita.fecha} · {cita.hora}
          </Text>
        </View>
        <InsigniaEstado estado={cita.estado} />
      </Tarjeta>

      {cita.solicitudEspecial ? (
        <Tarjeta>
          <Text style={estilos.etiquetaSolicitud}>Solicitud especial</Text>
          <Text style={estilos.textoSolicitud}>{cita.solicitudEspecial}</Text>
        </Tarjeta>
      ) : null}

      <Text style={estilos.tituloSeccion}>Pasos del servicio</Text>
      {pasos.map((paso, indice) => (
        <Tarjeta key={paso.nombre} estilo={estilos.filaPaso}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.nombrePaso}>{paso.nombre}</Text>
            <Text style={[estilos.estadoPaso, paso.hecho ? estilos.estadoHecho : estilos.estadoPendiente]}>
              {paso.hecho
                ? `${empleado?.nombre || 'Empleado'}${paso.hora ? ` · ${paso.hora}` : ''}`
                : 'Pendiente · sin marcar'}
            </Text>
          </View>
          <Pressable onPress={() => alternarPaso(indice, true)} style={[estilos.botonPaso, paso.hecho && estilos.botonHechoActivo]}>
            <Ionicons name="checkmark" size={16} color={paso.hecho ? '#ffffff' : colores.exito} />
          </Pressable>
          <Pressable onPress={() => alternarPaso(indice, false)} style={[estilos.botonPaso, !paso.hecho && estilos.botonPendienteActivo]}>
            <Ionicons name="close" size={16} color={!paso.hecho ? '#ffffff' : colores.peligro} />
          </Pressable>
        </Tarjeta>
      ))}

      {cita.estado === 'pendiente' || cita.estado === 'confirmada' ? (
        <Boton
          texto={guardando ? 'Guardando...' : 'Iniciar lavado'}
          alPresionar={() => cambiarEstado('en_proceso')}
          estilo={estilos.botonEstado}
        />
      ) : null}
      {cita.estado === 'en_proceso' ? (
        <Boton texto={guardando ? 'Guardando...' : 'Marcar como terminado'} alPresionar={alTerminar} estilo={estilos.botonEstado} />
      ) : null}

      <View style={estilos.resumen}>
        <View style={estilos.avatarResumen}>
          <Ionicons name="person" size={16} color="#ffffff" />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={estilos.textoResumen}>Atendido por {empleado?.nombre || 'empleado por asignar'}</Text>
          <Text style={estilos.subtextoResumen}>
            {pasosCompletados} de {pasos.length} pasos completados · {horaActual()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.tarjeta },

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  botonAtras: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 16, fontWeight: '800', color: colores.texto },
  subtitulo: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },

  contenido: { padding: 16, paddingBottom: 32, backgroundColor: colores.fondo, flexGrow: 1 },

  filaCliente: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  textoAvatar: { color: '#ffffff', fontWeight: '700' },
  nombreCliente: { fontSize: 15, fontWeight: '700', color: colores.texto },
  detalleCliente: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },

  etiquetaSolicitud: { fontSize: 12, color: colores.textoSuave },
  textoSolicitud: { fontSize: 14, color: colores.texto, fontWeight: '600', marginTop: 2 },

  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoSuave,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 10,
  },

  filaPaso: { flexDirection: 'row', alignItems: 'center' },
  nombrePaso: { fontSize: 14, fontWeight: '700', color: colores.texto, textTransform: 'capitalize' },
  estadoPaso: { fontSize: 12, marginTop: 2 },
  estadoHecho: { color: colores.exito },
  estadoPendiente: { color: '#d97706' },
  botonPaso: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  botonHechoActivo: { backgroundColor: colores.exito, borderColor: colores.exito },
  botonPendienteActivo: { backgroundColor: colores.peligro, borderColor: colores.peligro },

  botonEstado: { marginTop: 8, backgroundColor: '#132048' },

  resumen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#132048',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  avatarResumen: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  textoResumen: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  subtextoResumen: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
});
