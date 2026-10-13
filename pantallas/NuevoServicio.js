// PANTALLA: Nuevo servicio / Editar servicio (admin)
// Formulario para agregar un servicio a la colección "servicios" de Firebase
// (y su entrada en "catalogo"), eligiendo qué actividades incluye y viendo
// una vista previa de cómo se vería en el catálogo del cliente.
// Si llega "parametros.servicio" (desde el botón Editar de la Gestión de
// catálogo), el formulario se llena con ese servicio y al guardar se actualiza.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerServicios, crearServicio, actualizarServicio, actividadesDe } from '../firebase/servicios';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import CampoTexto from '../componentes/CampoTexto';
import Tarjeta from '../componentes/Tarjeta';
import Boton from '../componentes/Boton';
import { colores } from '../estilos/colores';

export default function NuevoServicio({ parametros, navegarA }) {
  const servicioEditado = parametros?.servicio;
  const [nombre, setNombre] = useState(servicioEditado?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(servicioEditado?.descripcion ?? '');
  const [precio, setPrecio] = useState(servicioEditado?.precio != null ? String(servicioEditado.precio) : '');
  const [duracion, setDuracion] = useState(
    servicioEditado?.duracionMinutos != null ? String(servicioEditado.duracionMinutos) : ''
  );
  const [actividadesElegidas, setActividadesElegidas] = useState(servicioEditado?.actividades ?? []);
  const [actividadNueva, setActividadNueva] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Las actividades que ya usan otros servicios, más las elegidas aquí.
  const { datos: servicios } = useDatos(obtenerServicios);
  const actividadesExistentes = actividadesDe(servicios ?? []).map((a) => a.nombre);
  const actividades = [...new Set([...actividadesExistentes, ...actividadesElegidas])];

  function alternarActividad(nombreActividad) {
    setActividadesElegidas((anteriores) =>
      anteriores.includes(nombreActividad)
        ? anteriores.filter((a) => a !== nombreActividad)
        : [...anteriores, nombreActividad]
    );
  }

  function alAgregarActividad() {
    const nueva = actividadNueva.trim().toLowerCase();
    if (!nueva) return;
    if (!actividadesElegidas.includes(nueva)) setActividadesElegidas((anteriores) => [...anteriores, nueva]);
    setActividadNueva('');
  }

  async function alGuardar() {
    if (guardando) return;
    const precioNumero = Number(precio);
    const duracionNumero = duracion ? Number(duracion) : null;
    if (!nombre.trim() || !precio || Number.isNaN(precioNumero)) {
      Alert.alert('Datos incompletos', 'Completa al menos nombre y un precio válido.');
      return;
    }
    if (duracion && Number.isNaN(duracionNumero)) {
      Alert.alert('Dato inválido', 'La duración debe ser un número de minutos.');
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio: precioNumero,
      duracionMinutos: duracionNumero,
      actividades: actividadesElegidas,
    };

    setGuardando(true);
    try {
      if (servicioEditado) await actualizarServicio(servicioEditado.id, servicioEditado.nombre, datos);
      else await crearServicio(datos);
    } catch (e) {
      setGuardando(false);
      Alert.alert('Error', 'No se pudo guardar el servicio. Intenta de nuevo.');
      return;
    }

    Alert.alert(servicioEditado ? 'Servicio actualizado' : 'Servicio agregado', '', [
      { text: 'OK', onPress: () => navegarA('adminCatalogo', { pestanaInicial: 'servicios' }) },
    ]);
  }


  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado
        titulo={servicioEditado ? 'Editar servicio' : 'Nuevo servicio'}
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

        <Text style={estilos.tituloSeccion}>Actividades incluidas</Text>
        <View style={estilos.filaChips}>
          {actividades.map((actividad) => {
            const elegida = actividadesElegidas.includes(actividad);
            return (
              <Pressable
                key={actividad}
                onPress={() => alternarActividad(actividad)}
                style={[estilos.chip, elegida && estilos.chipElegido]}
              >
                {elegida ? <Ionicons name="checkmark" size={13} color="#0e7490" style={{ marginRight: 4 }} /> : null}
                <Text style={[estilos.textoChip, elegida && estilos.textoChipElegido]}>{actividad}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={estilos.filaDoble}>
          <View style={estilos.mitad}>
            <CampoTexto
              etiqueta="Otra actividad"
              placeholder="Ej: limpieza de rines"
              valor={actividadNueva}
              alCambiar={setActividadNueva}
            />
          </View>
          <Boton texto="Agregar" tipo="borde" alPresionar={alAgregarActividad} estilo={estilos.botonAgregar} />
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
                  {duracion || '0'} min{actividadesElegidas.length > 0 ? ` · ${actividadesElegidas.join(', ')}` : ''}
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
        <Boton texto={guardando ? 'Guardando...' : 'Guardar servicio'} alPresionar={alGuardar} estilo={[estilos.botonMitad, { backgroundColor: '#132048' }]} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  filaDoble: { flexDirection: 'row', gap: 12 },
  mitad: { flex: 1 },
  botonAgregar: { alignSelf: 'center', paddingHorizontal: 16, marginTop: 6 },

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
