import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Campo de contraseña con un botón para mostrarla u ocultarla.
 * Acepta las mismas props que un <input>; el `type` lo gestiona el componente.
 */
export default function PasswordInput({ id, className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  const label = visible ? "Ocultar contraseña" : "Mostrar contraseña";
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="password-input">
      <input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        className={`form-control ${className}`.trim()}
      />

      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((current) => !current)}
        aria-label={label}
        aria-controls={id}
        title={label}
      >
        <Icon size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
