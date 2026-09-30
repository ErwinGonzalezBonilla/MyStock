import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      // Al haber usuario, App muestra la aplicación.
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "No se pudo conectar con el servidor."
          : err.message
      );
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accede a la gestión de tu negocio."
      footer={
        <>
          ¿Tu negocio aún no usa MyStock?{" "}
          <Link to="/register">Crear cuenta</Link>
        </>
      }
    >
      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className="form-control"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="mb-4">
          <label className="form-label" htmlFor="login-password">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            className="form-control"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={submitting || !email || !password}
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </AuthLayout>
  );
}
