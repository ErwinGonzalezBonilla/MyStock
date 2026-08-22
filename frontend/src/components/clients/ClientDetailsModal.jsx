export default function ClientDetailsModal({
  client,
  onClose,
}) {
  if (!client) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) {
      return "Sin fecha";
    }

    return new Date(date).toLocaleString(
      "es-ES",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
      />

      <div
        className="modal d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content">

            <div className="modal-header">

              <h5 className="modal-title">
                Detalles del cliente
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              />

            </div>

            <div className="modal-body">

              <div className="mb-3">

                <small className="text-muted">
                  Nombre / Razón social
                </small>

                <div className="fw-bold fs-5">
                  {client.name}
                </div>

              </div>

              <div className="row">

                <div className="col-md-6 mb-3">

                  <small className="text-muted">
                    DNI / NIF
                  </small>

                  <div>
                    {client.taxId || "—"}
                  </div>

                </div>

                <div className="col-md-6 mb-3">

                  <small className="text-muted">
                    Teléfono
                  </small>

                  <div>
                    {client.phone || "—"}
                  </div>

                </div>

              </div>

              <div className="mb-3">

                <small className="text-muted">
                  Email
                </small>

                <div>
                  {client.email || "—"}
                </div>

              </div>

              <div className="mb-3">

                <small className="text-muted">
                  Dirección
                </small>

                <div>
                  {client.address || "—"}
                </div>

              </div>

              <div className="row">

                <div className="col-md-8 mb-3">

                  <small className="text-muted">
                    Ciudad
                  </small>

                  <div>
                    {client.city || "—"}
                  </div>

                </div>

                <div className="col-md-4 mb-3">

                  <small className="text-muted">
                    Código postal
                  </small>

                  <div>
                    {client.postalCode || "—"}
                  </div>

                </div>

              </div>

              <hr />

              <div>

                <small className="text-muted">
                  Cliente registrado
                </small>

                <div>
                  {formatDate(
                    client.createdAt
                  )}
                </div>

              </div>

              {client.updatedAt && (
                <div className="mt-2">

                  <small className="text-muted">
                    Última actualización
                  </small>

                  <div>
                    {formatDate(
                      client.updatedAt
                    )}
                  </div>

                </div>
              )}

            </div>

            <div className="modal-footer">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cerrar
              </button>

            </div>

          </div>

        </div>
      </div>
    </>
  );
}