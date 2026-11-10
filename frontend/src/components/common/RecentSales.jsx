import { parseApiDate } from "../../utils/dates";
import { useMoney } from "../../hooks/useMoney";

const RECENT_LIMIT = 5;

const formatDate = (date) => {
  if (!date) {
    return "Sin fecha";
  }

  return parseApiDate(date)?.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Una venta tiene varias líneas (items). Se muestra el primer
// producto y cuántos más lleva: "Sérum vitamina C y 2 más".
const describeProducts = (items) => {
  if (!items.length) {
    return "Sin productos";
  }

  const first = items[0].productName || "Producto eliminado";
  const others = items.length - 1;

  return others > 0 ? `${first} y ${others} más` : first;
};

// sales: ventas de GET /api/sales (las carga Dashboard).
export default function RecentSales({ sales = [] }) {
  const formatMoney = useMoney();

  const recentSales = [...sales]
    .sort(
      (a, b) =>
        (parseApiDate(b.date)?.getTime() || 0) -
        (parseApiDate(a.date)?.getTime() || 0)
    )
    .slice(0, RECENT_LIMIT);

  return (
    <>
      <div className="dashboard-panel-header d-flex justify-content-between align-items-start gap-3">

        <div>
          <h2>Últimas ventas</h2>
          <p>Actividad reciente de tu negocio.</p>
        </div>

        <span className="badge bg-dark">
          {sales.length} {sales.length === 1 ? "venta" : "ventas"}
        </span>

      </div>

      {recentSales.length === 0 ? (

        <div className="text-center text-muted py-4">
          <div className="fs-1 mb-2" aria-hidden="true">🧾</div>
          <p className="mb-0">Todavía no hay ventas registradas.</p>
        </div>

      ) : (

        <div className="table-responsive">

          <table className="table table-hover align-middle mb-0 recent-sales-table">

            <thead className="table-light">
              <tr>
                <th>Fecha</th>
                <th>Venta</th>
                <th>Productos</th>
                <th className="text-end">Uds.</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>

            <tbody>

              {recentSales.map((sale) => {
                const items = sale.items || [];
                const units = items.reduce(
                  (total, item) => total + (Number(item.quantity) || 0),
                  0
                );
                const products = describeProducts(items);

                return (
                  <tr key={sale.id}>

                    <td className="text-nowrap">
                      <small>{formatDate(sale.date)}</small>
                    </td>

                    <td>
                      <div className="fw-semibold text-nowrap">
                        #{sale.id}
                      </div>
                      <small
                        className="text-muted recent-sales-table__client"
                        title={sale.clientName || "Venta sin cliente"}
                      >
                        {sale.clientName || "Venta sin cliente"}
                      </small>
                    </td>

                    <td
                      className="recent-sales-table__products"
                      title={items
                        .map((item) => `${item.quantity} × ${item.productName}`)
                        .join("\n")}
                    >
                      {products}
                    </td>

                    <td className="text-end">
                      {units}
                    </td>

                    <td className="text-end fw-bold text-nowrap">
                      {formatMoney(sale.total)}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      )}
    </>
  );
}
