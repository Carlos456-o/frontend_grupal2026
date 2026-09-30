// Título grande que va arriba de cada pantalla, con un subtítulo opcional.
// Si le pasas "alVolver", muestra una flecha de regreso a la izquierda
// (para pantallas a las que se entra desde otra, sin ser una pestaña).

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores } from '../estilos/colores';

export default function Encabezado({ titulo, subtitulo, alVolver }) {
  return (
    <View style={estilos.contenedor}>
      {alVolver ? (
        <Pressable onPress={alVolver} style={estilos.botonVolver}>
          <Ionicons name="chevron-back" size={26} color={colores.texto} />
        </Pressable>
      ) : null}
      <View>
        <Text style={estilos.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={estilos.subtitulo}>{subtitulo}</Text> : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16 },
  botonVolver: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  titulo: { fontSize: 22, fontWeight: '700', color: colores.texto },
  subtitulo: { fontSize: 13, color: colores.textoSuave, marginTop: 2 },
});
