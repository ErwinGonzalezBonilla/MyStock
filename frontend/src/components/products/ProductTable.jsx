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

      <table className="table table-striped table-hover align-middle">

        <thead className="table-light">
          <tr>
            <th>Imagen</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Compra</th>
            <th>Venta</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>

          {products.length === 0 ? (

            <tr>
              <td
                colSpan="7"
                className="text-center text-muted"
              >
                No hay productos registrados.
              </td>
            </tr>

          ) : (

            products.map((item, index) => (

              <tr key={index}>

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

                <td className="fw-semibold">
                  {item.name}
                </td>

                <td>
                  {item.category}
                </td>

                <td>
                  {item.stock}
                </td>

                <td>
                  € {item.buyPrice}
                </td>

                <td>
                  € {item.sellPrice}
                </td>

                <td className="d-flex gap-2">

                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleEdit(index)}
                  >
                    ✏️
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(index)}
                  >
                    🗑️
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}