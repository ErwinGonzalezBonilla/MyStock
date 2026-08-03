import StatCard from "../components/common/StatCard";

export default function Dashboard() {
  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4 fw-bold">Dashboard</h2>

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
    </div>
  );
}