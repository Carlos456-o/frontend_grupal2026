// PANTALLA: Nuevo empleado (admin)
// Registra un empleado y le crea su cuenta para entrar a la app:
//   - documento en "empleados" (nombre, teléfono, puesto, correo)
//   - cuenta en Firebase Authentication con su correo y una contraseña inicial
//   - "usuarios/{uid}" con rol "empleado"
// El empleado entra con su correo o teléfono y la contraseña que le dé el
// admin, y puede cambiarla en su perfil (o recuperarla por correo).

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { crearCuentaEmpleado, esCorreo, mensajeDeError, LARGO_MINIMO_CONTRASENA } from '../firebase/autenticacion';
import Encabezado from '../componentes/Encabezado';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import { INSIGNIA_ROL } from './ListaEmpleados';
import { colores } from '../estilos/colores';

export default function NuevoEmpleado({ navegarA }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [rol, setRol] = useState('lavador');
  const [contrasena, setContrasena] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function alGuardar() {
    if (guardando) return;
    if (!nombre.trim() || !telefono.trim() || !correo.trim()) {
      Alert.alert('Datos incompletos', 'Completa nombre, teléfono y correo.');
      return;
    }
    if (!esCorreo(correo.trim())) {
      Alert.alert('Correo inválido', 'Revisa el correo del empleado.');
      return;
    }
    if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
      Alert.alert('Contraseña muy corta', `Usa al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`);
      return;
    }

    setGuardando(true);
    try {
      await crearCuentaEmpleado({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        contrasena,
        puesto: rol,
      });
    } catch (e) {
      setGuardando(false);
      Alert.alert('No se pudo guardar el empleado', mensajeDeError(e.message));
      return;
    }

    Alert.alert('Empleado agregado', 'Ya puede entrar con su correo o teléfono y la contraseña que le diste.', [
      { text: 'OK', onPress: () => navegarA('adminEmpleados') },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Nuevo empleado" alVolver={() => navegarA('adminEmpleados')} />
      <View style={{ paddingHorizontal: 16 }}>
        <CampoTexto etiqueta="Nombre completo" valor={nombre} alCambiar={setNombre} />
        <CampoTexto etiqueta="Teléfono" keyboardType="phone-pad" valor={telefono} alCambiar={setTelefono} />
        <CampoTexto
          etiqueta="Correo"
          placeholder="Para entrar y recuperar su contraseña"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          valor={correo}
          alCambiar={setCorreo}
        />

        <Text style={estilos.etiqueta}>Rol</Text>
        <View style={estilos.filaRoles}>
          {Object.entries(INSIGNIA_ROL).map(([clave, insignia]) => {
            const elegido = rol === clave;
            return (
              <Pressable
                key={clave}
                onPress={() => setRol(clave)}
                style={[estilos.chip, elegido && { backgroundColor: insignia.fondo, borderColor: insignia.color }]}
              >
                <Text style={[estilos.textoChip, elegido && { color: insignia.color }]}>{insignia.texto}</Text>
              </Pressable>
            );
          })}
        </View>

        <CampoTexto
          etiqueta={`Contraseña inicial (mínimo ${LARGO_MINIMO_CONTRASENA} caracteres)`}
          secureTextEntry
          valor={contrasena}
          alCambiar={setContrasena}
        />

        <Boton texto={guardando ? 'Guardando...' : 'Guardar empleado'} alPresionar={alGuardar} />
        <Boton texto="Cancelar" tipo="borde" alPresionar={() => navegarA('adminEmpleados')} estilo={{ marginTop: 10, marginBottom: 24 }} />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  etiqueta: { fontSize: 13, fontWeight: '600', color: colores.texto, marginBottom: 8 },
  filaRoles: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colores.tarjeta,
  },
  textoChip: { fontSize: 13, fontWeight: '600', color: colores.textoSuave },
});
