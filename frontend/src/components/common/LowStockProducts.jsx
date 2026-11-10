import { STOCK_STATUS, getStockStatus, needsRestock } from "../../utils/stock";

// El amarillo de "text-warning" apenas se lee sobre blanco.
const STOCK_TEXT_CLASS = {
  out: "text-danger",
  low: "text-warning-emphasis",
};

// products: productos de GET /api/products (los carga Dashboard).
export default function LowStockProducts({ products = [] }) {
  // Sin stock o por debajo de su stock mínimo (utils/stock.js).
  // Primero los agotados; después, los que tienen menos stock
  // en proporción a su mínimo.
  const urgency = (product) => {
    const stock = Number(product.stock) || 0;
    const minStock = Number(product.minStock) || 0;

    return stock <= 0 ? -1 : stock / Math.max(minStock, 1);
  };

  const lowStockProducts = products
    .filter(needsRestock)
    .sort((a, b) => urgency(a) - urgency(b));

  return (
    <>
      <div className="dashboard-panel-header d-flex justify-content-between align-items-start gap-3">

        <div>
          <h2>Stock bajo</h2>
          <p>Productos que necesitan reposición.</p>
        </div>

        <span
          className={`badge ${
            lowStockProducts.length ? "bg-warning text-dark" : "bg-success"
          }`}
        >
          {lowStockProducts.length}
        </span>

      </div>

      {lowStockProducts.length === 0 ? (

        <div className="text-center py-4">
          <div className="fs-1 mb-2" aria-hidden="true">✅</div>
          <p className="fw-semibold mb-1">Todo en orden</p>
          <small className="text-muted">
            No hay productos con stock bajo.
          </small>
        </div>

      ) : (

        <ul className="low-stock-list">

          {lowStockProducts.map((product) => {
            const stock = Number(product.stock) || 0;
            const minStock = Number(product.minStock) || 0;
            const statusKey = getStockStatus(product);
            const status = STOCK_STATUS[statusKey];

            return (
              <li key={product.id} className="low-stock-item">

                <div className="low-stock-item__info">

                  <div
                    className="low-stock-item__name"
                    title={product.name}
                  >
                    {product.name}
                  </div>

                  <small className="text-muted">
                    {product.sku || "Sin SKU"} · mín. {minStock}
                  </small>

                </div>

                <div className="low-stock-item__stock">

                  <div className={`fw-bold ${STOCK_TEXT_CLASS[statusKey] || ""}`}>
                    {stock} {stock === 1 ? "ud." : "uds."}
                  </div>

                  <span className={`badge ${status.badgeClass}`}>
                    {status.label}
                  </span>

                </div>

              </li>
            );
          })}

        </ul>

      )}
    </>
  );
}
