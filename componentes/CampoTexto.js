// Campo de texto reutilizable, con una etiqueta arriba (label).
//
// Props: etiqueta, valor, alCambiar (función que actualiza el useState del padre)
// y cualquier otra prop normal de TextInput (placeholder, secureTextEntry, etc.)

import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colores } from '../estilos/colores';

export default function CampoTexto({ etiqueta, valor, alCambiar, ...resto }) {
  return (
    <View style={estilos.contenedor}>
      {etiqueta ? <Text style={estilos.etiqueta}>{etiqueta}</Text> : null}
      <TextInput
        value={valor}
        onChangeText={alCambiar}
        placeholderTextColor={colores.textoSuave}
        style={estilos.entrada}
        {...resto}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginBottom: 16 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: colores.texto, marginBottom: 6 },
  entrada: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colores.texto,
    backgroundColor: colores.tarjeta,
  },
});
