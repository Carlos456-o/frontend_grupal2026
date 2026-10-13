// PANTALLA: Gestión de catálogo (admin)
// Junta dos vistas en una sola pantalla, con una pestaña interna arriba:
//   "Servicios"   -> la colección "servicios" de Firebase (editar / eliminar,
//                    con las actividades que incluyen como etiquetas)
//   "Actividades" -> las actividades que usan los servicios (salen de
//                    "actividades_incluidas"; no tienen colección propia)
// "parametros.pestanaInicial" deja abrir la pantalla ya en una de las dos
// (por ejemplo, desde el Panel de administración).

import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerServicios, eliminarServicio, actividadesDe } from '../firebase/servicios';
import { useDatos } from '../firebase/utilidades';
import Tarjeta from '../componentes/Tarjeta';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

export default function GestionCatalogo({ parametros, navegarA }) {
  const [pestana, setPestana] = useState(parametros.pestanaInicial || 'servicios');
  const [busqueda, setBusqueda] = useState('');
  const { datos, cargando, error, recargar } = useDatos(obtenerServicios);
  const servicios = datos ?? [];
  const actividades = actividadesDe(servicios);

  function confirmarEliminar(servicio) {
    Alert.alert('Eliminar', `¿Seguro que deseas eliminar "${servicio.nombre}"? También se quitará del catálogo.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eliminarServicio(servicio);
            recargar();
          } catch (e) {
            Alert.alert('Error', 'No se pudo eliminar el servicio. Intenta de nuevo.');
          }
        },
      },
    ]);
  }

  const texto = busqueda.toLowerCase();
  const serviciosFiltrados = servicios.filter((s) => s.nombre.toLowerCase().includes(texto));
  const actividadesFiltradas = actividades.filter((a) => a.nombre.toLowerCase().includes(texto));

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Pressable onPress={() => navegarA('adminInicio')} style={estilos.botonAtras}>
          <Ionicons name="chevron-back" size={26} color={colores.texto} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={estilos.titulo}>{pestana === 'servicios' ? 'Servicios' : 'Catálogo de actividades'}</Text>
          <Text style={estilos.subtitulo}>
            {pestana === 'servicios'
              ? `${servicios.length} servicios registrados`
              : `${actividades.length} actividades · usadas para armar servicios`}
          </Text>
        </View>
        {pestana === 'servicios' ? (
          <Boton texto="+ Nuevo" alPresionar={() => navegarA('adminNuevoServicio')} estilo={estilos.botonNuevo} />
        ) : null}
      </View>

      <View style={estilos.selector}>
        <Pressable
          style={[estilos.opcionSelector, pestana === 'servicios' && estilos.opcionSelectorActiva]}
          onPress={() => setPestana('servicios')}
        >
          <Text style={[estilos.textoSelector, pestana === 'servicios' && estilos.textoSelectorActivo]}>Servicios</Text>
        </Pressable>
        <Pressable
          style={[estilos.opcionSelector, pestana === 'actividades' && estilos.opcionSelectorActiva]}
          onPress={() => setPestana('actividades')}
        >
          <Text style={[estilos.textoSelector, pestana === 'actividades' && estilos.textoSelectorActivo]}>
            Actividades
          </Text>
        </Pressable>
      </View>

      <View style={estilos.buscador}>
        <Ionicons name="search-outline" size={16} color={colores.textoSuave} style={{ marginRight: 8 }} />
        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder={pestana === 'servicios' ? 'Buscar servicio...' : 'Buscar actividad...'}
          placeholderTextColor={colores.textoSuave}
          style={estilos.entradaBuscador}
        />
      </View>

      <ScrollView contentContainerStyle={estilos.lista}>
        {cargando || error ? (
          <Cargando error={error} alReintentar={recargar} />
        ) : pestana === 'servicios' ? (
          serviciosFiltrados.length === 0 ? (
            <SinResultados texto="No se encontraron servicios" />
          ) : (
            serviciosFiltrados.map((servicio) => (
              <Tarjeta key={servicio.id}>
                <View style={estilos.filaServicio}>
                  <View style={estilos.iconoCuadro}>
                    <Ionicons name="car-outline" size={20} color={colores.principal} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={estilos.nombreServicio}>{servicio.nombre}</Text>
                    <Text style={estilos.detalleServicio}>
                      {servicio.descripcion}
                      {servicio.duracionMinutos != null ? ` · ${servicio.duracionMinutos} min` : ''}
                    </Text>
                  </View>
                  <Text style={estilos.precioServicio}>C${servicio.precio}</Text>
                </View>

                <View style={estilos.filaEtiquetas}>
                  {servicio.actividades.map((actividad) => (
                    <View key={actividad} style={estilos.etiqueta}>
                      <Text style={estilos.textoEtiqueta}>{actividad}</Text>
                    </View>
                  ))}
                </View>

                <View style={estilos.filaBotones}>
                  <Boton
                    texto="Editar"
                    tipo="borde"
                    alPresionar={() => navegarA('adminNuevoServicio', { servicio })}
                    estilo={estilos.botonMitad}
                  />
                  <Boton texto="Eliminar" tipo="peligro" alPresionar={() => confirmarEliminar(servicio)} estilo={estilos.botonMitad} />
                </View>
              </Tarjeta>
            ))
          )
        ) : actividadesFiltradas.length === 0 ? (
          <SinResultados texto="No se encontraron actividades" />
        ) : (
          actividadesFiltradas.map((actividad) => (
            <Tarjeta key={actividad.nombre} estilo={estilos.filaActividad}>
              <View style={estilos.iconoCuadro}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colores.principal} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={estilos.nombreServicio}>{actividad.nombre}</Text>
                <Text style={estilos.detalleServicio}>
                  Incluida en {actividad.cantidadServicios} servicio(s)
                </Text>
              </View>
            </Tarjeta>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  botonAtras: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  titulo: { fontSize: 16, fontWeight: '800', color: colores.texto },
  subtitulo: { fontSize: 11, color: colores.textoSuave, marginTop: 2 },
  botonNuevo: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#132048' },

  selector: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 8 },
  opcionSelector: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999, backgroundColor: colores.fondoTab },
  opcionSelectorActiva: { backgroundColor: '#132048' },
  textoSelector: { fontSize: 13, fontWeight: '700', color: colores.textoSuave },
  textoSelectorActivo: { color: '#ffffff' },

  buscador: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  entradaBuscador: { flex: 1, fontSize: 14, color: colores.texto },

  lista: { padding: 16, paddingBottom: 24 },

  filaServicio: { flexDirection: 'row', alignItems: 'center' },
  iconoCuadro: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondoTab,
  },
  nombreServicio: { fontSize: 14, fontWeight: '700', color: colores.texto },
  detalleServicio: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  precioServicio: { fontSize: 14, fontWeight: '700', color: colores.texto },

  filaEtiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  etiqueta: { backgroundColor: colores.fondoTab, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  textoEtiqueta: { fontSize: 11, fontWeight: '600', color: colores.textoSuave },

  filaBotones: { flexDirection: 'row', gap: 10, marginTop: 12 },
  botonMitad: { flex: 1 },

  filaActividad: { flexDirection: 'row', alignItems: 'center' },
});
