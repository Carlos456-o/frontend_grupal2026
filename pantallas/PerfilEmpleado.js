// PANTALLA: Perfil (empleado)

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import Boton from '../componentes/Boton';
import { colores } from '../estilos/colores';

export default function PerfilEmpleado({ usuario, cerrarSesion }) {
  return (
    <ScrollView style={estilos.contenedor}>
      <Encabezado titulo="Mi perfil" />
      <View style={estilos.seccion}>
        <Tarjeta>
          <Text style={estilos.etiqueta}>Nombre</Text>
          <Text style={estilos.valor}>{usuario.perfil.nombre}</Text>
          <Text style={estilos.etiqueta}>Rol</Text>
          <Text style={estilos.valor}>{usuario.perfil.rol}</Text>
          <Text style={estilos.etiqueta}>Teléfono</Text>
          <Text style={estilos.valor}>{usuario.telefono}</Text>
        </Tarjeta>
      </View>
      <View style={estilos.seccion}>
        <Boton texto="Cerrar sesión" tipo="peligro" alPresionar={cerrarSesion} />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  seccion: { paddingHorizontal: 16, marginBottom: 20 },
  etiqueta: { fontSize: 12, color: colores.textoSuave, marginTop: 10 },
  valor: { fontSize: 15, color: colores.texto, fontWeight: '600' },
});
