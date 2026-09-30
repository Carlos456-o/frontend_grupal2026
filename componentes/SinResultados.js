// Mensaje que mostramos cuando una lista está vacía
// (ej: "No tienes citas registradas").

import { View, Text, StyleSheet } from 'react-native';
import { colores } from '../estilos/colores';

export default function SinResultados({ texto }) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { padding: 32, alignItems: 'center' },
  texto: { fontSize: 14, color: colores.textoSuave, textAlign: 'center' },
});
