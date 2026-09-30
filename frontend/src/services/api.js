// =========================================================
// CLIENTE DE API DE MYSTOCK
// =========================================================
// Único punto de salida hacia el backend.
//
// - Añade el token JWT a cada petición.
// - Si el backend responde que la sesión no es válida
//   (token caducado, usuario desactivado...), borra el token
//   y avisa a AuthContext para volver al login.
//
// apiFetch tiene la misma firma que fetch y devuelve la misma
// Response, así que las páginas existentes solo cambian
// "fetch(" por "apiFetch(".
// =========================================================

export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const TOKEN_KEY = "mystock_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Navegador sin almacenamiento: la sesión durará
    // solo mientras la pestaña esté abierta.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nada que limpiar.
  }
}

let unauthorizedHandler = null;

export function onUnauthorized(handler) {
  unauthorizedHandler = handler;
}

export async function apiFetch(url, options = {}) {
  const fullUrl = url.startsWith("http")
    ? url
    : `${API_URL}${url}`;

  const headers = new Headers(options.headers || {});
  const token = getToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // 401: token caducado o usuario inexistente.
  // 422: token mal formado o firmado con otra clave.
  if (token && (response.status === 401 || response.status === 422)) {
    clearToken();

    if (unauthorizedHandler) {
      unauthorizedHandler();
    }
  }

  return response;
}
