// Tarjetas de "Cuenta" del perfil (cliente, empleado y admin):
//   - Correo de la cuenta, con opción de cambiarlo.
//   - Cambiar contraseña.
// Cada una se muestra cerrada (solo un botón) y al tocarla abre su formulario.
// Las dos piden la contraseña actual, porque Firebase Authentication lo exige.
//
// Props:
//   usuario: el usuario con sesión (usa usuario.correo)
//   abiertoAlInicio: true para abrir de una vez el formulario de contraseña

import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import {
  cambiarContrasena,
  cambiarCorreo,
  esCorreoProvisional,
  mensajeDeError,
  ERRORES,
  LARGO_MINIMO_CONTRASENA,
} from '../firebase/autenticacion';
import Tarjeta from './Tarjeta';
import CampoTexto from './CampoTexto';
import Boton from './Boton';
import { colores } from '../estilos/colores';

// Si falla por la contraseña actual, lo decimos claro.
function explicarError(codigo) {
  return codigo === ERRORES.datosIncorrectos ? 'La contraseña actual no es correcta.' : mensajeDeError(codigo);
}

export default function CambiarContrasena({ usuario, abiertoAlInicio = false }) {
  return (
    <View>
      <CorreoDeLaCuenta usuario={usuario} />
      <FormularioContrasena abiertoAlInicio={abiertoAlInicio} />
    </View>
  );
}

function CorreoDeLaCuenta({ usuario }) {
  const provisional = esCorreoProvisional(usuario.correo);
  const [abierto, setAbierto] = useState(false);
  const [nuevo, setNuevo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function alGuardar() {
    if (guardando) return;
    if (!nuevo.trim() || !contrasena) return setError('Escribe el correo nuevo y tu contraseña.');
    setGuardando(true);
    setError('');
    try {
      await cambiarCorreo(contrasena, nuevo);
      setAbierto(false);
      setNuevo('');
      setContrasena('');
      Alert.alert(
        'Confirma tu correo',
        `Te enviamos un enlace a ${nuevo.trim()}. Ábrelo para terminar el cambio y vuelve a iniciar sesión.`
      );
    } catch (e) {
      setError(explicarError(e.message));
    }
    setGuardando(false);
  }

  return (
    <Tarjeta>
      <Text style={estilos.etiqueta}>Correo de la cuenta</Text>
      <Text style={estilos.valor}>{provisional ? 'Sin correo' : usuario.correo}</Text>
      {provisional ? (
        <Text style={estilos.aviso}>Agrega un correo real: sin él no podrás recuperar tu contraseña si la olvidas.</Text>
      ) : null}

      {abierto ? (
        <View style={{ marginTop: 12 }}>
          <CampoTexto
            etiqueta="Correo nuevo"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            valor={nuevo}
            alCambiar={setNuevo}
          />
          <CampoTexto etiqueta="Tu contraseña actual" secureTextEntry valor={contrasena} alCambiar={setContrasena} />
          {error ? <Text style={estilos.error}>{error}</Text> : null}
          <View style={estilos.filaBotones}>
            <Boton texto="Cancelar" tipo="borde" alPresionar={() => setAbierto(false)} estilo={{ flex: 1 }} />
            <Boton texto={guardando ? 'Enviando...' : 'Cambiar'} alPresionar={alGuardar} estilo={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <Text style={estilos.enlace} onPress={() => setAbierto(true)}>
          {provisional ? 'Agregar correo' : 'Cambiar correo'}
        </Text>
      )}
    </Tarjeta>
  );
}

function FormularioContrasena({ abiertoAlInicio }) {
  const [abierto, setAbierto] = useState(abiertoAlInicio);
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function cerrar() {
    setAbierto(false);
    setActual('');
    setNueva('');
    setRepetir('');
    setError('');
  }

  async function alGuardar() {
    if (guardando) return;
    if (!actual || !nueva || !repetir) return setError('Completa los tres campos.');
    if (nueva.length < LARGO_MINIMO_CONTRASENA) {
      return setError(`La nueva contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`);
    }
    if (nueva !== repetir) return setError('Las contraseñas nuevas no coinciden.');
    if (nueva === actual) return setError('La nueva contraseña debe ser distinta a la actual.');

    setGuardando(true);
    setError('');
    try {
      await cambiarContrasena(actual, nueva);
      cerrar();
      Alert.alert('Contraseña actualizada', 'La próxima vez inicia sesión con tu nueva contraseña.');
    } catch (e) {
      setError(explicarError(e.message));
    }
    setGuardando(false);
  }

  if (!abierto) {
    return <Boton texto="Cambiar contraseña" tipo="borde" alPresionar={() => setAbierto(true)} />;
  }

  return (
    <Tarjeta>
      <Text style={estilos.titulo}>Cambiar contraseña</Text>
      <CampoTexto etiqueta="Contraseña actual" secureTextEntry valor={actual} alCambiar={setActual} />
      <CampoTexto etiqueta="Nueva contraseña" secureTextEntry valor={nueva} alCambiar={setNueva} />
      <CampoTexto etiqueta="Repite la nueva contraseña" secureTextEntry valor={repetir} alCambiar={setRepetir} />
      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <View style={estilos.filaBotones}>
        <Boton texto="Cancelar" tipo="borde" alPresionar={cerrar} estilo={{ flex: 1 }} />
        <Boton texto={guardando ? 'Guardando...' : 'Guardar'} alPresionar={alGuardar} estilo={{ flex: 1 }} />
      </View>
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 15, fontWeight: '700', color: colores.texto, marginBottom: 12 },
  etiqueta: { fontSize: 12, color: colores.textoSuave },
  valor: { fontSize: 15, color: colores.texto, fontWeight: '600', marginTop: 2 },
  enlace: { fontSize: 13, fontWeight: '700', color: colores.principal, marginTop: 10 },
  aviso: {
    fontSize: 13,
    color: '#92400e',
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  error: { color: colores.peligro, fontSize: 13, marginBottom: 12 },
  filaBotones: { flexDirection: 'row', gap: 10 },
});
