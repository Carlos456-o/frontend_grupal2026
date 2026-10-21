// PANTALLA: Seguimiento del lavado
// La usa el empleado para ir marcando los pasos del servicio conforme los
// termina, y también el administrador para ver cómo va cada cita (desde
// "Citas de hoy"). Los pasos son las "actividades_incluidas" del servicio
// de la cita en Firebase.
//
// Todo se guarda en la cita de Firebase: los pasos marcados (campo "pasos")
// y el estado: "en_proceso" al iniciar y "terminado" al finalizar.
//
// El administrador además ve un panel para confirmar la cita, asignarle
// un empleado, cancelarla o eliminarla.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerCita, cambiarEstadoCita, guardarPasos, asignarEmpleado, eliminarCita } from '../firebase/citas';
import { obtenerCliente } from '../firebase/clientes';
import { obtenerEmpleado, obtenerEmpleados } from '../firebase/empleados';
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
// Al admin también le traemos la lista de empleados para poder asignar uno.
async function cargarSeguimiento(citaId, esAdmin) {
  const cita = await obtenerCita(citaId);
  if (!cita) return { cita: null };
  const [cliente, empleado, servicio, empleados] = await Promise.all([
    obtenerCliente(cita.clienteId),
    obtenerEmpleado(cita.empleadoId),
    obtenerServicio(cita.servicio.id),
    esAdmin ? obtenerEmpleados() : Promise.resolve([]),
  ]);
  return { cita, cliente, empleado, servicio, empleados };
}

export default function SeguimientoLavado({ usuario, parametros, navegarA }) {
  const esAdmin = usuario?.rol === 'admin';
  const { datos, cargando, error, recargar } = useDatos(
    () => cargarSeguimiento(parametros.citaId, esAdmin),
    [parametros.citaId, esAdmin]
  );

  function alVolver() {
    navegarA(esAdmin ? 'adminCitas' : 'empleadoCitas');
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
        // "key" con el estado: al recargar tras un cambio, los pasos se vuelven a leer de Firebase.
        <Seguimiento
          key={`${datos.cita.id}-${datos.cita.estado}`}
          {...datos}
          esAdmin={esAdmin}
          alCambiarEstado={recargar}
          alEliminar={alVolver}
        />
      )}
    </View>
  );
}

// Pasos con los que arranca la pantalla: los guardados en la cita si existen;
// si no, las actividades del servicio (marcadas si la cita ya terminó).
function pasosIniciales(cita, servicio) {
  const nombresPasos = servicio?.actividades?.length ? servicio.actividades : PASOS_POR_DEFECTO;
  const yaTerminada = cita.estado === 'terminado';
  return nombresPasos.map((nombre) => {
    const guardado = cita.pasos.find((p) => p.nombre === nombre);
    return guardado ?? { nombre, hecho: yaTerminada, hora: null };
  });
}

// Se dibuja cuando ya tenemos los datos, así los pasos arrancan con las
// actividades correctas del servicio.
function Seguimiento({ cita, cliente, empleado, servicio, empleados, esAdmin, alCambiarEstado, alEliminar }) {
  const [pasos, setPasos] = useState(() => pasosIniciales(cita, servicio));
  const [guardando, setGuardando] = useState(false);

  const pasosCompletados = pasos.filter((p) => p.hecho).length;
  // Solo se marcan pasos mientras se está lavando.
  const puedeMarcarPasos = cita.estado === 'en_proceso';

  async function alternarPaso(indice, hecho) {
    if (!puedeMarcarPasos) {
      Alert.alert('Lavado no iniciado', 'Primero toca "Iniciar lavado" para marcar los pasos.');
      return;
    }
    const anteriores = pasos;
    const nuevos = pasos.map((paso, i) => (i === indice ? { ...paso, hecho, hora: hecho ? horaActual() : null } : paso));
    setPasos(nuevos);
    try {
      await guardarPasos(cita.id, nuevos);
    } catch (e) {
      setPasos(anteriores);
      Alert.alert('Error', 'No se pudo guardar el paso. Intenta de nuevo.');
    }
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

  async function alAsignar(empleadoId) {
    if (guardando || empleadoId === cita.empleadoId) return;
    setGuardando(true);
    try {
      await asignarEmpleado(cita.id, empleadoId);
      alCambiarEstado();
    } catch (e) {
      Alert.alert('Error', 'No se pudo asignar el empleado. Intenta de nuevo.');
    }
    setGuardando(false);
  }

  function alCancelar() {
    Alert.alert('Cancelar cita', '¿Seguro que deseas cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      { text: 'Sí, cancelar', style: 'destructive', onPress: () => cambiarEstado('cancelada') },
    ]);
  }

  function alEliminarCita() {
    Alert.alert('Eliminar cita', 'Se borrará de Firebase y no se puede deshacer.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarCita(cita.id);
            alEliminar();
          } catch (e) {
            Alert.alert('Error', 'No se pudo eliminar la cita. Intenta de nuevo.');
          }
        },
      },
    ]);
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

      {esAdmin ? (
        <PanelAdmin
          cita={cita}
          empleados={empleados}
          guardando={guardando}
          alConfirmar={() => cambiarEstado('confirmada')}
          alAsignar={alAsignar}
          alCancelar={alCancelar}
          alEliminar={alEliminarCita}
        />
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

// Acciones que solo puede hacer el administrador sobre la cita.
function PanelAdmin({ cita, empleados, guardando, alConfirmar, alAsignar, alCancelar, alEliminar }) {
  const activa = !['terminado', 'cancelada'].includes(cita.estado);

  return (
    <View>
      <Text style={estilos.tituloSeccion}>Empleado asignado</Text>
      {empleados.length === 0 ? (
        <Text style={estilos.aviso}>No hay empleados registrados.</Text>
      ) : (
        <View style={estilos.filaChips}>
          {empleados.map((e) => {
            const elegido = e.id === cita.empleadoId;
            return (
              <Pressable
                key={e.id}
                disabled={!activa}
                onPress={() => alAsignar(e.id)}
                style={[estilos.chip, elegido && estilos.chipElegido, !activa && !elegido && { opacity: 0.5 }]}
              >
                <Text style={[estilos.textoChip, elegido && estilos.textoChipElegido]}>{e.nombre}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {cita.estado === 'pendiente' ? (
        <Boton
          texto={guardando ? 'Guardando...' : 'Confirmar cita'}
          alPresionar={alConfirmar}
          estilo={estilos.botonEstado}
        />
      ) : null}
      {activa ? <Boton texto="Cancelar cita" tipo="peligro" alPresionar={alCancelar} estilo={{ marginTop: 10 }} /> : null}
      <Boton texto="Eliminar cita" tipo="borde" alPresionar={alEliminar} estilo={{ marginTop: 10 }} />
    </View>
  );
}

const estilos = StyleSheet.create({
  aviso: { fontSize: 13, color: colores.textoSuave, marginBottom: 10 },
  filaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  chipElegido: { backgroundColor: '#132048', borderColor: '#132048' },
  textoChip: { fontSize: 13, fontWeight: '600', color: colores.textoSuave },
  textoChipElegido: { color: '#ffffff' },

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
