import logo from "../../assets/images/mystock-logo.png";
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Package,
  Boxes,
  ShoppingCart,
  ShoppingBag,
  Users,
  Truck,
  BarChart3,
  Sparkles,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Empresa",
    path: "/company",
    icon: Building2,
  },
  {
    name: "Productos",
    path: "/products",
    icon: Package,
  },
  {
    name: "Inventario",
    path: "/inventory",
    icon: Boxes,
  },
  {
    name: "Ventas",
    path: "/sales",
    icon: ShoppingCart,
  },
  {
    name: "Compras",
    path: "/purchases",
    icon: ShoppingBag,
  },
  {
    name: "Clientes",
    path: "/clients",
    icon: Users,
  },
  {
    name: "Proveedores",
    path: "/suppliers",
    icon: Truck,
  },
  {
    name: "Reportes",
    path: "/reports",
    icon: BarChart3,
  },
];

const bottomMenuItems = [
  {
    name: "MyStock AI",
    path: "/ai",
    icon: Sparkles,
  },
  {
    name: "Configuración",
    path: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside
      className="mystock-sidebar"
      style={{
        width: "260px",
        minHeight: "100vh",
      }}
    >
      <div className="mystock-sidebar-inner">

        {/* =========================
            LOGO
        ========================= */}

        <div className="mystock-logo-container">
          <img
            src={logo}
            alt="MyStock Logo"
            className="mystock-logo"
          />
        </div>

        {/* =========================
            MENÚ PRINCIPAL
        ========================= */}

        <div className="mystock-menu-section">

          <div className="mystock-menu-title">
            PRINCIPAL
          </div>

          <nav className="mystock-nav">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `mystock-nav-link ${
                      isActive
                        ? "mystock-nav-link-active"
                        : ""
                    }`
                  }
                >
                  <Icon
                    className="mystock-nav-icon"
                    size={19}
                    strokeWidth={2}
                  />

                  <span>
                    {item.name}
                  </span>
                </NavLink>
              );
            })}

          </nav>
        </div>

        {/* =========================
            MENÚ INFERIOR
        ========================= */}

        <div className="mystock-sidebar-bottom">

          {bottomMenuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `mystock-nav-link ${
                    isActive
                      ? "mystock-nav-link-active"
                      : ""
                  }`
                }
              >
                <Icon
                  className="mystock-nav-icon"
                  size={19}
                  strokeWidth={2}
                />

                <span>
                  {item.name}
                </span>
              </NavLink>
            );
          })}

        </div>

        {/* =========================
            VERSIÓN
        ========================= */}

        <div className="mystock-version">
          MyStock · v1.0
        </div>

      </div>
    </aside>
  );
}