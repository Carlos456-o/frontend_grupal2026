// PANTALLA: Reportes de clientes (admin, HF11)
// Bandeja con los problemas que reportan los clientes, en tiempo real.
// El admin lee cada uno, escribe una respuesta y lo marca como resuelto;
// el cliente ve esa respuesta en su pantalla "Reportar un problema".

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Linking, Alert } from 'react-native';
import { escucharReportes, responderReporte, nombreTipoReporte, fechaHoraTexto } from '../firebase/reportes';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

const FILTROS = [
  { clave: 'abierto', texto: 'Abiertos' },
  { clave: 'resuelto', texto: 'Resueltos' },
  { clave: 'todos', texto: 'Todos' },
];

export default function Reportes({ navegarA }) {
  const [reportes, setReportes] = useState(null);
  const [filtro, setFiltro] = useState('abierto');
  // Lo que el admin va escribiendo en cada reporte: { [reporteId]: 'texto' }
  const [respuestas, setRespuestas] = useState({});
  const [guardando, setGuardando] = useState(null);

  useEffect(() => escucharReportes(setReportes), []);

  const lista = (reportes ?? []).filter((r) => filtro === 'todos' || r.estado === filtro);
  const abiertos = (reportes ?? []).filter((r) => r.estado === 'abierto').length;

  async function alResponder(reporte) {
    const texto = (respuestas[reporte.id] ?? '').trim();
    if (!texto) {
      Alert.alert('Escribe una respuesta', 'Cuéntale al cliente qué se hizo para resolverlo.');
      return;
    }
    setGuardando(reporte.id);
    try {
      await responderReporte(reporte.id, texto);
      setRespuestas((anteriores) => ({ ...anteriores, [reporte.id]: '' }));
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar la respuesta. Intenta de nuevo.');
    }
    setGuardando(null);
  }

  return (
    <View style={estilos.contenedor}>
      <Encabezado
        titulo="Reportes"
        subtitulo={reportes ? `${abiertos} ${abiertos === 1 ? 'reporte abierto' : 'reportes abiertos'}` : 'Problemas de los clientes'}
        alVolver={() => navegarA('adminMas')}
      />

      <View style={estilos.filaChips}>
        {FILTROS.map((f) => (
          <Pressable key={f.clave} onPress={() => setFiltro(f.clave)} style={[estilos.chip, filtro === f.clave && estilos.chipActivo]}>
            <Text style={[estilos.textoChip, filtro === f.clave && estilos.textoChipActivo]}>{f.texto}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={estilos.lista} keyboardShouldPersistTaps="handled">
        {reportes === null ? (
          <Cargando />
        ) : lista.length === 0 ? (
          <SinResultados texto={filtro === 'abierto' ? 'No hay reportes abiertos' : 'No hay reportes'} />
        ) : (
          lista.map((r) => (
            <Tarjeta key={r.id}>
              <View style={estilos.filaTitulo}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.nombre}>{r.clienteNombre || 'Cliente'}</Text>
                  <Text style={estilos.detalle}>
                    {nombreTipoReporte(r.tipo)} · {fechaHoraTexto(r.fecha)}
                  </Text>
                </View>
                <Text style={[estilos.insignia, r.estado === 'resuelto' ? estilos.insigniaResuelto : estilos.insigniaAbierto]}>
                  {r.estado === 'resuelto' ? 'Resuelto' : 'Abierto'}
                </Text>
              </View>

              <Text style={estilos.descripcion}>{r.descripcion}</Text>

              <View style={estilos.filaEnlaces}>
                {r.clienteTelefono ? (
                  <Text style={estilos.enlace} onPress={() => Linking.openURL(`tel:${r.clienteTelefono}`)}>
                    Llamar al {r.clienteTelefono}
                  </Text>
                ) : null}
                {r.citaId ? (
                  <Text style={estilos.enlace} onPress={() => navegarA('adminSeguimientoLavado', { citaId: r.citaId })}>
                    Ver la cita
                  </Text>
                ) : null}
              </View>

              {r.estado === 'resuelto' ? (
                <View style={estilos.respuesta}>
                  <Text style={estilos.etiquetaRespuesta}>Tu respuesta · {fechaHoraTexto(r.fechaRespuesta)}</Text>
                  <Text style={estilos.textoRespuesta}>{r.respuesta}</Text>
                </View>
              ) : (
                <>
                  <TextInput
                    value={respuestas[r.id] ?? ''}
                    onChangeText={(texto) => setRespuestas((anteriores) => ({ ...anteriores, [r.id]: texto }))}
                    placeholder="Escribe la respuesta para el cliente..."
                    placeholderTextColor={colores.textoSuave}
                    multiline
                    style={estilos.textarea}
                  />
                  <Boton
                    texto={guardando === r.id ? 'Guardando...' : 'Responder y marcar resuelto'}
                    alPresionar={() => alResponder(r)}
                    estilo={estilos.botonOscuro}
                  />
                </>
              )}
            </Tarjeta>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  filaChips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chipActivo: { backgroundColor: '#132048', borderColor: '#132048' },
  textoChip: { fontSize: 12, fontWeight: '600', color: colores.textoSuave },
  textoChipActivo: { color: '#ffffff' },

  lista: { paddingHorizontal: 16, paddingBottom: 24 },
  filaTitulo: { flexDirection: 'row', alignItems: 'center' },
  nombre: { fontSize: 15, fontWeight: '700', color: colores.texto },
  detalle: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  insignia: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  insigniaAbierto: { backgroundColor: '#fef3c7', color: '#92400e' },
  insigniaResuelto: { backgroundColor: '#dcfce7', color: '#166534' },

  descripcion: { fontSize: 14, color: colores.texto, marginTop: 10 },
  filaEnlaces: { flexDirection: 'row', gap: 16, marginTop: 8 },
  enlace: { fontSize: 13, fontWeight: '600', color: colores.principal },

  textarea: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 10,
    backgroundColor: colores.fondo,
    padding: 12,
    minHeight: 70,
    fontSize: 14,
    color: colores.texto,
    textAlignVertical: 'top',
    marginTop: 12,
    marginBottom: 10,
  },
  botonOscuro: { backgroundColor: '#132048' },

  respuesta: { marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: '#f0fdf4' },
  etiquetaRespuesta: { fontSize: 11, fontWeight: '700', color: '#166534' },
  textoRespuesta: { fontSize: 14, color: colores.texto, marginTop: 2 },
});
