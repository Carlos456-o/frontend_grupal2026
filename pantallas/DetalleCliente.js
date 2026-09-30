// PANTALLA: Detalle de un cliente (admin)
// "parametros.clienteId" nos dice qué cliente mostrar.

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { clientes } from '../datos/clientes';
import { citas } from '../datos/citas';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import TarjetaVehiculo from '../componentes/TarjetaVehiculo';
import TarjetaCita from '../componentes/TarjetaCita';
import SinResultados from '../componentes/SinResultados';
import Boton from '../componentes/Boton';
import { colores } from '../estilos/colores';

export default function DetalleCliente({ parametros, navegarA }) {
  const cliente = clientes.find((c) => c.id === parametros.clienteId);
  const historial = citas.filter((c) => c.clienteId === parametros.clienteId);

  if (!cliente) return <SinResultados texto="Cliente no encontrado" />;

  return (
    <ScrollView style={estilos.contenedor}>
      <Encabezado titulo={cliente.nombre} subtitulo={cliente.telefono} />

      <View style={estilos.seccion}>
        <Tarjeta>
          <Text style={estilos.etiqueta}>Correo</Text>
          <Text style={estilos.valor}>{cliente.correo}</Text>
          <Text style={estilos.etiqueta}>Cliente desde</Text>
          <Text style={estilos.valor}>{cliente.fechaRegistro}</Text>
        </Tarjeta>
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Vehículos</Text>
        {cliente.vehiculos.map((v) => (
          <TarjetaVehiculo key={v.placa} vehiculo={v} />
        ))}
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Historial de citas</Text>
        {historial.length === 0 ? (
          <SinResultados texto="Sin citas registradas" />
        ) : (
          historial.map((c) => <TarjetaCita key={c.id} cita={c} alPresionar={() => {}} />)
        )}
      </View>

      <View style={estilos.seccion}>
        <Boton texto="Volver" tipo="borde" alPresionar={() => navegarA('adminClientes')} />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.fondo },
  seccion: { paddingHorizontal: 16, marginBottom: 20 },
  tituloSeccion: { fontSize: 15, fontWeight: '700', color: colores.texto, marginBottom: 10 },
  etiqueta: { fontSize: 12, color: colores.textoSuave, marginTop: 10 },
  valor: { fontSize: 15, color: colores.texto, fontWeight: '600' },
});
