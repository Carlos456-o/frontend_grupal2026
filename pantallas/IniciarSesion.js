// PANTALLA: Iniciar sesión
// Es la primera pantalla que ve cualquier persona al abrir la app.
// Pide correo o teléfono y la contraseña, y usa la función "iniciarSesion"
// que viene de App.js (ahí se revisan con Firebase Authentication).
//
// No hay que elegir si eres cliente, empleado o administrador: la app lo
// sabe por tu cuenta y te lleva a tu pantalla de inicio.

import { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import { colores, degradados } from '../estilos/colores';

export default function IniciarSesion({ iniciarSesion, navegarA }) {
  const [identificador, setIdentificador] = useState(''); // correo o teléfono
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function alPresionarIngresar() {
    if (cargando) return;
    if (!identificador.trim() || !contrasena) {
      setError('Escribe tu correo o teléfono y tu contraseña.');
      return;
    }
    setCargando(true);
    setError('');
    const resultado = await iniciarSesion(identificador.trim(), contrasena);
    // Si el login salió bien, esta pantalla ya se cerró y no hay que tocar su estado.
    if (!resultado.ok) {
      setError(resultado.error);
      setCargando(false);
    }
  }

  function alPresionarInvitado() {
    setError('');
    navegarA('invitadoServicios');
  }

  return (
    <KeyboardAvoidingView style={estilos.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView bounces={false} contentContainerStyle={estilos.scroll}>
        {/* --- Parte de arriba con el degradado y el logo --- */}
        <LinearGradient colors={degradados.login} style={estilos.hero}>
          <View style={[estilos.circuloDecorativo, estilos.circulo1]} />
          <View style={[estilos.circuloDecorativo, estilos.circulo2]} />
          <View style={[estilos.circuloDecorativo, estilos.circulo3]} />
          <View style={estilos.circuloIcono}>
            <Text style={estilos.emojiIcono}>🚗</Text>
          </View>
          <Text style={estilos.tituloHero}>Divino Niño</Text>
          <Text style={estilos.subtituloHero}>AUTOLAVADO</Text>
        </LinearGradient>

        {/* --- Tarjeta blanca que tapa la parte de abajo del degradado --- */}
        <View style={estilos.tarjeta}>
          <Text style={estilos.bienvenida}>Bienvenido de nuevo</Text>
          <Text style={estilos.subBienvenida}>Inicia sesión para agendar tu lavado</Text>

          <CampoTexto
            etiqueta="Correo o teléfono"
            placeholder="Ej. andrea@gmail.com o 88123456"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            valor={identificador}
            alCambiar={setIdentificador}
          />
          <CampoTexto
            etiqueta="Contraseña"
            placeholder="••••••"
            secureTextEntry
            valor={contrasena}
            alCambiar={setContrasena}
          />

          <Text style={estilos.olvidaste} onPress={() => navegarA('recuperarContrasena')}>
            ¿Olvidaste tu contraseña?
          </Text>

          {error ? <Text style={estilos.error}>{error}</Text> : null}

          <Boton texto={cargando ? 'Ingresando...' : 'Iniciar sesión'} alPresionar={alPresionarIngresar} estilo={estilos.botonIngresar} />

          <View style={estilos.divisor}>
            <View style={estilos.lineaDivisor} />
            <Text style={estilos.textoDivisor}>o</Text>
            <View style={estilos.lineaDivisor} />
          </View>

          <Boton texto="Continuar como invitado" tipo="borde" alPresionar={alPresionarInvitado} />

          <View style={estilos.pieDePagina}>
            <Text style={estilos.textoPie}>¿Aún no tienes cuenta? </Text>
            <Text style={estilos.enlace} onPress={() => navegarA('registro')}>
              Regístrate
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colores.fondo },
  scroll: { flexGrow: 1 },

  hero: {
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  circuloDecorativo: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  circulo1: { width: 90, height: 90, top: -20, left: -20 },
  circulo2: { width: 60, height: 60, bottom: 30, right: 20 },
  circulo3: { width: 40, height: 40, top: 60, right: 60 },
  circuloIcono: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emojiIcono: { fontSize: 32 },
  tituloHero: { fontSize: 24, fontWeight: '800', color: '#ffffff' },
  subtituloHero: { fontSize: 13, fontWeight: '700', color: '#fbbf24', letterSpacing: 3, marginTop: 4 },

  tarjeta: {
    flex: 1,
    backgroundColor: colores.tarjeta,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  bienvenida: { fontSize: 20, fontWeight: '800', color: colores.texto },
  subBienvenida: { fontSize: 13, color: colores.textoSuave, marginTop: 4, marginBottom: 20 },

  olvidaste: { alignSelf: 'flex-end', color: colores.principal, fontSize: 12, fontWeight: '600', marginTop: -8, marginBottom: 16 },
  error: { color: colores.peligro, fontSize: 13, marginBottom: 12 },
  botonIngresar: { backgroundColor: '#132048' },

  divisor: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  lineaDivisor: { flex: 1, height: 1, backgroundColor: colores.borde },
  textoDivisor: { marginHorizontal: 10, color: colores.textoSuave, fontSize: 12 },

  pieDePagina: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  textoPie: { color: colores.textoSuave },
  enlace: { color: colores.principal, fontWeight: '700' },
});
