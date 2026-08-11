export default function ProductTable({
  products,
  handleDelete,
  handleEdit,
}) {
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
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {products.length === 0 ? (

              <tr>
                <td
                  colSpan="10"
                  className="text-center text-muted"
                >
                  No hay productos registrados.
                </td>
              </tr>

            ) : (

              products.map((item) => {

                const buy = Number(item.buyPrice);
                const sell = Number(item.sellPrice);

                const margin =
                  buy > 0
                    ? (((sell - buy) / buy) * 100).toFixed(0)
                    : 0;

                const stockInfo =
                  Number(item.stock) === 0
                    ? {
                        text: "Sin stock",
                        className: "bg-danger",
                      }
                    : Number(item.stock) <= 10
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

                    {/* Imagen */}

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

                    {/* SKU */}

                    <td>
                      <span className="badge bg-dark">
                        {item.sku || "Sin SKU"}
                      </span>
                    </td>

                    {/* Producto */}

                    <td className="fw-semibold">
                      {item.name}
                    </td>

                    {/* Categoría */}

                    <td>
                      {item.category}
                    </td>

                    {/* Stock */}

                    <td>
                      {item.stock}
                    </td>

                    {/* Estado */}

                    <td>
                      <span
                        className={`badge ${stockInfo.className}`}
                      >
                        {stockInfo.text}
                      </span>
                    </td>

                    {/* Precio compra */}

                    <td>
                      € {item.buyPrice}
                    </td>

                    {/* Precio venta */}

                    <td>
                      € {item.sellPrice}
                    </td>

                    {/* Margen */}

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

                    {/* Acciones */}

                    <td>
                      <div className="d-flex gap-2">

                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEdit(item.id)}
                          title="Editar producto"
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(item.id)}
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