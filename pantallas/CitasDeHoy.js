// PANTALLA: Citas de hoy (admin)
// Le muestra al administrador todas las citas del día, de todos los
// clientes y empleados, con filtros por estado. Tocar una cita lleva
// al "Seguimiento del lavado" para ver/actualizar sus pasos.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { citas } from '../datos/citas';
import { clientes } from '../datos/clientes';
import SinResultados from '../componentes/SinResultados';
import { colores, coloresPorEstado } from '../estilos/colores';

const NOMBRES_ESTADO = { pendiente: 'Pendiente', en_proceso: 'En proceso', completada: 'Completada', confirmada: 'Confirmada', cancelada: 'Cancelada' };

const FILTROS = [
  { clave: 'todas', texto: 'Todas' },
  { clave: 'en_proceso', texto: 'En proceso' },
  { clave: 'completada', texto: 'Completadas' },
];

export default function CitasDeHoy({ navegarA }) {
  const [filtro, setFiltro] = useState('todas');

  const hoyISO = new Date().toISOString().slice(0, 10);
  const citasHoy = citas
    .filter((c) => c.fecha === hoyISO)
    .sort((a, b) => (a.hora > b.hora ? 1 : -1));

  const completadas = citasHoy.filter((c) => c.estado === 'completada').length;
  const pendientes = citasHoy.filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada').length;

  const citasFiltradas = citasHoy.filter((c) => filtro === 'todas' || c.estado === filtro);

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Text style={estilos.marca}>PANEL DEL NEGOCIO</Text>
        <Text style={estilos.titulo}>Citas de hoy</Text>
      </View>

      <View style={estilos.seccion}>
        <View style={estilos.filaStats}>
          <View style={estilos.stat}>
            <Text style={estilos.statValor}>{citasHoy.length}</Text>
            <Text style={estilos.statEtiqueta}>Citas hoy</Text>
          </View>
          <View style={estilos.stat}>
            <Text style={[estilos.statValor, { color: colores.exito }]}>{completadas}</Text>
            <Text style={estilos.statEtiqueta}>Completadas</Text>
          </View>
          <View style={estilos.stat}>
            <Text style={[estilos.statValor, { color: '#d97706' }]}>{pendientes}</Text>
            <Text style={estilos.statEtiqueta}>Pendientes</Text>
          </View>
        </View>

        <View style={estilos.filaChips}>
          {FILTROS.map((f) => (
            <Pressable
              key={f.clave}
              onPress={() => setFiltro(f.clave)}
              style={[estilos.chip, filtro === f.clave && estilos.chipActivo]}
            >
              <Text style={[estilos.textoChip, filtro === f.clave && estilos.textoChipActivo]}>{f.texto}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={estilos.lista}>
        {citasFiltradas.length === 0 ? (
          <SinResultados texto="No hay citas con ese filtro" />
        ) : (
          citasFiltradas.map((cita) => {
            const cliente = clientes.find((c) => c.id === cita.clienteId);
            const color = coloresPorEstado[cita.estado];
            const iniciales = (cliente?.nombre || '')
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Pressable
                key={cita.id}
                style={estilos.filaCita}
                onPress={() => navegarA('adminSeguimientoLavado', { citaId: cita.id })}
              >
                <Text style={estilos.hora}>{cita.hora}</Text>
                <View style={estilos.avatarChico}>
                  <Text style={estilos.textoAvatarChico}>{iniciales}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={estilos.nombreCliente}>{cliente?.nombre}</Text>
                  <Text style={estilos.detalleCita}>
                    {cita.servicio.nombre} · {cita.vehiculo.placa}
                  </Text>
                </View>
                <View style={[estilos.insigniaEstado, { backgroundColor: color.fondo }]}>
                  <Text style={[estilos.textoInsignia, { color: color.texto }]}>{NOMBRES_ESTADO[cita.estado]}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },

  encabezado: { backgroundColor: '#132048', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  marca: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.65)', letterSpacing: 1 },
  titulo: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginTop: 4 },

  seccion: { paddingHorizontal: 16, marginTop: 16 },
  filaStats: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  stat: {
    flex: 1,
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValor: { fontSize: 18, fontWeight: '800', color: colores.texto },
  statEtiqueta: { fontSize: 10, color: colores.textoSuave, marginTop: 4, textAlign: 'center' },

  filaChips: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chipActivo: { backgroundColor: '#132048', borderColor: '#132048' },
  textoChip: { fontSize: 12, fontWeight: '600', color: colores.textoSuave },
  textoChipActivo: { color: '#ffffff' },

  lista: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  filaCita: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 12,
    marginBottom: 10,
  },
  hora: { fontSize: 13, fontWeight: '700', color: colores.texto, width: 52 },
  avatarChico: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAvatarChico: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  nombreCliente: { fontSize: 14, fontWeight: '700', color: colores.texto },
  detalleCita: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  insigniaEstado: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  textoInsignia: { fontSize: 10, fontWeight: '700' },
});
