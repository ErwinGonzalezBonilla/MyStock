import { useState } from "react";

import ClientForm from "../components/clients/ClientForm";
import ClientDetailsModal from "../components/clients/ClientDetailsModal";
import StatCard from "../components/common/StatCard";

const EMPTY_CLIENT = {
  id: "",
  name: "",
  taxId: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
};

export default function Clients() {
  const [client, setClient] =
    useState(EMPTY_CLIENT);

  const [clients, setClients] =
    useState(() => {
      const savedClients =
        localStorage.getItem("clients");

      if (!savedClients) {
        return [];
      }

      try {
        return JSON.parse(savedClients);
      } catch (error) {
        console.error(
          "Error al cargar clientes:",
          error
        );

        return [];
      }
    });

  // =========================
  // VENTAS
  // =========================

  const [sales] = useState(() => {
    const savedSales =
      localStorage.getItem("sales");

    if (!savedSales) {
      return [];
    }

    try {
      return JSON.parse(savedSales);
    } catch (error) {
      console.error(
        "Error al cargar ventas:",
        error
      );

      return [];
    }
  });

  const [message, setMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [selectedClient, setSelectedClient] =
    useState(null);

  // =========================
  // FORMULARIO
  // =========================

  const handleChange = (e) => {
    setClient((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
  };

  // =========================
  // GUARDAR / EDITAR
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    // EDITAR CLIENTE

    if (editingId) {
      const updatedClients =
        clients.map((item) =>
          item.id === editingId
            ? {
                ...client,
                id: editingId,
                createdAt:
                  item.createdAt,
                updatedAt:
                  new Date().toISOString(),
              }
            : item
        );

      localStorage.setItem(
        "clients",
        JSON.stringify(updatedClients)
      );

      setClients(updatedClients);

      setClient(EMPTY_CLIENT);

      setEditingId(null);

      setMessage(
        "Cliente actualizado correctamente."
      );

      return;
    }

    // CREAR CLIENTE

    const newClient = {
      ...client,
      id: crypto.randomUUID(),
      createdAt:
        new Date().toISOString(),
    };

    const updatedClients = [
      ...clients,
      newClient,
    ];

    localStorage.setItem(
      "clients",
      JSON.stringify(updatedClients)
    );

    setClients(updatedClients);

    setClient(EMPTY_CLIENT);

    setMessage(
      "Cliente guardado correctamente."
    );
  };

  // =========================
  // EDITAR
  // =========================

  const handleEdit = (id) => {
    const clientToEdit =
      clients.find(
        (item) => item.id === id
      );

    if (!clientToEdit) {
      return;
    }

    setClient(clientToEdit);

    setEditingId(id);

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CANCELAR EDICIÓN
  // =========================

  const handleCancelEdit = () => {
    setClient(EMPTY_CLIENT);

    setEditingId(null);

    setMessage("");
  };

  // =========================
  // ELIMINAR
  // =========================

  const handleDelete = (id) => {
    const clientToDelete =
      clients.find(
        (item) => item.id === id
      );

    if (!clientToDelete) {
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar al cliente "${clientToDelete.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const updatedClients =
      clients.filter(
        (item) => item.id !== id
      );

    localStorage.setItem(
      "clients",
      JSON.stringify(updatedClients)
    );

    setClients(updatedClients);

    if (editingId === id) {
      setClient(EMPTY_CLIENT);
      setEditingId(null);
    }

    setMessage(
      "Cliente eliminado correctamente."
    );
  };

  // =========================
  // VER DETALLES
  // =========================

  const handleViewDetails = (id) => {
    const clientToView =
      clients.find(
        (item) => item.id === id
      );

    if (!clientToView) {
      return;
    }

    setSelectedClient(clientToView);
  };

  const handleCloseDetails = () => {
    setSelectedClient(null);
  };

  // =========================
  // BUSCAR
  // =========================

  const searchTerm =
    search.toLowerCase().trim();

  const filteredClients =
    clients.filter((item) => {
      if (!searchTerm) {
        return true;
      }

      return (
        item.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        item.taxId
          ?.toLowerCase()
          .includes(searchTerm) ||
        item.email
          ?.toLowerCase()
          .includes(searchTerm)
      );
    });

  const clearSearch = () => {
    setSearch("");
  };

  // =========================
  // ESTADÍSTICAS
  // =========================

  const totalClients =
    clients.length;

  const clientsWithEmail =
    clients.filter(
      (item) =>
        item.email?.trim()
    ).length;

  const clientsWithPhone =
    clients.filter(
      (item) =>
        item.phone?.trim()
    ).length;

  const newClientsThisMonth =
    clients.filter((item) => {
      if (!item.createdAt) {
        return false;
      }

      const date =
        new Date(item.createdAt);

      const now =
        new Date();

      return (
        date.getMonth() ===
          now.getMonth() &&
        date.getFullYear() ===
          now.getFullYear()
      );
    }).length;

  return (
    <div className="container-fluid p-4">

      <h2 className="fw-bold mb-4">
        Clientes
      </h2>

      {/* =========================
          MENSAJE
      ========================= */}

      {message && (
        <div
          className={`alert ${
            message.includes(
              "actualizado"
            )
              ? "alert-primary"
              : message.includes(
                  "eliminado"
                )
              ? "alert-danger"
              : "alert-success"
          }`}
          role="alert"
        >
          {message.includes(
            "actualizado"
          )
            ? "✏️"
            : message.includes(
                "eliminado"
              )
            ? "🗑️"
            : "✅"}{" "}
          {message}
        </div>
      )}

      {/* =========================
          FORMULARIO
      ========================= */}

      <ClientForm
        client={client}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      {editingId && (
        <div className="mb-4">

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={
              handleCancelEdit
            }
          >
            Cancelar edición
          </button>

        </div>
      )}

      {/* =========================
          ESTADÍSTICAS
      ========================= */}

      <div className="row mb-4">

        <div className="col-lg-3 col-md-6 mb-3">

          <StatCard
            title="Total clientes"
            value={totalClients}
            subtitle="Clientes registrados"
          />

        </div>

        <div className="col-lg-3 col-md-6 mb-3">

          <StatCard
            title="Con email"
            value={clientsWithEmail}
            subtitle="Clientes con correo"
          />

        </div>

        <div className="col-lg-3 col-md-6 mb-3">

          <StatCard
            title="Con teléfono"
            value={clientsWithPhone}
            subtitle="Clientes con teléfono"
          />

        </div>

        <div className="col-lg-3 col-md-6 mb-3">

          <StatCard
            title="Nuevos este mes"
            value={newClientsThisMonth}
            subtitle="Registrados este mes"
          />

        </div>

      </div>

      {/* =========================
          LISTA DE CLIENTES
      ========================= */}

      <div className="stat-card">

        <div className="d-flex justify-content-between align-items-center mb-4">

          <div>

            <h4 className="mb-1">
              Lista de clientes
            </h4>

            <small className="text-muted">
              Clientes registrados en MyStock
            </small>

          </div>

          <span className="badge bg-dark">
            {filteredClients.length}{" "}
            {filteredClients.length === 1
              ? "cliente"
              : "clientes"}
          </span>

        </div>

        {/* BUSCADOR */}

        <div className="row mb-4">

          <div className="col-md-8">

            <label className="form-label fw-semibold">
              Buscar cliente
            </label>

            <input
              type="text"
              className="form-control"
              placeholder="🔍 Nombre, DNI/NIF o email..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="col-md-4 d-flex align-items-end">

            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={
                clearSearch
              }
              disabled={!search}
            >
              🔄 Limpiar búsqueda
            </button>

          </div>

        </div>

        {/* =========================
            CONTENIDO
        ========================= */}

        {clients.length === 0 ? (

          <div className="text-center text-muted py-4">

            <div className="fs-1 mb-2">
              👤
            </div>

            <p className="mb-0">
              Todavía no hay clientes registrados.
            </p>

          </div>

        ) : filteredClients.length === 0 ? (

          <div className="text-center text-muted py-4">

            <div className="fs-1 mb-2">
              🔍
            </div>

            <p className="mb-2">
              No encontramos clientes.
            </p>

            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={
                clearSearch
              }
            >
              Limpiar búsqueda
            </button>

          </div>

        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-light">

                <tr>

                  <th>
                    Cliente
                  </th>

                  <th>
                    DNI / NIF
                  </th>

                  <th>
                    Teléfono
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Acciones
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredClients.map(
                  (item) => (

                    <tr
                      key={item.id}
                    >

                      <td>

                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fw-semibold"
                          onClick={() =>
                            handleViewDetails(
                              item.id
                            )
                          }
                        >
                          {item.name}
                        </button>

                      </td>

                      <td>
                        {item.taxId ||
                          "—"}
                      </td>

                      <td>
                        {item.phone ||
                          "—"}
                      </td>

                      <td>
                        {item.email ||
                          "—"}
                      </td>

                      <td>

                        <div className="d-flex gap-2">

                          <button
                            type="button"
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              handleViewDetails(
                                item.id
                              )
                            }
                            title="Ver detalles"
                          >
                            👁️
                          </button>

                          <button
                            type="button"
                            className="btn btn-warning btn-sm"
                            onClick={() =>
                              handleEdit(
                                item.id
                              )
                            }
                            title="Editar cliente"
                          >
                            ✏️
                          </button>

                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                            title="Eliminar cliente"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =========================
          MODAL DETALLES
      ========================= */}

      <ClientDetailsModal
        client={selectedClient}
        sales={sales}
        onClose={
          handleCloseDetails
        }
      />

    </div>
  );
}