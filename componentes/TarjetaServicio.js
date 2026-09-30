import { Pressable, View, Text, StyleSheet } from 'react-native';
import Tarjeta from './Tarjeta';
import { colores } from '../estilos/colores';

export default function TarjetaServicio({ servicio, alPresionar, seleccionado = false }) {
  return (
    <Pressable onPress={alPresionar}>
      <Tarjeta estilo={seleccionado ? estilos.seleccionada : null}>
        <View style={estilos.fila}>
          <Text style={estilos.nombre}>{servicio.nombre}</Text>
          <Text style={estilos.precio}>C${servicio.precio}</Text>
        </View>
        <Text style={estilos.descripcion}>{servicio.descripcion}</Text>
        <Text style={estilos.duracion}>Duración aprox: {servicio.duracionMinutos} min</Text>
      </Tarjeta>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  seleccionada: { borderColor: colores.principal, borderWidth: 2 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nombre: { fontSize: 16, fontWeight: '700', color: colores.texto },
  precio: { fontSize: 16, fontWeight: '700', color: colores.principal },
  descripcion: { fontSize: 13, color: colores.textoSuave, marginTop: 6 },
  duracion: { fontSize: 12, color: colores.textoSuave, marginTop: 6 },
});
