// PANTALLA: Seguimiento del lavado
// La usa el empleado para ir marcando los pasos del servicio conforme los
// termina, y también el administrador para ver cómo va cada cita (desde
// "Citas de hoy"). Los 4 pasos son siempre los mismos, sin importar el
// servicio; cada uno se puede marcar como hecho o pendiente.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { citas } from '../datos/citas';
import { clientes } from '../datos/clientes';
import { empleados } from '../datos/empleados';
import Tarjeta from '../componentes/Tarjeta';
import InsigniaEstado from '../componentes/InsigniaEstado';
import SinResultados from '../componentes/SinResultados';
import { colores } from '../estilos/colores';

const NOMBRES_PASOS = ['Lavado exterior', 'Aspirado interior', 'Encerado', 'Secado y entrega'];

// Cuántos pasos vienen "ya hechos" según el estado general de la cita,
// solo para que la pantalla no arranque siempre en cero.
const PASOS_INICIALES_POR_ESTADO = { pendiente: 0, confirmada: 0, en_proceso: 2, completada: 4, cancelada: 0 };

function horaActual() {
  const ahora = new Date();
  const horas = ahora.getHours() % 12 || 12;
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const turno = ahora.getHours() >= 12 ? 'pm' : 'am';
  return `${horas}:${minutos} ${turno}`;
}

export default function SeguimientoLavado({ usuario, parametros, navegarA }) {
  const cita = citas.find((c) => c.id === parametros.citaId);
  const cliente = clientes.find((c) => c.id === cita?.clienteId);
  const empleado = empleados.find((e) => e.id === cita?.empleadoId);

  const cantidadInicial = PASOS_INICIALES_POR_ESTADO[cita?.estado] ?? 0;
  const [pasos, setPasos] = useState(
    NOMBRES_PASOS.map((nombre, indice) => ({
      nombre,
      hecho: indice < cantidadInicial,
      hora: indice < cantidadInicial ? horaActual() : null,
    }))
  );

  if (!cita) return <SinResultados texto="Cita no encontrada" />;

  const pasosCompletados = pasos.filter((p) => p.hecho).length;

  function alternarPaso(indice, hecho) {
    setPasos((anteriores) =>
      anteriores.map((paso, i) => (i === indice ? { ...paso, hecho, hora: hecho ? horaActual() : null } : paso))
    );
  }

  const iniciales = (cliente?.nombre || '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
          <Text style={estilos.subtitulo}>Panel del empleado</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={estilos.contenido}>
        <Tarjeta estilo={estilos.filaCliente}>
          <View style={estilos.avatar}>
            <Text style={estilos.textoAvatar}>{iniciales}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={estilos.nombreCliente}>{cliente?.nombre}</Text>
            <Text style={estilos.detalleCliente}>
              {cita.vehiculo.modelo} · Placa {cita.vehiculo.placa}
            </Text>
          </View>
          <InsigniaEstado estado={cita.estado} />
        </Tarjeta>

        <Text style={estilos.tituloSeccion}>Pasos del servicio</Text>
        {pasos.map((paso, indice) => (
          <Tarjeta key={paso.nombre} estilo={estilos.filaPaso}>
            <View style={{ flex: 1 }}>
              <Text style={estilos.nombrePaso}>{paso.nombre}</Text>
              <Text style={[estilos.estadoPaso, paso.hecho ? estilos.estadoHecho : estilos.estadoPendiente]}>
                {paso.hecho ? `${empleado?.nombre || 'Empleado'} · ${paso.hora}` : 'Pendiente · sin marcar'}
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

        <View style={estilos.resumen}>
          <View style={estilos.avatarResumen}>
            <Ionicons name="person" size={16} color="#ffffff" />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={estilos.textoResumen}>Atendido por {empleado?.nombre || 'empleado asignado'}</Text>
            <Text style={estilos.subtextoResumen}>
              {pasosCompletados} de {pasos.length} pasos completados · {horaActual()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  textoAvatar: { color: '#ffffff', fontWeight: '700' },
  nombreCliente: { fontSize: 15, fontWeight: '700', color: colores.texto },
  detalleCliente: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },

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
  nombrePaso: { fontSize: 14, fontWeight: '700', color: colores.texto },
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
