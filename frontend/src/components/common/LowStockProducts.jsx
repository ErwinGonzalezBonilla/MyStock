import { STOCK_STATUS, getStockStatus, needsRestock } from "../../utils/stock";

export default function LowStockProducts({
  products,
}) {
  // Sin stock o por debajo de su stock mínimo (utils/stock.js).
  const lowStockProducts = products
    .filter(needsRestock)
    .sort(
      (a, b) =>
        Number(a.stock) -
        Number(b.stock)
    );

  return (
    <div className="stat-card mb-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h4 className="mb-1">
            ⚠️ Stock bajo
          </h4>

          <small className="text-muted">
            Productos que necesitan reposición
          </small>
        </div>

        <span className="badge bg-warning text-dark">
          {lowStockProducts.length}
        </span>

      </div>

      {lowStockProducts.length === 0 ? (

        <div className="text-center py-4">

          <div className="fs-1 mb-2">
            ✅
          </div>

          <p className="fw-semibold mb-1">
            Todo en orden
          </p>

          <small className="text-muted">
            No hay productos con stock bajo.
          </small>

        </div>

      ) : (

        <div>

          {lowStockProducts.map(
            (product) => {

              const stock =
                Number(product.stock) || 0;

              const status =
                STOCK_STATUS[getStockStatus(product)];

              return (
                <div
                  key={product.id}
                  className="d-flex justify-content-between align-items-center border-bottom py-3"
                >

                  <div className="d-flex align-items-center gap-3">

                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "45px",
                          height: "45px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border:
                            "1px solid #ddd",
                        }}
                      />

                    ) : (

                      <div
                        style={{
                          width: "45px",
                          height: "45px",
                          background:
                            "#f2f2f2",
                          borderRadius: "8px",
                        }}
                      />

                    )}

                    <div>

                      <div className="fw-semibold">
                        {product.name}
                      </div>

                      <small className="text-muted">
                        {product.sku ||
                          "Sin SKU"}
                      </small>

                    </div>

                  </div>

                  <div className="text-end">

                    <div
                      className={`fw-bold ${status.textClass}`}
                    >
                      {stock} unidades
                    </div>

                    <small className="text-muted">
                      {status.label} · mín.{" "}
                      {Number(product.minStock) || 0}
                    </small>

                  </div>

                </div>
              );
            }
          )}

        </div>

      )}

    </div>
  );
}