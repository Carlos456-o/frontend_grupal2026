// Ayudas que comparten todos los archivos de firebase/ y las pantallas.

import { useCallback, useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';

// Firebase guarda las fechas como Timestamp. En la app las usamos como
// texto "AAAA-MM-DD" (ej. "2026-10-01"), que es fácil de comparar y mostrar.
// Las citas se guardan a la medianoche UTC, por eso leemos la fecha en UTC.
export function timestampATexto(valor) {
  if (!valor?.toDate) return '';
  return valor.toDate().toISOString().slice(0, 10);
}

export function textoATimestamp(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  return Timestamp.fromDate(new Date(Date.UTC(anio, mes - 1, dia)));
}

// La fecha de hoy en "AAAA-MM-DD" según el reloj del teléfono.
export function hoyISO() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

// Hook para cargar datos de Firebase en una pantalla.
// Uso: const { datos, cargando, error, recargar } = useDatos(() => obtenerClientes());
export function useDatos(cargar, dependencias = []) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recargar = useCallback(() => {
    setCargando(true);
    setError('');
    return cargar()
      .then(setDatos)
      .catch(() => setError('No se pudo conectar con el servidor. Intenta de nuevo.'))
      .finally(() => setCargando(false));
  }, dependencias);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { datos, cargando, error, recargar };
}
