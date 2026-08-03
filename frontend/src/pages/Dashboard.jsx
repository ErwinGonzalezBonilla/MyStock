import StatCard from "../components/common/StatCard";
import SalesChart from "../components/common/SalesChart";

export default function Dashboard() {
  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4 fw-bold">Dashboard</h2>

      {/* KPIs */}
      <div className="row">
        <div className="col-lg-3 col-md-6 mb-4">
          <StatCard
            title="Ventas Hoy"
            value="€12.530"
            subtitle="+15% respecto ayer"
          />
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <StatCard
            title="Productos"
            value="1.245"
            subtitle="34 nuevos este mes"
          />
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <StatCard
            title="Clientes"
            value="583"
            subtitle="+12 nuevos"
          />
        </div>

        <div className="col-lg-3 col-md-6 mb-4">
          <StatCard
            title="Stock Bajo"
            value="12"
            subtitle="Requieren reposición"
          />
        </div>
      </div>

      {/* Segunda fila */}
      <div className="row">
        {/* Gráfico */}
        <div className="col-lg-8">
          <div
            className="stat-card mb-4"
            style={{ minHeight: "350px" }}
          >
            <h4 className="mb-4">
              Ventas últimos 30 días
            </h4>

            <SalesChart />
          </div>
        </div>

        {/* IA */}
        <div className="col-lg-4">
          <div
            className="stat-card"
            style={{ minHeight: "350px" }}
          >
            <h4 className="mb-4">
              🤖 MyStock AI
            </h4>

            <p>Bienvenido a MyStock.</p>

            <p>
              Todavía no tienes suficientes datos para
              generar recomendaciones.
            </p>

            <p>
              Cuando registres productos, compras y ventas,
              comenzaré a analizar tu negocio para ayudarte
              a tomar mejores decisiones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}