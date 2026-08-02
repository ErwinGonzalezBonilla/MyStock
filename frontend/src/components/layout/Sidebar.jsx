import logo from "../../assets/images/mystock-logo.png";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
  },
  {
    name: "Productos",
    path: "/products",
  },
  {
    name: "Inventario",
    path: "/inventory",
  },
  {
    name: "Ventas",
    path: "/sales",
  },
  {
    name: "Compras",
    path: "/purchases",
  },
  {
    name: "Clientes",
    path: "/customers",
  },
  {
    name: "Proveedores",
    path: "/suppliers",
  },
  {
    name: "Reportes",
    path: "/reports",
  },
  {
    name: "IA Assistant",
    path: "/ai",
  },
  {
    name: "Configuración",
    path: "/settings",
  },
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

        {/* Logo */}
        <div className="d-flex justify-content-center mb-3">
          <img
            src={logo}
            alt="MyStock Logo"
            style={{
              width: "180px",
              height: "auto",
            }}
          />
        </div>

        <hr className="my-3" />

        {/* Menú */}
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item mb-2">
              <button className="btn btn-light w-100 text-start">
                {item.name}
              </button>
            </li>
          ))}
        </ul>

      </div>
    </aside>
  );
}