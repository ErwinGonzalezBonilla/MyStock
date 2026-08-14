import { useState } from "react";

const ENTRY_REASONS = [
  "Compra a proveedor",
  "Devolución",
  "Ajuste de inventario",
  "Otro",
];

const EXIT_REASONS = [
  "Venta",
  "Producto dañado",
  "Pérdida",
  "Ajuste de inventario",
  "Otro",
];

export default function StockMovementModal({
  product,
  type,
  onClose,
  onConfirm,
}) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");

  if (!product) {
    return null;
  }

  const isEntry = type === "entrada";

  const reasons = isEntry
    ? ENTRY_REASONS
    : EXIT_REASONS;

  const handleSubmit = (e) => {
    e.preventDefault();

    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      return;
    }

    if (!reason) {
      return;
    }

    if (
      !isEntry &&
      amount > Number(product.stock)
    ) {
      return;
    }

    onConfirm(amount, reason);
  };

  const resultingStock = isEntry
    ? Number(product.stock) +
      Number(quantity || 0)
    : Math.max(
        0,
        Number(product.stock) -
          Number(quantity || 0)
      );

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

            {/* CABECERA */}

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

                {/* PRODUCTO */}

                <div className="mb-3">

                  <label className="form-label text-muted">
                    Producto
                  </label>

                  <div className="fw-bold">
                    {product.name}
                  </div>

                </div>

                {/* SKU */}

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

                {/* STOCK ACTUAL */}

                <div className="mb-3">

                  <label className="form-label text-muted">
                    Stock actual
                  </label>

                  <div className="fs-4 fw-bold">
                    {product.stock}
                  </div>

                </div>

                {/* CANTIDAD */}

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

                {/* MOTIVO */}

                <div className="mb-3">

                  <label
                    htmlFor="movementReason"
                    className="form-label fw-semibold"
                  >
                    Motivo del movimiento
                  </label>

                  <select
                    id="movementReason"
                    className="form-select"
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    required
                  >

                    <option value="">
                      Selecciona un motivo...
                    </option>

                    {reasons.map(
                      (item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* RESUMEN */}

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
                        {resultingStock}
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
                        {resultingStock}
                      </strong>
                      .
                    </>
                  )}

                </div>

              </div>

              {/* BOTONES */}

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
                  disabled={!reason}
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