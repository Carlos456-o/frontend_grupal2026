// PANTALLA: Calificaciones (admin)
// Muestra las calificaciones que dejaron los clientes al terminar sus
// citas: el promedio general, cuántas hay de cada estrella y la lista con
// los comentarios. Tocar una lleva al seguimiento de esa cita.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { obtenerCalificaciones } from '../firebase/citas';
import { obtenerClientes } from '../firebase/clientes';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import Estrellas from '../componentes/Estrellas';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores, colorAvatar } from '../estilos/colores';

async function cargarCalificaciones() {
  const [citas, clientes] = await Promise.all([obtenerCalificaciones(), obtenerClientes()]);
  return { citas, clientes };
}

export default function Calificaciones({ navegarA }) {
  // 0 = todas; 1 a 5 = solo las de esa cantidad de estrellas.
  const [filtro, setFiltro] = useState(0);
  const { datos, cargando, error, recargar } = useDatos(cargarCalificaciones);

  const citas = datos?.citas ?? [];
  const clientes = datos?.clientes ?? [];
  const promedio = citas.length ? citas.reduce((suma, c) => suma + c.calificacion.estrellas, 0) / citas.length : 0;
  const citasFiltradas = citas.filter((c) => filtro === 0 || c.calificacion.estrellas === filtro);

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Calificaciones" subtitulo="Lo que opinan los clientes" alVolver={() => navegarA('adminMas')} />

      {cargando || error ? (
        <Cargando error={error} alReintentar={recargar} />
      ) : (
        <ScrollView contentContainerStyle={estilos.contenido}>
          <Tarjeta estilo={estilos.resumen}>
            <View style={estilos.columnaPromedio}>
              <Text style={estilos.promedio}>{citas.length ? promedio.toFixed(1) : '–'}</Text>
              <Estrellas valor={Math.round(promedio)} tamano={16} />
              <Text style={estilos.total}>
                {citas.length} {citas.length === 1 ? 'calificación' : 'calificaciones'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              {[5, 4, 3, 2, 1].map((n) => {
                const cantidad = citas.filter((c) => c.calificacion.estrellas === n).length;
                const porcentaje = citas.length ? (cantidad / citas.length) * 100 : 0;
                return (
                  <View key={n} style={estilos.filaBarra}>
                    <Text style={estilos.numeroBarra}>{n}★</Text>
                    <View style={estilos.barra}>
                      <View style={[estilos.barraLlena, { width: `${porcentaje}%` }]} />
                    </View>
                    <Text style={estilos.cantidadBarra}>{cantidad}</Text>
                  </View>
                );
              })}
            </View>
          </Tarjeta>

          <View style={estilos.filaChips}>
            {[0, 5, 4, 3, 2, 1].map((n) => (
              <Pressable key={n} onPress={() => setFiltro(n)} style={[estilos.chip, filtro === n && estilos.chipActivo]}>
                <Text style={[estilos.textoChip, filtro === n && estilos.textoChipActivo]}>
                  {n === 0 ? 'Todas' : `${n}★`}
                </Text>
              </Pressable>
            ))}
          </View>

          {citasFiltradas.length === 0 ? (
            <SinResultados texto={citas.length ? 'No hay calificaciones con ese filtro' : 'Aún no hay calificaciones'} />
          ) : (
            citasFiltradas.map((cita) => {
              const cliente = clientes.find((c) => c.id === cita.clienteId);
              const iniciales = (cliente?.nombre || '?')
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              return (
                <Pressable key={cita.id} onPress={() => navegarA('adminSeguimientoLavado', { citaId: cita.id })}>
                  <Tarjeta>
                    <View style={estilos.filaCliente}>
                      <View style={[estilos.avatar, { backgroundColor: colorAvatar(cita.clienteId) }]}>
                        <Text style={estilos.textoAvatar}>{iniciales}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={estilos.nombreCliente}>{cliente?.nombre || 'Cliente no encontrado'}</Text>
                        <Text style={estilos.detalle}>
                          {cita.servicio.nombre} · {cita.vehiculo.placa} · {cita.fecha}
                        </Text>
                      </View>
                      <Estrellas valor={cita.calificacion.estrellas} tamano={14} />
                    </View>
                    {cita.calificacion.comentario ? (
                      <Text style={estilos.comentario}>“{cita.calificacion.comentario}”</Text>
                    ) : (
                      <Text style={estilos.sinComentario}>Sin comentario</Text>
                    )}
                  </Tarjeta>
                </Pressable>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenido: { paddingHorizontal: 16, paddingBottom: 24 },

  resumen: { flexDirection: 'row', alignItems: 'center' },
  columnaPromedio: { alignItems: 'center', width: 96 },
  promedio: { fontSize: 36, fontWeight: '800', color: colores.texto },
  total: { fontSize: 11, color: colores.textoSuave, marginTop: 4, textAlign: 'center' },
  filaBarra: { flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  numeroBarra: { width: 26, fontSize: 11, color: colores.textoSuave },
  barra: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colores.borde, overflow: 'hidden' },
  barraLlena: { height: 6, backgroundColor: '#f59e0b' },
  cantidadBarra: { width: 24, fontSize: 11, color: colores.textoSuave, textAlign: 'right' },

  filaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  chipActivo: { backgroundColor: '#132048', borderColor: '#132048' },
  textoChip: { fontSize: 12, fontWeight: '600', color: colores.textoSuave },
  textoChipActivo: { color: '#ffffff' },

  filaCliente: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  textoAvatar: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  nombreCliente: { fontSize: 14, fontWeight: '700', color: colores.texto },
  detalle: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  comentario: { fontSize: 13, color: colores.texto, marginTop: 10, fontStyle: 'italic' },
  sinComentario: { fontSize: 12, color: colores.textoSuave, marginTop: 10 },
});
