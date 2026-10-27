// PANTALLA: Registro (crear usuario)
// Formulario para crear una cuenta nueva de cliente, dividido en 2 pasos
// para que no se vea todo amontonado:
//   Paso 1: datos del cliente  -> colección "clientes" (nombre, telefono, email)
//   Paso 2: la contraseña      -> cuenta en Firebase Authentication
//
// Usamos una variable de estado "paso" (1 o 2) para saber cuál de los
// dos bloques mostrar. Al final se crea la cuenta y sus documentos
// (ver registrarCliente en firebase/autenticacion.js).
// El correo es obligatorio: ahí llega el enlace si olvida la contraseña.
// El vehículo NO se pide aquí: el cliente lo agrega después dentro de la app.

import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { registrarCliente, esCorreo, mensajeDeError, LARGO_MINIMO_CONTRASENA } from '../firebase/autenticacion';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import { colores, degradados } from '../estilos/colores';

export default function Registro({ navegarA }) {
  const [paso, setPaso] = useState(1);

  // Datos del paso 1
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  // Datos del paso 2
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [guardando, setGuardando] = useState(false);

  function alPresionarAtras() {
    if (paso === 2) setPaso(1);
    else navegarA('iniciarSesion');
  }

  function alPresionarSiguiente() {
    if (!nombre.trim() || !telefono.trim() || !correo.trim()) {
      Alert.alert('Datos incompletos', 'Completa tu nombre, tu teléfono y tu correo.');
      return;
    }
    if (!esCorreo(correo.trim())) {
      Alert.alert('Correo inválido', 'Revisa tu correo. Lo necesitas para recuperar tu contraseña.');
      return;
    }
    setPaso(2);
  }

  async function alPresionarCrearCuenta() {
    if (guardando) return;
    if (!contrasena || contrasena.length < LARGO_MINIMO_CONTRASENA) {
      Alert.alert('Contraseña muy corta', `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`);
      return;
    }
    if (contrasena !== confirmarContrasena) {
      Alert.alert('Las contraseñas no coinciden', 'Revisa que sean iguales.');
      return;
    }

    setGuardando(true);
    try {
      // También revisa que el teléfono y el correo no estén usados.
      await registrarCliente({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        contrasena,
      });
    } catch (e) {
      setGuardando(false);
      Alert.alert('No se pudo crear la cuenta', mensajeDeError(e.message));
      return;
    }

    Alert.alert('Cuenta creada', 'Ya puedes iniciar sesión con tus datos.', [
      { text: 'OK', onPress: () => navegarA('iniciarSesion') },
    ]);
  }

  // Qué tan "segura" se ve la contraseña, solo por longitud (0 a 3).
  const nivelSeguridad = contrasena.length === 0 ? 0 : contrasena.length < 6 ? 1 : contrasena.length < 10 ? 2 : 3;
  const textoSeguridad = ['', 'Floja', 'Media', 'Segura'][nivelSeguridad];
  const colorSeguridad = ['', colores.peligro, '#d97706', colores.exito][nivelSeguridad];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={degradados.registro} style={estilos.encabezado}>
        <Pressable onPress={alPresionarAtras} style={estilos.botonAtras}>
          <Text style={estilos.iconoAtras}>‹</Text>
        </Pressable>
        <Text style={estilos.tituloEncabezado}>Crear cuenta</Text>
        <Text style={estilos.subtituloEncabezado}>Cliente nuevo · Divino Niño</Text>

        <View style={estilos.filaProgreso}>
          <View style={estilos.pasoProgreso}>
            <Text style={estilos.numeroPaso}>1</Text>
            <View style={[estilos.barraPaso, estilos.barraPasoLlena]} />
          </View>
          <View style={estilos.pasoProgreso}>
            <Text style={estilos.numeroPaso}>2</Text>
            <View style={[estilos.barraPaso, paso === 2 && estilos.barraPasoLlena]} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={estilos.contenido} contentContainerStyle={estilos.contenidoInterno}>
        {paso === 1 ? (
          <View>
            <View style={estilos.filaFoto}>
              <View style={estilos.avatar}>
                <Text style={estilos.emojiAvatar}>🧑</Text>
                <View style={estilos.insigniaCamara}>
                  <Text style={estilos.emojiCamara}>📷</Text>
                </View>
              </View>
              <View style={estilos.textosFoto}>
                <Text style={estilos.tituloFoto}>Foto de perfil</Text>
                <Text style={estilos.descripcionFoto}>Ayuda al personal a identificarte</Text>
                <Text
                  style={estilos.enlaceFoto}
                  onPress={() => Alert.alert('Próximamente', 'Podrás subir una foto cuando tengamos esa función lista.')}
                >
                  Toca para agregar
                </Text>
              </View>
            </View>

            <Text style={estilos.tituloSeccion}>Datos personales</Text>
            <CampoTexto etiqueta="Nombre completo" valor={nombre} alCambiar={setNombre} />
            <CampoTexto etiqueta="Número de teléfono" keyboardType="phone-pad" valor={telefono} alCambiar={setTelefono} />
            <CampoTexto
              etiqueta="Correo electrónico"
              placeholder="Para recuperar tu contraseña"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              valor={correo}
              alCambiar={setCorreo}
            />

            <Boton texto="Siguiente" tipo="degradado" colorDegradado={degradados.registro} alPresionar={alPresionarSiguiente} />
          </View>
        ) : (
          <View>
            <Text style={[estilos.tituloSeccion, estilos.colorAzul]}>Datos de tu cuenta</Text>
            <View style={estilos.resumenCuenta}>
              <Text style={estilos.etiquetaResumen}>Podrás iniciar sesión con</Text>
              <Text style={estilos.valorResumen}>📱 {telefono.trim()}</Text>
              <Text style={estilos.valorResumen}>✉️ {correo.trim()}</Text>
              <Text style={estilos.notaResumen}>Tus vehículos los podrás agregar dentro de la app.</Text>
            </View>

            <Text style={[estilos.tituloSeccion, estilos.colorAzul]}>Crea tu contraseña</Text>
            <CampoTexto etiqueta="Contraseña" secureTextEntry valor={contrasena} alCambiar={setContrasena} />
            <CampoTexto etiqueta="Confirmar contraseña" secureTextEntry valor={confirmarContrasena} alCambiar={setConfirmarContrasena} />

            {contrasena.length > 0 ? (
              <View style={estilos.bloqueSeguridad}>
                <View style={estilos.filaSegmentos}>
                  {[1, 2, 3].map((segmento) => (
                    <View
                      key={segmento}
                      style={[
                        estilos.segmento,
                        segmento <= nivelSeguridad && { backgroundColor: colorSeguridad },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[estilos.textoSeguridad, { color: colorSeguridad }]}>{textoSeguridad}</Text>
              </View>
            ) : null}

            <Boton
              texto={guardando ? 'Creando cuenta...' : 'Crear mi cuenta'}
              tipo="degradado"
              colorDegradado={degradados.registro}
              alPresionar={alPresionarCrearCuenta}
              estilo={{ marginTop: 8 }}
            />
          </View>
        )}

        <View style={estilos.pieDePagina}>
          <Text style={estilos.textoPie}>¿Ya tienes cuenta? </Text>
          <Text style={estilos.enlace} onPress={() => navegarA('iniciarSesion')}>
            Inicia sesión
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  encabezado: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 24 },
  botonAtras: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  iconoAtras: { fontSize: 26, color: '#ffffff', marginTop: -4 },
  tituloEncabezado: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginTop: 4 },
  subtituloEncabezado: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2, marginBottom: 16 },

  filaProgreso: { flexDirection: 'row', gap: 16 },
  pasoProgreso: { flex: 1 },
  numeroPaso: { color: '#ffffff', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  barraPaso: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  barraPasoLlena: { backgroundColor: '#ffffff' },

  contenido: { flex: 1, backgroundColor: colores.tarjeta },
  contenidoInterno: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },

  filaFoto: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colores.fondoTab,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiAvatar: { fontSize: 28 },
  insigniaCamara: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  emojiCamara: { fontSize: 11 },
  textosFoto: { marginLeft: 16, flex: 1 },
  tituloFoto: { fontSize: 15, fontWeight: '700', color: colores.texto },
  descripcionFoto: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  enlaceFoto: { fontSize: 12, color: '#7c3aed', fontWeight: '700', marginTop: 4 },

  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoSuave,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  colorAzul: { color: colores.principal, marginTop: 8 },

  resumenCuenta: {
    backgroundColor: colores.fondoTab,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  etiquetaResumen: { fontSize: 12, color: colores.textoSuave },
  valorResumen: { fontSize: 16, fontWeight: '700', color: colores.texto, marginTop: 4 },
  notaResumen: { fontSize: 12, color: colores.textoSuave, marginTop: 8 },

  bloqueSeguridad: { marginTop: -8, marginBottom: 16 },
  filaSegmentos: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  segmento: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colores.borde },
  textoSeguridad: { fontSize: 12, fontWeight: '700' },

  pieDePagina: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  textoPie: { color: colores.textoSuave },
  enlace: { color: colores.principal, fontWeight: '700' },
});
