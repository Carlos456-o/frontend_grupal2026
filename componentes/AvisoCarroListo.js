// Aviso emergente (notificación dentro de la app) que le sale al cliente
// cuando el empleado o el administrador marca su cita como "terminado".
// Le dice que su carro está listo y le deja calificar el servicio.
//
// Props que recibe:
//   cita: la cita terminada (o null para no mostrar nada)
//   alCerrar: se llama al tocar "Más tarde" (el cliente puede calificar
//             después desde el detalle de la cita)

import { Modal, View, Text, Pressable, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import FormularioCalificacion from './FormularioCalificacion';
import { colores } from '../estilos/colores';

export default function AvisoCarroListo({ cita, alCerrar }) {
  return (
    <Modal visible={Boolean(cita)} transparent animationType="fade" onRequestClose={alCerrar}>
      <KeyboardAvoidingView style={estilos.fondo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {cita ? (
          <View style={estilos.caja}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={estilos.emoji}>🚗✨</Text>
              <Text style={estilos.titulo}>¡Tu carro está listo!</Text>
              <Text style={estilos.detalle}>
                {cita.servicio.nombre} · {cita.vehiculo.modelo} · Placa {cita.vehiculo.placa}
              </Text>
              <Text style={estilos.detalle}>Ya puedes pasar a recogerlo.</Text>

              <View style={estilos.separador} />

              {/* El "key" reinicia el formulario si llega otra cita terminada. */}
              {/* Al guardar, Firebase marca el aviso como visto y este se cierra solo. */}
              <FormularioCalificacion
                key={cita.id}
                cita={cita}
                alTerminar={() => Alert.alert('¡Gracias!', 'Tu calificación nos ayuda a mejorar.')}
              />

              <Pressable onPress={alCerrar} style={estilos.botonLuego}>
                <Text style={estilos.textoLuego}>Más tarde</Text>
              </Pressable>
            </ScrollView>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'center', padding: 20 },
  caja: { backgroundColor: colores.tarjeta, borderRadius: 20, padding: 20, maxHeight: '90%' },
  emoji: { fontSize: 40, textAlign: 'center' },
  titulo: { fontSize: 20, fontWeight: '800', color: colores.texto, textAlign: 'center', marginTop: 8 },
  detalle: { fontSize: 13, color: colores.textoSuave, textAlign: 'center', marginTop: 4 },
  separador: { height: 1, backgroundColor: colores.borde, marginVertical: 16 },
  botonLuego: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  textoLuego: { fontSize: 14, fontWeight: '600', color: colores.textoSuave },
});
