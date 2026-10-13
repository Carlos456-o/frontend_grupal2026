// PANTALLA: Citas asignadas (empleado)
// Lista todas las citas (de Firebase) asignadas a este empleado, sin importar el estado.

import { View, FlatList } from 'react-native';
import { obtenerCitasDeEmpleado } from '../firebase/citas';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import TarjetaCita from '../componentes/TarjetaCita';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

export default function CitasAsignadas({ usuario, navegarA }) {
  const { datos, cargando, error, recargar } = useDatos(
    () => obtenerCitasDeEmpleado(usuario.perfil.id),
    [usuario.perfil.id]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Citas asignadas" />
      {cargando || error ? (
        <Cargando error={error} alReintentar={recargar} />
      ) : (
        <FlatList
          data={datos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={<SinResultados texto="No tienes citas asignadas" />}
          renderItem={({ item }) => (
            <TarjetaCita cita={item} alPresionar={() => navegarA('empleadoDetalleCita', { citaId: item.id })} />
          )}
        />
      )}
    </View>
  );
}
