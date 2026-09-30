// PANTALLA: Inicio del cliente
// Es lo primero que ve un cliente después de iniciar sesión.
// Muestra un saludo, un botón para agendar, su próxima cita
// (si tiene una pendiente o confirmada) y algunos servicios destacados.

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { citas } from '../datos/citas';
import { servicios } from '../datos/servicios';
import Tarjeta from '../componentes/Tarjeta';
import TarjetaServicioResumen from '../componentes/TarjetaServicioResumen';
import Boton from '../componentes/Boton';
import { colores, degradados, coloresPorEstado } from '../estilos/colores';

// Cómo mostramos cada estado en la tarjeta de "próxima cita".
const AVISO_POR_ESTADO = {
  pendiente: { titulo: 'Cita pendiente', icono: '⏳' },
  confirmada: { titulo: 'Cita confirmada', icono: '✓' },
  en_proceso: { titulo: 'Servicio en proceso', icono: '🧽' },
};

export default function InicioCliente({ usuario, navegarA }) {
  const misCitas = citas.filter((c) => c.clienteId === usuario.perfil.id);
  // La próxima cita "activa": primero buscamos una confirmada, si no hay
  // mostramos una pendiente, y si no hay ninguna, no mostramos nada.
  const citaDestacada =
    misCitas.find((c) => c.estado === 'confirmada') ||
    misCitas.find((c) => c.estado === 'en_proceso') ||
    misCitas.find((c) => c.estado === 'pendiente');

  // Solo mostramos 2 servicios como "destacados" en el inicio.
  const serviciosDestacados = servicios.slice(0, 2);

  // Iniciales del nombre, para el círculo de avatar (ej. "Andrea Salazar" -> "AS").
  const iniciales = usuario.perfil.nombre
    .split(' ')
    .map((palabra) => palabra[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={estilos.contenedor}>
      <LinearGradient colors={degradados.inicio} style={estilos.hero}>
        <View style={estilos.filaSaludo}>
          <View>
            <Text style={estilos.textoHola}>Hola,</Text>
            <Text style={estilos.nombreUsuario}>{usuario.perfil.nombre}</Text>
          </View>
          <View style={estilos.avatar}>
            <Text style={estilos.textoAvatar}>{iniciales}</Text>
          </View>
        </View>

        <View style={estilos.tarjetaAgendar}>
          <Text style={estilos.tituloAgendar}>Agenda tu próximo lavado</Text>
          <Text style={estilos.subtituloAgendar}>
            Elige el servicio, la fecha y la hora en menos de un minuto.
          </Text>
          <Boton
            texto="Agendar cita"
            tipo="claro"
            colorTexto="#4338ca"
            alPresionar={() => navegarA('clienteCalculadora')}
            estilo={estilos.botonAgendar}
          />
        </View>
      </LinearGradient>

      <View style={estilos.seccion}>
        {citaDestacada ? (
          <Pressable onPress={() => navegarA('clienteDetalleCita', { citaId: citaDestacada.id })}>
            <Tarjeta estilo={estilos.filaCitaDestacada}>
              <View
                style={[
                  estilos.iconoAviso,
                  { backgroundColor: coloresPorEstado[citaDestacada.estado].fondo },
                ]}
              >
                <Text style={{ color: coloresPorEstado[citaDestacada.estado].texto }}>
                  {AVISO_POR_ESTADO[citaDestacada.estado]?.icono || '📅'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.tituloCitaDestacada}>
                  {AVISO_POR_ESTADO[citaDestacada.estado]?.titulo || 'Tu cita'}
                </Text>
                <Text style={estilos.subtituloCitaDestacada}>
                  {citaDestacada.servicio.nombre} · {citaDestacada.fecha}, {citaDestacada.hora}
                </Text>
              </View>
              <Text style={estilos.flecha}>›</Text>
            </Tarjeta>
          </Pressable>
        ) : null}
      </View>

      <View style={estilos.seccion}>
        <View style={estilos.filaTitulo}>
          <Text style={estilos.tituloSeccion}>Nuestros servicios</Text>
          <Text style={estilos.verTodos} onPress={() => navegarA('clienteServicios')}>
            Ver todos
          </Text>
        </View>
        {serviciosDestacados.map((servicio) => (
          <TarjetaServicioResumen key={servicio.id} servicio={servicio} />
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  filaSaludo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  textoHola: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  nombreUsuario: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoAvatar: { color: '#ffffff', fontWeight: '700' },

  tarjetaAgendar: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 16,
    padding: 16,
  },
  tituloAgendar: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  subtituloAgendar: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, marginBottom: 14 },
  botonAgendar: { alignSelf: 'flex-start', paddingHorizontal: 20 },

  seccion: { paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },

  filaCitaDestacada: { flexDirection: 'row', alignItems: 'center' },
  iconoAviso: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tituloCitaDestacada: { fontSize: 15, fontWeight: '700', color: colores.texto },
  subtituloCitaDestacada: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  flecha: { fontSize: 22, color: colores.textoSuave },

  filaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tituloSeccion: { fontSize: 16, fontWeight: '700', color: colores.texto },
  verTodos: { fontSize: 13, color: colores.principal, fontWeight: '600' },
});
