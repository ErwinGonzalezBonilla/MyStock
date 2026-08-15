export default function RecentSales({ sales }) {
  const formatDate = (date) => {
    if (!date) {
      return "Sin fecha";
    }

    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const recentSales = sales.slice(0, 5);

  return (
    <div className="stat-card mb-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h4 className="mb-1">
            Últimas ventas
          </h4>

          <small className="text-muted">
            Actividad reciente
          </small>
        </div>

        <span className="badge bg-dark">
          {sales.length} ventas
        </span>

      </div>

      {recentSales.length === 0 ? (

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

          <table className="table table-hover align-middle mb-0">

            <thead className="table-light">

              <tr>

                <th>Fecha</th>

                <th>Producto</th>

                <th>SKU</th>

                <th>Cantidad</th>

                <th>Total</th>

              </tr>

            </thead>

            <tbody>

              {recentSales.map((sale) => (

                <tr key={sale.id}>

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

                    <span className="badge bg-dark">
                      {sale.sku ||
                        "Sin SKU"}
                    </span>

                  </td>

                  <td>
                    {sale.quantity}
                  </td>

                  <td className="fw-bold">
                    €
                    {" "}
                    {Number(
                      sale.total
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