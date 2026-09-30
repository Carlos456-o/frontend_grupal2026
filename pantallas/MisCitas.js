// PANTALLA: Mis citas (cliente)
// Tiene dos pestañas: "Próximas" (pendiente/confirmada/en_proceso) e
// "Historial" (completada/cancelada). Cada tarjeta muestra botones
// distintos según el estado de la cita.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { citas } from '../datos/citas';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import { colores, coloresPorEstado } from '../estilos/colores';

const NOMBRES_ESTADO = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_proceso: 'En proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};
const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES_ABREV = ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'];

function formatearFecha(fechaISO) {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  return `${DIAS_SEMANA[fecha.getDay()]} ${fecha.getDate()} de ${MESES_ABREV[fecha.getMonth()]}`;
}

export default function MisCitas({ usuario, navegarA }) {
  const [pestana, setPestana] = useState('proximas'); // "proximas" o "historial"

  const misCitas = citas.filter((c) => c.clienteId === usuario.perfil.id);
  const citasMostradas = misCitas
    .filter((c) =>
      pestana === 'proximas'
        ? ['pendiente', 'confirmada', 'en_proceso'].includes(c.estado)
        : ['completada', 'cancelada'].includes(c.estado)
    )
    .sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1));

  function alCancelar() {
    Alert.alert('Cancelar cita', '¿Seguro que deseas cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        // Todavía no hay backend, así que solo avisamos (no se guarda el cambio).
        onPress: () => Alert.alert('Cita cancelada'),
      },
    ]);
  }

  function alReprogramar() {
    Alert.alert('Próximamente', 'Pronto podrás elegir una nueva fecha y hora para tu cita.');
  }

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Mis citas" />

      <View style={estilos.selector}>
        <Pressable
          style={[estilos.opcionSelector, pestana === 'proximas' && estilos.opcionSelectorActiva]}
          onPress={() => setPestana('proximas')}
        >
          <Text style={[estilos.textoSelector, pestana === 'proximas' && estilos.textoSelectorActivo]}>Próximas</Text>
        </Pressable>
        <Pressable
          style={[estilos.opcionSelector, pestana === 'historial' && estilos.opcionSelectorActiva]}
          onPress={() => setPestana('historial')}
        >
          <Text style={[estilos.textoSelector, pestana === 'historial' && estilos.textoSelectorActivo]}>Historial</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={estilos.lista}>
        {citasMostradas.length === 0 ? (
          <SinResultados texto={pestana === 'proximas' ? 'No tienes citas próximas' : 'Aún no tienes historial'} />
        ) : (
          citasMostradas.map((cita) => {
            const color = coloresPorEstado[cita.estado];
            return (
              <Tarjeta key={cita.id} estilo={estilos.tarjetaCita}>
                <View style={estilos.filaTitulo}>
                  <Text style={estilos.nombreServicio}>{cita.servicio.nombre}</Text>
                  <View style={[estilos.insigniaEstado, { backgroundColor: color.fondo }]}>
                    <Text style={[estilos.textoInsignia, { color: color.texto }]}>{NOMBRES_ESTADO[cita.estado]}</Text>
                  </View>
                </View>
                <Text style={estilos.fechaHora}>
                  {formatearFecha(cita.fecha)} · {cita.hora}
                </Text>
                <View style={estilos.filaVehiculo}>
                  <Ionicons name="car-outline" size={14} color={colores.textoSuave} />
                  <Text style={estilos.textoVehiculo}>
                    {cita.vehiculo.modelo} · Placa {cita.vehiculo.placa}
                  </Text>
                </View>

                {pestana === 'proximas' ? (
                  cita.estado === 'pendiente' ? (
                    <View style={estilos.filaBotones}>
                      <Boton texto="Reprogramar" tipo="borde" alPresionar={alReprogramar} estilo={estilos.botonMitad} />
                      <Boton texto="Cancelar" tipo="peligro" alPresionar={alCancelar} estilo={estilos.botonMitad} />
                    </View>
                  ) : (
                    <Boton
                      texto="Ver detalles"
                      tipo="borde"
                      alPresionar={() => navegarA('clienteDetalleCita', { citaId: cita.id })}
                    />
                  )
                ) : (
                  <Boton
                    texto="Ver detalles"
                    tipo="borde"
                    alPresionar={() => navegarA('clienteDetalleCita', { citaId: cita.id })}
                  />
                )}
              </Tarjeta>
            );
          })
        )}

        <Pressable style={estilos.tarjetaNueva} onPress={() => navegarA('clienteCalculadora')}>
          <Text style={estilos.iconoMas}>+</Text>
          <Text style={estilos.textoNueva1}>¿Necesitas otro lavado?</Text>
          <Text style={estilos.textoNueva2}>Agenda una nueva cita</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  selector: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  opcionSelector: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  opcionSelectorActiva: { backgroundColor: '#132048' },
  textoSelector: { fontSize: 13, fontWeight: '700', color: colores.textoSuave },
  textoSelectorActivo: { color: '#ffffff' },

  lista: { paddingHorizontal: 16, paddingBottom: 24 },

  tarjetaCita: {},
  filaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  nombreServicio: { fontSize: 16, fontWeight: '700', color: colores.texto, flexShrink: 1, marginRight: 8 },
  insigniaEstado: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  textoInsignia: { fontSize: 11, fontWeight: '700' },
  fechaHora: { fontSize: 13, color: colores.textoSuave, marginBottom: 8 },
  filaVehiculo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  textoVehiculo: { fontSize: 13, color: colores.textoSuave },

  filaBotones: { flexDirection: 'row', gap: 10 },
  botonMitad: { flex: 1 },

  tarjetaNueva: {
    borderWidth: 1.5,
    borderColor: colores.borde,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 24,
    alignItems: 'center',
  },
  iconoMas: { fontSize: 24, color: colores.textoSuave, marginBottom: 6 },
  textoNueva1: { fontSize: 13, color: colores.textoSuave },
  textoNueva2: { fontSize: 14, fontWeight: '700', color: colores.principal, marginTop: 2 },
});
