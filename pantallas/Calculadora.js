// PANTALLA: Calcula tu lavado
// Primer paso para agendar una cita: el cliente elige un servicio del
// catálogo de Firebase. El botón "Siguiente" (al lado del total) lleva a la
// pantalla "Agendar cita" (AgendarCita.js) con el servicio elegido.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerCatalogo } from '../firebase/servicios';
import { obtenerPromociones, mejorDescuento } from '../firebase/promociones';
import { useDatos } from '../firebase/utilidades';
import Tarjeta from '../componentes/Tarjeta';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

export default function Calculadora({ parametros, navegarA }) {
  const { datos, cargando, error, recargar } = useDatos(obtenerCatalogo);
  const paquetes = datos ?? [];
  // Si volvemos desde "Agendar cita" con "Cambiar", mantenemos el servicio elegido.
  const [paqueteId, setPaqueteId] = useState(parametros?.servicioId ?? null);

  // Promociones: si un servicio tiene descuento vigente, mostramos su precio rebajado.
  const { datos: promociones } = useDatos(obtenerPromociones);

  const paquete = paquetes.find((p) => p.id === paqueteId) ?? paquetes[0];
  const descuentoElegido = mejorDescuento(promociones, paquete);
  const total = descuentoElegido ? descuentoElegido.precioFinal : paquete?.precio ?? 0;

  function alContinuar() {
    if (!paquete) return;
    navegarA('clienteAgendarCita', { servicio: paquete });
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Pressable onPress={() => navegarA('clienteInicio')} style={estilos.botonAtras}>
          <Ionicons name="chevron-back" size={26} color={colores.texto} />
        </Pressable>
        <View>
          <Text style={estilos.titulo}>Calcula tu lavado</Text>
          <Text style={estilos.subtitulo}>Elige el servicio que quieres</Text>
        </View>
      </View>

      <ScrollView style={estilos.contenido} contentContainerStyle={estilos.contenidoInterno}>
        <Text style={estilos.tituloSeccion}>Elige tu servicio</Text>
        {cargando || error ? <Cargando error={error} alReintentar={recargar} /> : null}
        {paquetes.map((p) => {
          const seleccionado = p.id === paquete?.id;
          const descuento = mejorDescuento(promociones, p);
          return (
            <View key={p.catalogoId}>
              <Pressable onPress={() => setPaqueteId(p.id)}>
                <Tarjeta estilo={[estilos.filaPaquete, seleccionado && estilos.paqueteSeleccionado]}>
                  <View style={[estilos.iconoCuadro, { backgroundColor: colores.fondoTab }]}>
                    <Ionicons name="car-outline" size={20} color={colores.principal} />
                  </View>
                  <View style={estilos.textosPaquete}>
                    <Text style={estilos.nombrePaquete}>{p.nombre}</Text>
                    <Text style={estilos.descripcionPaquete}>
                      {p.descripcion}
                      {p.duracionMinutos != null ? ` · ${p.duracionMinutos} min` : ''}
                    </Text>
                  </View>
                  {descuento ? (
                    <View style={estilos.columnaPrecio}>
                      <Text style={estilos.precioTachado}>C${p.precio}</Text>
                      <Text style={[estilos.precioPaquete, estilos.precioRebajado]}>C${descuento.precioFinal}</Text>
                    </View>
                  ) : (
                    <Text style={estilos.precioPaquete}>C${p.precio}</Text>
                  )}
                  <View style={[estilos.radio, seleccionado && estilos.radioSeleccionado]}>
                    {seleccionado ? <Ionicons name="checkmark" size={14} color="#ffffff" /> : null}
                  </View>
                </Tarjeta>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {/* Total a la izquierda y, al lado, el botón para seguir a "Agendar cita". */}
      <View style={estilos.barraTotal}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.etiquetaTotal}>Total a pagar</Text>
          <Text style={estilos.valorTotal}>C${total}</Text>
          {descuentoElegido ? (
            <Text style={estilos.textoAhorro} numberOfLines={1}>
              Ahorras C${descuentoElegido.monto} · {descuentoElegido.promocion.titulo}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={alContinuar}
          disabled={!paquete}
          style={[estilos.botonAgendar, !paquete && { opacity: 0.4 }]}
        >
          <Text style={estilos.textoBotonAgendar}>Siguiente</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </Pressable>
      </View>
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
  columnaPrecio: { alignItems: 'flex-end' },
  precioTachado: { fontSize: 12, color: colores.textoSuave, textDecorationLine: 'line-through', marginRight: 12 },
  precioRebajado: { color: colores.exito },
  textoAhorro: { fontSize: 12, fontWeight: '600', color: colores.exito, marginTop: 2, marginRight: 10 },
  botonAgendar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
  },
  textoBotonAgendar: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});
