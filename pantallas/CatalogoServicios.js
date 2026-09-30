// PANTALLA: Catálogo de servicios
// Muestra todos los servicios agrupados por categoría (Lavados, Estética,
// Mantenimiento Básico...), con un buscador y chips para filtrar.
// La usan dos casos: un cliente que ya inició sesión (ahí "usuario" existe
// y el menú de abajo ya deja moverse a otras pantallas), y alguien que
// entró como invitado desde el login (ahí "usuario" es null).

import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { servicios } from '../datos/servicios';
import { catalogo } from '../datos/catalogo';
import TarjetaServicioResumen from '../componentes/TarjetaServicioResumen';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import { colores, degradados } from '../estilos/colores';

export default function CatalogoServicios({ usuario, navegarA }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('todos');

  const serviciosFiltrados = servicios.filter((servicio) => {
    const coincideCategoria = categoriaActiva === 'todos' || servicio.categoriaId === categoriaActiva;
    const coincideBusqueda = servicio.nombre.toLowerCase().includes(busqueda.trim().toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.filaChips}>
          <Chip texto="Todos" activo={categoriaActiva === 'todos'} alPresionar={() => setCategoriaActiva('todos')} />
          {catalogo.map((categoria) => (
            <Chip
              key={categoria.id}
              texto={categoria.nombre}
              activo={categoriaActiva === categoria.id}
              alPresionar={() => setCategoriaActiva(categoria.id)}
            />
          ))}
        </ScrollView>

        {serviciosFiltrados.length === 0 ? (
          <SinResultados texto="No encontramos servicios con ese filtro" />
        ) : (
          catalogo.map((categoria) => {
            const serviciosDeCategoria = serviciosFiltrados.filter((s) => s.categoriaId === categoria.id);
            if (serviciosDeCategoria.length === 0) return null;
            return (
              <View key={categoria.id} style={estilos.grupo}>
                <View style={estilos.tituloGrupo}>
                  <View style={[estilos.puntoColor, { backgroundColor: categoria.color }]} />
                  <Text style={[estilos.textoTituloGrupo, { color: categoria.color }]}>
                    {categoria.nombre.toUpperCase()}
                  </Text>
                </View>
                {serviciosDeCategoria.map((servicio) => (
                  <TarjetaServicioResumen key={servicio.id} servicio={servicio} />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function Chip({ texto, activo, alPresionar }) {
  return (
    <Pressable onPress={alPresionar} style={[estilos.chip, activo && estilos.chipActivo]}>
      <Text style={[estilos.textoChip, activo && estilos.textoChipActivo]}>{texto}</Text>
    </Pressable>
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

  filaChips: { marginBottom: 16 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colores.borde,
    marginRight: 8,
  },
  chipActivo: { backgroundColor: '#132048', borderColor: '#132048' },
  textoChip: { fontSize: 13, fontWeight: '600', color: colores.textoSuave },
  textoChipActivo: { color: '#ffffff' },

  grupo: { marginBottom: 20 },
  tituloGrupo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  puntoColor: { width: 7, height: 7, borderRadius: 4, marginRight: 8 },
  textoTituloGrupo: { fontSize: 12, fontWeight: '700', color: colores.textoSuave, letterSpacing: 1 },
});
