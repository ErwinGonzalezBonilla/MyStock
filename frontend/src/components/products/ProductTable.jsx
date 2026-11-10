import { useState } from "react";
import StockMovementModal from "./StockMovementModal";
import { parseApiDate } from "../../utils/dates";
import { STOCK_STATUS, getStockStatus } from "../../utils/stock";
import { useMoney } from "../../hooks/useMoney";
import { formatPercent } from "../../utils/money";

export default function ProductTable({
  products,
  movements,
  handleDelete,
  handleRestore,
  handleEdit,
  handleIncreaseStock,
  handleDecreaseStock,
  // Qué puede hacer el rol del usuario (ver pages/Products.jsx).
  permissions = {},
}) {
  const formatMoney = useMoney();

  const [movementProduct, setMovementProduct] =
    useState(null);

  const [movementType, setMovementType] =
    useState(null);

  const formatLastUpdate = (date) => {
    if (!date) {
      return "Sin movimientos";
    }

    return parseApiDate(date)?.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLastMovement = (productId) => {
    if (!movements || movements.length === 0) {
      return null;
    }

    return movements.find(
      (movement) =>
        Number(movement.productId) === Number(productId)
    );
  };

  const openMovementModal = (product, type) => {
    setMovementProduct(product);
    setMovementType(type);
  };

  const closeMovementModal = () => {
    setMovementProduct(null);
    setMovementType(null);
  };

  const handleMovementConfirm = (
    quantity,
    reason
  ) => {
    if (!movementProduct || !movementType) {
      return;
    }

    if (!quantity || !reason) {
      return;
    }

    if (movementType === "entrada") {
      handleIncreaseStock(
        movementProduct.id,
        quantity,
        reason
      );
    } else {
      handleDecreaseStock(
        movementProduct.id,
        quantity,
        reason
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

        <table className="table table-striped table-hover align-middle product-table">

          <thead className="table-light">
            <tr>
              <th className="d-none d-xxl-table-cell">Imagen</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th className="text-end">Precio</th>
              <th>Margen</th>
              <th className="d-none d-xl-table-cell">Último movimiento</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {products.length === 0 ? (

              <tr>
                <td
                  colSpan="8"
                  className="text-center text-muted"
                >
                  No hay productos registrados.
                </td>
              </tr>

            ) : (

              products.map((item) => {

                const buy =
                  Number(item.buyPrice) || 0;

                const sell =
                  Number(item.sellPrice) || 0;

                const stock =
                  Number(item.stock) || 0;

                const margin =
                  buy > 0
                    ? Math.round(
                        ((sell - buy) / buy) * 100
                      )
                    : 0;

                // Misma regla en toda la app (utils/stock.js).
                const status =
                  STOCK_STATUS[getStockStatus(item)];

                const stockInfo = {
                  text:
                    status === STOCK_STATUS.ok
                      ? "Disponible"
                      : status.label,
                  className: status.badgeClass,
                };

                const lastMovement =
                  getLastMovement(item.id);

                const archived =
                  item.isActive === false;

                return (

                  <tr
                    key={item.id}
                    className={archived ? "table-secondary" : undefined}
                  >

                    {/* IMAGEN */}

                    <td className="d-none d-xxl-table-cell">

                      {item.image ? (

                        <img
                          src={item.image}
                          alt={item.name}
                          className="product-table__thumb"
                          style={{ objectFit: "cover" }}
                        />

                      ) : (

                        <div className="product-table__thumb product-table__thumb--empty" />

                      )}

                    </td>

                    {/* PRODUCTO + SKU + CÓDIGO DE BARRAS */}

                    <td className="product-table__product">

                      <div className="fw-semibold">
                        {item.name}

                        {archived && (
                          <span className="badge bg-secondary ms-2">
                            Archivado
                          </span>
                        )}
                      </div>

                      <div className="product-table__codes">

                        <span className="badge bg-dark">
                          {item.sku || "Sin SKU"}
                        </span>

                        <span
                          className={
                            item.barcode
                              ? "product-table__barcode"
                              : "text-muted"
                          }
                        >
                          {item.barcode || "Sin código"}
                        </span>

                      </div>

                    </td>

                    {/* CATEGORÍA */}

                    <td>
                      {item.category || "-"}
                    </td>

                    {/* STOCK + ESTADO */}

                    <td className="text-nowrap">

                      <div className="d-flex align-items-center gap-2 flex-nowrap">

                        {permissions.moveStock && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() =>
                            openMovementModal(
                              item,
                              "salida"
                            )
                          }
                          disabled={
                            archived || stock === 0
                          }
                          title="Registrar salida"
                        >
                          −
                        </button>
                        )}

                        <strong>
                          {stock}
                        </strong>

                        {permissions.moveStock && (
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm"
                          onClick={() =>
                            openMovementModal(
                              item,
                              "entrada"
                            )
                          }
                          disabled={archived}
                          title="Registrar entrada"
                        >
                          +
                        </button>
                        )}

                      </div>

                      <span
                        className={`badge mt-1 ${stockInfo.className}`}
                      >
                        {stockInfo.text}
                      </span>

                    </td>

                    {/* PRECIO DE VENTA + COMPRA */}

                    <td className="text-end text-nowrap">

                      <div className="fw-semibold">
                        {formatMoney(sell)}
                      </div>

                      <small className="text-muted">
                        Compra {formatMoney(buy)}
                      </small>

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
                        {formatPercent(margin, 0)}
                      </span>

                    </td>

                    {/* ÚLTIMO MOVIMIENTO */}

                    <td className="d-none d-xl-table-cell">

                      <small className="text-muted">

                        {lastMovement
                          ? formatLastUpdate(
                              lastMovement.date
                            )
                          : "Sin movimientos"}

                      </small>

                    </td>

                    {/* ACCIONES */}

                    <td>

                      <div className="d-flex gap-2 flex-nowrap">

                        {!permissions.edit &&
                          !permissions.delete &&
                          !permissions.restore && (
                            <span className="text-muted">—</span>
                          )}

                        {permissions.edit && (
                        <button
                          type="button"
                          className="btn btn-warning btn-sm"
                          onClick={() =>
                            handleEdit(
                              item.id
                            )
                          }
                          title="Editar producto"
                        >
                          ✏️
                        </button>
                        )}

                        {archived ? (
                          permissions.restore && (

                          <button
                            type="button"
                            className="btn btn-outline-success btn-sm"
                            onClick={() =>
                              handleRestore(
                                item.id
                              )
                            }
                            title="Restaurar producto"
                          >
                            ♻️
                          </button>
                          )
                        ) : (
                          permissions.delete && (

                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                            title="Eliminar o archivar producto"
                          >
                            🗑️
                          </button>
                          )
                        )}

                      </div>

                    </td>

                  </tr>

                );
              })

            )}

          </tbody>

        </table>

      </div>

      {/* MODAL DE MOVIMIENTO */}

      {movementProduct && (

        <StockMovementModal
          product={movementProduct}
          type={movementType}
          onClose={closeMovementModal}
          onConfirm={
            handleMovementConfirm
          }
        />

      )}

    </div>
  );
}