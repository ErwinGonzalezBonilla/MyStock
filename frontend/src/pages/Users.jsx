import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Power,
  Search,
  UserCog,
  X,
} from "lucide-react";

import { API_URL, apiFetch } from "../services/api";
import PasswordInput from "../components/common/PasswordInput";
import { useAuth } from "../context/AuthContext";
import { ROLE_LABELS } from "../constants/roles";
import { formatDate } from "../utils/dates";

// =========================================================
// USUARIOS DE LA EMPRESA
// =========================================================
// Solo para administradores (ruta protegida en routes/index.jsx;
// la seguridad real está en el backend: /api/users es solo ADMIN).
//
// Los usuarios no se eliminan: se desactivan, para no perder
// quién hizo cada venta o movimiento en el futuro.
// =========================================================

const ROLE_OPTIONS = [
  {
    value: "manager",
    description: "Productos, stock, compras y proveedores.",
  },
  {
    value: "cashier",
    description: "Ventas y clientes.",
  },
  {
    value: "employee",
    description: "Solo consulta.",
  },
  {
    value: "administrator",
    description: "Acceso total, incluida la gestión de usuarios.",
  },
];

const ROLE_BADGES = {
  administrator: "bg-dark",
  manager: "bg-primary",
  cashier: "bg-info text-dark",
  employee: "bg-secondary",
};

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "cashier",
};

export default function Users() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // =========================
  // CARGAR
  // =========================

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      try {
        const response = await apiFetch(`${API_URL}/api/users`);

        if (!response.ok) {
          throw new Error("No se pudieron cargar los usuarios");
        }

        const data = await response.json();

        if (!cancelled) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No se pudieron cargar los usuarios");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    const sorted = [...users].sort((a, b) =>
      // Activos primero, luego por nombre.
      a.isActive === b.isActive
        ? a.name.localeCompare(b.name, "es")
        : a.isActive
        ? -1
        : 1
    );

    if (!term) {
      return sorted;
    }

    return sorted.filter((user) =>
      [user.name, user.email, ROLE_LABELS[user.role]]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [users, search]);

  const activeCount = users.filter((user) => user.isActive).length;

  const replaceUser = (updated) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updated.id ? updated : user))
    );
  };

  // =========================
  // FORMULARIO
  // =========================

  const openCreateForm = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const isSelf = (user) => user && currentUser && user.id === currentUser.id;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const isEditing = Boolean(editingUser);

    if (!isEditing && form.password.length < 8) {
      setFormError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (isEditing && form.password && form.password.length < 8) {
      setFormError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
    };

    // El backend no deja que el administrador se quite su propio rol.
    if (!isEditing || !isSelf(editingUser)) {
      payload.role = form.role;
    }

    // Al editar, contraseña vacía = no cambiarla.
    if (form.password) {
      payload.password = form.password;
    }

    try {
      setSaving(true);
      setFormError("");

      const response = await apiFetch(
        isEditing
          ? `${API_URL}/api/users/${editingUser.id}`
          : `${API_URL}/api/users`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo guardar el usuario");
      }

      if (isEditing) {
        replaceUser(data);
        setMessage(`Usuario ${data.name} actualizado.`);
      } else {
        setUsers((prev) => [data, ...prev]);
        setMessage(`Usuario ${data.name} creado. Ya puede iniciar sesión.`);
      }

      setSaving(false);
      setShowForm(false);
      setEditingUser(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err.message || "No se pudo guardar el usuario");
      setSaving(false);
    }
  };

  // =========================
  // ACTIVAR / DESACTIVAR
  // =========================

  const toggleActive = async (user) => {
    const activate = !user.isActive;

    if (
      !activate &&
      !window.confirm(
        `¿Desactivar a ${user.name}? No podrá iniciar sesión y, ` +
          "si tiene una sesión abierta, se cerrará en su próxima acción."
      )
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await apiFetch(`${API_URL}/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: activate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo actualizar el usuario");
      }

      replaceUser(data);
      setMessage(
        activate
          ? `${data.name} vuelve a estar activo.`
          : `${data.name} ha sido desactivado.`
      );
    } catch (err) {
      setError(err.message || "No se pudo actualizar el usuario");
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <UserCog size={26} />
            <h1 className="h3 mb-0">Usuarios</h1>
          </div>

          <p className="text-muted mb-0">
            Personas que pueden entrar en MyStock con tu empresa.{" "}
            {activeCount} activo{activeCount === 1 ? "" : "s"} de {users.length}.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-dark d-flex align-items-center gap-2"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Nuevo usuario
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search size={18} />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre, email o rol..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">
              Cargando usuarios...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No se encontraron usuarios.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Alta</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={user.isActive ? undefined : "text-muted"}
                    >
                      <td>
                        <div className="fw-semibold">
                          {user.name}
                          {isSelf(user) && (
                            <span className="badge bg-light text-dark border ms-2">
                              Tú
                            </span>
                          )}
                        </div>
                        <small className="text-muted">{user.email}</small>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            ROLE_BADGES[user.role] || "bg-secondary"
                          }`}
                        >
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>

                      <td>
                        {user.isActive ? (
                          <span className="badge bg-success">Activo</span>
                        ) : (
                          <span className="badge bg-secondary">
                            Desactivado
                          </span>
                        )}
                      </td>

                      <td>{formatDate(user.createdAt, "—")}</td>

                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            title="Editar usuario"
                            onClick={() => openEditForm(user)}
                          >
                            <Pencil size={16} />
                          </button>

                          {/* El backend no permite desactivarse a uno mismo. */}
                          {!isSelf(user) && (
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                user.isActive
                                  ? "btn-outline-danger"
                                  : "btn-outline-success"
                              }`}
                              title={
                                user.isActive
                                  ? "Desactivar usuario"
                                  : "Reactivar usuario"
                              }
                              onClick={() => toggleActive(user)}
                            >
                              <Power size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? "Editar usuario" : "Nuevo usuario"}
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  onClick={closeForm}
                  disabled={saving}
                  aria-label="Cerrar"
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {formError && (
                    <div className="alert alert-danger">{formError}</div>
                  )}

                  <div className="mb-3">
                    <label className="form-label" htmlFor="user-name">
                      Nombre *
                    </label>
                    <input
                      id="user-name"
                      type="text"
                      name="name"
                      className="form-control"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="user-email">
                      Email *
                    </label>
                    <input
                      id="user-email"
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      autoComplete="off"
                      required
                    />
                    <div className="form-text">
                      Es el usuario con el que iniciará sesión.
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="user-password">
                      {editingUser ? "Nueva contraseña" : "Contraseña *"}
                    </label>
                    <PasswordInput
                      id="user-password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      minLength={8}
                      required={!editingUser}
                    />
                    <div className="form-text">
                      {editingUser
                        ? "Déjala vacía para no cambiarla. Mínimo 8 caracteres."
                        : "Mínimo 8 caracteres. Compártela con el usuario de forma segura."}
                    </div>
                  </div>

                  <div className="mb-1">
                    <label className="form-label" htmlFor="user-role">
                      Rol *
                    </label>
                    <select
                      id="user-role"
                      name="role"
                      className="form-select"
                      value={form.role}
                      onChange={handleChange}
                      disabled={isSelf(editingUser)}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {ROLE_LABELS[option.value]}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      {isSelf(editingUser)
                        ? "No puedes cambiar tu propio rol."
                        : ROLE_OPTIONS.find((o) => o.value === form.role)
                            ?.description}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light d-flex align-items-center gap-2"
                    onClick={closeForm}
                    disabled={saving}
                  >
                    <X size={17} />
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-dark"
                    disabled={saving}
                  >
                    {saving
                      ? "Guardando..."
                      : editingUser
                      ? "Guardar cambios"
                      : "Crear usuario"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
