// PANTALLA: Recuperar contraseña (HF02)
// Se abre desde "¿Olvidaste tu contraseña?" en Iniciar sesión.
// La persona escribe su correo o su teléfono y Firebase Authentication le
// manda al correo de su cuenta un enlace para elegir una contraseña nueva.
// Sirve igual para clientes, empleados y el administrador.

import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { enviarCorreoRecuperacion, mensajeDeError, ERRORES } from '../firebase/autenticacion';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import { colores } from '../estilos/colores';

export default function RecuperarContrasena({ navegarA }) {
  const [identificador, setIdentificador] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState(null); // "an***@gmail.com" cuando ya se envió

  const volver = () => navegarA('iniciarSesion');

  async function alEnviar() {
    if (enviando) return;
    if (!identificador.trim()) return setError('Escribe el correo o el teléfono de tu cuenta.');

    setEnviando(true);
    setError('');
    try {
      setCorreoEnviado(await enviarCorreoRecuperacion(identificador));
    } catch (e) {
      setError(
        e.message === ERRORES.sinCuenta
          ? 'No encontramos una cuenta con ese teléfono. Prueba con tu correo.'
          : mensajeDeError(e.message)
      );
    }
    setEnviando(false);
  }

  if (correoEnviado) {
    return (
      <View style={estilos.contenedor}>
        <Encabezado titulo="Recuperar contraseña" alVolver={volver} />
        <View style={estilos.seccion}>
          <Tarjeta estilo={estilos.tarjetaListo}>
            <Ionicons name="mail" size={48} color={colores.exito} />
            <Text style={estilos.tituloListo}>Revisa tu correo</Text>
            <Text style={estilos.textoListo}>Si hay una cuenta con esos datos, enviamos un enlace a {correoEnviado}.</Text>
            <Text style={estilos.textoListo}>Ábrelo, elige tu contraseña nueva y luego inicia sesión aquí con ella.</Text>
            <Text style={estilos.notaListo}>¿No llega? Revisa la carpeta de spam o correo no deseado.</Text>
          </Tarjeta>
          <Boton texto="Volver a iniciar sesión" alPresionar={volver} estilo={estilos.botonOscuro} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={estilos.contenedor} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Encabezado titulo="Recuperar contraseña" subtitulo="Te ayudamos a volver a entrar" alVolver={volver} />
        <View style={estilos.seccion}>
          <Tarjeta estilo={estilos.tarjetaPasos}>
            <Paso numero="1" texto="Escribe el correo o el teléfono de tu cuenta." />
            <Paso numero="2" texto="Te llega un enlace al correo de tu cuenta." />
            <Paso numero="3" texto="Ábrelo y elige una contraseña nueva." />
            <Paso numero="4" texto="Entra a la app con tu contraseña nueva." />
          </Tarjeta>

          <CampoTexto
            etiqueta="Correo o teléfono"
            placeholder="Ej. andrea@gmail.com o 88123456"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            valor={identificador}
            alCambiar={setIdentificador}
          />

          {error ? <Text style={estilos.error}>{error}</Text> : null}

          <Boton texto={enviando ? 'Enviando...' : 'Enviar enlace'} alPresionar={alEnviar} estilo={estilos.botonOscuro} />
          <Text style={estilos.ayuda}>
            ¿Ya no tienes acceso a ese correo? Acércate al autolavado para que te ayuden.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Paso({ numero, texto }) {
  return (
    <View style={estilos.paso}>
      <View style={estilos.numeroPaso}>
        <Text style={estilos.textoNumero}>{numero}</Text>
      </View>
      <Text style={estilos.textoPaso}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  seccion: { paddingHorizontal: 16, paddingBottom: 32 },

  tarjetaPasos: { marginBottom: 20 },
  paso: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  numeroPaso: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#132048',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textoNumero: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  textoPaso: { flex: 1, fontSize: 13, color: colores.texto },

  error: { color: colores.peligro, fontSize: 13, marginBottom: 12 },
  ayuda: { fontSize: 12, color: colores.textoSuave, textAlign: 'center', marginTop: 12 },
  botonOscuro: { backgroundColor: '#132048' },

  tarjetaListo: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  tituloListo: { fontSize: 18, fontWeight: '800', color: colores.texto, marginTop: 10, marginBottom: 8 },
  textoListo: { fontSize: 14, color: colores.textoSuave, textAlign: 'center', marginTop: 6 },
  notaListo: { fontSize: 12, color: colores.textoSuave, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
});
