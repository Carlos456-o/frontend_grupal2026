// Botón reutilizable. Lo usamos en toda la app en vez de escribir
// un <Pressable> distinto en cada pantalla.
//
// Props que recibe:
//   texto: lo que se muestra dentro del botón
//   alPresionar: función que se ejecuta al tocar el botón
//   tipo: "normal" (azul, por defecto), "borde" (solo contorno),
//         "peligro" (rojo), "claro" (fondo blanco, para usar sobre
//         fondos de color) o "degradado" (fondo con degradado de color)
//   colorDegradado: arreglo de 2 colores, solo se usa si tipo="degradado"
//   colorTexto: color del texto, solo se usa si tipo="claro"

import { Pressable, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colores } from '../estilos/colores';

export default function Boton({ texto, alPresionar, tipo = 'normal', colorDegradado, colorTexto, estilo }) {
  const esBorde = tipo === 'borde';
  const esPeligro = tipo === 'peligro';
  const esDegradado = tipo === 'degradado';
  const esClaro = tipo === 'claro';

  if (esDegradado) {
    return (
      <Pressable onPress={alPresionar} style={estilo}>
        <LinearGradient
          colors={colorDegradado || [colores.principal, colores.principal]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={estilos.base}
        >
          <Text style={estilos.texto}>{texto}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={alPresionar}
      style={[
        estilos.base,
        esBorde && estilos.borde,
        esPeligro && estilos.peligro,
        esClaro && estilos.claro,
        !esBorde && !esPeligro && !esClaro && estilos.normal,
        estilo,
      ]}
    >
      <Text
        style={[
          estilos.texto,
          esBorde && estilos.textoBorde,
          esClaro && { color: colorTexto || colores.principal },
        ]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  normal: {
    backgroundColor: colores.principal,
  },
  borde: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colores.principal,
  },
  peligro: {
    backgroundColor: colores.peligro,
  },
  claro: {
    backgroundColor: '#ffffff',
  },
  texto: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  textoBorde: {
    color: colores.principal,
  },
});
