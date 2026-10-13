// PANTALLA: Perfil (cliente)
// Muestra los datos del cliente y sus vehículos (los que tiene guardados en
// su documento de la colección "clientes" de Firebase), y el botón para
// cerrar sesión.

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { obtenerCliente } from '../firebase/clientes';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import Tarjeta from '../componentes/Tarjeta';
import TarjetaVehiculo from '../componentes/TarjetaVehiculo';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

export default function PerfilCliente({ usuario, navegarA, cerrarSesion }) {
  // Traemos el cliente de Firebase para ver también los vehículos agregados después de iniciar sesión.
  const { datos: cliente, cargando, error, recargar } = useDatos(
    () => obtenerCliente(usuario.perfil.id),
    [usuario.perfil.id]
  );
  const perfil = cliente ?? usuario.perfil;

  return (
    <ScrollView style={estilos.contenedor}>
      <Encabezado titulo="Mi perfil" />
      <View style={estilos.seccion}>
        <Tarjeta>
          <Text style={estilos.etiqueta}>Nombre</Text>
          <Text style={estilos.valor}>{perfil.nombre}</Text>
          <Text style={estilos.etiqueta}>Teléfono</Text>
          <Text style={estilos.valor}>{usuario.telefono}</Text>
          <Text style={estilos.etiqueta}>Correo</Text>
          <Text style={estilos.valor}>{perfil.correo || '—'}</Text>
          <Text style={estilos.etiqueta}>Cliente desde</Text>
          <Text style={estilos.valor}>{perfil.fechaRegistro || '—'}</Text>
        </Tarjeta>
      </View>

      <View style={estilos.seccion}>
        <Text style={estilos.tituloSeccion}>Mis vehículos</Text>
        {cargando || error ? (
          <Cargando error={error} alReintentar={recargar} />
        ) : perfil.vehiculos.length === 0 ? (
          <SinResultados texto="Aún no registras vehículos" />
        ) : (
          perfil.vehiculos.map((v) => <TarjetaVehiculo key={v.placa} vehiculo={v} />)
        )}
        <Boton texto="Administrar vehículos" tipo="borde" alPresionar={() => navegarA('clienteVehiculos')} />
      </View>

      <View style={estilos.seccion}>
        <Boton texto="Cerrar sesión" tipo="peligro" alPresionar={cerrarSesion} />
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
