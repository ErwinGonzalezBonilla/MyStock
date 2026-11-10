import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// Fechas de la API en UTC sin zona horaria: ver utils/dates.js.
import { parseApiDate } from "../../utils/dates";
import { useMoney } from "../../hooks/useMoney";

// sales: ventas reales de GET /api/sales (las carga Dashboard).
export default function SalesChart({ sales = [] }) {
  const formatCurrency = useMoney();

  // =========================
  // ÚLTIMOS 30 DÍAS
  // =========================

  const today = new Date();

  const data = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);

    date.setHours(0, 0, 0, 0);
    date.setDate(
      today.getDate() - i
    );

    const daySales = sales.filter(
      (sale) => {
        if (!sale.date) {
          return false;
        }

        const saleDate =
          parseApiDate(sale.date);

        if (!saleDate) {
          return false;
        }

        return (
          saleDate.getDate() ===
            date.getDate() &&
          saleDate.getMonth() ===
            date.getMonth() &&
          saleDate.getFullYear() ===
            date.getFullYear()
        );
      }
    );

    const total = daySales.reduce(
      (sum, sale) =>
        sum +
        (Number(sale.total) || 0),
      0
    );

    data.push({
      date: date.toLocaleDateString(
        "es-ES",
        {
          day: "2-digit",
          month: "2-digit",
        }
      ),
      sales: Number(
        total.toFixed(2)
      ),
    });
  }

  return (
    <ResponsiveContainer
      width="100%"
      height={250}
    >
      <LineChart data={data}>

        <CartesianGrid
          strokeDasharray="3 3"
        />

        <XAxis
          dataKey="date"
        />

        <YAxis
          tickFormatter={(value) =>
            formatCurrency(value, { decimals: 0 })
          }
        />

        <Tooltip
          formatter={(value) =>
            formatCurrency(value)
          }
          labelFormatter={(label) =>
            `Fecha: ${label}`
          }
        />

        <Line
          type="monotone"
          dataKey="sales"
          stroke="#0D6EFD"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />

      </LineChart>
    </ResponsiveContainer>
  );
}