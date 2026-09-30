// PANTALLA: Gestión de clientes (admin)
// Lista de clientes con buscador. Cada tarjeta muestra sus vehículos como
// etiquetas pequeñas. Tocar una tarjeta lleva al detalle del cliente.

import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { clientes } from '../datos/clientes';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import SinResultados from '../componentes/SinResultados';
import { colores } from '../estilos/colores';

export default function ListaClientes({ navegarA }) {
  const [busqueda, setBusqueda] = useState('');

  const clientesFiltrados = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.telefono.includes(busqueda)
  );

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado
        titulo="Clientes"
        subtitulo={`${clientes.length} clientes registrados`}
        alVolver={() => navegarA('adminInicio')}
      />

      <View style={estilos.buscador}>
        <Ionicons name="search-outline" size={16} color={colores.textoSuave} style={{ marginRight: 8 }} />
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por nombre o teléfono..."
          placeholderTextColor={colores.textoSuave}
          style={estilos.entradaBuscador}
        />
      </View>

      <ScrollView contentContainerStyle={estilos.lista}>
        {clientesFiltrados.length === 0 ? (
          <SinResultados texto="No se encontraron clientes" />
        ) : (
          clientesFiltrados.map((cliente) => {
            const iniciales = cliente.nombre
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Pressable key={cliente.id} onPress={() => navegarA('adminDetalleCliente', { clienteId: cliente.id })}>
                <Tarjeta estilo={estilos.fila}>
                  <View style={[estilos.avatar, { backgroundColor: cliente.color }]}>
                    <Text style={estilos.textoAvatar}>{iniciales}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={estilos.nombre}>{cliente.nombre}</Text>
                    <Text style={estilos.telefono}>
                      {cliente.telefono} · {cliente.vehiculos.length} vehículo(s)
                    </Text>
                    <View style={estilos.filaVehiculos}>
                      {cliente.vehiculos.map((v) => (
                        <View key={v.placa} style={estilos.etiquetaVehiculo}>
                          <Text style={estilos.textoEtiqueta}>
                            {v.modelo} · {v.placa}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
                </Tarjeta>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    marginHorizontal: 16,
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

  filaVehiculos: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  etiquetaVehiculo: { backgroundColor: colores.fondoTab, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  textoEtiqueta: { fontSize: 10, fontWeight: '600', color: colores.textoSuave },
});
