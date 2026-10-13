// PANTALLA: Detalle de una cita (cliente)
// "parametros.citaId" nos dice qué cita mostrar. Nos lo pasó App.js
// cuando el cliente tocó una tarjeta de cita en otra pantalla.

import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { obtenerCita, cambiarEstadoCita } from '../firebase/citas';
import { obtenerEmpleado } from '../firebase/empleados';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import InsigniaEstado from '../componentes/InsigniaEstado';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

// Trae la cita y el empleado que la atiende.
async function cargarDetalle(citaId) {
  const cita = await obtenerCita(citaId);
  const empleado = cita ? await obtenerEmpleado(cita.empleadoId) : null;
  return { cita, empleado };
}

export default function DetalleCita({ parametros, navegarA }) {
  const { datos, cargando, error, recargar } = useDatos(() => cargarDetalle(parametros.citaId), [parametros.citaId]);

  if (cargando || error) return <Cargando error={error} alReintentar={recargar} />;
  const { cita, empleado } = datos;
  if (!cita) return <SinResultados texto="Cita no encontrada" />;

  function alCancelar() {
    Alert.alert('Cancelar cita', '¿Seguro que deseas cancelar esta cita?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cambiarEstadoCita(cita.id, 'cancelada');
            navegarA('clienteCitas');
          } catch (e) {
            Alert.alert('Error', 'No se pudo cancelar la cita. Intenta de nuevo.');
          }
        },
      },
    ]);
  }

  return (
    <ScrollView style={estilos.contenedor}>
      <Encabezado titulo={cita.servicio.nombre} />
      <View style={estilos.seccion}>
        <InsigniaEstado estado={cita.estado} />
      </View>

      <View style={estilos.seccion}>
        <Tarjeta>
          <Fila etiqueta="Vehículo" valor={`${cita.vehiculo.modelo} · ${cita.vehiculo.placa}`} />
          <Fila etiqueta="Fecha" valor={cita.fecha} />
          <Fila etiqueta="Hora" valor={cita.hora} />
          <Fila etiqueta="Precio" valor={`C$${cita.servicio.precio}`} />
          <Fila etiqueta="Encargado" valor={empleado?.nombre || 'Por asignar'} />
          {cita.solicitudEspecial ? <Fila etiqueta="Solicitud especial" valor={cita.solicitudEspecial} /> : null}
        </Tarjeta>
      </View>

      <View style={estilos.seccion}>
        {cita.estado === 'pendiente' || cita.estado === 'confirmada' ? (
          <Boton texto="Cancelar cita" tipo="peligro" alPresionar={alCancelar} />
        ) : null}
        <Boton texto="Volver" tipo="borde" alPresionar={() => navegarA('clienteCitas')} estilo={{ marginTop: 10 }} />
      </View>
    </ScrollView>
  );
}

function Fila({ etiqueta, valor }) {
  return (
    <View style={estilos.fila}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  seccion: { paddingHorizontal: 16, marginBottom: 20 },
  fila: { marginBottom: 10 },
  etiqueta: { fontSize: 12, color: colores.textoSuave },
  valor: { fontSize: 15, color: colores.texto, fontWeight: '600', marginTop: 2 },
});
