// PANTALLA: Citas asignadas (empleado)
// Lista todas las citas asignadas a este empleado, sin importar el estado.

import { View, FlatList } from 'react-native';
import { citas } from '../datos/citas';
import Encabezado from '../componentes/Encabezado';
import TarjetaCita from '../componentes/TarjetaCita';
import SinResultados from '../componentes/SinResultados';
import { colores } from '../estilos/colores';

export default function CitasAsignadas({ usuario, navegarA }) {
  const misCitas = citas
    .filter((c) => c.empleadoId === usuario.perfil.id)
    .sort((a, b) => (a.fecha + a.hora < b.fecha + b.hora ? 1 : -1));

  return (
    <View style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo="Citas asignadas" />
      <FlatList
        data={misCitas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        ListEmptyComponent={<SinResultados texto="No tienes citas asignadas" />}
        renderItem={({ item }) => (
          <TarjetaCita cita={item} alPresionar={() => navegarA('empleadoDetalleCita', { citaId: item.id })} />
        )}
      />
    </View>
  );
}
