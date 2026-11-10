import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  PackageX,
  Search,
} from "lucide-react";

import { API_URL, apiFetch } from "../services/api";
import { useMoney } from "../hooks/useMoney";
import { STOCK_STATUS, getStockStatus } from "../utils/stock";

// =========================================================
// INVENTARIO
// =========================================================
// Vista de consulta del stock actual de los productos activos
// (los archivados no cuentan como inventario).
//
// Estado de cada producto:
//   - Sin stock:  stock = 0
//   - Stock bajo: stock <= stock mínimo del producto
//   - Correcto:   el resto
// =========================================================

// Regla de stock compartida con Dashboard y Productos.
const STATUS = STOCK_STATUS;

export default function Inventory() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await apiFetch(`${API_URL}/api/products`);

        if (!response.ok) {
          throw new Error("No se pudo cargar el inventario");
        }

        const data = await response.json();

        if (!cancelled) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No se pudo cargar el inventario");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatMoney = useMoney();

  const categories = useMemo(
    () =>
      [...new Set(products.map((p) => p.category).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b, "es")
      ),
    [products]
  );

  // Categoría primero: los contadores de estado reflejan la
  // categoría elegida.
  const productsInCategory = useMemo(
    () =>
      category === "all"
        ? products
        : category === "none"
        ? products.filter((p) => !p.category)
        : products.filter((p) => p.category === category),
    [products, category]
  );

  const counts = useMemo(() => {
    const result = { out: 0, low: 0, ok: 0, units: 0 };

    productsInCategory.forEach((product) => {
      result[getStockStatus(product)] += 1;
      result.units += Number(product.stock) || 0;
    });

    return result;
  }, [productsInCategory]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return productsInCategory
      .filter((product) => status === "all" || getStockStatus(product) === status)
      .filter(
        (product) =>
          !term ||
          [product.name, product.sku, product.barcode]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(term))
      )
      .sort((a, b) => {
        // Lo que necesita atención primero.
        const order = { out: 0, low: 1, ok: 2 };
        const byStatus = order[getStockStatus(a)] - order[getStockStatus(b)];

        return byStatus || a.name.localeCompare(b.name, "es");
      });
  }, [productsInCategory, status, search]);

  const hasProductsWithoutCategory = products.some((p) => !p.category);

  const statusButtons = [
    { value: "all", label: "Todos", count: productsInCategory.length },
    { value: "low", label: "Stock bajo", count: counts.low },
    { value: "out", label: "Sin stock", count: counts.out },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-1">
          <Boxes size={26} />
          <h1 className="h3 mb-0">Inventario</h1>
        </div>

        <p className="text-muted mb-0">
          Stock actual de tus productos activos. El aviso de stock bajo usa el
          stock mínimo de cada producto.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* RESUMEN */}

      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="stat-card h-100">
            <div className="text-muted small">Productos</div>
            <div className="fs-3 fw-bold">{productsInCategory.length}</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card h-100">
            <div className="text-muted small">Unidades en stock</div>
            <div className="fs-3 fw-bold">
              {counts.units.toLocaleString("es-ES")}
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card h-100">
            <div className="text-muted small d-flex align-items-center gap-1">
              <AlertTriangle size={15} className="text-warning" />
              Stock bajo
            </div>
            <div className="fs-3 fw-bold">{counts.low}</div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="stat-card h-100">
            <div className="text-muted small d-flex align-items-center gap-1">
              <PackageX size={15} className="text-danger" />
              Sin stock
            </div>
            <div className="fs-3 fw-bold">{counts.out}</div>
          </div>
        </div>
      </div>

      {/* FILTROS + TABLA */}

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end mb-4">
            <div className="col-md-4">
              <label className="form-label small text-muted" htmlFor="inv-search">
                Buscar
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <Search size={18} />
                </span>
                <input
                  id="inv-search"
                  type="text"
                  className="form-control"
                  placeholder="Nombre, SKU o código de barras"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <label className="form-label small text-muted" htmlFor="inv-category">
                Categoría
              </label>
              <select
                id="inv-category"
                className="form-select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="all">Todas las categorías</option>
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                {hasProductsWithoutCategory && (
                  <option value="none">Sin categoría</option>
                )}
              </select>
            </div>

            <div className="col-md-5">
              <div className="btn-group w-100" role="group" aria-label="Estado del stock">
                {statusButtons.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`btn ${
                      status === option.value ? "btn-dark" : "btn-outline-secondary"
                    }`}
                    onClick={() => setStatus(option.value)}
                    aria-pressed={status === option.value}
                  >
                    {option.label} ({option.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">
              Cargando inventario...
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {products.length === 0
                ? "Todavía no hay productos. Créalos en Productos."
                : "Ningún producto coincide con los filtros."}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th className="text-end">Stock</th>
                    <th className="text-end">Mínimo</th>
                    <th>Estado</th>
                    <th className="text-end">Valor (coste)</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleProducts.map((product) => {
                    const productStatus = STATUS[getStockStatus(product)];
                    const stock = Number(product.stock) || 0;

                    return (
                      <tr key={product.id}>
                        <td>
                          <div className="fw-semibold">{product.name}</div>
                          <small className="text-muted">{product.sku}</small>
                        </td>
                        <td>{product.category || "—"}</td>
                        <td className="text-end fw-semibold">{stock}</td>
                        <td className="text-end text-muted">
                          {Number(product.minStock) || 0}
                        </td>
                        <td>
                          <span className={`badge ${productStatus.badgeClass}`}>
                            {productStatus.label}
                          </span>
                        </td>
                        <td className="text-end">
                          {formatMoney(stock * (Number(product.buyPrice) || 0))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
