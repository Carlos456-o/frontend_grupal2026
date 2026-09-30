// PANTALLA: Inicio del empleado
// Muestra las citas que el empleado tiene pendientes de atender hoy.

import { View, ScrollView } from 'react-native';
import { citas } from '../datos/citas';
import Encabezado from '../componentes/Encabezado';
import TarjetaCita from '../componentes/TarjetaCita';
import SinResultados from '../componentes/SinResultados';
import { colores } from '../estilos/colores';

export default function InicioEmpleado({ usuario, navegarA }) {
  const citasPorAtender = citas.filter(
    (c) => c.empleadoId === usuario.perfil.id && ['pendiente', 'confirmada', 'en_proceso'].includes(c.estado)
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }}>
      <Encabezado titulo={`Hola, ${usuario.perfil.nombre.split(' ')[0]} 👋`} subtitulo="Citas asignadas por atender" />
      <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
        {citasPorAtender.length === 0 ? (
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
