// Conexión con el backend del proyecto (Node.js + Express en Render).
// La app usa Firebase directamente para casi todo; el backend se usa para
// lo que conviene calcular en el servidor: estadísticas y reportes.

import { Linking, Alert } from 'react-native';

export const URL_BACKEND = 'https://backend-grupal2026.onrender.com';

// Render (plan gratis) duerme el servidor si nadie lo usa: la primera
// petición puede tardar hasta un minuto en responder.
const ESPERA_MAXIMA_MS = 90 * 1000;

// GET /estadisticas: indicadores del negocio calculados con todas las citas.
export async function obtenerEstadisticas() {
  const control = new AbortController();
  const temporizador = setTimeout(() => control.abort(), ESPERA_MAXIMA_MS);
  try {
    const respuesta = await fetch(`${URL_BACKEND}/estadisticas`, { signal: control.signal });
    if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}`);
    return await respuesta.json();
  } finally {
    clearTimeout(temporizador);
  }
}

// Abre una ruta del backend en el navegador del teléfono. Se usa para
// descargar archivos: /excel (Excel) y /reporte/pdf (PDF).
export function abrirEnNavegador(ruta) {
  Linking.openURL(`${URL_BACKEND}${ruta}`).catch(() =>
    Alert.alert('No se pudo abrir', 'Revisa tu conexión a internet e intenta de nuevo.')
  );
}

export const descargarExcel = () => abrirEnNavegador('/excel');
export const descargarPdf = () => abrirEnNavegador('/reporte/pdf');
