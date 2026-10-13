// PANTALLA: Nuevo empleado (admin)
// Formulario para registrar un empleado en la colección "empleados" de
// Firebase. Si se escribe una contraseña, también se le crea una cuenta en
// "usuarios" para que pueda iniciar sesión como empleado con su teléfono.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { crearEmpleado } from '../firebase/empleados';
import { crearUsuario, telefonoRegistrado } from '../firebase/usuarios';
import Encabezado from '../componentes/Encabezado';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import { INSIGNIA_ROL } from './ListaEmpleados';
import { colores } from '../estilos/colores';

export default function NuevoEmpleado({ navegarA }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('lavador');
  const [contrasena, setContrasena] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function alGuardar() {
    if (guardando) return;
    if (!nombre.trim() || !telefono.trim()) {
      Alert.alert('Datos incompletos', 'Completa nombre y teléfono.');
      return;
    }
    if (contrasena && contrasena.length < 4) {
      Alert.alert('Contraseña muy corta', 'Usa al menos 4 caracteres, o déjala vacía.');
      return;
    }

    setGuardando(true);
    try {
      if (contrasena && (await telefonoRegistrado(telefono.trim()))) {
        setGuardando(false);
        Alert.alert('Teléfono en uso', 'Ya existe una cuenta con ese teléfono.');
        return;
      }
      const empleadoId = await crearEmpleado({ nombre: nombre.trim(), telefono: telefono.trim(), rol });
      if (contrasena) {
        await crearUsuario({ telefono: telefono.trim(), contrasena, rol: 'empleado', perfilId: empleadoId });
      }
    } catch (e) {
      setGuardando(false);
      Alert.alert('Error', 'No se pudo guardar el empleado. Intenta de nuevo.');
      return;
    }

    Alert.alert('Empleado agregado', '', [{ text: 'OK', onPress: () => navegarA('adminEmpleados') }]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Nuevo empleado" alVolver={() => navegarA('adminEmpleados')} />
      <View style={{ paddingHorizontal: 16 }}>
        <CampoTexto etiqueta="Nombre completo" valor={nombre} alCambiar={setNombre} />
        <CampoTexto etiqueta="Teléfono" keyboardType="phone-pad" valor={telefono} alCambiar={setTelefono} />

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
          etiqueta="Contraseña para la app (opcional)"
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
