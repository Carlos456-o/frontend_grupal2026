// PANTALLA: Catálogo de servicios
// Muestra la lista de la colección "catalogo" de Firebase con el precio y
// la duración de cada servicio (ver firebase/servicios.js), con un buscador.
// La usan dos casos: un cliente que ya inició sesión (ahí "usuario" existe
// y el menú de abajo ya deja moverse a otras pantallas), y alguien que
// entró como invitado desde el login (ahí "usuario" es null).

import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { obtenerCatalogo } from '../firebase/servicios';
import { useDatos } from '../firebase/utilidades';
import TarjetaServicioResumen from '../componentes/TarjetaServicioResumen';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores, degradados } from '../estilos/colores';

export default function CatalogoServicios({ usuario, navegarA }) {
  const [busqueda, setBusqueda] = useState('');
  const { datos: catalogo, cargando, error, recargar } = useDatos(obtenerCatalogo);

  const texto = busqueda.trim().toLowerCase();
  const catalogoFiltrado = (catalogo ?? []).filter((item) => item.nombre.toLowerCase().includes(texto));

  return (
    <View style={estilos.contenedor}>
      <LinearGradient
        colors={degradados.inicio}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={estilos.encabezado}
      >
        <View style={estilos.filaTitulo}>
          <Pressable onPress={() => navegarA(usuario ? 'clienteInicio' : 'iniciarSesion')} style={estilos.botonAtras}>
            <Ionicons name="chevron-back" size={26} color="#ffffff" />
          </Pressable>
          <Text style={estilos.titulo}>Catálogo de servicios</Text>
        </View>

        <View style={estilos.buscador}>
          <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.85)" style={estilos.iconoBuscar} />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar servicio..."
            placeholderTextColor="rgba(255,255,255,0.75)"
            style={estilos.entradaBuscador}
          />
        </View>
      </LinearGradient>

      {!usuario ? (
        <View style={estilos.seccionInvitado}>
          <Boton texto="Crear cuenta o iniciar sesión" alPresionar={() => navegarA('iniciarSesion')} />
        </View>
      ) : null}

      <ScrollView style={estilos.contenido} contentContainerStyle={estilos.contenidoInterno}>
        {cargando || error ? (
          <Cargando error={error} alReintentar={recargar} />
        ) : catalogoFiltrado.length === 0 ? (
          <SinResultados texto="No encontramos servicios con ese filtro" />
        ) : (
          catalogoFiltrado.map((item) => <TarjetaServicioResumen key={item.catalogoId} servicio={item} />)
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },

  encabezado: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 20 },
  filaTitulo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  botonAtras: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  titulo: { fontSize: 18, fontWeight: '800', color: '#ffffff' },

  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  iconoBuscar: { marginRight: 8 },
  entradaBuscador: { flex: 1, color: '#ffffff', fontSize: 14 },

  seccionInvitado: { paddingHorizontal: 16, marginTop: 16 },

  contenido: { flex: 1 },
  contenidoInterno: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

});
