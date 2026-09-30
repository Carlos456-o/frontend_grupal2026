// PANTALLA: Panel de administración (Inicio del admin)
// Es lo primero que ve el administrador: un resumen del día, accesos
// rápidos para crear cosas, y una lista para gestionar cada parte del
// negocio (servicios, catálogo, empleados, clientes).

import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { citas } from '../datos/citas';
import { servicios } from '../datos/servicios';
import { actividades } from '../datos/actividades';
import { clientes } from '../datos/clientes';
import { empleados } from '../datos/empleados';
import { colores } from '../estilos/colores';

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function fechaDeHoyEnTexto() {
  const hoy = new Date();
  return `Hoy, ${DIAS_SEMANA[hoy.getDay()]} ${hoy.getDate()} de ${MESES[hoy.getMonth()]}`;
}

export default function InicioAdmin({ usuario, navegarA }) {
  const hoyISO = new Date().toISOString().slice(0, 10);
  const citasHoy = citas.filter((c) => c.fecha === hoyISO);
  const ingresosHoy = citasHoy
    .filter((c) => c.estado !== 'cancelada')
    .reduce((suma, c) => suma + c.servicio.precio, 0);

  const paquetesLavado = servicios.filter((s) => s.categoriaId === 'cat1');

  const iniciales = usuario.perfil.nombre
    .split(' ')
    .map((palabra) => palabra[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const accesos = [
    {
      titulo: 'Nueva cita',
      icono: 'calendar-outline',
      colorFondo: '#ffedd5',
      color: '#c2410c',
      alPresionar: () => Alert.alert('Próximamente', 'Pronto podrás agendar citas para tus clientes desde aquí.'),
    },
    {
      titulo: 'Nuevo servicio',
      icono: 'car-outline',
      colorFondo: '#dbeafe',
      color: '#2563eb',
      alPresionar: () => navegarA('adminNuevoServicio'),
    },
    {
      titulo: 'Nuevo empleado',
      icono: 'person-add-outline',
      colorFondo: '#ede9fe',
      color: '#7c3aed',
      alPresionar: () => navegarA('adminNuevoEmpleado'),
    },
    {
      titulo: 'Ver clientes',
      icono: 'people-outline',
      colorFondo: '#fce7f3',
      color: '#db2777',
      alPresionar: () => navegarA('adminClientes'),
    },
  ];

  const gestion = [
    {
      titulo: 'Servicios',
      subtitulo: `${paquetesLavado.length} tipos de lavado registrados`,
      icono: 'car-outline',
      colorFondo: '#dbeafe',
      color: '#2563eb',
      alPresionar: () => navegarA('adminCatalogo', { pestanaInicial: 'servicios' }),
    },
    {
      titulo: 'Catálogo',
      subtitulo: `${actividades.length} actividades registradas`,
      icono: 'grid-outline',
      colorFondo: '#ffedd5',
      color: '#c2410c',
      alPresionar: () => navegarA('adminCatalogo', { pestanaInicial: 'actividades' }),
    },
    {
      titulo: 'Empleados',
      subtitulo: `${empleados.length} empleados activos`,
      icono: 'people-outline',
      colorFondo: '#ede9fe',
      color: '#7c3aed',
      alPresionar: () => navegarA('adminEmpleados'),
    },
    {
      titulo: 'Clientes',
      subtitulo: `${clientes.length} clientes registrados`,
      icono: 'person-outline',
      colorFondo: '#fce7f3',
      color: '#db2777',
      alPresionar: () => navegarA('adminClientes'),
    },
  ];

  return (
    <ScrollView style={estilos.contenedor}>
      <View style={estilos.hero}>
        <View style={estilos.filaHero}>
          <View>
            <Text style={estilos.marca}>AUTOLAVADO DIVINO NIÑO</Text>
            <Text style={estilos.titulo}>Panel de administración</Text>
            <Text style={estilos.fecha}>{fechaDeHoyEnTexto()}</Text>
          </View>
          <View style={estilos.avatar}>
            <Text style={estilos.textoAvatar}>{iniciales}</Text>
          </View>
        </View>

        <View style={estilos.filaStats}>
          <View style={estilos.stat}>
            <Text style={estilos.statValor}>{citasHoy.length}</Text>
            <Text style={estilos.statEtiqueta}>Citas hoy</Text>
          </View>
          <View style={estilos.stat}>
            <Text style={[estilos.statValor, { color: '#0891b2' }]}>C${ingresosHoy}</Text>
            <Text style={estilos.statEtiqueta}>Ingresos hoy</Text>
          </View>
          <View style={estilos.stat}>
            <Text style={[estilos.statValor, { color: '#7c3aed' }]}>{empleados.length}</Text>
            <Text style={estilos.statEtiqueta}>Empleados activos</Text>
          </View>
        </View>
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Accesos rápidos</Text>
        <View style={estilos.cuadricula}>
          {accesos.map((a) => (
            <Pressable key={a.titulo} style={estilos.tarjetaAcceso} onPress={a.alPresionar}>
              <View style={[estilos.iconoAcceso, { backgroundColor: a.colorFondo }]}>
                <Ionicons name={a.icono} size={20} color={a.color} />
              </View>
              <Text style={estilos.textoAcceso}>{a.titulo}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Gestión</Text>
        {gestion.map((g) => (
          <Pressable key={g.titulo} style={estilos.filaGestion} onPress={g.alPresionar}>
            <View style={[estilos.iconoGestion, { backgroundColor: g.colorFondo }]}>
              <Ionicons name={g.icono} size={20} color={g.color} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={estilos.tituloGestion}>{g.titulo}</Text>
              <Text style={estilos.subtituloGestion}>{g.subtitulo}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colores.textoSuave} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },

  hero: {
    backgroundColor: '#132048',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  filaHero: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  marca: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.65)', letterSpacing: 1 },
  titulo: { fontSize: 18, fontWeight: '800', color: '#ffffff', marginTop: 4 },
  fecha: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAvatar: { color: '#ffffff', fontWeight: '700', fontSize: 13 },

  filaStats: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValor: { fontSize: 18, fontWeight: '800', color: colores.texto },
  statEtiqueta: { fontSize: 10, color: colores.textoSuave, marginTop: 4, textAlign: 'center' },

  seccion: { paddingHorizontal: 16, marginTop: 20 },
  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoSuave,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },

  cuadricula: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tarjetaAcceso: {
    width: '47%',
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
  },
  iconoAcceso: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  textoAcceso: { fontSize: 13, fontWeight: '700', color: colores.texto },

  filaGestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.tarjeta,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 14,
    marginBottom: 10,
  },
  iconoGestion: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tituloGestion: { fontSize: 14, fontWeight: '700', color: colores.texto },
  subtituloGestion: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
});
