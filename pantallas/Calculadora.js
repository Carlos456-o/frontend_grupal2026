// PANTALLA: Calcula tu lavado
// Primer paso para agendar una cita: el cliente elige un paquete (uno de
// los servicios de la categoría "Lavados") y puede agregar extras opcionales.
// Al final, el botón de abajo ("Total a pagar") lleva a la pantalla
// "Agendar cita" (AgendarCita.js) llevando el paquete y los extras elegidos.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { servicios } from '../datos/servicios';
import { extras } from '../datos/extras';
import Tarjeta from '../componentes/Tarjeta';
import { colores } from '../estilos/colores';

const paquetes = servicios.filter((s) => s.categoriaId === 'cat1'); // solo "Lavados"
const paqueteDestacado = paquetes.find((p) => p.destacado) || paquetes[0];

export default function Calculadora({ navegarA }) {
  const [paqueteId, setPaqueteId] = useState(paqueteDestacado.id);
  const [extrasElegidos, setExtrasElegidos] = useState(['ext1']); // Perfume viene elegido por defecto

  const paquete = paquetes.find((p) => p.id === paqueteId);
  const totalExtras = extras
    .filter((e) => extrasElegidos.includes(e.id))
    .reduce((suma, e) => suma + e.precio, 0);
  const total = paquete.precio + totalExtras;

  function alternarExtra(id) {
    setExtrasElegidos((anteriores) =>
      anteriores.includes(id) ? anteriores.filter((e) => e !== id) : [...anteriores, id]
    );
  }

  function alContinuar() {
    navegarA('clienteAgendarCita', { servicioId: paqueteId, extraIds: extrasElegidos });
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Pressable onPress={() => navegarA('clienteInicio')} style={estilos.botonAtras}>
          <Ionicons name="chevron-back" size={26} color={colores.texto} />
        </Pressable>
        <View>
          <Text style={estilos.titulo}>Calcula tu lavado</Text>
          <Text style={estilos.subtitulo}>Elige un paquete y agrega extras</Text>
        </View>
      </View>

      <ScrollView style={estilos.contenido} contentContainerStyle={estilos.contenidoInterno}>
        <Text style={estilos.tituloSeccion}>1. Elige tu paquete</Text>
        {paquetes.map((p) => {
          const seleccionado = p.id === paqueteId;
          return (
            <View key={p.id}>
              {p.destacado ? (
                <View style={estilos.insignia}>
                  <Text style={estilos.textoInsignia}>KIT COMPLETO · MÁS ELEGIDO</Text>
                </View>
              ) : null}
              <Pressable onPress={() => setPaqueteId(p.id)}>
                <Tarjeta estilo={[estilos.filaPaquete, seleccionado && estilos.paqueteSeleccionado]}>
                  <View style={[estilos.iconoCuadro, { backgroundColor: p.colorFondoIcono }]}>
                    <Ionicons name={p.icono} size={20} color={p.colorIcono} />
                  </View>
                  <View style={estilos.textosPaquete}>
                    <Text style={estilos.nombrePaquete}>{p.nombre}</Text>
                    <Text style={estilos.descripcionPaquete}>
                      {p.descripcion} · {p.duracionMinutos} min
                    </Text>
                  </View>
                  <Text style={estilos.precioPaquete}>C${p.precio}</Text>
                  <View style={[estilos.radio, seleccionado && estilos.radioSeleccionado]}>
                    {seleccionado ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
                  </View>
                </Tarjeta>
              </Pressable>
            </View>
          );
        })}

        <Text style={[estilos.tituloSeccion, { marginTop: 8 }]}>2. Agrega extras (opcional)</Text>
        <View style={estilos.filaExtras}>
          {extras.map((extra) => {
            const elegido = extrasElegidos.includes(extra.id);
            return (
              <Pressable key={extra.id} onPress={() => alternarExtra(extra.id)} style={[estilos.chipExtra, elegido && estilos.chipExtraElegido]}>
                <Text style={[estilos.textoChipExtra, elegido && estilos.textoChipExtraElegido]}>
                  + {extra.nombre}
                </Text>
                <Text style={[estilos.precioChipExtra, elegido && estilos.precioChipExtraElegido]}>
                  +C${extra.precio}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <Pressable onPress={alContinuar} style={estilos.barraTotal}>
        <Text style={estilos.etiquetaTotal}>Total a pagar</Text>
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
  subtitulo: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },

  contenido: { flex: 1, backgroundColor: colores.fondo },
  contenidoInterno: { padding: 16, paddingBottom: 32 },

  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoSuave,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  insignia: {
    alignSelf: 'flex-start',
    backgroundColor: '#7c3aed',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 6,
    marginLeft: 4,
  },
  textoInsignia: { color: '#ffffff', fontSize: 9, fontWeight: '700' },

  filaPaquete: { flexDirection: 'row', alignItems: 'center' },
  paqueteSeleccionado: { borderColor: '#7c3aed', borderWidth: 2, backgroundColor: '#f5f3ff' },
  iconoCuadro: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  textosPaquete: { flex: 1, marginLeft: 12 },
  nombrePaquete: { fontSize: 14, fontWeight: '700', color: colores.texto },
  descripcionPaquete: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  precioPaquete: { fontSize: 14, fontWeight: '700', color: colores.texto, marginRight: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSeleccionado: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },

  filaExtras: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipExtra: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipExtraElegido: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  textoChipExtra: { fontSize: 13, fontWeight: '600', color: colores.texto },
  textoChipExtraElegido: { color: '#c2410c' },
  precioChipExtra: { fontSize: 11, color: colores.textoSuave, marginTop: 2 },
  precioChipExtraElegido: { color: '#c2410c', textDecorationLine: 'line-through' },

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
  valorTotal: { fontSize: 20, fontWeight: '800', color: '#7c3aed' },
});
