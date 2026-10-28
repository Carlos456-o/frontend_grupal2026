// PANTALLA: Estadísticas del negocio (admin)
// Muestra los indicadores que calcula el backend (GET /estadisticas):
// ingresos, citas, ticket promedio, cancelaciones, calificación,
// servicios más solicitados, citas por mes, horas pico, días de la semana
// y citas por empleado. Abajo, botones para descargar el Excel y el PDF.

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { obtenerEstadisticas, descargarExcel, descargarPdf } from '../api/backend';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

const cordobas = (n) => `C$${Number(n || 0).toLocaleString('es-NI', { maximumFractionDigits: 0 })}`;

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
// "2026-10" -> "Oct 2026"
const nombreMes = (clave) => {
  const [anio, mes] = clave.split('-');
  return `${MESES[Number(mes) - 1] ?? mes} ${anio}`;
};

export default function Estadisticas({ navegarA }) {
  const { datos, cargando, error, recargar } = useDatos(obtenerEstadisticas);

  return (
    <View style={estilos.contenedor}>
      <Encabezado titulo="Estadísticas" subtitulo="Cómo va el negocio" alVolver={() => navegarA('adminMas')} />

      {cargando ? (
        <View style={estilos.cajaCargando}>
          <Cargando />
          <Text style={estilos.textoCargando}>
            Calculando… Si el servidor estaba inactivo puede tardar hasta un minuto.
          </Text>
        </View>
      ) : error || !datos ? (
        <Cargando error="No se pudieron cargar las estadísticas. Revisa tu conexión." alReintentar={recargar} />
      ) : (
        <Contenido datos={datos} alRecargar={recargar} />
      )}
    </View>
  );
}

function Contenido({ datos, alRecargar }) {
  const { resumen } = datos;
  const horasPico = [...datos.porHora].sort((a, b) => b.citas - a.citas).slice(0, 5);

  return (
    <ScrollView contentContainerStyle={estilos.lista}>
      {/* ---- Indicadores ---- */}
      <View style={estilos.cuadricula}>
        <Indicador titulo="Ingresos" valor={cordobas(resumen.ingresos)} detalle="Citas terminadas" color={colores.exito} />
        <Indicador titulo="Por cobrar" valor={cordobas(resumen.ingresosPorCobrar)} detalle="Citas activas" color="#d97706" />
        <Indicador titulo="Citas" valor={resumen.totalCitas} detalle={`${resumen.terminadas} terminadas`} color={colores.principal} />
        <Indicador titulo="Ticket promedio" valor={cordobas(resumen.ticketPromedio)} detalle="Por cita terminada" color="#7c3aed" />
        <Indicador
          titulo="Cancelaciones"
          valor={`${resumen.tasaCancelacion} %`}
          detalle={`${resumen.canceladas} canceladas`}
          color={colores.peligro}
        />
        <Indicador
          titulo="Calificación"
          valor={resumen.calificacionPromedio ? `★ ${resumen.calificacionPromedio}` : '—'}
          detalle={`${resumen.totalCalificaciones} opiniones`}
          color="#d97706"
        />
      </View>

      <Seccion titulo="Servicios más solicitados">
        <Barras filas={datos.porServicio.map((s) => ({ etiqueta: s.servicio, valor: s.citas, extra: cordobas(s.ingresos) }))} />
      </Seccion>

      <Seccion titulo="Citas por mes">
        <Barras
          filas={datos.porMes.map((m) => ({ etiqueta: nombreMes(m.mes), valor: m.citas, extra: cordobas(m.ingresos) }))}
          color="#0891b2"
        />
      </Seccion>

      <Seccion titulo="Horas pico">
        <Barras filas={horasPico.map((h) => ({ etiqueta: h.hora, valor: h.citas }))} color="#f97316" />
      </Seccion>

      <Seccion titulo="Citas por día de la semana">
        <Barras filas={datos.porDiaSemana.map((d) => ({ etiqueta: d.dia, valor: d.citas }))} color="#db2777" />
      </Seccion>

      <Seccion titulo="Citas por empleado">
        <Barras
          filas={datos.porEmpleado.map((e) => ({ etiqueta: e.empleado, valor: e.citas, extra: cordobas(e.ingresos) }))}
          color="#16a34a"
        />
      </Seccion>

      <Text style={estilos.nota}>Las citas canceladas no se cuentan en las gráficas.</Text>

      {/* ---- Descargas ---- */}
      <View style={estilos.filaBotones}>
        <BotonDescarga
          texto="Excel"
          icono={<MaterialCommunityIcons name="microsoft-excel" size={20} color="#ffffff" />}
          color="#16a34a"
          alPresionar={descargarExcel}
        />
        <BotonDescarga
          texto="PDF"
          icono={<MaterialCommunityIcons name="file-pdf-box" size={20} color="#ffffff" />}
          color="#dc2626"
          alPresionar={descargarPdf}
        />
      </View>
      <Pressable style={estilos.botonRecargar} onPress={alRecargar}>
        <Ionicons name="refresh" size={16} color={colores.principal} />
        <Text style={estilos.textoRecargar}>Actualizar</Text>
      </Pressable>
    </ScrollView>
  );
}

function Indicador({ titulo, valor, detalle, color }) {
  return (
    <View style={estilos.indicador}>
      <Text style={estilos.tituloIndicador}>{titulo}</Text>
      <Text style={[estilos.valorIndicador, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {valor}
      </Text>
      <Text style={estilos.detalleIndicador}>{detalle}</Text>
    </View>
  );
}

function Seccion({ titulo, children }) {
  return (
    <Tarjeta>
      <Text style={estilos.tituloSeccion}>{titulo}</Text>
      {children}
    </Tarjeta>
  );
}

// Barras horizontales: el largo de cada barra es proporcional al valor más alto.
function Barras({ filas, color = colores.principal }) {
  if (filas.length === 0) return <Text style={estilos.sinDatos}>Sin datos todavía</Text>;
  const maximo = Math.max(...filas.map((f) => f.valor), 1);
  return filas.map((f) => (
    <View key={f.etiqueta} style={estilos.filaBarra}>
      <View style={estilos.filaTextoBarra}>
        <Text style={estilos.etiquetaBarra} numberOfLines={1}>
          {f.etiqueta}
        </Text>
        <Text style={estilos.valorBarra}>
          {f.valor}
          {f.extra ? <Text style={estilos.extraBarra}> · {f.extra}</Text> : null}
        </Text>
      </View>
      <View style={estilos.fondoBarra}>
        <View style={[estilos.barra, { width: `${(f.valor / maximo) * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  ));
}

function BotonDescarga({ texto, icono, color, alPresionar }) {
  return (
    <Pressable style={[estilos.botonDescarga, { backgroundColor: color }]} onPress={alPresionar}>
      {icono}
      <Text style={estilos.textoDescarga}>{texto}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  lista: { paddingHorizontal: 16, paddingBottom: 32 },

  cajaCargando: { paddingHorizontal: 24 },
  textoCargando: { fontSize: 13, color: colores.textoSuave, textAlign: 'center', marginTop: 8 },

  cuadricula: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  indicador: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 12,
  },
  tituloIndicador: { fontSize: 12, color: colores.textoSuave, fontWeight: '600' },
  valorIndicador: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  detalleIndicador: { fontSize: 11, color: colores.textoSuave, marginTop: 2 },

  tituloSeccion: { fontSize: 15, fontWeight: '700', color: colores.texto, marginBottom: 12 },
  sinDatos: { fontSize: 13, color: colores.textoSuave },
  filaBarra: { marginBottom: 10 },
  filaTextoBarra: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  etiquetaBarra: { flex: 1, fontSize: 13, color: colores.texto, marginRight: 8 },
  valorBarra: { fontSize: 13, fontWeight: '700', color: colores.texto },
  extraBarra: { fontWeight: '400', color: colores.textoSuave },
  fondoBarra: { height: 8, borderRadius: 4, backgroundColor: colores.fondoTab, overflow: 'hidden' },
  barra: { height: 8, borderRadius: 4 },

  nota: { fontSize: 12, color: colores.textoSuave, textAlign: 'center', marginVertical: 8 },

  filaBotones: { flexDirection: 'row', gap: 10, marginTop: 6 },
  botonDescarga: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  textoDescarga: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  botonRecargar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 },
  textoRecargar: { fontSize: 13, fontWeight: '600', color: colores.principal },
});
