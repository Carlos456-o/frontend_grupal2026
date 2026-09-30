import { Text, StyleSheet } from 'react-native';
import Tarjeta from './Tarjeta';
import { colores } from '../estilos/colores';

export default function TarjetaVehiculo({ vehiculo }) {
  return (
    <Tarjeta>
      <Text style={estilos.modelo}>{vehiculo.modelo}</Text>
      <Text style={estilos.placa}>Placa: {vehiculo.placa}</Text>
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  modelo: { fontSize: 16, fontWeight: '700', color: colores.texto },
  placa: { fontSize: 13, color: colores.textoSuave, marginTop: 2 },
});
