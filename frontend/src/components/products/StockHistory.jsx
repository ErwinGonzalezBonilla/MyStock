import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  RotateCcw,
  Package,
  TrendingUp,
} from "lucide-react";

export default function StockHistory({ movements = [] }) {
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

  const uniqueProducts = useMemo(() => {
    return [
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
  }, [movements]);

  const filteredMovements = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    return [...movements]
      .filter((movement) => {
        const matchesSearch =
          !searchTerm ||
          movement.productName
            ?.toLowerCase()
            .includes(searchTerm) ||
          movement.sku
            ?.toLowerCase()
            .includes(searchTerm) ||
          movement.barcode
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
          String(movement.productId) ===
            String(productFilter);

        return (
          matchesSearch &&
          matchesType &&
          matchesProduct
        );
      })
      .sort((a, b) => {
        return (
          new Date(b.date || 0) -
          new Date(a.date || 0)
        );
      });
  }, [
    movements,
    search,
    typeFilter,
    productFilter,
  ]);

  const totalEntries = filteredMovements
    .filter(
      (movement) => movement.type === "entrada"
    )
    .reduce(
      (total, movement) =>
        total + Number(movement.quantity || 0),
      0
    );

  const totalExits = filteredMovements
    .filter(
      (movement) => movement.type === "salida"
    )
    .reduce(
      (total, movement) =>
        total + Number(movement.quantity || 0),
      0
    );

  const netBalance = totalEntries - totalExits;

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

      {/* RESUMEN */}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="border rounded p-3 h-100">
            <div className="d-flex align-items-center mb-2">
              <ArrowDownToLine
                size={18}
                className="me-2 text-success"
              />

              <span className="text-muted small">
                Unidades entradas
              </span>
            </div>

            <div className="fs-4 fw-bold text-success">
              +{totalEntries}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="border rounded p-3 h-100">
            <div className="d-flex align-items-center mb-2">
              <ArrowUpFromLine
                size={18}
                className="me-2 text-danger"
              />

              <span className="text-muted small">
                Unidades salidas
              </span>
            </div>

            <div className="fs-4 fw-bold text-danger">
              -{totalExits}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="border rounded p-3 h-100">
            <div className="d-flex align-items-center mb-2">
              <TrendingUp
                size={18}
                className="me-2"
              />

              <span className="text-muted small">
                Balance neto
              </span>
            </div>

            <div
              className={`fs-4 fw-bold ${
                netBalance >= 0
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {netBalance > 0 ? "+" : ""}
              {netBalance}
            </div>
          </div>
        </div>
      </div>

      {/* FILTROS */}

      <div className="row g-3 mb-4">
        {/* BUSCAR */}

        <div className="col-md-5">
          <label className="form-label fw-semibold">
            Buscar
          </label>

          <div className="input-group">
            <span className="input-group-text">
              <Search size={17} />
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Producto, SKU, código de barras o motivo..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>
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
            <RotateCcw size={16} className="me-2" />
            Limpiar
          </button>
        </div>
      </div>

      {/* RESULTADOS */}

      {movements.length === 0 ? (
        <div className="text-center text-muted py-5">
          <Package size={42} className="mb-3" />

          <p className="mb-0">
            Todavía no hay movimientos registrados.
          </p>
        </div>
      ) : filteredMovements.length === 0 ? (
        <div className="text-center text-muted py-5">
          <Search size={42} className="mb-3" />

          <p className="mb-2">
            No encontramos movimientos con estos filtros.
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
                    <td>
                      <small>
                        {formatDate(
                          movement.date
                        )}
                      </small>
                    </td>

                    <td className="fw-semibold">
                      {movement.productName}
                    </td>

                    <td>
                      <span className="badge bg-dark">
                        {movement.sku ||
                          "Sin SKU"}
                      </span>
                    </td>

                    <td>
                      {movement.type ===
                      "entrada" ? (
                        <span className="badge bg-success d-inline-flex align-items-center">
                          <ArrowDownToLine
                            size={14}
                            className="me-1"
                          />
                          Entrada
                        </span>
                      ) : (
                        <span className="badge bg-danger d-inline-flex align-items-center">
                          <ArrowUpFromLine
                            size={14}
                            className="me-1"
                          />
                          Salida
                        </span>
                      )}
                    </td>

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

                    <td>
                      <strong>
                        {movement.resultingStock}
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