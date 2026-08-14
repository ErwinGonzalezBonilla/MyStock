import { useState } from "react";

export default function StockMovementModal({
  product,
  type,
  onClose,
  onConfirm,
}) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return null;
  }

  const isEntry = type === "entrada";

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      return;
    }

    if (
      !isEntry &&
      amount > Number(product.stock)
    ) {
      return;
    }

    onConfirm(amount);
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
      />

      <div
        className="modal d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">

          <div className="modal-content">

            <div className="modal-header">

              <h5 className="modal-title">
                {isEntry
                  ? "Entrada de stock"
                  : "Salida de stock"}
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              />

            </div>

            <form onSubmit={handleSubmit}>

              <div className="modal-body">

                <div className="mb-3">

                  <label className="form-label text-muted">
                    Producto
                  </label>

                  <div className="fw-bold">
                    {product.name}
                  </div>

                </div>

                <div className="mb-3">

                  <label className="form-label text-muted">
                    SKU
                  </label>

                  <div>
                    <span className="badge bg-dark">
                      {product.sku || "Sin SKU"}
                    </span>
                  </div>

                </div>

                <div className="mb-3">

                  <label className="form-label text-muted">
                    Stock actual
                  </label>

                  <div className="fs-4 fw-bold">
                    {product.stock}
                  </div>

                </div>

                <div className="mb-3">

                  <label
                    htmlFor="movementQuantity"
                    className="form-label fw-semibold"
                  >
                    Cantidad
                  </label>

                  <input
                    id="movementQuantity"
                    type="number"
                    min="1"
                    max={
                      isEntry
                        ? undefined
                        : product.stock
                    }
                    className="form-control form-control-lg"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                    autoFocus
                  />

                </div>

                <div
                  className={`alert ${
                    isEntry
                      ? "alert-success"
                      : "alert-danger"
                  } mb-0`}
                >
                  {isEntry ? (
                    <>
                      El stock pasará de{" "}
                      <strong>
                        {product.stock}
                      </strong>{" "}
                      a{" "}
                      <strong>
                        {Number(product.stock) +
                          Number(quantity || 0)}
                      </strong>
                      .
                    </>
                  ) : (
                    <>
                      El stock pasará de{" "}
                      <strong>
                        {product.stock}
                      </strong>{" "}
                      a{" "}
                      <strong>
                        {Math.max(
                          0,
                          Number(product.stock) -
                            Number(quantity || 0)
                        )}
                      </strong>
                      .
                    </>
                  )}
                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={
                    isEntry
                      ? "btn btn-success"
                      : "btn btn-danger"
                  }
                >
                  {isEntry
                    ? "Añadir stock"
                    : "Registrar salida"}
                </button>

              </div>

            </form>

          </div>

        </div>
      </div>
    </>
  );
}