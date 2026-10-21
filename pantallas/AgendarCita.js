// PANTALLA: Agendar cita
// Segundo paso: con el servicio que viene de Calculadora.js (en "parametros"),
// el cliente elige vehículo, fecha, hora y una solicitud especial, y la cita
// se guarda en la colección "citas" de Firebase con estado "pendiente".
//
// Las 4 fechas se calculan solas a partir de hoy (hoy, mañana, pasado...),
// y una hora aparece tachada si ya hay otra cita a esa misma hora ese día.
//
// Si llega "parametros.citaId" la pantalla funciona en modo REPROGRAMAR:
// carga esa cita, rellena el formulario y al confirmar la actualiza en
// Firebase en vez de crear una nueva.

import { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerCliente } from '../firebase/clientes';
import { obtenerCita, obtenerCitasDeFecha, crearCita, reprogramarCita, ERROR_HORA_OCUPADA } from '../firebase/citas';
import { useDatos, hoyISO } from '../firebase/utilidades';
import Tarjeta from '../componentes/Tarjeta';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

const NOMBRES_DIA = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

// Genera los próximos "cantidad" días a partir de hoy, ej:
// [{ clave: '2026-09-09', dia: 'MIÉ', numero: 9 }, ...]
function generarProximosDias(cantidad) {
  const dias = [];
  const [anio, mes, dia] = hoyISO().split('-').map(Number);
  for (let i = 0; i < cantidad; i++) {
    const fecha = new Date(anio, mes - 1, dia + i);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    dias.push({ clave, dia: NOMBRES_DIA[fecha.getDay()], numero: fecha.getDate() });
  }
  return dias;
}

// Mismo formato de hora que usan las citas en Firebase ("08:30").
const HORAS = ['08:30', '09:00', '10:00', '10:30', '11:00', '11:30', '13:00', '14:00', '15:00', '16:00', '16:30'];

export default function AgendarCita({ usuario, parametros, navegarA }) {
  const citaId = parametros.citaId ?? null;
  const { datos: citaOriginal, cargando, error, recargar } = useDatos(
    () => (citaId ? obtenerCita(citaId) : Promise.resolve(null)),
    [citaId]
  );

  if (citaId && (cargando || error)) return <Cargando error={error} alReintentar={recargar} />;
  if (citaId && !citaOriginal) return <SinResultados texto="Cita no encontrada" />;

  // "key" hace que el formulario arranque de cero si cambia la cita.
  return <FormularioCita key={citaId ?? 'nueva'} usuario={usuario} parametros={parametros} navegarA={navegarA} citaOriginal={citaOriginal} />;
}

function FormularioCita({ usuario, parametros, navegarA, citaOriginal }) {
  const esReprogramar = Boolean(citaOriginal);
  const servicio = citaOriginal?.servicio ?? parametros.servicio;

  const dias = generarProximosDias(4);
  // Al reprogramar mantenemos la fecha original si todavía está entre los días disponibles.
  const fechaInicial = dias.some((d) => d.clave === citaOriginal?.fecha) ? citaOriginal.fecha : dias[0].clave;
  const [fechaElegida, setFechaElegida] = useState(fechaInicial);
  const [horaElegida, setHoraElegida] = useState(fechaInicial === citaOriginal?.fecha ? citaOriginal.hora : null);
  const [placaElegida, setPlacaElegida] = useState(citaOriginal?.vehiculo.placa ?? null);
  const [solicitud, setSolicitud] = useState(citaOriginal?.solicitudEspecial ?? '');
  const [guardando, setGuardando] = useState(false);

  // Traemos el cliente de nuevo por si agregó vehículos después de iniciar sesión.
  const { datos: cliente } = useDatos(() => obtenerCliente(usuario.perfil.id), [usuario.perfil.id]);
  const vehiculos = cliente?.vehiculos ?? usuario.perfil.vehiculos ?? [];
  const vehiculo = vehiculos.find((v) => v.placa === placaElegida) ?? vehiculos[0];

  const { datos: citasDelDia } = useDatos(() => obtenerCitasDeFecha(fechaElegida), [fechaElegida]);
  // La propia cita que se reprograma no cuenta como ocupada.
  const horasOcupadas = (citasDelDia ?? [])
    .filter((c) => c.estado !== 'cancelada' && c.id !== citaOriginal?.id)
    .map((c) => c.hora);

  function alVolver() {
    if (esReprogramar) navegarA('clienteCitas');
    else navegarA('clienteCalculadora', { servicioId: servicio.id });
  }

  if (!servicio) return <SinResultados texto="Primero elige un servicio" />;

  function alElegirFecha(clave) {
    setFechaElegida(clave);
    setHoraElegida(null);
  }

  async function alConfirmar() {
    if (guardando) return;
    if (!vehiculo) {
      Alert.alert('Sin vehículo', 'Primero registra un vehículo en "Mis vehículos".');
      return;
    }
    if (!horaElegida) {
      Alert.alert('Elige una hora', 'Selecciona una hora disponible para tu cita.');
      return;
    }

    setGuardando(true);
    try {
      const datosCita = {
        fecha: fechaElegida,
        hora: horaElegida,
        vehiculo: { placa: vehiculo.placa, modelo: vehiculo.modelo },
        solicitudEspecial: solicitud.trim(),
      };
      if (esReprogramar) {
        await reprogramarCita(citaOriginal.id, datosCita);
      } else {
        await crearCita({ ...datosCita, clienteId: usuario.perfil.id, empleadoId: null, servicio });
      }
    } catch (e) {
      setGuardando(false);
      if (e.message === ERROR_HORA_OCUPADA) {
        Alert.alert('Hora no disponible', 'Alguien acaba de tomar esa hora. Elige otra.');
      } else {
        Alert.alert('Error', 'No se pudo guardar la cita. Intenta de nuevo.');
      }
      return;
    }

    Alert.alert(
      esReprogramar ? 'Cita reprogramada' : 'Cita agendada',
      esReprogramar ? 'Tu cita quedó con la nueva fecha y hora.' : 'Tu cita ha sido registrada correctamente.',
      [{ text: 'OK', onPress: () => navegarA('clienteCitas') }]
    );
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <Pressable onPress={alVolver} style={estilos.botonAtras}>
          <Ionicons name="chevron-back" size={26} color={colores.texto} />
        </Pressable>
        <Text style={estilos.titulo}>{esReprogramar ? 'Reprogramar cita' : 'Agendar cita'}</Text>
      </View>

      <ScrollView style={estilos.contenido} contentContainerStyle={estilos.contenidoInterno}>
        <Text style={estilos.tituloSeccion}>Servicio seleccionado</Text>
        <Tarjeta estilo={estilos.tarjetaServicio}>
          <View style={estilos.iconoCuadro}>
            <Ionicons name="car-outline" size={20} color="#ffffff" />
          </View>
          <View style={estilos.textosServicio}>
            <Text style={estilos.nombreServicio}>{servicio.nombre}</Text>
            <Text style={estilos.detalleServicio}>
              {servicio.duracionMinutos != null ? `${servicio.duracionMinutos} min · ` : ''}C${servicio.precio}
            </Text>
          </View>
          {/* Al reprogramar el servicio se mantiene: solo cambian fecha, hora y vehículo. */}
          {esReprogramar ? null : (
            <Text style={estilos.enlaceCambiar} onPress={alVolver}>
              Cambiar
            </Text>
          )}
        </Tarjeta>

        <Text style={estilos.tituloSeccion}>Vehículo</Text>
        {vehiculos.length === 0 ? (
          <Text style={estilos.aviso}>No tienes vehículos registrados. Agrégalos en "Mis vehículos".</Text>
        ) : (
          <View style={estilos.filaHoras}>
            {vehiculos.map((v) => {
              const elegido = v.placa === vehiculo?.placa;
              return (
                <Pressable
                  key={v.placa}
                  onPress={() => setPlacaElegida(v.placa)}
                  style={[estilos.chipVehiculo, elegido && estilos.chipElegido]}
                >
                  <Text style={[estilos.textoHora, elegido && estilos.textoElegido]}>{v.modelo}</Text>
                  <Text style={[estilos.textoPlaca, elegido && estilos.textoElegido]}>{v.placa}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Text style={estilos.tituloSeccion}>Fecha</Text>
        <View style={estilos.filaDias}>
          {dias.map((d) => {
            const elegido = d.clave === fechaElegida;
            return (
              <Pressable key={d.clave} onPress={() => alElegirFecha(d.clave)} style={[estilos.chipDia, elegido && estilos.chipElegido]}>
                <Text style={[estilos.textoDiaNombre, elegido && estilos.textoElegido]}>{d.dia}</Text>
                <Text style={[estilos.textoDiaNumero, elegido && estilos.textoElegido]}>{d.numero}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={estilos.tituloSeccion}>Hora disponible</Text>
        <View style={estilos.filaHoras}>
          {HORAS.map((hora) => {
            const elegido = hora === horaElegida;
            const ocupada = horasOcupadas.includes(hora);
            return (
              <Pressable
                key={hora}
                disabled={ocupada}
                onPress={() => setHoraElegida(hora)}
                style={[estilos.chipHora, elegido && estilos.chipElegido, ocupada && estilos.chipDeshabilitado]}
              >
                <Text style={[estilos.textoHora, elegido && estilos.textoElegido, ocupada && estilos.textoDeshabilitado]}>
                  {hora}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={estilos.tituloSeccion}>Solicitud especial (opcional)</Text>
        <TextInput
          value={solicitud}
          onChangeText={setSolicitud}
          placeholder="Ej: manchas de resina en el capó..."
          placeholderTextColor={colores.textoSuave}
          multiline
          style={estilos.textarea}
        />
      </ScrollView>

      <Pressable onPress={alConfirmar} style={estilos.barraTotal}>
        <Text style={estilos.etiquetaTotal}>
          {guardando ? 'Guardando...' : esReprogramar ? 'Guardar cambios · Total' : 'Confirmar · Total'}
        </Text>
        <Text style={estilos.valorTotal}>C${servicio.precio}</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.tarjeta },

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  botonAtras: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 17, fontWeight: '800', color: colores.texto },

  contenido: { flex: 1, backgroundColor: colores.fondo },
  contenidoInterno: { padding: 16, paddingBottom: 32 },

  tituloSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: colores.textoSuave,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 16,
  },
  aviso: { fontSize: 13, color: colores.peligro },

  tarjetaServicio: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfeff', borderColor: '#a5f3fc' },
  iconoCuadro: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#06b6d4', alignItems: 'center', justifyContent: 'center' },
  textosServicio: { flex: 1, marginLeft: 12 },
  nombreServicio: { fontSize: 14, fontWeight: '700', color: colores.texto },
  detalleServicio: { fontSize: 12, color: colores.textoSuave, marginTop: 2 },
  enlaceCambiar: { fontSize: 12, fontWeight: '700', color: colores.principal },

  filaDias: { flexDirection: 'row', gap: 8 },
  chipDia: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  textoDiaNombre: { fontSize: 11, fontWeight: '600', color: colores.textoSuave },
  textoDiaNumero: { fontSize: 16, fontWeight: '800', color: colores.texto, marginTop: 2 },

  filaHoras: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipHora: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  chipVehiculo: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  textoPlaca: { fontSize: 11, color: colores.textoSuave, marginTop: 2 },
  chipDeshabilitado: { backgroundColor: colores.fondo, opacity: 0.6 },
  textoHora: { fontSize: 13, fontWeight: '600', color: colores.texto },
  textoDeshabilitado: { color: colores.textoSuave, textDecorationLine: 'line-through' },

  chipElegido: { backgroundColor: '#132048', borderColor: '#132048' },
  textoElegido: { color: '#ffffff' },

  textarea: {
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    backgroundColor: colores.fondo,
    padding: 14,
    minHeight: 80,
    fontSize: 14,
    color: colores.texto,
    textAlignVertical: 'top',
  },

  barraTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    backgroundColor: colores.tarjeta,
  },
  etiquetaTotal: { fontSize: 14, color: colores.textoSuave, fontWeight: '600' },
  valorTotal: { fontSize: 20, fontWeight: '800', color: '#132048' },
});
