export default function SaleForm({
  products,
  sale,
  handleChange,
  handleSubmit,
}) {
  const selectedProduct = products.find(
    (product) =>
      product.id === sale.productId
  );

  const price = selectedProduct
    ? Number(selectedProduct.sellPrice) || 0
    : 0;

  const quantity =
    Number(sale.quantity) || 0;

  const total = price * quantity;

  const availableStock = selectedProduct
    ? Number(selectedProduct.stock) || 0
    : 0;

  return (
    <div className="stat-card mb-4">

      <h4 className="mb-4">
        Nueva venta
      </h4>

      <form onSubmit={handleSubmit}>

        {/* PRODUCTO */}

        <div className="mb-3">

          <label
            htmlFor="productId"
            className="form-label fw-semibold"
          >
            Producto
          </label>

          <select
            id="productId"
            name="productId"
            className="form-select"
            value={sale.productId}
            onChange={handleChange}
            required
          >

            <option value="">
              Selecciona un producto...
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
                {product.sku || "Sin SKU"} — Stock:{" "}
                {product.stock}
              </option>

            ))}

          </select>

        </div>

        {/* INFORMACIÓN DEL PRODUCTO */}

        {selectedProduct && (

          <div className="alert alert-light border mb-3">

            <div className="row">

              <div className="col-md-4">

                <small className="text-muted">
                  SKU
                </small>

                <div className="fw-semibold">
                  {selectedProduct.sku ||
                    "Sin SKU"}
                </div>

              </div>

              <div className="col-md-4">

                <small className="text-muted">
                  Precio de venta
                </small>

                <div className="fw-semibold">
                  € {price.toFixed(2)}
                </div>

              </div>

              <div className="col-md-4">

                <small className="text-muted">
                  Stock disponible
                </small>

                <div className="fw-semibold">
                  {availableStock}
                </div>

              </div>

            </div>

          </div>

        )}

        {/* CANTIDAD */}

        <div className="mb-3">

          <label
            htmlFor="quantity"
            className="form-label fw-semibold"
          >
            Cantidad
          </label>

          <input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            max={availableStock || undefined}
            className="form-control"
            value={sale.quantity}
            onChange={handleChange}
            required
          />

          {selectedProduct &&
            quantity > availableStock && (

              <div className="text-danger small mt-1">
                No hay suficiente stock.
              </div>

            )}

        </div>

        {/* TOTAL */}

        <div className="border rounded p-3 mb-4">

          <div className="d-flex justify-content-between">

            <span className="text-muted">
              Precio unitario
            </span>

            <strong>
              € {price.toFixed(2)}
            </strong>

          </div>

          <div className="d-flex justify-content-between mt-2">

            <span className="text-muted">
              Cantidad
            </span>

            <strong>
              {quantity}
            </strong>

          </div>

          <hr />

          <div className="d-flex justify-content-between">

            <span className="fw-bold">
              Total
            </span>

            <span className="fs-4 fw-bold">
              € {total.toFixed(2)}
            </span>

          </div>

        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            !selectedProduct ||
            quantity <= 0 ||
            quantity > availableStock
          }
        >
          Registrar venta
        </button>

      </form>

    </div>
  );
}