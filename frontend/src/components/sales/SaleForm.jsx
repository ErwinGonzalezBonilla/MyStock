export default function SaleForm({
  products = [],
  clients = [],
  sale,
  cart = [],
  cartTotal = 0,
  cartItemsCount = 0,
  handleChange,
  handleSubmit,
  onProductSelect,
  updateCartQuantity,
  removeFromCart,
  loadingProducts,
}) {
  const selectedClient = clients.find(
    (client) =>
      Number(client.id) === Number(sale?.clientId)
  );

  return (
    <div className="stat-card mb-4">

      <h4 className="mb-4">
        Nueva venta
      </h4>

      <form onSubmit={handleSubmit}>

        {/* =========================
            CLIENTE
        ========================= */}

        <div className="mb-4">

          <label
            htmlFor="clientId"
            className="form-label fw-semibold"
          >
            Cliente
          </label>

          <select
            id="clientId"
            name="clientId"
            className="form-select"
            value={sale?.clientId || ""}
            onChange={handleChange}
          >

            <option value="">
              Venta sin cliente
            </option>

            {clients.map((client) => (

              <option
                key={client.id}
                value={client.id}
              >
                {client.name}
                {client.taxId
                  ? ` — ${client.taxId}`
                  : ""}
              </option>

            ))}

          </select>

          <small className="text-muted">
            Puedes registrar la venta sin asociarla
            a un cliente.
          </small>

        </div>

        {/* =========================
            INFORMACIÓN DEL CLIENTE
        ========================= */}

        {selectedClient && (

          <div className="alert alert-light border mb-4">

            <h6 className="fw-bold mb-3">
              Cliente seleccionado
            </h6>

            <div className="row">

              <div className="col-md-3 mb-2">
                <small className="text-muted d-block">
                  Nombre
                </small>

                <span className="fw-semibold">
                  {selectedClient.name}
                </span>
              </div>

              <div className="col-md-3 mb-2">
                <small className="text-muted d-block">
                  DNI / NIF
                </small>

                <span className="fw-semibold">
                  {selectedClient.taxId || "—"}
                </span>
              </div>

              <div className="col-md-3 mb-2">
                <small className="text-muted d-block">
                  Teléfono
                </small>

                <span className="fw-semibold">
                  {selectedClient.phone || "—"}
                </span>
              </div>

              <div className="col-md-3 mb-2">
                <small className="text-muted d-block">
                  Email
                </small>

                <span className="fw-semibold">
                  {selectedClient.email || "—"}
                </span>
              </div>

            </div>

            <div className="row mt-2">

              <div className="col-md-6 mb-2">
                <small className="text-muted d-block">
                  Dirección
                </small>

                <span className="fw-semibold">
                  {selectedClient.address || "—"}
                </span>
              </div>

              <div className="col-md-3 mb-2">
                <small className="text-muted d-block">
                  Ciudad
                </small>

                <span className="fw-semibold">
                  {selectedClient.city || "—"}
                </span>
              </div>

              <div className="col-md-3 mb-2">
                <small className="text-muted d-block">
                  Código postal
                </small>

                <span className="fw-semibold">
                  {selectedClient.postalCode || "—"}
                </span>
              </div>

            </div>

          </div>

        )}

        {/* =========================
            PRODUCTO MANUAL
        ========================= */}

        <div className="mb-4">

          <label
            htmlFor="productId"
            className="form-label fw-semibold"
          >
            Añadir producto manualmente
          </label>

          <select
            id="productId"
            className="form-select"
            value=""
            onChange={onProductSelect}
            disabled={loadingProducts}
          >

            <option value="">
              {loadingProducts
                ? "Cargando productos..."
                : "Selecciona un producto..."}
            </option>

            {products.map((product) => (

              <option
                key={product.id}
                value={product.id}
                disabled={
                  Number(product.stock) <= 0
                }
              >
                {product.name} —{" "}
                {product.sku || "Sin SKU"} —{" "}
                Stock: {product.stock}
              </option>

            ))}

          </select>

        </div>

        {/* =========================
            CARRITO
        ========================= */}

        <div className="border rounded p-3 mb-4">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <div>

              <h5 className="mb-1">
                Carrito
              </h5>

              <small className="text-muted">
                {cartItemsCount}{" "}
                {cartItemsCount === 1
                  ? "producto"
                  : "productos"}
              </small>

            </div>

            <span className="badge bg-dark">
              {cart.length}{" "}
              {cart.length === 1
                ? "línea"
                : "líneas"}
            </span>

          </div>

          {cart.length === 0 ? (

            <div className="text-center py-4 text-muted">
              No hay productos en el carrito.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table align-middle mb-0">

                <thead>

                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Precio</th>
                    <th style={{ width: "120px" }}>
                      Cantidad
                    </th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>

                </thead>

                <tbody>

                  {cart.map((item) => (

                    <tr key={item.productId}>

                      <td>

                        <div className="fw-semibold">
                          {item.name}
                        </div>

                        {item.barcode && (
                          <small className="text-muted">
                            Código: {item.barcode}
                          </small>
                        )}

                      </td>

                      <td>
                        {item.sku || "—"}
                      </td>

                      <td>
                        €{" "}
                        {Number(
                          item.unitPrice
                        ).toFixed(2)}
                      </td>

                      <td>

                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartQuantity(
                              item.productId,
                              e.target.value
                            )
                          }
                        />

                      </td>

                      <td className="fw-semibold">
                        €{" "}
                        {Number(
                          item.subtotal
                        ).toFixed(2)}
                      </td>

                      <td>

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() =>
                            removeFromCart(
                              item.productId
                            )
                          }
                        >
                          Eliminar
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

        {/* =========================
            TOTAL
        ========================= */}

        <div className="border rounded p-3 mb-4">

          <div className="d-flex justify-content-between">

            <span className="text-muted">
              Líneas
            </span>

            <strong>
              {cart.length}
            </strong>

          </div>

          <div className="d-flex justify-content-between mt-2">

            <span className="text-muted">
              Productos
            </span>

            <strong>
              {cartItemsCount}
            </strong>

          </div>

          <hr />

          <div className="d-flex justify-content-between align-items-center">

            <span className="fw-bold">
              TOTAL
            </span>

            <span className="fs-3 fw-bold">
              € {Number(cartTotal).toFixed(2)}
            </span>

          </div>

        </div>

        {/* =========================
            FINALIZAR
        ========================= */}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={
            cart.length === 0 ||
            loadingProducts
          }
        >
          Finalizar venta
        </button>

      </form>

    </div>
  );
}