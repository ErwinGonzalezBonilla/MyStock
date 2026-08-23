export default function ClientDetailsModal({
  client,
  sales = [],
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

  const clientSales = sales.filter(
    (sale) =>
      sale.clientId === client.id
  );

  const totalPurchases =
    clientSales.reduce(
      (total, sale) =>
        total +
        (Number(sale.total) || 0),
      0
    );

  const totalItems =
    clientSales.reduce(
      (total, sale) =>
        total +
        (Number(sale.quantity) || 0),
      0
    );

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
        <div className="modal-dialog modal-dialog-centered modal-lg">

          <div className="modal-content">

            {/* HEADER */}

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

            {/* BODY */}

            <div className="modal-body">

              {/* DATOS CLIENTE */}

              <div className="mb-4">

                <h6 className="fw-bold mb-3">
                  Información del cliente
                </h6>

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

              {/* RESUMEN DE COMPRAS */}

              <div className="mb-4">

                <h6 className="fw-bold mb-3">
                  Resumen de compras
                </h6>

                <div className="row">

                  <div className="col-md-4 mb-3">

                    <div className="border rounded p-3">

                      <small className="text-muted">
                        Compras
                      </small>

                      <div className="fs-4 fw-bold">
                        {clientSales.length}
                      </div>

                    </div>

                  </div>

                  <div className="col-md-4 mb-3">

                    <div className="border rounded p-3">

                      <small className="text-muted">
                        Artículos
                      </small>

                      <div className="fs-4 fw-bold">
                        {totalItems}
                      </div>

                    </div>

                  </div>

                  <div className="col-md-4 mb-3">

                    <div className="border rounded p-3">

                      <small className="text-muted">
                        Total comprado
                      </small>

                      <div className="fs-4 fw-bold">
                        €{" "}
                        {totalPurchases.toFixed(
                          2
                        )}
                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* HISTORIAL */}

              <div>

                <h6 className="fw-bold mb-3">
                  Historial de compras
                </h6>

                {clientSales.length === 0 ? (

                  <div className="text-center text-muted border rounded p-4">

                    <div className="fs-2 mb-2">
                      🛒
                    </div>

                    <p className="mb-0">
                      Este cliente todavía no tiene compras registradas.
                    </p>

                  </div>

                ) : (

                  <div className="table-responsive">

                    <table className="table table-sm table-hover align-middle">

                      <thead className="table-light">

                        <tr>

                          <th>
                            Fecha
                          </th>

                          <th>
                            Producto
                          </th>

                          <th>
                            Cantidad
                          </th>

                          <th>
                            Precio
                          </th>

                          <th>
                            Total
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {clientSales.map(
                          (sale) => (

                            <tr
                              key={sale.id}
                            >

                              <td>
                                <small>
                                  {formatDate(
                                    sale.date
                                  )}
                                </small>
                              </td>

                              <td className="fw-semibold">
                                {sale.productName}
                              </td>

                              <td>
                                {sale.quantity}
                              </td>

                              <td>
                                €{" "}
                                {Number(
                                  sale.unitPrice ||
                                    0
                                ).toFixed(
                                  2
                                )}
                              </td>

                              <td className="fw-bold">
                                €{" "}
                                {Number(
                                  sale.total ||
                                    0
                                ).toFixed(
                                  2
                                )}
                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            </div>

            {/* FOOTER */}

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