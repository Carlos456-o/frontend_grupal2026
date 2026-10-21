// Formulario para que el cliente califique un servicio terminado:
// estrellas (obligatorias) y un comentario (opcional).
// Lo usan el aviso "Tu carro está listo" y el detalle de la cita.
//
// Props que recibe:
//   cita: la cita a calificar
//   alTerminar: se llama después de guardar la calificación en Firebase

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { calificarCita } from '../firebase/citas';
import Estrellas from './Estrellas';
import Boton from './Boton';
import { colores } from '../estilos/colores';

const TEXTOS_ESTRELLAS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'];

export default function FormularioCalificacion({ cita, alTerminar }) {
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function alEnviar() {
    if (guardando) return;
    if (estrellas === 0) {
      Alert.alert('Elige las estrellas', 'Toca de 1 a 5 estrellas para calificar el servicio.');
      return;
    }
    setGuardando(true);
    try {
      await calificarCita(cita.id, estrellas, comentario);
    } catch (e) {
      setGuardando(false);
      Alert.alert('Error', 'No se pudo enviar tu calificación. Intenta de nuevo.');
      return;
    }
    setGuardando(false);
    alTerminar?.();
  }

  return (
    <View>
      <Text style={estilos.pregunta}>¿Cómo te atendimos?</Text>
      <View style={estilos.centro}>
        <Estrellas valor={estrellas} alCambiar={setEstrellas} tamano={34} />
        <Text style={estilos.textoEstrellas}>{TEXTOS_ESTRELLAS[estrellas]}</Text>
      </View>
      <TextInput
        value={comentario}
        onChangeText={setComentario}
        placeholder="Cuéntanos qué te pareció (opcional)"
        placeholderTextColor={colores.textoSuave}
        multiline
        style={estilos.textarea}
      />
      <Boton texto={guardando ? 'Enviando...' : 'Enviar calificación'} alPresionar={alEnviar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  pregunta: { fontSize: 14, fontWeight: '700', color: colores.texto, textAlign: 'center', marginBottom: 10 },
  centro: { alignItems: 'center', marginBottom: 12 },
  textoEstrellas: { fontSize: 13, fontWeight: '600', color: '#b45309', marginTop: 6, minHeight: 18 },
  textarea: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    backgroundColor: colores.fondo,
    padding: 12,
    minHeight: 70,
    fontSize: 14,
    color: colores.texto,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
});
