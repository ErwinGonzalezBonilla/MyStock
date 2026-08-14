import { useState } from "react";

export default function StockHistory({ movements }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [productFilter, setProductFilter] = useState("todos");

  const formatDate = (date) => {
    if (!date) {
      return "Sin fecha";
    }

    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const uniqueProducts = [
    ...new Map(
      movements.map((movement) => [
        movement.productId,
        {
          id: movement.productId,
          name: movement.productName,
        },
      ])
    ).values(),
  ];

  const filteredMovements = movements.filter((movement) => {
    const searchTerm = search
      .toLowerCase()
      .trim();

    const matchesSearch =
      !searchTerm ||
      movement.productName
        ?.toLowerCase()
        .includes(searchTerm) ||
      movement.sku
        ?.toLowerCase()
        .includes(searchTerm) ||
      movement.reason
        ?.toLowerCase()
        .includes(searchTerm);

    const matchesType =
      typeFilter === "todos" ||
      movement.type === typeFilter;

    const matchesProduct =
      productFilter === "todos" ||
      movement.productId === productFilter;

    return (
      matchesSearch &&
      matchesType &&
      matchesProduct
    );
  });

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("todos");
    setProductFilter("todos");
  };

  const filtersActive =
    search !== "" ||
    typeFilter !== "todos" ||
    productFilter !== "todos";

  return (
    <div className="stat-card mt-4">

      {/* CABECERA */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h4 className="mb-1">
            Historial de movimientos
          </h4>

          <small className="text-muted">
            Control de entradas y salidas del inventario
          </small>
        </div>

        <span className="badge bg-dark">
          {filteredMovements.length} movimientos
        </span>

      </div>

      {/* FILTROS */}

      <div className="row g-3 mb-4">

        {/* BUSCAR */}

        <div className="col-md-5">

          <label className="form-label fw-semibold">
            Buscar
          </label>

          <input
            type="text"
            className="form-control"
            placeholder="🔍 Producto, SKU o motivo..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        {/* PRODUCTO */}

        <div className="col-md-3">

          <label className="form-label fw-semibold">
            Producto
          </label>

          <select
            className="form-select"
            value={productFilter}
            onChange={(e) =>
              setProductFilter(e.target.value)
            }
          >

            <option value="todos">
              Todos los productos
            </option>

            {uniqueProducts.map((product) => (

              <option
                key={product.id}
                value={product.id}
              >
                {product.name}
              </option>

            ))}

          </select>

        </div>

        {/* TIPO */}

        <div className="col-md-2">

          <label className="form-label fw-semibold">
            Movimiento
          </label>

          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value)
            }
          >

            <option value="todos">
              Todos
            </option>

            <option value="entrada">
              Entradas
            </option>

            <option value="salida">
              Salidas
            </option>

          </select>

        </div>

        {/* LIMPIAR */}

        <div className="col-md-2 d-flex align-items-end">

          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={clearFilters}
            disabled={!filtersActive}
          >
            🔄 Limpiar
          </button>

        </div>

      </div>

      {/* RESULTADOS */}

      {movements.length === 0 ? (

        <div className="text-center text-muted py-4">

          <div className="fs-1 mb-2">
            📦
          </div>

          <p className="mb-0">
            Todavía no hay movimientos registrados.
          </p>

        </div>

      ) : filteredMovements.length === 0 ? (

        <div className="text-center text-muted py-4">

          <div className="fs-1 mb-2">
            🔍
          </div>

          <p className="mb-2">
            No encontramos movimientos.
          </p>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>

        </div>

      ) : (

        <div className="table-responsive">

          <table className="table table-hover align-middle">

            <thead className="table-light">

              <tr>

                <th>Fecha</th>

                <th>Producto</th>

                <th>SKU</th>

                <th>Tipo</th>

                <th>Cantidad</th>

                <th>Motivo</th>

                <th>Stock resultante</th>

              </tr>

            </thead>

            <tbody>

              {filteredMovements.map(
                (movement) => (

                  <tr key={movement.id}>

                    {/* FECHA */}

                    <td>
                      <small>
                        {formatDate(
                          movement.date
                        )}
                      </small>
                    </td>

                    {/* PRODUCTO */}

                    <td className="fw-semibold">
                      {movement.productName}
                    </td>

                    {/* SKU */}

                    <td>

                      <span className="badge bg-dark">
                        {movement.sku ||
                          "Sin SKU"}
                      </span>

                    </td>

                    {/* TIPO */}

                    <td>

                      {movement.type ===
                      "entrada" ? (

                        <span className="badge bg-success">
                          ↑ Entrada
                        </span>

                      ) : (

                        <span className="badge bg-danger">
                          ↓ Salida
                        </span>

                      )}

                    </td>

                    {/* CANTIDAD */}

                    <td>

                      <strong
                        className={
                          movement.type ===
                          "entrada"
                            ? "text-success"
                            : "text-danger"
                        }
                      >

                        {movement.type ===
                        "entrada"
                          ? "+"
                          : "-"}
                        {movement.quantity}

                      </strong>

                    </td>

                    {/* MOTIVO */}

                    <td>

                      <span
                        className={
                          movement.reason
                            ? "badge bg-light text-dark border"
                            : "text-muted"
                        }
                      >
                        {movement.reason ||
                          "Sin especificar"}
                      </span>

                    </td>

                    {/* STOCK */}

                    <td>

                      <strong>
                        {
                          movement.resultingStock
                        }
                      </strong>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}