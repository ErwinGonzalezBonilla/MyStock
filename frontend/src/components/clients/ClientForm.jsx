export default function ClientForm({
  client,
  handleChange,
  handleSubmit,
}) {
  return (
    <div className="stat-card mb-4">

      <h4 className="mb-4">
        Nuevo cliente
      </h4>

      <form onSubmit={handleSubmit}>

        {/* Nombre */}

        <div className="mb-3">

          <label className="form-label">
            Nombre / Razón social
          </label>

          <input
            type="text"
            className="form-control"
            name="name"
            value={client.name}
            onChange={handleChange}
            placeholder="Ej. Juan Pérez"
            required
          />

        </div>

        {/* DNI / NIF */}

        <div className="mb-3">

          <label className="form-label">
            DNI / NIF
          </label>

          <input
            type="text"
            className="form-control"
            name="taxId"
            value={client.taxId}
            onChange={handleChange}
            placeholder="Ej. 12345678A"
          />

        </div>

        <div className="row">

          {/* Teléfono */}

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Teléfono
            </label>

            <input
              type="tel"
              className="form-control"
              name="phone"
              value={client.phone}
              onChange={handleChange}
              placeholder="Ej. 600123456"
            />

          </div>

          {/* Email */}

          <div className="col-md-6 mb-3">

            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              name="email"
              value={client.email}
              onChange={handleChange}
              placeholder="cliente@email.com"
            />

          </div>

        </div>

        {/* Dirección */}

        <div className="mb-3">

          <label className="form-label">
            Dirección
          </label>

          <input
            type="text"
            className="form-control"
            name="address"
            value={client.address}
            onChange={handleChange}
            placeholder="Calle, número..."
          />

        </div>

        <div className="row">

          {/* Ciudad */}

          <div className="col-md-8 mb-3">

            <label className="form-label">
              Ciudad
            </label>

            <input
              type="text"
              className="form-control"
              name="city"
              value={client.city}
              onChange={handleChange}
              placeholder="Madrid"
            />

          </div>

          {/* Código postal */}

          <div className="col-md-4 mb-3">

            <label className="form-label">
              Código postal
            </label>

            <input
              type="text"
              className="form-control"
              name="postalCode"
              value={client.postalCode}
              onChange={handleChange}
              placeholder="28001"
            />

          </div>

        </div>

        <button
          type="submit"
          className="btn btn-primary mt-2"
        >
          Guardar cliente
        </button>

      </form>

    </div>
  );
}