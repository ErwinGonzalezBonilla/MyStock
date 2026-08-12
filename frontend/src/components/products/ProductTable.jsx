export default function ProductTable({
  products,
  handleDelete,
  handleEdit,
  handleIncreaseStock,
  handleDecreaseStock,
}) {
  const formatLastUpdate = (date) => {
    if (!date) {
      return "Sin movimientos";
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
    <div className="stat-card">

      <h4 className="mb-4">
        Lista de productos
      </h4>

      <div className="table-responsive">

        <table className="table table-striped table-hover align-middle">

          <thead className="table-light">
            <tr>
              <th>Imagen</th>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Compra</th>
              <th>Venta</th>
              <th>Margen</th>
              <th>Último movimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {products.length === 0 ? (

              <tr>
                <td
                  colSpan="11"
                  className="text-center text-muted"
                >
                  No hay productos registrados.
                </td>
              </tr>

            ) : (

              products.map((item) => {

                const buy = Number(item.buyPrice);
                const sell = Number(item.sellPrice);
                const stock = Number(item.stock) || 0;

                const margin =
                  buy > 0
                    ? (((sell - buy) / buy) * 100).toFixed(0)
                    : 0;

                const stockInfo =
                  stock === 0
                    ? {
                        text: "Sin stock",
                        className: "bg-danger",
                      }
                    : stock <= 10
                    ? {
                        text: "Stock bajo",
                        className: "bg-warning text-dark",
                      }
                    : {
                        text: "Disponible",
                        className: "bg-success",
                      };

                return (

                  <tr key={item.id}>

                    <td>
                      {item.image ? (

                        <img
                          src={item.image}
                          alt={item.name}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "10px",
                            border: "1px solid #ddd",
                          }}
                        />

                      ) : (

                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            background: "#f2f2f2",
                            borderRadius: "10px",
                          }}
                        />

                      )}
                    </td>

                    <td>
                      <span className="badge bg-dark">
                        {item.sku || "Sin SKU"}
                      </span>
                    </td>

                    <td className="fw-semibold">
                      {item.name}
                    </td>

                    <td>
                      {item.category}
                    </td>

                    <td>

                      <div className="d-flex align-items-center gap-2">

                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            handleDecreaseStock(item.id)
                          }
                          disabled={stock === 0}
                          title="Disminuir stock"
                        >
                          −
                        </button>

                        <strong>
                          {stock}
                        </strong>

                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() =>
                            handleIncreaseStock(item.id)
                          }
                          title="Aumentar stock"
                        >
                          +
                        </button>

                      </div>

                    </td>

                    <td>
                      <span
                        className={`badge ${stockInfo.className}`}
                      >
                        {stockInfo.text}
                      </span>
                    </td>

                    <td>
                      € {item.buyPrice}
                    </td>

                    <td>
                      € {item.sellPrice}
                    </td>

                    <td>

                      <span
                        className={
                          margin >= 50
                            ? "badge bg-success"
                            : margin >= 20
                            ? "badge bg-warning text-dark"
                            : "badge bg-danger"
                        }
                      >
                        {margin}%
                      </span>

                    </td>

                    <td>
                      <small className="text-muted">
                        {formatLastUpdate(
                          item.lastStockUpdate
                        )}
                      </small>
                    </td>

                    <td>

                      <div className="d-flex gap-2">

                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() =>
                            handleEdit(item.id)
                          }
                          title="Editar producto"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          title="Eliminar producto"
                        >
                          🗑️
                        </button>

                      </div>

                    </td>

                  </tr>

                );
              })

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}