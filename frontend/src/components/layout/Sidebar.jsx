import logo from "../../assets/images/mystock-logo.png";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
  },
  {
    name: "Empresa",
    path: "/company",
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
    path: "/clients",
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

        {/* LOGO */}

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

        {/* MENÚ */}

        <ul className="nav flex-column">

          {menuItems.map((item) => (

            <li
              key={item.path}
              className="nav-item mb-2"
            >

              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `btn w-100 text-start ${
                    isActive
                      ? "btn-primary"
                      : "btn-light"
                  }`
                }
              >
                {item.name}
              </NavLink>

            </li>

          ))}

        </ul>

      </div>
    </aside>
  );
}