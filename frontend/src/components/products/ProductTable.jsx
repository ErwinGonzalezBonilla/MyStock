import { useState } from "react";
import StockMovementModal from "./StockMovementModal";

export default function ProductTable({
  products,
  handleDelete,
  handleEdit,
  handleIncreaseStock,
  handleDecreaseStock,
}) {
  const [movementProduct, setMovementProduct] = useState(null);
  const [movementType, setMovementType] = useState(null);

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

  const openMovementModal = (product, type) => {
    setMovementProduct(product);
    setMovementType(type);
  };

  const closeMovementModal = () => {
    setMovementProduct(null);
    setMovementType(null);
  };

  const handleMovementConfirm = (quantity) => {
    if (!movementProduct || !movementType) {
      return;
    }

    if (movementType === "entrada") {
      handleIncreaseStock(
        movementProduct.id,
        quantity
      );
    } else {
      handleDecreaseStock(
        movementProduct.id,
        quantity
      );
    }

    closeMovementModal();
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

                    {/* IMAGEN */}

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

                    {/* PRODUCTO */}

                    <td className="fw-semibold">
                      {item.name}
                    </td>

                    {/* CATEGORÍA */}

                    <td>
                      {item.category}
                    </td>

                    {/* STOCK */}

                    <td>

                      <div className="d-flex align-items-center gap-2">

                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() =>
                            openMovementModal(
                              item,
                              "salida"
                            )
                          }
                          disabled={stock === 0}
                          title="Registrar salida"
                        >
                          −
                        </button>

                        <strong>
                          {stock}
                        </strong>

                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm"
                          onClick={() =>
                            openMovementModal(
                              item,
                              "entrada"
                            )
                          }
                          title="Registrar entrada"
                        >
                          +
                        </button>

                      </div>

                    </td>

                    {/* ESTADO */}

                    <td>
                      <span
                        className={`badge ${stockInfo.className}`}
                      >
                        {stockInfo.text}
                      </span>
                    </td>

                    {/* COMPRA */}

                    <td>
                      € {item.buyPrice}
                    </td>

                    {/* VENTA */}

                    <td>
                      € {item.sellPrice}
                    </td>

                    {/* MARGEN */}

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

                    {/* ÚLTIMO MOVIMIENTO */}

                    <td>
                      <small className="text-muted">
                        {formatLastUpdate(
                          item.lastStockUpdate
                        )}
                      </small>
                    </td>

                    {/* ACCIONES */}

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

      {movementProduct && (

        <StockMovementModal
          product={movementProduct}
          type={movementType}
          onClose={closeMovementModal}
          onConfirm={handleMovementConfirm}
        />

      )}

    </div>
  );
}