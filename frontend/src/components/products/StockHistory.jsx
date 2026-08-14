export default function StockHistory({ movements }) {
  const formatDate = (date) => {
    if (!date) {
      return "Sin fecha";
    }

    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="stat-card mt-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h4 className="mb-1">
            Historial de movimientos
          </h4>

          <small className="text-muted">
            Últimos movimientos del inventario
          </small>
        </div>

        <span className="badge bg-dark">
          {movements.length} movimientos
        </span>

      </div>

      {movements.length === 0 ? (

        <div className="text-center text-muted py-4">
          <div className="fs-1 mb-2">
            📦
          </div>

          <p className="mb-0">
            Todavía no hay movimientos registrados.
          </p>
        </div>

      ) : (

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead className="table-light">

              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>SKU</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Stock resultante</th>
              </tr>

            </thead>

            <tbody>

              {movements.map((movement) => (

                <tr key={movement.id}>

                  <td>
                    <small>
                      {formatDate(movement.date)}
                    </small>
                  </td>

                  <td className="fw-semibold">
                    {movement.productName}
                  </td>

                  <td>
                    <span className="badge bg-dark">
                      {movement.sku || "Sin SKU"}
                    </span>
                  </td>

                  <td>

                    {movement.type === "entrada" ? (

                      <span className="badge bg-success">
                        ↑ Entrada
                      </span>

                    ) : (

                      <span className="badge bg-danger">
                        ↓ Salida
                      </span>

                    )}

                  </td>

                  <td>

                    <strong
                      className={
                        movement.type === "entrada"
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {movement.type === "entrada"
                        ? "+"
                        : "-"}
                      {movement.quantity}
                    </strong>

                  </td>

                  <td>
                    <strong>
                      {movement.resultingStock}
                    </strong>
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