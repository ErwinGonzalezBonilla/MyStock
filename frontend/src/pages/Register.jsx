import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = {
  companyName: "",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const { register } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validate = () => {
    if (!form.companyName.trim()) {
      return "Indica el nombre de tu negocio.";
    }

    if (!form.name.trim()) {
      return "Indica tu nombre.";
    }

    if (!form.email.includes("@")) {
      return "El email no es válido.";
    }

    if (form.password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (form.password !== form.confirmPassword) {
      return "Las contraseñas no coinciden.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await register({
        companyName: form.companyName.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
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
      title="Crea tu cuenta"
      subtitle="Da de alta tu negocio. Serás su administrador."
      footer={
        <>
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
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
          <label className="form-label" htmlFor="register-company">
            Nombre del negocio
          </label>
          <input
            id="register-company"
            name="companyName"
            type="text"
            className="form-control"
            autoComplete="organization"
            value={form.companyName}
            onChange={handleChange}
            autoFocus
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="register-name">
            Tu nombre
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            className="form-control"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            className="form-control"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="register-password">
            Contraseña
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            className="form-control"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />
          <div className="form-text">Mínimo 8 caracteres.</div>
        </div>

        <div className="mb-4">
          <label className="form-label" htmlFor="register-confirm">
            Repite la contraseña
          </label>
          <input
            id="register-confirm"
            name="confirmPassword"
            type="password"
            className="form-control"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={submitting}
        >
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </AuthLayout>
  );
}
