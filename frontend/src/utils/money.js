// =========================================================
// FORMATO DE MONEDA
// =========================================================
// Formato español en toda la app: 1.234,56 €.
//
// useGrouping "always": con "es-ES", Intl no separa los miles en
// cifras de 4 dígitos (daría "1234,56 €").
//
// La moneda es la de la empresa (campo libre en Empresa), así que se
// normaliza: "€", "euro" o "eur" -> EUR. Si no es un código ISO 4217
// válido, se usa EUR.
// =========================================================

export const DEFAULT_CURRENCY = "EUR";

const CURRENCY_ALIASES = {
  "€": "EUR",
  EURO: "EUR",
  EUROS: "EUR",
  $: "USD",
  US$: "USD",
  DOLAR: "USD",
  DÓLAR: "USD",
  "£": "GBP",
};

const formatters = new Map();

function createFormatter(currency, decimals) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    useGrouping: "always",
    ...(decimals === undefined
      ? {}
      : {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }),
  });
}

export function normalizeCurrency(value) {
  const code = String(value ?? "").trim().toUpperCase();
  const candidate = CURRENCY_ALIASES[code] || code;

  if (!/^[A-Z]{3}$/.test(candidate)) {
    return DEFAULT_CURRENCY;
  }

  try {
    createFormatter(candidate);
    return candidate;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

function getFormatter(currency, decimals) {
  const code = normalizeCurrency(currency);
  const key = `${code}:${decimals ?? ""}`;

  if (!formatters.has(key)) {
    formatters.set(key, createFormatter(code, decimals));
  }

  return formatters.get(key);
}

// options.decimals: número fijo de decimales (p. ej. 0 en los ejes
// de los gráficos). Por defecto, los de la moneda (2 en EUR).
export function formatMoney(value, currency = DEFAULT_CURRENCY, options = {}) {
  return getFormatter(currency, options.decimals).format(Number(value) || 0);
}

// =========================================================
// PORCENTAJES
// =========================================================
// Formato español: 58,3 %. Recibe el porcentaje (58.3), no la
// fracción (0.583).

const percentFormatters = new Map();

export function formatPercent(value, decimals = 1) {
  if (!percentFormatters.has(decimals)) {
    percentFormatters.set(
      decimals,
      new Intl.NumberFormat("es-ES", {
        style: "percent",
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: "always",
      })
    );
  }

  return percentFormatters.get(decimals).format((Number(value) || 0) / 100);
}
