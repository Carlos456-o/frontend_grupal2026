// PANTALLA: Más (admin)
// Menú con las opciones que ya no caben en la barra de abajo:
// empleados, clientes, calificaciones, promociones, reportes de clientes,
// el perfil del admin y cerrar sesión.

import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerEmpleados } from '../firebase/empleados';
import { obtenerClientes } from '../firebase/clientes';
import { obtenerCalificaciones } from '../firebase/citas';
import { obtenerReportes } from '../firebase/reportes';
import { obtenerPromociones, promocionesVigentes } from '../firebase/promociones';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import { colores } from '../estilos/colores';

async function contarPersonas() {
  const [empleados, clientes, calificaciones, reportes, promociones] = await Promise.all([
    obtenerEmpleados(),
    obtenerClientes(),
    obtenerCalificaciones(),
    obtenerReportes(),
    obtenerPromociones(),
  ]);
  const promedio = calificaciones.length
    ? calificaciones.reduce((suma, c) => suma + c.calificacion.estrellas, 0) / calificaciones.length
    : 0;
  return {
    empleados: empleados.length,
    clientes: clientes.length,
    calificaciones: calificaciones.length,
    promedio,
    reportesAbiertos: reportes.filter((r) => r.estado === 'abierto').length,
    promocionesVigentes: promocionesVigentes(promociones).length,
  };
}

// "3 reportes abiertos", "1 reporte abierto"...
function plural(cantidad, singular, pluralTexto) {
  return `${cantidad} ${cantidad === 1 ? singular : pluralTexto}`;
}

export default function Mas({ usuario, navegarA, cerrarSesion }) {
  const { datos } = useDatos(contarPersonas);

  const opciones = [
    {
      titulo: 'Empleados',
      subtitulo: `${datos?.empleados ?? '…'} empleados activos`,
      icono: 'people-outline',
      colorFondo: '#ede9fe',
      color: '#7c3aed',
      alPresionar: () => navegarA('adminEmpleados'),
    },
    {
      titulo: 'Clientes',
      subtitulo: `${datos?.clientes ?? '…'} clientes registrados`,
      icono: 'person-outline',
      colorFondo: '#fce7f3',
      color: '#db2777',
      alPresionar: () => navegarA('adminClientes'),
    },
    {
      titulo: 'Calificaciones',
      subtitulo: !datos
        ? '…'
        : datos.calificaciones
          ? `★ ${datos.promedio.toFixed(1)} · ${datos.calificaciones} opiniones`
          : 'Aún no hay calificaciones',
      icono: 'star-outline',
      colorFondo: '#fef3c7',
      color: '#d97706',
      alPresionar: () => navegarA('adminCalificaciones'),
    },
    {
      titulo: 'Promociones',
      subtitulo: datos ? plural(datos.promocionesVigentes, 'promoción vigente', 'promociones vigentes') : '…',
      icono: 'pricetag-outline',
      colorFondo: '#ffedd5',
      color: '#c2410c',
      alPresionar: () => navegarA('adminPromociones'),
    },
    {
      titulo: 'Reportes de clientes',
      subtitulo: datos ? plural(datos.reportesAbiertos, 'reporte abierto', 'reportes abiertos') : '…',
      icono: 'alert-circle-outline',
      colorFondo: '#fee2e2',
      color: colores.peligro,
      pendientes: datos?.reportesAbiertos ?? 0,
      alPresionar: () => navegarA('adminReportes'),
    },
    {
      titulo: 'Mi perfil',
      subtitulo: usuario.perfil.nombre,
      icono: 'settings-outline',
      colorFondo: colores.fondoTab,
      color: colores.textoSuave,
      alPresionar: () => navegarA('adminPerfil'),
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Más" />
      <View style={estilos.seccion}>
        {opciones.map((o) => (
          <Pressable key={o.titulo} style={estilos.fila} onPress={o.alPresionar}>
            <View style={[estilos.icono, { backgroundColor: o.colorFondo }]}>
              <Ionicons name={o.icono} size={20} color={o.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={estilos.titulo}>{o.titulo}</Text>
              <Text style={estilos.subtitulo}>{o.subtitulo}</Text>
            </View>
            {/* Globito rojo con lo que falta atender. */}
            {o.pendientes ? (
              <View style={estilos.globo}>
                <Text style={estilos.textoGlobo}>{o.pendientes}</Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
          </Pressable>
        ))}

        <Pressable style={[estilos.fila, estilos.filaSalir]} onPress={cerrarSesion}>
          <View style={[estilos.icono, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="log-out-outline" size={20} color={colores.peligro} />
          </View>
          <Text style={[estilos.titulo, { color: colores.peligro, marginLeft: 12 }]}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  seccion: { paddingHorizontal: 16, marginTop: 8 },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
    marginBottom: 10,
  },
  filaSalir: { marginTop: 10 },
  icono: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 14, fontWeight: '700', color: colores.texto },
  subtitulo: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  globo: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: colores.peligro,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  textoGlobo: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
});
