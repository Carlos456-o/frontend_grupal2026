// Muestra el estado de una cita como una pequeña etiqueta de color
// (ej: "Pendiente" en amarillo, "Completada" en verde).

import { View, Text, StyleSheet } from 'react-native';
import { coloresPorEstado } from '../estilos/colores';

const NOMBRES_ESTADO = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_proceso: 'En proceso',
  completada: 'Completada',
  cancelada: 'Cancelada',
};

export default function InsigniaEstado({ estado }) {
  const color = coloresPorEstado[estado] || coloresPorEstado.pendiente;
  return (
    <View style={[estilos.caja, { backgroundColor: color.fondo }]}>
      <Text style={[estilos.texto, { color: color.texto }]}>{NOMBRES_ESTADO[estado] || estado}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  texto: { fontSize: 12, fontWeight: '600' },
});
