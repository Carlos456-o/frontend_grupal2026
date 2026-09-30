// PANTALLA: Gestión de catálogo (admin)
// Junta dos vistas en una sola pantalla, con una pestaña interna arriba:
//   "Servicios"   -> los paquetes de lavado (editar / eliminar, con las
//                    actividades que los componen como etiquetas)
//   "Actividades" -> el catálogo de tareas individuales (datos/actividades.js)
// "parametros.pestanaInicial" deja abrir la pantalla ya en una de las dos
// (por ejemplo, desde el Panel de administración).

import { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { servicios } from '../datos/servicios';
import { actividades } from '../datos/actividades';
import Tarjeta from '../componentes/Tarjeta';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import { colores } from '../estilos/colores';

const paquetesLavado = servicios.filter((s) => s.categoriaId === 'cat1');

function IconoActividad({ nombreIcono, set, color, tamano = 16 }) {
  if (set === 'material') {
    return <MaterialCommunityIcons name={nombreIcono} size={tamano} color={color} />;
  }
  return <Ionicons name={nombreIcono} size={tamano} color={color} />;
}

export default function GestionCatalogo({ parametros, navegarA }) {
  const [pestana, setPestana] = useState(parametros.pestanaInicial || 'servicios');
  const [busqueda, setBusqueda] = useState('');

  function confirmarEliminar(nombre) {
    Alert.alert('Eliminar', `¿Seguro que deseas eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      // Todavía no hay backend, así que solo avisamos (no se borra de verdad).
      { text: 'Eliminar', style: 'destructive', onPress: () => Alert.alert('Eliminado', `"${nombre}" fue eliminado.`) },
    ]);
  }

  function alEditar(nombre) {
    Alert.alert('Próximamente', `Aquí podrás editar "${nombre}" cuando conectemos el backend.`);
  }

  const serviciosFiltrados = paquetesLavado.filter((s) => s.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const actividadesFiltradas = actividades.filter((a) => a.nombre.toLowerCase().includes(busqueda.toLowerCase()));

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
              ? `${paquetesLavado.length} tipos de lavado registrados`
              : `${actividades.length} actividades · usadas para armar servicios`}
          </Text>
        </View>
        <Boton
          texto="+ Nuevo"
          alPresionar={() => navegarA(pestana === 'servicios' ? 'adminNuevoServicio' : 'adminNuevaActividad')}
          estilo={estilos.botonNuevo}
        />
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
        {pestana === 'servicios' ? (
          serviciosFiltrados.length === 0 ? (
            <SinResultados texto="No se encontraron servicios" />
          ) : (
            serviciosFiltrados.map((servicio) => (
              <Tarjeta key={servicio.id} estilo={servicio.destacado ? estilos.tarjetaDestacada : null}>
                <View style={estilos.filaServicio}>
                  <View style={[estilos.iconoCuadro, { backgroundColor: servicio.colorFondoIcono }]}>
                    <Ionicons name={servicio.icono} size={20} color={servicio.colorIcono} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={estilos.nombreServicio}>{servicio.nombre}</Text>
                    <Text style={estilos.detalleServicio}>
                      {servicio.descripcion} · {servicio.duracionMinutos} min
                    </Text>
                  </View>
                  <Text style={estilos.precioServicio}>C${servicio.precio}</Text>
                </View>

                <View style={estilos.filaEtiquetas}>
                  {(servicio.actividadesIds || []).map((id) => {
                    const actividad = actividades.find((a) => a.id === id);
                    if (!actividad) return null;
                    return (
                      <View key={id} style={estilos.etiqueta}>
                        <Text style={estilos.textoEtiqueta}>{actividad.nombre}</Text>
                      </View>
                    );
                  })}
                </View>

                <View style={estilos.filaBotones}>
                  <Boton texto="Editar" tipo="borde" alPresionar={() => alEditar(servicio.nombre)} estilo={estilos.botonMitad} />
                  <Boton texto="Eliminar" tipo="peligro" alPresionar={() => confirmarEliminar(servicio.nombre)} estilo={estilos.botonMitad} />
                </View>
              </Tarjeta>
            ))
          )
        ) : actividadesFiltradas.length === 0 ? (
          <SinResultados texto="No se encontraron actividades" />
        ) : (
          actividadesFiltradas.map((actividad) => (
            <Tarjeta key={actividad.id} estilo={estilos.filaActividad}>
              <View style={[estilos.iconoCuadro, { backgroundColor: actividad.colorFondoIcono }]}>
                <IconoActividad nombreIcono={actividad.icono} set={actividad.iconoSet} color={actividad.colorIcono} tamano={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={estilos.nombreServicio}>{actividad.nombre}</Text>
                <Text style={estilos.detalleServicio}>{actividad.descripcion}</Text>
              </View>
              <Pressable style={estilos.botonEditarChico} onPress={() => alEditar(actividad.nombre)}>
                <Ionicons name="pencil-outline" size={16} color={colores.textoSuave} />
              </Pressable>
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

  tarjetaDestacada: { borderColor: '#7c3aed', borderWidth: 2, backgroundColor: '#f5f3ff' },
  filaServicio: { flexDirection: 'row', alignItems: 'center' },
  iconoCuadro: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  nombreServicio: { fontSize: 14, fontWeight: '700', color: colores.texto },
  detalleServicio: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  precioServicio: { fontSize: 14, fontWeight: '700', color: colores.texto },

  filaEtiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  etiqueta: { backgroundColor: colores.fondoTab, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  textoEtiqueta: { fontSize: 11, fontWeight: '600', color: colores.textoSuave },

  filaBotones: { flexDirection: 'row', gap: 10, marginTop: 12 },
  botonMitad: { flex: 1 },

  filaActividad: { flexDirection: 'row', alignItems: 'center' },
  botonEditarChico: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colores.borde,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
