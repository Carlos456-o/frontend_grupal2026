// Caja blanca con borde redondeado. La usamos como fondo de cada
// elemento de una lista (una cita, un vehículo, un servicio, etc.)

import { View, StyleSheet } from 'react-native';
import { colores } from '../estilos/colores';

export default function Tarjeta({ children, estilo }) {
  return <View style={[estilos.caja, estilo]}>{children}</View>;
}

const estilos = StyleSheet.create({
  caja: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    marginBottom: 10,
  },
});
