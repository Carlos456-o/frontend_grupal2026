// PANTALLA: Citas (admin)
// Le muestra al administrador las citas de Firebase, de todos los clientes
// y empleados: las de hoy o todas, con filtros por estado. Tocar una cita
// lleva al "Seguimiento del lavado" para ver/actualizar sus pasos.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { obtenerCitas } from '../firebase/citas';
import { obtenerClientes } from '../firebase/clientes';
import { useDatos, hoyISO } from '../firebase/utilidades';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import Estrellas from '../componentes/Estrellas';
import { colores, coloresPorEstado, nombresEstado, colorAvatar } from '../estilos/colores';

const RANGOS = [
  { clave: 'hoy', texto: 'Hoy' },
  { clave: 'todas', texto: 'Todas las fechas' },
];

const FILTROS = [
  { clave: 'todas', texto: 'Todas' },
  { clave: 'pendiente', texto: 'Pendientes' },
  { clave: 'en_proceso', texto: 'En proceso' },
  { clave: 'terminado', texto: 'Terminadas' },
];

async function cargarCitasYClientes() {
  const [citas, clientes] = await Promise.all([obtenerCitas(), obtenerClientes()]);
  return { citas, clientes };
}

export default function CitasDeHoy({ navegarA }) {
  const [rango, setRango] = useState('hoy');
  const [filtro, setFiltro] = useState('todas');
  const { datos, cargando, error, recargar } = useDatos(cargarCitasYClientes);
  const clientes = datos?.clientes ?? [];

  const hoy = hoyISO();
  const citasDelRango = (datos?.citas ?? [])
    .filter((c) => rango === 'todas' || c.fecha === hoy)
    // Hoy: por hora. Todas: las más recientes primero (ya vienen así).
    .sort((a, b) => (rango === 'hoy' ? (a.hora > b.hora ? 1 : -1) : 0));

  const terminadas = citasDelRango.filter((c) => c.estado === 'terminado').length;
  const pendientes = citasDelRango.filter((c) => c.estado === 'pendiente' || c.estado === 'confirmada').length;

  const citasFiltradas = citasDelRango.filter(
    (c) => filtro === 'todas' || c.estado === filtro || (filtro === 'pendiente' && c.estado === 'confirmada')
  );

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Text style={estilos.marca}>PANEL DEL NEGOCIO</Text>
        <Text style={estilos.titulo}>{rango === 'hoy' ? 'Citas de hoy' : 'Todas las citas'}</Text>
      </View>

      <View style={estilos.seccion}>
        <View style={[estilos.filaChips, { marginBottom: 12 }]}>
          {RANGOS.map((r) => (
            <Pressable
              key={r.clave}
              onPress={() => setRango(r.clave)}
              style={[estilos.chip, rango === r.clave && estilos.chipActivo]}
            >
              <Text style={[estilos.textoChip, rango === r.clave && estilos.textoChipActivo]}>{r.texto}</Text>
            </Pressable>
          ))}
        </View>

        <View style={estilos.filaStats}>
          <View style={estilos.stat}>
            <Text style={estilos.statValor}>{citasDelRango.length}</Text>
            <Text style={estilos.statEtiqueta}>Citas</Text>
          </View>
          <View style={estilos.stat}>
            <Text style={[estilos.statValor, { color: colores.exito }]}>{terminadas}</Text>
            <Text style={estilos.statEtiqueta}>Terminadas</Text>
          </View>
          <View style={estilos.stat}>
            <Text style={[estilos.statValor, { color: '#d97706' }]}>{pendientes}</Text>
            <Text style={estilos.statEtiqueta}>Pendientes</Text>
          </View>
        </View>

        <View style={[estilos.filaChips, { flexWrap: 'wrap' }]}>
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
        {cargando || error ? (
          <Cargando error={error} alReintentar={recargar} />
        ) : citasFiltradas.length === 0 ? (
          <SinResultados texto="No hay citas con ese filtro" />
        ) : (
          citasFiltradas.map((cita) => {
            const cliente = clientes.find((c) => c.id === cita.clienteId);
            const color = coloresPorEstado[cita.estado] ?? coloresPorEstado.pendiente;
            const iniciales = (cliente?.nombre || '')
              .split(' ')
              .map((p) => p[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Pressable
                key={cita.id}
                style={estilos.tarjetaCita}
                onPress={() => navegarA('adminSeguimientoLavado', { citaId: cita.id })}
              >
                <View style={estilos.filaCita}>
                  <View style={estilos.columnaHora}>
                    <Text style={estilos.hora}>{cita.hora}</Text>
                    {rango === 'todas' ? <Text style={estilos.fecha}>{cita.fecha.slice(5)}</Text> : null}
                  </View>
                  <View style={[estilos.avatarChico, { backgroundColor: colorAvatar(cita.clienteId) }]}>
                    <Text style={estilos.textoAvatarChico}>{iniciales}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={estilos.nombreCliente}>{cliente?.nombre || 'Cliente no encontrado'}</Text>
                    <Text style={estilos.detalleCita}>
                      {cita.servicio.nombre} · {cita.vehiculo.placa}
                    </Text>
                  </View>
                  <View style={[estilos.insigniaEstado, { backgroundColor: color.fondo }]}>
                    <Text style={[estilos.textoInsignia, { color: color.texto }]}>{nombresEstado[cita.estado] ?? cita.estado}</Text>
                  </View>
                </View>

                {/* Debajo de cada servicio terminado: lo que calificó el cliente. */}
                {cita.estado === 'terminado' ? (
                  <View style={estilos.bloqueCalificacion}>
                    {cita.calificacion ? (
                      <>
                        <View style={estilos.filaEstrellas}>
                          <Estrellas valor={cita.calificacion.estrellas} tamano={14} />
                          <Text style={estilos.textoCalificacion}>{cita.calificacion.estrellas}/5</Text>
                        </View>
                        {cita.calificacion.comentario ? (
                          <Text style={estilos.comentario}>“{cita.calificacion.comentario}”</Text>
                        ) : null}
                      </>
                    ) : (
                      <Text style={estilos.sinCalificar}>El cliente aún no ha calificado</Text>
                    )}
                  </View>
                ) : null}
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
  tarjetaCita: {
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 12,
    marginBottom: 10,
  },
  filaCita: { flexDirection: 'row', alignItems: 'center' },

  bloqueCalificacion: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  filaEstrellas: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoCalificacion: { fontSize: 12, fontWeight: '700', color: '#b45309' },
  comentario: { fontSize: 13, color: colores.texto, fontStyle: 'italic', marginTop: 4 },
  sinCalificar: { fontSize: 12, color: colores.textoSuave },
  columnaHora: { width: 52 },
  hora: { fontSize: 13, fontWeight: '700', color: colores.texto },
  fecha: { fontSize: 10, color: colores.textoSuave, marginTop: 2 },
  avatarChico: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAvatarChico: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  nombreCliente: { fontSize: 14, fontWeight: '700', color: colores.texto },
  detalleCita: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  insigniaEstado: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  textoInsignia: { fontSize: 10, fontWeight: '700' },
});
