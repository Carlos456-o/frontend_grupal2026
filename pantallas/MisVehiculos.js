// PANTALLA: Mis vehículos (cliente)
// Muestra los vehículos del cliente (guardados dentro de su documento en
// la colección "clientes" de Firebase) y permite agregar uno nuevo.

import { useState } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { obtenerCliente, agregarVehiculo } from '../firebase/clientes';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import TarjetaVehiculo from '../componentes/TarjetaVehiculo';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

export default function MisVehiculos({ usuario }) {
  const { datos: cliente, cargando, error, recargar } = useDatos(
    () => obtenerCliente(usuario.perfil.id),
    [usuario.perfil.id]
  );
  const vehiculos = cliente?.vehiculos ?? [];
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function alAgregar() {
    if (guardando) return;
    const placaLimpia = placa.trim().toUpperCase();
    if (!placaLimpia || !modelo.trim()) {
      Alert.alert('Datos incompletos', 'Escribe la placa y el modelo.');
      return;
    }
    if (vehiculos.some((v) => v.placa === placaLimpia)) {
      Alert.alert('Placa repetida', 'Ya tienes un vehículo con esa placa.');
      return;
    }

    setGuardando(true);
    try {
      await agregarVehiculo(usuario.perfil.id, { placa: placaLimpia, modelo: modelo.trim() });
      setPlaca('');
      setModelo('');
      setMostrarFormulario(false);
      recargar();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el vehículo. Intenta de nuevo.');
    }
    setGuardando(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Mis vehículos" subtitulo={`${vehiculos.length} registrado(s)`} />
      {cargando || error ? (
        <Cargando error={error} alReintentar={recargar} />
      ) : (
        <FlatList
          data={vehiculos}
          keyExtractor={(item) => item.placa}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={<SinResultados texto="Aún no registras vehículos" />}
          renderItem={({ item }) => <TarjetaVehiculo vehiculo={item} />}
          ListFooterComponent={
            <View style={{ marginTop: 10 }}>
              {mostrarFormulario ? (
                <View>
                  <CampoTexto etiqueta="Placa" valor={placa} alCambiar={setPlaca} autoCapitalize="characters" />
                  <CampoTexto etiqueta="Modelo" valor={modelo} alCambiar={setModelo} />
                  <Boton texto={guardando ? 'Guardando...' : 'Guardar vehículo'} alPresionar={alAgregar} />
                  <Boton texto="Cancelar" tipo="borde" alPresionar={() => setMostrarFormulario(false)} estilo={{ marginTop: 10 }} />
                </View>
              ) : (
                <Boton texto="+ Agregar vehículo" tipo="borde" alPresionar={() => setMostrarFormulario(true)} />
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
