// PANTALLA: Inicio del empleado
// Muestra las citas (de Firebase) que el empleado tiene pendientes de atender.

import { View, ScrollView } from 'react-native';
import { obtenerCitasDeEmpleado } from '../firebase/citas';
import { useDatos } from '../firebase/utilidades';
import Encabezado from '../componentes/Encabezado';
import TarjetaCita from '../componentes/TarjetaCita';
import SinResultados from '../componentes/SinResultados';
import Cargando from '../componentes/Cargando';
import { colores } from '../estilos/colores';

export default function InicioEmpleado({ usuario, navegarA }) {
  const { datos, cargando, error, recargar } = useDatos(
    () => obtenerCitasDeEmpleado(usuario.perfil.id),
    [usuario.perfil.id]
  );
  const citasPorAtender = (datos ?? []).filter((c) => ['pendiente', 'confirmada', 'en_proceso'].includes(c.estado));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo={`Hola, ${usuario.perfil.nombre.split(' ')[0]} 👋`} subtitulo="Citas asignadas por atender" />
      <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
        {cargando || error ? (
          <Cargando error={error} alReintentar={recargar} />
        ) : citasPorAtender.length === 0 ? (
          <SinResultados texto="No tienes citas pendientes" />
        ) : (
          citasPorAtender.map((cita) => (
            <TarjetaCita key={cita.id} cita={cita} alPresionar={() => navegarA('empleadoDetalleCita', { citaId: cita.id })} />
          ))
        )}
      </View>
    </ScrollView>
  );
}
