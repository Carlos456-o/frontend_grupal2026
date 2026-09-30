// PANTALLA: Nuevo servicio (admin)
// Formulario para agregar un servicio al catálogo, eligiendo con qué
// actividades se arma (ver datos/actividades.js) y viendo una vista previa
// de cómo se vería en el catálogo del cliente mientras se llena el formulario.
// Todavía no se guarda en un backend, solo muestra un mensaje de confirmación.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { actividades } from '../datos/actividades';
import Encabezado from '../componentes/Encabezado';
import CampoTexto from '../componentes/CampoTexto';
import Tarjeta from '../componentes/Tarjeta';
import Boton from '../componentes/Boton';
import { colores } from '../estilos/colores';

export default function NuevoServicio({ navegarA }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [duracion, setDuracion] = useState('');
  const [actividadesElegidas, setActividadesElegidas] = useState([]);

  function alternarActividad(id) {
    setActividadesElegidas((anteriores) =>
      anteriores.includes(id) ? anteriores.filter((a) => a !== id) : [...anteriores, id]
    );
  }

  function alGuardar() {
    if (!nombre || !precio) {
      Alert.alert('Datos incompletos', 'Completa al menos nombre y precio.');
      return;
    }
    Alert.alert('Servicio agregado', '', [
      { text: 'OK', onPress: () => navegarA('adminCatalogo', { pestanaInicial: 'servicios' }) },
    ]);
  }

  const nombresElegidos = actividades.filter((a) => actividadesElegidas.includes(a.id)).map((a) => a.nombre);

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado
        titulo="Nuevo servicio"
        subtitulo="Se mostrará en el catálogo del cliente"
        alVolver={() => navegarA('adminCatalogo', { pestanaInicial: 'servicios' })}
      />

      <ScrollView contentContainerStyle={estilos.contenido}>
        <CampoTexto
          etiqueta="Nombre del servicio"
          placeholder="Ej: Lavado Premium"
          valor={nombre}
          alCambiar={setNombre}
        />
        <CampoTexto
          etiqueta="Descripción"
          placeholder="Breve descripción de lo que incluye el servicio"
          valor={descripcion}
          alCambiar={setDescripcion}
          multiline
        />

        <View style={estilos.filaDoble}>
          <View style={estilos.mitad}>
            <CampoTexto etiqueta="Precio (C$)" placeholder="250" keyboardType="numeric" valor={precio} alCambiar={setPrecio} />
          </View>
          <View style={estilos.mitad}>
            <CampoTexto etiqueta="Duración (min)" placeholder="40" keyboardType="numeric" valor={duracion} alCambiar={setDuracion} />
          </View>
        </View>

        <Text style={estilos.tituloSeccion}>Actividades incluidas (del catálogo)</Text>
        <View style={estilos.filaChips}>
          {actividades.map((actividad) => {
            const elegida = actividadesElegidas.includes(actividad.id);
            return (
              <Pressable
                key={actividad.id}
                onPress={() => alternarActividad(actividad.id)}
                style={[estilos.chip, elegida && estilos.chipElegido]}
              >
                {elegida ? <Ionicons name="checkmark" size={13} color="#0e7490" style={{ marginRight: 4 }} /> : null}
                <Text style={[estilos.textoChip, elegida && estilos.textoChipElegido]}>{actividad.nombre}</Text>
              </Pressable>
            );
          })}
        </View>

        {nombre ? (
          <View style={estilos.seccionPreview}>
            <Text style={[estilos.tituloSeccion, estilos.colorPreview]}>Vista previa para el cliente</Text>
            <Tarjeta estilo={estilos.filaPreview}>
              <View style={estilos.iconoPreview}>
                <Ionicons name="car-sport-outline" size={20} color="#ffffff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={estilos.nombrePreview}>{nombre}</Text>
                <Text style={estilos.detallePreview}>
                  {duracion || '0'} min{nombresElegidos.length > 0 ? ` · ${nombresElegidos.join(', ')}` : ''}
                </Text>
              </View>
              <Text style={estilos.precioPreview}>C${precio || '0'}</Text>
            </Tarjeta>
          </View>
        ) : null}
      </ScrollView>

      <View style={estilos.barraBotones}>
        <Boton
          texto="Cancelar"
          tipo="borde"
          alPresionar={() => navegarA('adminCatalogo', { pestanaInicial: 'servicios' })}
          estilo={estilos.botonMitad}
        />
        <Boton texto="Guardar servicio" alPresionar={alGuardar} estilo={[estilos.botonMitad, { backgroundColor: '#132048' }]} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  filaDoble: { flexDirection: 'row', gap: 12 },
  mitad: { flex: 1 },

  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoSuave,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  colorPreview: { color: '#7c3aed' },

  filaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipElegido: { borderColor: '#06b6d4', backgroundColor: '#ecfeff' },
  textoChip: { fontSize: 13, fontWeight: '600', color: colores.texto },
  textoChipElegido: { color: '#0e7490' },

  seccionPreview: { marginTop: 20 },
  filaPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' },
  iconoPreview: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#7c3aed', alignItems: 'center', justifyContent: 'center' },
  nombrePreview: { fontSize: 14, fontWeight: '700', color: colores.texto },
  detallePreview: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  precioPreview: { fontSize: 15, fontWeight: '800', color: '#7c3aed' },

  barraBotones: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  botonMitad: { flex: 1 },
});
