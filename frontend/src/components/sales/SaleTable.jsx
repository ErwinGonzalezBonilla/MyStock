export default function SaleTable({
  sales,
}) {
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
    <div className="stat-card">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h4 className="mb-1">
            Historial de ventas
          </h4>

          <small className="text-muted">
            Ventas registradas
          </small>

        </div>

        <span className="badge bg-dark">
          {sales.length}{" "}
          {sales.length === 1
            ? "venta"
            : "ventas"}
        </span>

      </div>

      {sales.length === 0 ? (

        <div className="text-center text-muted py-4">

          <div className="fs-1 mb-2">
            🧾
          </div>

          <p className="mb-0">
            Todavía no hay ventas registradas.
          </p>

        </div>

      ) : (

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead className="table-light">

              <tr>

                <th>Fecha</th>

                <th>Cliente</th>

                <th>Producto</th>

                <th>SKU</th>

                <th>Cantidad</th>

                <th>Precio</th>

                <th>Total</th>

              </tr>

            </thead>

            <tbody>

              {sales.map((sale) => (

                <tr
                  key={sale.id}
                >

                  {/* FECHA */}

                  <td>
                    <small>
                      {formatDate(
                        sale.date
                      )}
                    </small>
                  </td>

                  {/* CLIENTE */}

                  <td>

                    {sale.clientName ? (

                      <span className="fw-semibold">
                        {sale.clientName}
                      </span>

                    ) : (

                      <span className="text-muted">
                        Venta sin cliente
                      </span>

                    )}

                  </td>

                  {/* PRODUCTO */}

                  <td className="fw-semibold">
                    {sale.productName}
                  </td>

                  {/* SKU */}

                  <td>

                    <span className="badge bg-dark">
                      {sale.sku ||
                        "Sin SKU"}
                    </span>

                  </td>

                  {/* CANTIDAD */}

                  <td>
                    {sale.quantity}
                  </td>

                  {/* PRECIO */}

                  <td>
                    €{" "}
                    {Number(
                      sale.unitPrice || 0
                    ).toFixed(2)}
                  </td>

                  {/* TOTAL */}

                  <td className="fw-bold">
                    €{" "}
                    {Number(
                      sale.total || 0
                    ).toFixed(2)}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}