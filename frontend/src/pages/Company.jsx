import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";

const EMPTY_COMPANY = {
  name: "",
  taxId: "",
  email: "",
  phone: "",
  country: "",
  currency: "",
};

function toForm(company) {
  return {
    name: company?.name || "",
    taxId: company?.taxId || "",
    email: company?.email || "",
    phone: company?.phone || "",
    country: company?.country || "",
    currency: company?.currency || "",
  };
}

const FIELDS = [
  { name: "name", label: "Nombre de la empresa", type: "text", required: true },
  { name: "taxId", label: "DNI / NIF / CIF", type: "text" },
  { name: "email", label: "Correo", type: "email" },
  { name: "phone", label: "Teléfono", type: "text" },
  { name: "country", label: "País", type: "text" },
  { name: "currency", label: "Moneda", type: "text" },
];

export default function Company() {
  const { setCompany, hasRole } = useAuth();

  // Solo el administrador puede modificar la empresa.
  const canEdit = hasRole("administrator");

  const [form, setForm] = useState(EMPTY_COMPANY);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // CARGAR EMPRESA
  // =========================

  useEffect(() => {
    let cancelled = false;

    const loadCompany = async () => {
      try {
        const response = await apiFetch("/api/company");

        if (!response.ok) {
          throw new Error("No se pudo cargar la empresa.");
        }

        const data = await response.json();

        if (!cancelled) {
          setForm(toForm(data));
        }
      } catch (err) {
        console.error("Error cargando empresa:", err);

        if (!cancelled) {
          setError("No se pudo conectar con el servidor.");
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    };

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // CAMBIAR CAMPOS
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  // =========================
  // GUARDAR
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await apiFetch("/api/company", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo guardar la empresa.");
      }

      setForm(toForm(data.company));

      // Actualiza también el nombre que se ve en la barra superior.
      setCompany(data.company);

      setMessage("Empresa actualizada correctamente.");
    } catch (err) {
      console.error("Error guardando empresa:", err);
      setError(err.message || "No se pudo guardar la empresa.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-4">

      <h2 className="fw-bold mb-4">
        Configuración de la Empresa
      </h2>

      {message && (
        <div className="alert alert-success" role="alert">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          ⚠️ {error}
        </div>
      )}

      {!canEdit && (
        <div className="alert alert-info" role="alert">
          Solo el administrador puede modificar los datos de la empresa.
        </div>
      )}

      <div className="stat-card">

        {loadingData ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>

            {FIELDS.map((field) => (
              <div className="mb-3" key={field.name}>
                <label className="form-label" htmlFor={`company-${field.name}`}>
                  {field.label}
                </label>

                <input
                  id={`company-${field.name}`}
                  type={field.type}
                  name={field.name}
                  className="form-control"
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.required}
                  disabled={!canEdit}
                />
              </div>
            ))}

            {canEdit && (
              <button
                type="submit"
                className="btn btn-primary mt-2"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            )}

          </form>
        )}

      </div>

    </div>
  );
}
