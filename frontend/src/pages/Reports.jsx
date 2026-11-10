import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Table2 } from "lucide-react";

import { API_URL, apiFetch } from "../services/api";
import { useMoney } from "../hooks/useMoney";
import { localDayKey, parseApiDate } from "../utils/dates";

// =========================================================
// INFORMES
// =========================================================
// Calculados en el navegador a partir de GET /api/sales y
// GET /api/products (datos reales de la empresa).
//
// - Ventas por día del periodo elegido.
// - Productos más vendidos del periodo (por unidades).
// - Valor actual del stock (productos activos).
// =========================================================

const PERIODS = [
  { days: 7, label: "7 días" },
  { days: 30, label: "30 días" },
  { days: 90, label: "90 días" },
];

const TOP_LIMIT = 10;

// Color de la serie: primario de la app (validado para fondo claro).
const SERIES_COLOR = "#0D6EFD";
const GRID_COLOR = "#e9ecef";
const AXIS_TEXT = "#6c757d";

function buildDays(days) {
  const result = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - i);

    result.push({
      key: localDayKey(date),
      label: date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
      }),
      longLabel: date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
      revenue: 0,
      count: 0,
    });
  }

  return result;
}

function StatTile({ label, value, hint }) {
  return (
    <div className="stat-card h-100">
      <div className="text-muted small">{label}</div>
      <div className="fs-3 fw-bold">{value}</div>
      {hint && <div className="small text-muted">{hint}</div>}
    </div>
  );
}

export default function Reports() {

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [periodDays, setPeriodDays] = useState(30);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [salesResponse, productsResponse] = await Promise.all([
          apiFetch(`${API_URL}/api/sales`),
          apiFetch(`${API_URL}/api/products`),
        ]);

        if (!salesResponse.ok || !productsResponse.ok) {
          throw new Error("No se pudieron cargar los datos de los informes");
        }

        const [salesData, productsData] = await Promise.all([
          salesResponse.json(),
          productsResponse.json(),
        ]);

        if (!cancelled) {
          setSales(Array.isArray(salesData) ? salesData : []);
          setProducts(Array.isArray(productsData) ? productsData : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No se pudieron cargar los informes");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatMoney = useMoney();

  // =========================
  // VENTAS DEL PERIODO
  // =========================

  const { days, periodSales } = useMemo(() => {
    const dayList = buildDays(periodDays);
    const byKey = new Map(dayList.map((day) => [day.key, day]));
    const inPeriod = [];

    sales.forEach((sale) => {
      const day = byKey.get(localDayKey(sale.date));

      if (!day) {
        return;
      }

      day.revenue += Number(sale.total) || 0;
      day.count += 1;
      inPeriod.push(sale);
    });

    dayList.forEach((day) => {
      day.revenue = Math.round(day.revenue * 100) / 100;
    });

    return { days: dayList, periodSales: inPeriod };
  }, [sales, periodDays]);

  const periodRevenue = periodSales.reduce(
    (sum, sale) => sum + (Number(sale.total) || 0),
    0
  );

  const averageTicket = periodSales.length
    ? periodRevenue / periodSales.length
    : 0;

  const bestDay = days.reduce(
    (best, day) => (day.revenue > (best?.revenue ?? 0) ? day : best),
    null
  );

  // =========================
  // PRODUCTOS MÁS VENDIDOS
  // =========================

  const topProducts = useMemo(() => {
    const totals = new Map();

    periodSales.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        const current = totals.get(item.productId) || {
          productId: item.productId,
          name: item.productName || `Producto ${item.productId}`,
          sku: item.sku,
          units: 0,
          revenue: 0,
        };

        current.units += Number(item.quantity) || 0;
        current.revenue += Number(item.subtotal) || 0;
        totals.set(item.productId, current);
      });
    });

    return [...totals.values()]
      .sort((a, b) => b.units - a.units || b.revenue - a.revenue)
      .slice(0, TOP_LIMIT);
  }, [periodSales]);

  const maxUnits = topProducts[0]?.units || 0;

  // =========================
  // VALOR DEL STOCK (actual)
  // =========================

  const stockValue = useMemo(
    () =>
      products.reduce(
        (result, product) => {
          const stock = Math.max(Number(product.stock) || 0, 0);

          result.units += stock;
          result.cost += stock * (Number(product.buyPrice) || 0);
          result.retail += stock * (Number(product.sellPrice) || 0);

          return result;
        },
        { units: 0, cost: 0, retail: 0 }
      ),
    [products]
  );

  const lastSaleDate = sales.length
    ? parseApiDate(sales[0].date)
    : null;

  // =========================
  // RENDER
  // =========================

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <BarChart3 size={26} />
            <h1 className="h3 mb-0">Informes</h1>
          </div>

          <p className="text-muted mb-0">
            Ventas, productos más vendidos y valor del stock de tu empresa.
          </p>
        </div>

        <div className="btn-group" role="group" aria-label="Periodo">
          {PERIODS.map((period) => (
            <button
              key={period.days}
              type="button"
              className={`btn ${
                periodDays === period.days ? "btn-dark" : "btn-outline-secondary"
              }`}
              onClick={() => setPeriodDays(period.days)}
              aria-pressed={periodDays === period.days}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5 text-muted">Cargando informes...</div>
      ) : (
        <>
          {/* RESUMEN DEL PERIODO */}

          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <StatTile
                label={`Ingresos (${periodDays} días)`}
                value={formatMoney(periodRevenue)}
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatTile label="Ventas" value={periodSales.length} />
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatTile
                label="Ticket medio"
                value={formatMoney(averageTicket)}
              />
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatTile
                label="Mejor día"
                value={bestDay ? formatMoney(bestDay.revenue) : "—"}
                hint={bestDay ? bestDay.longLabel : "Sin ventas en el periodo"}
              />
            </div>
          </div>

          {/* VENTAS POR DÍA */}

          <div className="stat-card mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
              <div>
                <h4 className="mb-1">Ventas por día</h4>
                <small className="text-muted">
                  Ingresos diarios de los últimos {periodDays} días
                  {lastSaleDate &&
                    ` · última venta: ${lastSaleDate.toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`}
                </small>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={() => setShowTable((value) => !value)}
                aria-pressed={showTable}
              >
                {showTable ? <BarChart3 size={15} /> : <Table2 size={15} />}
                {showTable ? "Ver gráfico" : "Ver tabla"}
              </button>
            </div>

            {showTable ? (
              <div className="table-responsive" style={{ maxHeight: 320 }}>
                <table className="table table-sm align-middle mb-0">
                  <thead className="sticky-top bg-white">
                    <tr>
                      <th>Día</th>
                      <th className="text-end">Ventas</th>
                      <th className="text-end">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...days].reverse().map((day) => (
                      <tr key={day.key}>
                        <td className="text-capitalize">{day.longLabel}</td>
                        <td className="text-end">{day.count}</td>
                        <td className="text-end">{formatMoney(day.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={GRID_COLOR} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={{ stroke: GRID_COLOR }}
                    tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    minTickGap={16}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat("es-ES", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(value)
                    }
                    width={48}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(13, 110, 253, 0.06)" }}
                    formatter={(value, _name, item) => [
                      `${formatMoney(value)} · ${item.payload.count} venta${
                        item.payload.count === 1 ? "" : "s"
                      }`,
                      "Ingresos",
                    ]}
                    labelFormatter={(_label, payload) =>
                      payload?.[0]?.payload.longLabel ?? ""
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    name="Ingresos"
                    fill={SERIES_COLOR}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="row g-4">
            {/* MÁS VENDIDOS */}

            <div className="col-lg-7">
              <div className="stat-card h-100">
                <h4 className="mb-1">Productos más vendidos</h4>
                <small className="text-muted d-block mb-3">
                  Top {TOP_LIMIT} por unidades vendidas en los últimos{" "}
                  {periodDays} días
                </small>

                {topProducts.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No hay ventas en este periodo.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th style={{ width: 36 }}>#</th>
                          <th>Producto</th>
                          <th style={{ width: "30%" }}>Unidades</th>
                          <th className="text-end">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((product, index) => (
                          <tr key={product.productId}>
                            <td className="text-muted">{index + 1}</td>
                            <td>
                              <div className="fw-semibold">{product.name}</div>
                              {product.sku && (
                                <small className="text-muted">{product.sku}</small>
                              )}
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="flex-grow-1 rounded-pill"
                                  style={{ background: GRID_COLOR, height: 8 }}
                                  aria-hidden="true"
                                >
                                  <div
                                    className="rounded-pill"
                                    style={{
                                      background: SERIES_COLOR,
                                      height: 8,
                                      width: `${
                                        maxUnits ? (product.units / maxUnits) * 100 : 0
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="fw-semibold text-end" style={{ minWidth: 32 }}>
                                  {product.units}
                                </span>
                              </div>
                            </td>
                            <td className="text-end">
                              {formatMoney(product.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* VALOR DEL STOCK */}

            <div className="col-lg-5">
              <div className="stat-card h-100">
                <h4 className="mb-1">Valor del stock</h4>
                <small className="text-muted d-block mb-3">
                  Situación actual de los productos activos
                </small>

                <div className="row g-3">
                  <div className="col-sm-6 col-lg-12 col-xl-6">
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">A precio de coste</div>
                      <div className="fs-4 fw-bold">
                        {formatMoney(stockValue.cost)}
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-12 col-xl-6">
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">A precio de venta</div>
                      <div className="fs-4 fw-bold">
                        {formatMoney(stockValue.retail)}
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-12 col-xl-6">
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Margen potencial</div>
                      <div className="fs-4 fw-bold">
                        {formatMoney(stockValue.retail - stockValue.cost)}
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-12 col-xl-6">
                    <div className="border rounded p-3 h-100">
                      <div className="text-muted small">Unidades</div>
                      <div className="fs-4 fw-bold">
                        {stockValue.units.toLocaleString("es-ES")}
                      </div>
                      <div className="small text-muted">
                        en {products.length} producto
                        {products.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
