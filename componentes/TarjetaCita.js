// Muestra el resumen de una cita dentro de una lista.
// Al tocarla, avisa al padre con "alPresionar" (normalmente para ir al detalle).

import { Pressable, View, Text, StyleSheet } from 'react-native';
import Tarjeta from './Tarjeta';
import InsigniaEstado from './InsigniaEstado';
import { colores } from '../estilos/colores';

export default function TarjetaCita({ cita, alPresionar }) {
  return (
    <Pressable onPress={alPresionar}>
      <Tarjeta>
        <View style={estilos.fila}>
          <Text style={estilos.servicio}>{cita.servicio.nombre}</Text>
          <InsigniaEstado estado={cita.estado} />
        </View>
        <Text style={estilos.info}>{cita.vehiculo.modelo} · {cita.vehiculo.placa}</Text>
        <Text style={estilos.info}>{cita.fecha} · {cita.hora}</Text>
      </Tarjeta>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  servicio: { fontSize: 16, fontWeight: '700', color: colores.texto },
  info: { fontSize: 13, color: colores.textoSuave, marginTop: 2 },
});
