import { useState } from "react";

export default function Company() {
  const [company, setCompany] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    currency: "",
  });

  const handleChange = (e) => {
    setCompany({
      ...company,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(company);

    alert("Empresa guardada correctamente.");
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="fw-bold mb-4">
        Configuración de la Empresa
      </h2>

      <div className="stat-card">

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">
              Nombre de la empresa
            </label>

            <input
              type="text"
              name="name"
              className="form-control"
              value={company.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Correo
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              value={company.email}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Teléfono
            </label>

            <input
              type="text"
              name="phone"
              className="form-control"
              value={company.phone}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              País
            </label>

            <input
              type="text"
              name="country"
              className="form-control"
              value={company.country}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">
              Moneda
            </label>

            <input
              type="text"
              name="currency"
              className="form-control"
              value={company.currency}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Guardar empresa
          </button>

        </form>

      </div>
    </div>
  );
}