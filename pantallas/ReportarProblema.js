// PANTALLA: Reportar un problema (cliente, HF11)
// El cliente elige qué tipo de problema tuvo, lo describe y lo envía.
// Se guarda en la colección "reportes" de Firebase y le llega al admin.
// Abajo ve sus reportes anteriores con la respuesta del negocio, que se
// actualiza sola en cuanto el admin contesta.
//
// Se puede abrir desde el perfil o desde el detalle de una cita
// (en ese caso llega "parametros.citaId" y el reporte queda ligado a la cita).

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { obtenerCita } from '../firebase/citas';
import { crearReporte, escucharReportesDeCliente, TIPOS_REPORTE, nombreTipoReporte, fechaHoraTexto } from '../firebase/reportes';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import { colores } from '../estilos/colores';

const LARGO_MINIMO = 10;

export default function ReportarProblema({ usuario, parametros, navegarA }) {
  const citaId = parametros?.citaId ?? null;
  const { datos: cita } = useDatos(() => (citaId ? obtenerCita(citaId) : Promise.resolve(null)), [citaId]);

  const [tipo, setTipo] = useState(citaId ? 'servicio' : null);
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [misReportes, setMisReportes] = useState(null);
  useEffect(() => escucharReportesDeCliente(usuario.perfil.id, setMisReportes), [usuario.perfil.id]);

  function alVolver() {
    if (citaId) navegarA('clienteDetalleCita', { citaId });
    else navegarA('clientePerfil');
  }

  async function alEnviar() {
    if (enviando) return;
    if (!tipo) return setError('Elige qué tipo de problema tuviste.');
    if (descripcion.trim().length < LARGO_MINIMO) return setError('Cuéntanos un poco más de lo que pasó (mínimo 10 letras).');

    setEnviando(true);
    setError('');
    try {
      await crearReporte({
        clienteId: usuario.perfil.id,
        clienteNombre: usuario.perfil.nombre,
        clienteTelefono: usuario.telefono,
        tipo,
        citaId,
        descripcion: descripcion.trim(),
      });
      setDescripcion('');
      setTipo(citaId ? 'servicio' : null);
      Alert.alert('Reporte enviado', 'Gracias por avisarnos. Te responderemos aquí mismo lo antes posible.');
    } catch (e) {
      setError('No se pudo enviar el reporte. Intenta de nuevo.');
    }
    setEnviando(false);
  }

  return (
    <KeyboardAvoidingView style={estilos.contenedor} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Encabezado titulo="Reportar un problema" subtitulo="Cuéntanos qué pasó" alVolver={alVolver} />

        <View style={estilos.seccion}>
          {cita ? (
            <Tarjeta estilo={estilos.tarjetaCita}>
              <Text style={estilos.etiqueta}>Sobre tu cita</Text>
              <Text style={estilos.valor}>
                {cita.servicio.nombre} · {cita.fecha}, {cita.hora}
              </Text>
            </Tarjeta>
          ) : null}

          <Text style={estilos.tituloSeccion}>¿Qué tipo de problema?</Text>
          <View style={estilos.filaChips}>
            {TIPOS_REPORTE.map((t) => (
              <Pressable key={t.clave} onPress={() => setTipo(t.clave)} style={[estilos.chip, tipo === t.clave && estilos.chipActivo]}>
                <Text style={[estilos.textoChip, tipo === t.clave && estilos.textoChipActivo]}>{t.texto}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={estilos.tituloSeccion}>Describe el problema</Text>
          <TextInput
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Ej: quedaron manchas de jabón en el parabrisas..."
            placeholderTextColor={colores.textoSuave}
            multiline
            maxLength={500}
            style={estilos.textarea}
          />
          <Text style={estilos.contador}>{descripcion.length}/500</Text>

          {error ? <Text style={estilos.error}>{error}</Text> : null}
          <Boton texto={enviando ? 'Enviando...' : 'Enviar reporte'} alPresionar={alEnviar} estilo={estilos.botonOscuro} />
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.tituloSeccion}>Mis reportes</Text>
          {misReportes === null ? null : misReportes.length === 0 ? (
            <SinResultados texto="Aún no has enviado reportes" />
          ) : (
            misReportes.map((r) => (
              <Tarjeta key={r.id}>
                <View style={estilos.filaReporte}>
                  <Text style={estilos.tipoReporte}>{nombreTipoReporte(r.tipo)}</Text>
                  <Text style={[estilos.insignia, r.estado === 'resuelto' ? estilos.insigniaResuelto : estilos.insigniaAbierto]}>
                    {r.estado === 'resuelto' ? 'Resuelto' : 'En revisión'}
                  </Text>
                </View>
                <Text style={estilos.fecha}>{fechaHoraTexto(r.fecha)}</Text>
                <Text style={estilos.descripcion}>{r.descripcion}</Text>
                {r.respuesta ? (
                  <View style={estilos.respuesta}>
                    <Text style={estilos.etiquetaRespuesta}>Respuesta del autolavado</Text>
                    <Text style={estilos.textoRespuesta}>{r.respuesta}</Text>
                  </View>
                ) : null}
              </Tarjeta>
            ))
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  seccion: { paddingHorizontal: 16, marginBottom: 20 },
  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoSuave,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 10,
  },

  tarjetaCita: { backgroundColor: '#ecfeff', borderColor: '#a5f3fc' },
  etiqueta: { fontSize: 12, color: colores.textoSuave },
  valor: { fontSize: 14, fontWeight: '700', color: colores.texto, marginTop: 2 },

  filaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chipActivo: { backgroundColor: '#132048', borderColor: '#132048' },
  textoChip: { fontSize: 13, fontWeight: '600', color: colores.textoSuave },
  textoChipActivo: { color: '#ffffff' },

  textarea: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    backgroundColor: colores.tarjeta,
    padding: 14,
    minHeight: 110,
    fontSize: 14,
    color: colores.texto,
    textAlignVertical: 'top',
  },
  contador: { fontSize: 11, color: colores.textoSuave, textAlign: 'right', marginTop: 4, marginBottom: 12 },
  error: { color: colores.peligro, fontSize: 13, marginBottom: 12 },
  botonOscuro: { backgroundColor: '#132048' },

  filaReporte: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipoReporte: { fontSize: 14, fontWeight: '700', color: colores.texto, flex: 1 },
  insignia: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  insigniaAbierto: { backgroundColor: '#fef3c7', color: '#92400e' },
  insigniaResuelto: { backgroundColor: '#dcfce7', color: '#166534' },
  fecha: { fontSize: 11, color: colores.textoSuave, marginTop: 2 },
  descripcion: { fontSize: 14, color: colores.texto, marginTop: 8 },
  respuesta: { marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: colores.fondoTab },
  etiquetaRespuesta: { fontSize: 11, fontWeight: '700', color: colores.textoSuave },
  textoRespuesta: { fontSize: 14, color: colores.texto, marginTop: 2 },
});
