export default function ClientDetailsModal({
  client,
  sales = [],
  onClose,
}) {
  if (!client) {
    return null;
  }

  // =========================
  // FORMATEAR FECHA
  // =========================

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

  // =========================
  // VENTAS DEL CLIENTE
  // =========================

  const clientSales = sales
    .filter(
      (sale) =>
        Number(sale.clientId) ===
        Number(client.id)
    )
    .sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );

  // =========================
  // TOTAL COMPRADO
  // =========================

  const totalPurchases =
    clientSales.reduce(
      (total, sale) =>
        total +
        (Number(sale.total) || 0),
      0
    );

  // =========================
  // ARTÍCULOS COMPRADOS
  // =========================

  const totalItems =
    clientSales.reduce(
      (total, sale) =>
        total +
        (sale.items || []).reduce(
          (itemTotal, item) =>
            itemTotal +
            (Number(item.quantity) || 0),
          0
        ),
      0
    );

  // =========================
  // TICKET MEDIO
  // =========================

  const averageTicket =
    clientSales.length > 0
      ? totalPurchases /
        clientSales.length
      : 0;

  // =========================
  // ÚLTIMA COMPRA
  // =========================

  const lastPurchase =
    clientSales.length > 0
      ? clientSales[0]
      : null;

  // =========================
  // HISTORIAL DE PRODUCTOS
  // =========================

  const purchaseHistory =
    clientSales.flatMap((sale) =>
      (sale.items || []).map(
        (item) => ({
          saleId: sale.id,
          date: sale.date,
          productName:
            item.productName ||
            "Producto",
          sku: item.sku,
          barcode: item.barcode,
          quantity:
            Number(item.quantity) || 0,
          unitPrice:
            Number(item.unitPrice) || 0,
          subtotal:
            Number(item.subtotal) || 0,
        })
      )
    );

  return (
    <>
      {/* =========================
          BACKDROP
      ========================= */}

      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
      />

      {/* =========================
          MODAL
      ========================= */}

      <div
        className="modal d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >

        <div className="modal-dialog modal-dialog-centered modal-lg">

          <div className="modal-content">

            {/* =========================
                HEADER
            ========================= */}

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

            {/* =========================
                BODY
            ========================= */}

            <div className="modal-body">

              {/* =========================
                  INFORMACIÓN DEL CLIENTE
              ========================= */}

              <div className="mb-4">

                <h5 className="fw-bold mb-4">
                  Información del cliente
                </h5>

                <div className="mb-3">

                  <small className="text-muted">
                    Nombre / Razón social
                  </small>

                  <div className="fs-4 fw-bold">
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

                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Email
                    </small>

                    <div>
                      {client.email || "—"}
                    </div>

                  </div>

                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Dirección
                    </small>

                    <div>
                      {client.address || "—"}
                    </div>

                  </div>

                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Ciudad
                    </small>

                    <div>
                      {client.city || "—"}
                    </div>

                  </div>

                  <div className="col-md-6 mb-3">

                    <small className="text-muted">
                      Código postal
                    </small>

                    <div>
                      {client.postalCode || "—"}
                    </div>

                  </div>

                </div>

                <hr />

                <small className="text-muted">
                  Cliente registrado
                </small>

                <div>
                  {formatDate(
                    client.createdAt
                  )}
                </div>

              </div>

              {/* =========================
                  RESUMEN ECONÓMICO
              ========================= */}

              <div className="mb-4">

                <h5 className="fw-bold mb-3">
                  Resumen de compras
                </h5>

                <div className="row">

                  <div className="col-md-3 mb-3">

                    <div className="border rounded p-3 h-100">

                      <small className="text-muted">
                        Compras
                      </small>

                      <div className="fs-4 fw-bold">
                        {clientSales.length}
                      </div>

                    </div>

                  </div>

                  <div className="col-md-3 mb-3">

                    <div className="border rounded p-3 h-100">

                      <small className="text-muted">
                        Artículos
                      </small>

                      <div className="fs-4 fw-bold">
                        {totalItems}
                      </div>

                    </div>

                  </div>

                  <div className="col-md-3 mb-3">

                    <div className="border rounded p-3 h-100">

                      <small className="text-muted">
                        Total comprado
                      </small>

                      <div className="fs-5 fw-bold">
                        €{" "}
                        {totalPurchases.toFixed(
                          2
                        )}
                      </div>

                    </div>

                  </div>

                  <div className="col-md-3 mb-3">

                    <div className="border rounded p-3 h-100">

                      <small className="text-muted">
                        Ticket medio
                      </small>

                      <div className="fs-5 fw-bold">
                        €{" "}
                        {averageTicket.toFixed(
                          2
                        )}
                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* =========================
                  ÚLTIMA COMPRA
              ========================= */}

              {lastPurchase && (

                <div className="alert alert-light border mb-4">

                  <div className="fw-bold mb-1">
                    Última compra
                  </div>

                  <div className="text-muted">
                    {formatDate(
                      lastPurchase.date
                    )}
                  </div>

                  <div className="mt-2">

                    <span className="fw-semibold">
                      Venta #
                      {lastPurchase.id}
                    </span>

                    {" · "}

                    <span>
                      €
                      {" "}
                      {Number(
                        lastPurchase.total
                      ).toFixed(2)}
                    </span>

                  </div>

                </div>

              )}

              {/* =========================
                  HISTORIAL
              ========================= */}

              <div>

                <div className="d-flex justify-content-between align-items-center mb-3">

                  <div>

                    <h5 className="fw-bold mb-1">
                      Historial de compras
                    </h5>

                    <small className="text-muted">
                      Productos comprados por este cliente
                    </small>

                  </div>

                  <span className="badge bg-dark">
                    {purchaseHistory.length}{" "}
                    {purchaseHistory.length === 1
                      ? "línea"
                      : "líneas"}
                  </span>

                </div>

                {purchaseHistory.length === 0 ? (

                  <div className="text-center text-muted border rounded p-4">

                    <div className="fs-1 mb-2">
                      🛒
                    </div>

                    <p className="mb-0">
                      Este cliente todavía no tiene compras registradas.
                    </p>

                  </div>

                ) : (

                  <div className="table-responsive">

                    <table className="table table-hover align-middle">

                      <thead className="table-light">

                        <tr>

                          <th>
                            Fecha
                          </th>

                          <th>
                            Venta
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
                            Subtotal
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {purchaseHistory.map(
                          (item, index) => (

                            <tr
                              key={`${item.saleId}-${item.productName}-${index}`}
                            >

                              <td>
                                <small>
                                  {formatDate(
                                    item.date
                                  )}
                                </small>
                              </td>

                              <td>
                                #{item.saleId}
                              </td>

                              <td>

                                <div className="fw-semibold">
                                  {item.productName}
                                </div>

                                {item.sku && (
                                  <small className="text-muted">
                                    SKU: {item.sku}
                                  </small>
                                )}

                              </td>

                              <td>
                                {item.quantity}
                              </td>

                              <td>
                                €{" "}
                                {item.unitPrice.toFixed(
                                  2
                                )}
                              </td>

                              <td className="fw-bold">
                                €{" "}
                                {item.subtotal.toFixed(
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

            {/* =========================
                FOOTER
            ========================= */}

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