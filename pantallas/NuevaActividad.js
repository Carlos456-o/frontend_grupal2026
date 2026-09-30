// PANTALLA: Nueva actividad (admin)
// Formulario para agregar una actividad al catálogo (ej. "Aspirado").
// Todavía no se guarda en un backend, solo muestra un mensaje.

import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import Encabezado from '../componentes/Encabezado';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import { colores } from '../estilos/colores';

export default function NuevaActividad({ navegarA }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  function alGuardar() {
    if (!nombre) {
      Alert.alert('Datos incompletos', 'Escribe al menos el nombre de la actividad.');
      return;
    }
    Alert.alert('Actividad agregada', '', [
      { text: 'OK', onPress: () => navegarA('adminCatalogo', { pestanaInicial: 'actividades' }) },
    ]);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Nueva actividad" />
      <View style={{ paddingHorizontal: 16 }}>
        <CampoTexto etiqueta="Nombre" placeholder="Ej. Aspirado" valor={nombre} alCambiar={setNombre} />
        <CampoTexto etiqueta="Descripción" placeholder="Ej. Aspirado de alfombras y asientos" valor={descripcion} alCambiar={setDescripcion} multiline />
        <Boton texto="Guardar actividad" alPresionar={alGuardar} />
        <Boton
          texto="Cancelar"
          tipo="borde"
          alPresionar={() => navegarA('adminCatalogo', { pestanaInicial: 'actividades' })}
          estilo={{ marginTop: 10 }}
        />
      </View>
    </ScrollView>
  );
}
