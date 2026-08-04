import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Company from "../pages/Company";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/company" element={<Company />} />
    </Routes>
  );
}