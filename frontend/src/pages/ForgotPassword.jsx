import { Link } from "react-router-dom";

import AuthLayout from "../components/auth/AuthLayout";

// Fase 1: sin envío de emails. El administrador de la empresa asigna
// una contraseña nueva desde Usuarios. La recuperación por email está
// en el ROADMAP.
export default function ForgotPassword() {
  return (
    <AuthLayout
      title="¿Olvidaste tu contraseña?"
      subtitle="Te ayudamos a recuperar el acceso."
      footer={<Link to="/login">Volver a iniciar sesión</Link>}
    >
      <div className="alert alert-info mb-0" role="status">
        Contacta con el <strong>administrador de tu empresa</strong> para
        que te asigne una contraseña nueva desde la sección{" "}
        <strong>Usuarios</strong>. Después podrás iniciar sesión con ella.
      </div>
    </AuthLayout>
  );
}
