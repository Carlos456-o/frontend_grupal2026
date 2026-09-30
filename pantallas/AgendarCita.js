// PANTALLA: Agendar cita
// Segundo paso: con el paquete y los extras que vienen de Calculadora.js
// (en "parametros"), el cliente elige fecha, hora y una solicitud especial.
//
// Las 4 fechas se calculan solas a partir de hoy (hoy, mañana, pasado...),
// así que siempre muestran días reales en vez de fechas fijas de ejemplo.

import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { servicios } from '../datos/servicios';
import { extras } from '../datos/extras';
import Tarjeta from '../componentes/Tarjeta';
import { colores } from '../estilos/colores';

const NOMBRES_DIA = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

// Genera los próximos "cantidad" días a partir de hoy, ej:
// [{ clave: '2026-09-09', dia: 'MIÉ', numero: 9 }, ...]
function generarProximosDias(cantidad) {
  const dias = [];
  const hoy = new Date();
  for (let i = 0; i < cantidad; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + i);
    dias.push({
      clave: fecha.toISOString().slice(0, 10),
      dia: NOMBRES_DIA[fecha.getDay()],
      numero: fecha.getDate(),
    });
  }
  return dias;
}

const HORAS_DISPONIBLES = [
  { hora: '9:00 am', disponible: true },
  { hora: '10:30 am', disponible: true },
  { hora: '1:00 pm', disponible: true },
  { hora: '2:30 pm', disponible: false },
  { hora: '3:30 pm', disponible: true },
  { hora: '5:00 pm', disponible: true },
];

export default function AgendarCita({ parametros, navegarA }) {
  const servicio = servicios.find((s) => s.id === parametros.servicioId);
  const extrasElegidos = extras.filter((e) => (parametros.extraIds || []).includes(e.id));
  const total = servicio.precio + extrasElegidos.reduce((suma, e) => suma + e.precio, 0);

  const dias = generarProximosDias(4);
  const [fechaElegida, setFechaElegida] = useState(dias[0].clave);
  const [horaElegida, setHoraElegida] = useState('10:30 am');
  const [solicitud, setSolicitud] = useState('');

  function alConfirmar() {
    // Aquí, cuando tengamos un backend real, mandaríamos estos datos
    // para crear la "cita" de verdad.
    Alert.alert('Cita agendada', 'Tu cita ha sido registrada correctamente.', [
      { text: 'OK', onPress: () => navegarA('clienteCitas') },
    ]);
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Pressable onPress={() => navegarA('clienteCalculadora')} style={estilos.botonAtras}>
          <Ionicons name="chevron-back" size={26} color={colores.texto} />
        </Pressable>
        <Text style={estilos.titulo}>Agendar cita</Text>
      </View>

      <ScrollView style={estilos.contenido} contentContainerStyle={estilos.contenidoInterno}>
        <Text style={estilos.tituloSeccion}>Servicio seleccionado</Text>
        <Tarjeta estilo={estilos.tarjetaServicio}>
          <View style={estilos.iconoCuadro}>
            <Ionicons name={servicio.icono} size={20} color="#ffffff" />
          </View>
          <View style={estilos.textosServicio}>
            <Text style={estilos.nombreServicio}>{servicio.nombre}</Text>
            <Text style={estilos.detalleServicio}>
              {servicio.duracionMinutos} min · C${servicio.precio}
              {extrasElegidos.length > 0 ? ` + ${extrasElegidos.length} extra(s)` : ''}
            </Text>
          </View>
          <Text style={estilos.enlaceCambiar} onPress={() => navegarA('clienteCalculadora')}>
            Cambiar
          </Text>
        </Tarjeta>

        <Text style={estilos.tituloSeccion}>Fecha</Text>
        <View style={estilos.filaDias}>
          {dias.map((d) => {
            const elegido = d.clave === fechaElegida;
            return (
              <Pressable key={d.clave} onPress={() => setFechaElegida(d.clave)} style={[estilos.chipDia, elegido && estilos.chipElegido]}>
                <Text style={[estilos.textoDiaNombre, elegido && estilos.textoElegido]}>{d.dia}</Text>
                <Text style={[estilos.textoDiaNumero, elegido && estilos.textoElegido]}>{d.numero}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={estilos.tituloSeccion}>Hora disponible</Text>
        <View style={estilos.filaHoras}>
          {HORAS_DISPONIBLES.map((h) => {
            const elegido = h.hora === horaElegida;
            return (
              <Pressable
                key={h.hora}
                disabled={!h.disponible}
                onPress={() => setHoraElegida(h.hora)}
                style={[estilos.chipHora, elegido && estilos.chipElegido, !h.disponible && estilos.chipDeshabilitado]}
              >
                <Text
                  style={[
                    estilos.textoHora,
                    elegido && estilos.textoElegido,
                    !h.disponible && estilos.textoDeshabilitado,
                  ]}
                >
                  {h.hora}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={estilos.tituloSeccion}>Solicitud especial (opcional)</Text>
        <TextInput
          value={solicitud}
          onChangeText={setSolicitud}
          placeholder="Ej: manchas de resina en el capó..."
          placeholderTextColor={colores.textoSuave}
          multiline
          style={estilos.textarea}
        />
      </ScrollView>

      <Pressable onPress={alConfirmar} style={estilos.barraTotal}>
        <Text style={estilos.etiquetaTotal}>Total estimado</Text>
        <Text style={estilos.valorTotal}>C${total}</Text>
      </Pressable>
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
  titulo: { fontSize: 17, fontWeight: '800', color: colores.texto },

  contenido: { flex: 1, backgroundColor: colores.fondo },
  contenidoInterno: { padding: 16, paddingBottom: 32 },

  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoSuave,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 16,
  },

  tarjetaServicio: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfeff', borderColor: '#a5f3fc' },
  iconoCuadro: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#06b6d4', alignItems: 'center', justifyContent: 'center' },
  textosServicio: { flex: 1, marginLeft: 12 },
  nombreServicio: { fontSize: 14, fontWeight: '700', color: colores.texto },
  detalleServicio: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  enlaceCambiar: { fontSize: 12, fontWeight: '700', color: colores.principal },

  filaDias: { flexDirection: 'row', gap: 8 },
  chipDia: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  textoDiaNombre: { fontSize: 11, fontWeight: '600', color: colores.textoSuave },
  textoDiaNumero: { fontSize: 16, fontWeight: '800', color: colores.texto, marginTop: 2 },

  filaHoras: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipHora: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  chipDeshabilitado: { backgroundColor: colores.fondo, opacity: 0.6 },
  textoHora: { fontSize: 13, fontWeight: '600', color: colores.texto },
  textoDeshabilitado: { color: colores.textoSuave, textDecorationLine: 'line-through' },

  chipElegido: { backgroundColor: '#132048', borderColor: '#132048' },
  textoElegido: { color: '#ffffff' },

  textarea: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    backgroundColor: colores.fondo,
    padding: 14,
    minHeight: 80,
    fontSize: 14,
    color: colores.texto,
    textAlignVertical: 'top',
  },

  barraTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  etiquetaTotal: { fontSize: 14, color: colores.textoSuave, fontWeight: '600' },
  valorTotal: { fontSize: 20, fontWeight: '800', color: '#132048' },
});
