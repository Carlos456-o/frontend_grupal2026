// Muestra una ruedita mientras se cargan datos de Firebase, o el mensaje
// de error si algo falló (con un botón para reintentar).
//
// Props:
//   error: texto del error ('' si no hay)
//   alReintentar: función que vuelve a pedir los datos

import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Boton from './Boton';
import { colores } from '../estilos/colores';

export default function Cargando({ error, alReintentar }) {
  if (error) {
    return (
      <View style={estilos.caja}>
        <Text style={estilos.error}>{error}</Text>
        {alReintentar ? <Boton texto="Reintentar" tipo="borde" alPresionar={alReintentar} /> : null}
      </View>
    );
  }
  return (
    <View style={estilos.caja}>
      <ActivityIndicator size="large" color={colores.principal} />
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { padding: 24, alignItems: 'stretch', justifyContent: 'center' },
  error: { color: colores.peligro, textAlign: 'center', marginBottom: 12 },
});
