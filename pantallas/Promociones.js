// PANTALLA: Promociones (admin, HF10)
// El admin crea descuentos para los clientes:
//   - de porcentaje (ej. 20 %) o de monto fijo (ej. C$50),
//   - para un servicio en particular o para todos,
//   - con fecha de inicio y de fin.
// Puede pausarlas, volver a activarlas o eliminarlas. Las promociones
// vigentes las ve el cliente en su inicio y se aplican solas al agendar.

import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  escucharPromociones,
  crearPromocion,
  cambiarEstadoPromocion,
  eliminarPromocion,
  estadoPromocion,
  textoDescuento,
  fechaCorta,
} from '../firebase/promociones';
import { obtenerServicios } from '../firebase/servicios';
import { useDatos, hoyISO } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

const ESTADOS = {
  vigente: { texto: 'Vigente', fondo: '#dcfce7', color: '#166534' },
  programada: { texto: 'Programada', fondo: '#dbeafe', color: '#1e40af' },
  vencida: { texto: 'Vencida', fondo: colores.fondoTab, color: colores.textoSuave },
  pausada: { texto: 'Pausada', fondo: '#fef3c7', color: '#92400e' },
};

// "2026-10-26" + 30 días -> "2026-11-25"
function sumarDias(fechaISO, dias) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const f = new Date(anio, mes - 1, dia + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

// true si el texto es una fecha real con formato AAAA-MM-DD.
function fechaValida(texto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const [anio, mes, dia] = texto.split('-').map(Number);
  const f = new Date(anio, mes - 1, dia);
  return f.getFullYear() === anio && f.getMonth() === mes - 1 && f.getDate() === dia;
}

export default function Promociones({ navegarA }) {
  const [promociones, setPromociones] = useState(null);
  const [creando, setCreando] = useState(false);
  useEffect(() => escucharPromociones(setPromociones), []);

  function alCambiarActiva(promocion, activa) {
    cambiarEstadoPromocion(promocion.id, activa).catch(() => Alert.alert('Error', 'No se pudo actualizar la promoción.'));
  }

  function alEliminar(promocion) {
    Alert.alert('Eliminar promoción', `¿Eliminar "${promocion.titulo}"? Las citas ya agendadas conservan su descuento.`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, eliminar',
        style: 'destructive',
        onPress: () => eliminarPromocion(promocion.id).catch(() => Alert.alert('Error', 'No se pudo eliminar.')),
      },
    ]);
  }

  return (
    <KeyboardAvoidingView style={estilos.contenedor} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <Encabezado titulo="Promociones" subtitulo="Descuentos para tus clientes" alVolver={() => navegarA('adminMas')} />

        <View style={estilos.seccion}>
          {creando ? (
            <FormularioPromocion alTerminar={() => setCreando(false)} />
          ) : (
            <Boton texto="+ Nueva promoción" alPresionar={() => setCreando(true)} estilo={estilos.botonMorado} />
          )}
        </View>

        <View style={estilos.seccion}>
          {promociones === null ? (
            <Cargando />
          ) : promociones.length === 0 ? (
            <SinResultados texto="Aún no hay promociones" />
          ) : (
            promociones.map((p) => {
              const estado = ESTADOS[estadoPromocion(p)];
              return (
                <Tarjeta key={p.id}>
                  <View style={estilos.filaTitulo}>
                    <View style={estilos.iconoPromo}>
                      <Ionicons name="pricetag" size={18} color="#c2410c" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={estilos.titulo}>{p.titulo}</Text>
                      <Text style={estilos.descuento}>{textoDescuento(p)}</Text>
                    </View>
                    <Text style={[estilos.insignia, { backgroundColor: estado.fondo, color: estado.color }]}>{estado.texto}</Text>
                  </View>

                  {p.descripcion ? <Text style={estilos.descripcion}>{p.descripcion}</Text> : null}
                  <Text style={estilos.detalle}>Aplica a: {p.servicioId ? p.servicioNombre || 'un servicio' : 'todos los servicios'}</Text>
                  <Text style={estilos.detalle}>
                    Del {fechaCorta(p.fechaInicio)} al {fechaCorta(p.fechaFin)}
                  </Text>

                  <View style={estilos.filaAcciones}>
                    <View style={estilos.filaSwitch}>
                      <Switch value={p.activa} onValueChange={(valor) => alCambiarActiva(p, valor)} />
                      <Text style={estilos.textoSwitch}>{p.activa ? 'Activa' : 'Pausada'}</Text>
                    </View>
                    <Text style={estilos.eliminar} onPress={() => alEliminar(p)}>
                      Eliminar
                    </Text>
                  </View>
                </Tarjeta>
              );
            })
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FormularioPromocion({ alTerminar }) {
  const { datos: servicios } = useDatos(obtenerServicios);
  const hoy = hoyISO();

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('porcentaje');
  const [valor, setValor] = useState('');
  const [servicioId, setServicioId] = useState(null); // null = todos
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [fechaFin, setFechaFin] = useState(sumarDias(hoy, 30));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function alGuardar() {
    if (guardando) return;
    const numero = Number(valor);
    if (!titulo.trim()) return setError('Ponle un título a la promoción.');
    if (!numero || numero <= 0) return setError('Escribe cuánto se descuenta.');
    if (tipo === 'porcentaje' && numero > 100) return setError('El porcentaje no puede pasar de 100.');
    if (!fechaValida(fechaInicio) || !fechaValida(fechaFin)) return setError('Escribe las fechas como AAAA-MM-DD (ej. 2026-11-30).');
    if (fechaFin < fechaInicio) return setError('La fecha de fin debe ser igual o posterior a la de inicio.');

    const servicio = (servicios ?? []).find((s) => s.id === servicioId);
    setGuardando(true);
    setError('');
    try {
      await crearPromocion({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        valor: numero,
        servicioId: servicio?.id ?? null,
        servicioNombre: servicio?.nombre ?? '',
        fechaInicio,
        fechaFin,
      });
      alTerminar();
    } catch (e) {
      setError('No se pudo guardar la promoción. Intenta de nuevo.');
      setGuardando(false);
    }
  }

  return (
    <Tarjeta>
      <Text style={estilos.tituloFormulario}>Nueva promoción</Text>
      <CampoTexto etiqueta="Título" placeholder="Ej. Lavado de fin de mes" valor={titulo} alCambiar={setTitulo} />
      <CampoTexto
        etiqueta="Descripción (opcional)"
        placeholder="Ej. Solo de lunes a jueves"
        valor={descripcion}
        alCambiar={setDescripcion}
      />

      <Text style={estilos.etiqueta}>Tipo de descuento</Text>
      <View style={estilos.filaChips}>
        {[
          { clave: 'porcentaje', texto: 'Porcentaje (%)' },
          { clave: 'monto', texto: 'Monto fijo (C$)' },
        ].map((op) => (
          <Pressable key={op.clave} onPress={() => setTipo(op.clave)} style={[estilos.chip, tipo === op.clave && estilos.chipActivo]}>
            <Text style={[estilos.textoChip, tipo === op.clave && estilos.textoChipActivo]}>{op.texto}</Text>
          </Pressable>
        ))}
      </View>

      <CampoTexto
        etiqueta={tipo === 'porcentaje' ? 'Porcentaje de descuento' : 'Córdobas de descuento'}
        placeholder={tipo === 'porcentaje' ? 'Ej. 20' : 'Ej. 50'}
        keyboardType="numeric"
        valor={valor}
        alCambiar={setValor}
      />

      <Text style={estilos.etiqueta}>¿A qué servicio aplica?</Text>
      <View style={estilos.filaChips}>
        <Pressable onPress={() => setServicioId(null)} style={[estilos.chip, servicioId === null && estilos.chipActivo]}>
          <Text style={[estilos.textoChip, servicioId === null && estilos.textoChipActivo]}>Todos</Text>
        </Pressable>
        {(servicios ?? []).map((s) => (
          <Pressable key={s.id} onPress={() => setServicioId(s.id)} style={[estilos.chip, servicioId === s.id && estilos.chipActivo]}>
            <Text style={[estilos.textoChip, servicioId === s.id && estilos.textoChipActivo]}>{s.nombre}</Text>
          </Pressable>
        ))}
      </View>

      <View style={estilos.filaFechas}>
        <View style={{ flex: 1 }}>
          <CampoTexto etiqueta="Desde" placeholder="AAAA-MM-DD" valor={fechaInicio} alCambiar={setFechaInicio} />
        </View>
        <View style={{ flex: 1 }}>
          <CampoTexto etiqueta="Hasta" placeholder="AAAA-MM-DD" valor={fechaFin} alCambiar={setFechaFin} />
        </View>
      </View>

      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <View style={estilos.filaBotones}>
        <Boton texto="Cancelar" tipo="borde" alPresionar={alTerminar} estilo={{ flex: 1 }} />
        <Boton texto={guardando ? 'Guardando...' : 'Guardar'} alPresionar={alGuardar} estilo={[{ flex: 1 }, estilos.botonMorado]} />
      </View>
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  seccion: { paddingHorizontal: 16, marginBottom: 12 },
  botonMorado: { backgroundColor: '#7c3aed' },

  filaTitulo: { flexDirection: 'row', alignItems: 'center' },
  iconoPromo: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ffedd5', alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 15, fontWeight: '700', color: colores.texto },
  descuento: { fontSize: 13, fontWeight: '700', color: '#c2410c', marginTop: 2 },
  insignia: { fontSize: 11, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  descripcion: { fontSize: 13, color: colores.texto, marginTop: 10 },
  detalle: { fontSize: 12, color: colores.textoSuave, marginTop: 6 },

  filaAcciones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  filaSwitch: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  textoSwitch: { fontSize: 13, color: colores.texto, fontWeight: '600' },
  eliminar: { fontSize: 13, fontWeight: '700', color: colores.peligro },

  tituloFormulario: { fontSize: 16, fontWeight: '800', color: colores.texto, marginBottom: 14 },
  etiqueta: { fontSize: 13, fontWeight: '600', color: colores.texto, marginBottom: 8 },
  filaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chipActivo: { backgroundColor: '#7c3aed', borderColor: '#7c3aed' },
  textoChip: { fontSize: 12, fontWeight: '600', color: colores.textoSuave },
  textoChipActivo: { color: '#ffffff' },
  filaFechas: { flexDirection: 'row', gap: 10 },
  error: { color: colores.peligro, fontSize: 13, marginBottom: 12 },
  filaBotones: { flexDirection: 'row', gap: 10 },
});
