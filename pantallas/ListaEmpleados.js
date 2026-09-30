// PANTALLA: Gestión de empleados (admin)
// Lista de empleados con buscador, insignia de rol y botón para editar.
// El botón de abajo lleva al formulario de "Nuevo empleado".

import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { empleados } from '../datos/empleados';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import { colores } from '../estilos/colores';

const INSIGNIA_ROL = {
  lavador: { texto: 'Lavador', fondo: '#dbeafe', color: '#2563eb' },
  cajero: { texto: 'Cajero', fondo: '#fce7f3', color: '#db2777' },
  supervisor: { texto: 'Supervisor', fondo: '#ffedd5', color: '#c2410c' },
};

export default function ListaEmpleados({ navegarA }) {
  const [busqueda, setBusqueda] = useState('');

  const empleadosFiltrados = empleados.filter((e) => e.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <View style={estilos.encabezado}>
        <View style={{ flex: 1 }}>
          <Encabezado
            titulo="Empleados"
            subtitulo={`${empleados.length} empleados activos`}
            alVolver={() => navegarA('adminInicio')}
          />
        </View>
        <Boton texto="+ Nuevo" alPresionar={() => navegarA('adminNuevoEmpleado')} estilo={estilos.botonNuevo} />
      </View>

      <View style={estilos.buscador}>
        <Ionicons name="search-outline" size={16} color={colores.textoSuave} style={{ marginRight: 8 }} />
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar empleado..."
          placeholderTextColor={colores.textoSuave}
          style={estilos.entradaBuscador}
        />
      </View>

      <ScrollView contentContainerStyle={estilos.lista}>
        {empleadosFiltrados.length === 0 ? (
          <SinResultados texto="No se encontraron empleados" />
        ) : (
          empleadosFiltrados.map((empleado) => {
            const insignia = INSIGNIA_ROL[empleado.rol] || INSIGNIA_ROL.lavador;
            const iniciales = empleado.nombre
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Tarjeta key={empleado.id} estilo={estilos.fila}>
                <View style={[estilos.avatar, { backgroundColor: empleado.color }]}>
                  <Text style={estilos.textoAvatar}>{iniciales}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={estilos.nombre}>{empleado.nombre}</Text>
                  <Text style={estilos.telefono}>{empleado.telefono}</Text>
                </View>
                <View style={[estilos.insignia, { backgroundColor: insignia.fondo }]}>
                  <Text style={[estilos.textoInsignia, { color: insignia.color }]}>{insignia.texto}</Text>
                </View>
                <Pressable
                  style={estilos.botonEditar}
                  onPress={() => Alert.alert('Próximamente', `Aquí podrás editar a ${empleado.nombre}.`)}
                >
                  <Ionicons name="pencil-outline" size={16} color={colores.textoSuave} />
                </Pressable>
              </Tarjeta>
            );
          })
        )}

        <Pressable style={estilos.tarjetaNueva} onPress={() => navegarA('adminNuevoEmpleado')}>
          <Text style={estilos.iconoMas}>+</Text>
          <Text style={estilos.textoNueva}>Registrar un nuevo empleado</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  encabezado: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 },
  botonNuevo: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#132048' },

  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  entradaBuscador: { flex: 1, fontSize: 14, color: colores.texto },

  lista: { paddingHorizontal: 16, paddingBottom: 24 },

  fila: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  textoAvatar: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  nombre: { fontSize: 14, fontWeight: '700', color: colores.texto },
  telefono: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  insignia: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginRight: 8 },
  textoInsignia: { fontSize: 11, fontWeight: '700' },
  botonEditar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tarjetaNueva: {
    borderWidth: 1.5,
    borderColor: colores.borde,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  iconoMas: { fontSize: 22, color: colores.textoSuave, marginBottom: 4 },
  textoNueva: { fontSize: 13, fontWeight: '700', color: colores.principal },
});
