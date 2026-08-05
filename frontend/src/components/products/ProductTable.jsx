export default function ProductTable({
  products,
  handleDelete,
}) {
  return (
    <div className="stat-card">

      <h4 className="mb-4">
        Lista de productos
      </h4>

      <table className="table table-striped table-hover">

        <thead className="table-light">
          <tr>
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
                colSpan="6"
                className="text-center text-muted"
              >
                No hay productos registrados.
              </td>
            </tr>

          ) : (

            products.map((item, index) => (

              <tr key={index}>

                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.stock}</td>
                <td>€ {item.buyPrice}</td>
                <td>€ {item.sellPrice}</td>

                <td>

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