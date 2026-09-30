import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  apiFetch,
  clearToken,
  getToken,
  onUnauthorized,
  setToken,
} from "../services/api";

const AuthContext = createContext(null);

async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);

  // Si hay token guardado, empezamos "cargando" hasta
  // comprobar con el backend que sigue siendo válido.
  const [loading, setLoading] = useState(
    () => Boolean(getToken())
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setCompany(null);
  }, []);

  // Cualquier 401 de la API cierra la sesión.
  useEffect(() => {
    onUnauthorized(logout);

    return () => onUnauthorized(null);
  }, [logout]);

  // Recuperar sesión al recargar la página.
  useEffect(() => {
    if (!getToken()) {
      return;
    }

    let cancelled = false;

    const restoreSession = async () => {
      try {
        const response = await apiFetch("/api/auth/me");

        if (!response.ok) {
          throw new Error("Sesión no válida");
        }

        const data = await readJson(response);

        if (!cancelled) {
          setUser(data.user);
          setCompany(data.company);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setCompany(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback((data) => {
    setToken(data.accessToken);
    setUser(data.user);
    setCompany(data.company);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(data.error || "No se pudo iniciar sesión");
    }

    startSession(data);
  }, [startSession]);

  const register = useCallback(async (payload) => {
    const response = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await readJson(response);

    if (!response.ok) {
      throw new Error(data.error || "No se pudo crear la cuenta");
    }

    startSession(data);
  }, [startSession]);

  const hasRole = useCallback(
    (...roles) => Boolean(user && roles.includes(user.role)),
    [user]
  );

  const value = useMemo(() => ({
    user,
    company,
    setCompany,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    hasRole,
  }), [user, company, loading, login, register, logout, hasRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
