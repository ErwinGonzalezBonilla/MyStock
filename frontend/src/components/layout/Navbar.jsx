import { LogOut } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../constants/roles";

export default function Navbar() {
  const { user, company, logout } = useAuth();

  return (
    <nav
      className="navbar bg-white border-bottom px-4"
      style={{ height: "70px" }}
    >
      <div className="container-fluid">

        <div className="fw-semibold">
          {company?.name}
        </div>

        <div className="d-flex align-items-center gap-3">

          <div className="text-end lh-sm">
            <div className="fw-semibold">
              {user?.name}
            </div>
            <small style={{ color: "var(--text-secondary)" }}>
              {ROLE_LABELS[user?.role] || user?.role}
            </small>
          </div>

          <button
            type="button"
            className="btn btn-light d-flex align-items-center gap-2"
            onClick={logout}
            title="Cerrar sesión"
          >
            <LogOut size={18} />
            <span className="d-none d-md-inline">Salir</span>
          </button>

        </div>

      </div>
    </nav>
  );
}
