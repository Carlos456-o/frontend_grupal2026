// Fila de 5 estrellas para mostrar o elegir una calificación.
//
// Props que recibe:
//   valor: cuántas estrellas van llenas (0 a 5)
//   alCambiar: si se pasa, las estrellas se pueden tocar para elegir
//   tamano: tamaño de cada estrella (por defecto 18)

import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLOR_ESTRELLA = '#f59e0b';

export default function Estrellas({ valor = 0, alCambiar, tamano = 18 }) {
  return (
    <View style={estilos.fila}>
      {[1, 2, 3, 4, 5].map((numero) => {
        const icono = (
          <Ionicons
            name={numero <= valor ? 'star' : 'star-outline'}
            size={tamano}
            color={COLOR_ESTRELLA}
          />
        );
        if (!alCambiar) return <View key={numero}>{icono}</View>;
        return (
          <Pressable key={numero} onPress={() => alCambiar(numero)} hitSlop={6}>
            {icono}
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', gap: 4 },
});
