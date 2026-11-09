// =========================================================
// FECHAS DE LA API
// =========================================================
// El backend guarda las fechas en UTC y las envía en ISO sin
// zona horaria ("2026-11-09T23:30:00.123456"). new Date() las
// interpretaría como hora LOCAL, desplazándolas 1-2 h en España
// (y cambiando de día a las ventas de madrugada).
//
// Usa siempre estas funciones para leer o mostrar fechas de la API.
// =========================================================

const TIMEZONE_SUFFIX = /(Z|[+-]\d{2}:?\d{2})$/i;

export function parseApiDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const text = String(value);
  const date = new Date(
    TIMEZONE_SUFFIX.test(text) ? text : `${text}Z`
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

// Milisegundos, para ordenar. Fechas vacías o inválidas van al final
// en orden descendente.
export function apiDateTime(value) {
  return parseApiDate(value)?.getTime() ?? 0;
}

export function formatDateTime(value, fallback = "Sin fecha") {
  const date = parseApiDate(value);

  if (!date) {
    return fallback;
  }

  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value, fallback = "Sin fecha") {
  const date = parseApiDate(value);

  if (!date) {
    return fallback;
  }

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Clave "AAAA-MM-DD" del día LOCAL, para agrupar por día.
export function localDayKey(value) {
  const date = parseApiDate(value);

  if (!date) {
    return null;
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}
