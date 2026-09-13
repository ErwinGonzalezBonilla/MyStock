import {
  X,
  ShoppingBag,
  Truck,
  Calendar,
  Package,
} from "lucide-react";

export default function PurchaseDetailsModal({ purchase, onClose }) {
  if (!purchase) {
    return null;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(Number(value) || 0);
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const totalItems = (purchase.items || []).reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        role="document"
      >
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <ShoppingBag size={21} />

                <h5 className="modal-title mb-0">
                  Compra #{purchase.id}
                </h5>
              </div>

              <small className="text-muted">
                Detalle completo de la compra
              </small>
            </div>

            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Truck size={18} />

                    <small className="text-muted">
                      Proveedor
                    </small>
                  </div>

                  <div className="fw-semibold">
                    {purchase.supplierName || "-"}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Calendar size={18} />

                    <small className="text-muted">
                      Fecha
                    </small>
                  </div>

                  <div className="fw-semibold">
                    {formatDate(purchase.createdAt)}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="border rounded p-3 h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Package size={18} />

                    <small className="text-muted">
                      Unidades
                    </small>
                  </div>

                  <div className="fw-semibold">
                    {totalItems}
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <h6 className="fw-semibold mb-3">
                Productos de la compra
              </h6>

              {purchase.items?.length === 0 ? (
                <div className="text-muted text-center py-4">
                  No hay productos asociados.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Producto</th>
                        <th>SKU</th>
                        <th>Código</th>
                        <th className="text-center">
                          Cantidad
                        </th>
                        <th className="text-end">
                          Precio
                        </th>
                        <th className="text-end">
                          Subtotal
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {purchase.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="fw-semibold">
                              {item.productName}
                            </div>
                          </td>

                          <td>
                            <span className="badge bg-dark">
                              {item.sku || "Sin SKU"}
                            </span>
                          </td>

                          <td>
                            <small>
                              {item.barcode || "-"}
                            </small>
                          </td>

                          <td className="text-center">
                            {item.quantity}
                          </td>

                          <td className="text-end">
                            {formatCurrency(item.unitPrice)}
                          </td>

                          <td className="text-end fw-semibold">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-top pt-3">
              <div className="d-flex justify-content-end">
                <div
                  className="text-end"
                  style={{ minWidth: "220px" }}
                >
                  <div className="text-muted small">
                    Total de la compra
                  </div>

                  <div className="fs-3 fw-bold">
                    {formatCurrency(purchase.total)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <X size={17} className="me-2" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}