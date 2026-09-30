// PANTALLA: Nuevo empleado (admin)
// Formulario para registrar un empleado. Todavía no se guarda en un backend,
// solo muestra un mensaje de confirmación.

import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import Encabezado from '../componentes/Encabezado';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import { colores } from '../estilos/colores';

export default function NuevoEmpleado({ navegarA }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('lavador');

  function alGuardar() {
    if (!nombre || !telefono) {
      Alert.alert('Datos incompletos', 'Completa nombre y teléfono.');
      return;
    }
    Alert.alert('Empleado agregado', '', [{ text: 'OK', onPress: () => navegarA('adminEmpleados') }]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Nuevo empleado" />
      <View style={{ paddingHorizontal: 16 }}>
        <CampoTexto etiqueta="Nombre completo" valor={nombre} alCambiar={setNombre} />
        <CampoTexto etiqueta="Teléfono" keyboardType="phone-pad" valor={telefono} alCambiar={setTelefono} />
        <CampoTexto etiqueta="Rol (lavador / supervisor)" valor={rol} alCambiar={setRol} />
        <Boton texto="Guardar empleado" alPresionar={alGuardar} />
        <Boton texto="Cancelar" tipo="borde" alPresionar={() => navegarA('adminEmpleados')} estilo={{ marginTop: 10 }} />
      </View>
    </ScrollView>
  );
}
