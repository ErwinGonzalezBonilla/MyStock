import { Navigate, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Company from "../pages/Company";
import Products from "../pages/Products";
import Sales from "../pages/Sales";
import Clients from "../pages/Clients";
import Suppliers from "../pages/Suppliers";
import Purchases from "../pages/Purchases";
import { useAuth } from "../context/AuthContext";

// Evita que un rol sin permiso entre escribiendo la URL.
// La seguridad real está en el backend; esto es solo UX.
function RequireRole({ roles, children }) {
  const { hasRole } = useAuth();

  if (!hasRole(...roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

const ADMIN_MANAGER = ["administrator", "manager"];

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/company" element={<Company />} />
      <Route path="/products" element={<Products />} />
      <Route path="/sales" element={<Sales />} />
      <Route path="/clients" element={<Clients />} />

      <Route
        path="/suppliers"
        element={
          <RequireRole roles={ADMIN_MANAGER}>
            <Suppliers />
          </RequireRole>
        }
      />

      <Route
        path="/purchases"
        element={
          <RequireRole roles={ADMIN_MANAGER}>
            <Purchases />
          </RequireRole>
        }
      />

      {/* Tras iniciar sesión, /login y /register llevan al dashboard. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
