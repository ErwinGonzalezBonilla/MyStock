import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Truck,
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000";

const emptySupplier = {
  name: "",
  taxId: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
};

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState(emptySupplier);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/suppliers`);

      if (!response.ok) {
        throw new Error("No se pudieron cargar los proveedores");
      }

      const data = await response.json();

      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar proveedores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchSuppliers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/suppliers`);

        if (!response.ok) {
          throw new Error("No se pudieron cargar los proveedores");
        }

        const data = await response.json();

        if (!cancelled) {
          setSuppliers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Error al cargar proveedores");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSuppliers();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return suppliers;
    }

    return suppliers.filter((supplier) =>
      [
        supplier.name,
        supplier.taxId,
        supplier.phone,
        supplier.email,
        supplier.city,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(term)
        )
    );
  }, [suppliers, search]);

  const openCreateForm = () => {
    setEditingSupplier(null);
    setForm(emptySupplier);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (supplier) => {
    setEditingSupplier(supplier);

    setForm({
      name: supplier.name || "",
      taxId: supplier.taxId || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      city: supplier.city || "",
      postalCode: supplier.postalCode || "",
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingSupplier(null);
    setForm(emptySupplier);
    setError("");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("El nombre del proveedor es obligatorio");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingSupplier);

      const response = await fetch(
        isEditing
          ? `${API_URL}/api/suppliers/${editingSupplier.id}`
          : `${API_URL}/api/suppliers`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo guardar el proveedor"
        );
      }

      await loadSuppliers();
      closeForm();
    } catch (err) {
      setError(err.message || "Error al guardar el proveedor");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar a "${supplier.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/suppliers/${supplier.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "No se pudo eliminar el proveedor"
        );
      }

      await loadSuppliers();
    } catch (err) {
      setError(err.message || "Error al eliminar el proveedor");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <Truck size={26} />
            <h1 className="h3 mb-0">Proveedores</h1>
          </div>

          <p className="text-muted mb-0">
            Gestiona tus proveedores y sus datos de contacto.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-dark d-flex align-items-center gap-2"
          onClick={openCreateForm}
        >
          <Plus size={18} />
          Nuevo proveedor
        </button>
      </div>

      {error && !showForm && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

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
                  placeholder="Buscar proveedor..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">
              Cargando proveedores...
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-5">
              <Truck size={42} className="text-muted mb-3" />

              <h5>
                {search
                  ? "No se encontraron proveedores"
                  : "No hay proveedores todavía"}
              </h5>

              <p className="text-muted mb-3">
                {search
                  ? "Prueba con otro término de búsqueda."
                  : "Añade tu primer proveedor para comenzar."}
              </p>

              {!search && (
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={openCreateForm}
                >
                  <Plus size={18} className="me-1" />
                  Añadir proveedor
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Proveedor</th>
                    <th>NIF/CIF</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Ciudad</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>
                        <div className="fw-semibold">
                          {supplier.name}
                        </div>

                        {supplier.address && (
                          <small className="text-muted">
                            {supplier.address}
                          </small>
                        )}
                      </td>

                      <td>{supplier.taxId || "—"}</td>
                      <td>{supplier.phone || "—"}</td>
                      <td>{supplier.email || "—"}</td>
                      <td>
                        {supplier.city || "—"}
                        {supplier.postalCode
                          ? ` · ${supplier.postalCode}`
                          : ""}
                      </td>

                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            title="Editar proveedor"
                            onClick={() => openEditForm(supplier)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Eliminar proveedor"
                            onClick={() => handleDelete(supplier)}
                          >
                            <Trash2 size={16} />
                          </button>
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
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingSupplier
                    ? "Editar proveedor"
                    : "Nuevo proveedor"}
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
                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">
                        Nombre *
                      </label>

                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Nombre del proveedor"
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        NIF / CIF
                      </label>

                      <input
                        type="text"
                        name="taxId"
                        className="form-control"
                        value={form.taxId}
                        onChange={handleChange}
                        placeholder="B12345678"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Teléfono
                      </label>

                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="600 000 000"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="proveedor@email.com"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">
                        Dirección
                      </label>

                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Calle, número..."
                      />
                    </div>

                    <div className="col-md-8">
                      <label className="form-label">
                        Ciudad
                      </label>

                      <input
                        type="text"
                        name="city"
                        className="form-control"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Madrid"
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label">
                        Código postal
                      </label>

                      <input
                        type="text"
                        name="postalCode"
                        className="form-control"
                        value={form.postalCode}
                        onChange={handleChange}
                        placeholder="28001"
                      />
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
                      : editingSupplier
                      ? "Guardar cambios"
                      : "Guardar proveedor"}
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

export default Suppliers;