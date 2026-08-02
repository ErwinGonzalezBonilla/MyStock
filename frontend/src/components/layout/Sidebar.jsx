const menuItems = [
  "Dashboard",
  "Productos",
  "Inventario",
  "Ventas",
  "Compras",
  "Clientes",
  "Proveedores",
  "Reportes",
  "IA Assistant",
  "Configuración",
];

export default function Sidebar() {
  return (
    <aside
      className="bg-white border-end"
      style={{
        width: "260px",
        minHeight: "100vh",
      }}
    >
      <div className="p-4">

        <h3 className="fw-bold text-primary">
          📦 MyStock
        </h3>

        <hr />

        <ul className="nav flex-column">

          {menuItems.map((item) => (

            <li key={item} className="nav-item mb-2">

              <button
                className="btn btn-light w-100 text-start"
              >
                {item}
              </button>

            </li>

          ))}

        </ul>

      </div>
    </aside>
  );
}