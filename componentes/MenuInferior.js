// Barra de botones abajo de la pantalla para movernos entre las secciones
// principales de cada rol (parecido a las "pestañas" de otras apps, pero
// hecho a mano con botones simples, sin ninguna librería de navegación).
//
// Props:
//   opciones: lista de botones, ej: [{ clave: 'inicio', texto: 'Inicio' }, ...]
//   pantallaActiva: clave de la pantalla que está mostrándose ahora
//   alCambiarPantalla: función que se llama con la clave elegida

import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colores } from '../estilos/colores';

export default function MenuInferior({ opciones, pantallaActiva, alCambiarPantalla }) {
  return (
    <View style={estilos.contenedor}>
      {opciones.map((opcion) => {
        const activo = opcion.clave === pantallaActiva;
        return (
          <Pressable key={opcion.clave} style={estilos.boton} onPress={() => alCambiarPantalla(opcion.clave)}>
            <Text style={estilos.icono}>{opcion.icono}</Text>
            <Text style={[estilos.texto, activo && estilos.textoActivo]}>{opcion.texto}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.tarjeta,
    paddingVertical: 8,
  },
  boton: { flex: 1, alignItems: 'center' },
  icono: { fontSize: 18 },
  texto: { fontSize: 11, color: colores.textoSuave, marginTop: 2 },
  textoActivo: { color: colores.principal, fontWeight: '700' },
});
