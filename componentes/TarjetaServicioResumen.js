// Fila con un cuadrito de color (con el ícono del servicio), el nombre
// y la descripción, y el precio a la derecha.
// La usamos en la pantalla de Inicio (servicios destacados) y en el
// Catálogo de servicios (lista completa agrupada por categoría).
// Si el servicio tiene "destacado: true" (ver datos/servicios.js), la
// tarjeta se resalta con un borde morado, como el "más pedido".

import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tarjeta from './Tarjeta';
import { colores } from '../estilos/colores';

export default function TarjetaServicioResumen({ servicio, alPresionar }) {
  return (
    <Pressable onPress={alPresionar} disabled={!alPresionar}>
      <Tarjeta estilo={[estilos.fila, servicio.destacado && estilos.destacada]}>
        <View style={[estilos.iconoCuadro, { backgroundColor: servicio.colorFondoIcono || colores.fondoTab }]}>
          <Ionicons name={servicio.icono || 'sparkles-outline'} size={20} color={servicio.colorIcono || colores.principal} />
        </View>
        <View style={estilos.textos}>
          <Text style={estilos.nombre}>{servicio.nombre}</Text>
          <Text style={estilos.descripcion}>
            {servicio.descripcion} · {servicio.duracionMinutos} min
          </Text>
        </View>
        <Text style={estilos.precio}>C${servicio.precio}</Text>
      </Tarjeta>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
  destacada: { borderColor: '#7c3aed', borderWidth: 2, backgroundColor: '#f5f3ff' },
  iconoCuadro: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, marginLeft: 12 },
  nombre: { fontSize: 15, fontWeight: '700', color: colores.texto },
  descripcion: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  precio: { fontSize: 15, fontWeight: '700', color: '#3730a3' },
});
