import { useContext, useEffect, useState } from "react";
import CompanyContext from "../context/CompanyContext";

const API_URL = "http://127.0.0.1:5000/api/companies";

export default function Company() {
  const { company, setCompany } =
    useContext(CompanyContext);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // =========================
  // CARGAR EMPRESA
  // =========================

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setError("");

        const response =
          await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            "No se pudieron cargar las empresas."
          );
        }

        const companies =
          await response.json();

        if (companies.length > 0) {
          const savedCompany =
            companies[0];

          setCompany((prev) => ({
            ...prev,

            id: savedCompany.id,

            name:
              savedCompany.name || "",

            email:
              savedCompany.email || "",

            phone:
              savedCompany.phone || "",

            taxId:
              savedCompany.taxId || "",

            country:
              savedCompany.country || "",

            currency:
              savedCompany.currency || "",
          }));
        }
      } catch (err) {
        console.error(
          "Error cargando empresa:",
          err
        );

        setError(
          "No se pudo conectar con el servidor."
        );
      }
    };

    loadCompany();
  }, [setCompany]);

  // =========================
  // CAMBIAR CAMPOS
  // =========================

  const handleChange = (e) => {
    setCompany({
      ...company,
      [e.target.name]: e.target.value,
    });

    setMessage("");
    setError("");
  };

  // =========================
  // LOGO
  // =========================

  const handleLogo = (e) => {
    const file =
      e.target.files[0];

    if (!file) {
      return;
    }

    setCompany({
      ...company,
      logo: URL.createObjectURL(file),
    });

    setMessage("");
    setError("");
  };

  // =========================
  // GUARDAR / ACTUALIZAR
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const isEditing =
        Boolean(company.id);

      const url = isEditing
        ? `${API_URL}/${company.id}`
        : API_URL;

      const method = isEditing
        ? "PUT"
        : "POST";

      const response =
        await fetch(url, {
          method,

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: company.name,
            taxId: company.taxId,
            email: company.email,
            phone: company.phone,
            country: company.country,
            currency: company.currency,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo guardar la empresa."
        );
      }

      const savedCompany =
        data.company;

      setCompany((prev) => ({
        ...prev,

        id: savedCompany.id,

        name:
          savedCompany.name || "",

        email:
          savedCompany.email || "",

        phone:
          savedCompany.phone || "",

        taxId:
          savedCompany.taxId || "",

        country:
          savedCompany.country || "",

        currency:
          savedCompany.currency || "",
      }));

      setMessage(
        isEditing
          ? "Empresa actualizada correctamente."
          : "Empresa guardada correctamente."
      );
    } catch (err) {
      console.error(
        "Error guardando empresa:",
        err
      );

      setError(
        err.message ||
          "No se pudo guardar la empresa."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">

      <h2 className="fw-bold mb-4">
        Configuración de la Empresa
      </h2>

      {/* =========================
          MENSAJE DE ÉXITO
      ========================= */}

      {message && (
        <div
          className="alert alert-success"
          role="alert"
        >
          {message.includes("actualizada")
            ? "✏️"
            : "✅"}{" "}
          {message}
        </div>
      )}

      {/* =========================
          MENSAJE DE ERROR
      ========================= */}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          ⚠️ {error}
        </div>
      )}

      <div className="stat-card">

        <form onSubmit={handleSubmit}>

          {/* =========================
              LOGO
          ========================= */}

          <div className="mb-4">

            <label className="form-label fw-bold">
              Logo de la empresa
            </label>

            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleLogo}
            />

          </div>

          {company.logo && (
            <div className="mb-4 text-center">

              <img
                src={company.logo}
                alt="Logo empresa"
                style={{
                  width: "160px",
                  maxHeight: "160px",
                  objectFit: "contain",
                  borderRadius: "10px",
                }}
              />

            </div>
          )}

          {/* =========================
              NOMBRE
          ========================= */}

          <div className="mb-3">

            <label className="form-label">
              Nombre de la empresa
            </label>

            <input
              type="text"
              name="name"
              className="form-control"
              value={company.name || ""}
              onChange={handleChange}
              required
            />

          </div>

          {/* =========================
              NIF / CIF
          ========================= */}

          <div className="mb-3">

            <label className="form-label">
              DNI / NIF / CIF
            </label>

            <input
              type="text"
              name="taxId"
              className="form-control"
              value={company.taxId || ""}
              onChange={handleChange}
            />

          </div>

          {/* =========================
              CORREO
          ========================= */}

          <div className="mb-3">

            <label className="form-label">
              Correo
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              value={company.email || ""}
              onChange={handleChange}
            />

          </div>

          {/* =========================
              TELÉFONO
          ========================= */}

          <div className="mb-3">

            <label className="form-label">
              Teléfono
            </label>

            <input
              type="text"
              name="phone"
              className="form-control"
              value={company.phone || ""}
              onChange={handleChange}
            />

          </div>

          {/* =========================
              PAÍS
          ========================= */}

          <div className="mb-3">

            <label className="form-label">
              País
            </label>

            <input
              type="text"
              name="country"
              className="form-control"
              value={company.country || ""}
              onChange={handleChange}
            />

          </div>

          {/* =========================
              MONEDA
          ========================= */}

          <div className="mb-4">

            <label className="form-label">
              Moneda
            </label>

            <input
              type="text"
              name="currency"
              className="form-control"
              value={company.currency || ""}
              onChange={handleChange}
            />

          </div>

          {/* =========================
              BOTÓN
          ========================= */}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? "Guardando..."
              : company.id
              ? "Actualizar empresa"
              : "Guardar empresa"}
          </button>

        </form>

      </div>

    </div>
  );
}