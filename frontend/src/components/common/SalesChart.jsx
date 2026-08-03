import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const data = [
  { day: "Lun", sales: 400 },
  { day: "Mar", sales: 300 },
  { day: "Mié", sales: 700 },
  { day: "Jue", sales: 500 },
  { day: "Vie", sales: 900 },
  { day: "Sáb", sales: 1100 },
  { day: "Dom", sales: 850 },
];

export default function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="day" />

        <YAxis />

        <Tooltip />

        <Line
          type="monotone"
          dataKey="sales"
          stroke="#0D6EFD"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}