import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Company from "../pages/Company";
import Products from "../pages/Products";
import Sales from "../pages/Sales";
import Clients from "../pages/Clients";

export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Dashboard />}
      />

      <Route
        path="/company"
        element={<Company />}
      />

      <Route
        path="/products"
        element={<Products />}
      />

      <Route
        path="/sales"
        element={<Sales />}
      />
      <Route
        path="/clients"
        element={<Clients />}
      />
    </Routes>
  );
}