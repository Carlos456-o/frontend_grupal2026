// PANTALLA: Mis vehículos (cliente)
// Muestra los vehículos del cliente y permite agregar uno nuevo
// (solo en la pantalla, todavía no se guarda en ningún backend).

import { useState } from 'react';
import { View, FlatList } from 'react-native';
import Encabezado from '../componentes/Encabezado';
import TarjetaVehiculo from '../componentes/TarjetaVehiculo';
import CampoTexto from '../componentes/CampoTexto';
import Boton from '../componentes/Boton';
import SinResultados from '../componentes/SinResultados';
import { colores } from '../estilos/colores';

export default function MisVehiculos({ usuario }) {
  const [vehiculos, setVehiculos] = useState(usuario.perfil.vehiculos);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');

  function alAgregar() {
    if (!placa || !modelo) return;
    setVehiculos((anteriores) => [...anteriores, { placa, modelo }]);
    setPlaca('');
    setModelo('');
    setMostrarFormulario(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Mis vehículos" subtitulo={`${vehiculos.length} registrado(s)`} />
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
                <Boton texto="Guardar vehículo" alPresionar={alAgregar} />
                <Boton texto="Cancelar" tipo="borde" alPresionar={() => setMostrarFormulario(false)} estilo={{ marginTop: 10 }} />
              </View>
            ) : (
              <Boton texto="+ Agregar vehículo" tipo="borde" alPresionar={() => setMostrarFormulario(true)} />
            )}
          </View>
        }
      />
    </View>
  );
}
