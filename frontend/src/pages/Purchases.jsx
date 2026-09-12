import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Truck,
  RefreshCw,
  Search,
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000";

export default function Purchases() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");

      const [
        suppliersResponse,
        productsResponse,
        purchasesResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/api/suppliers`),
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/purchases`),
      ]);

      if (
        !suppliersResponse.ok ||
        !productsResponse.ok ||
        !purchasesResponse.ok
      ) {
        throw new Error("No se pudieron cargar los datos");
      }

      const suppliersData = await suppliersResponse.json();
      const productsData = await productsResponse.json();
      const purchasesData = await purchasesResponse.json();

      setSuppliers(
        Array.isArray(suppliersData)
          ? suppliersData
          : suppliersData.value || []
      );

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : productsData.value || []
      );

      setPurchases(
        Array.isArray(purchasesData)
          ? purchasesData
          : purchasesData.value || []
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los datos de compras.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter((product) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    return (
      product.name?.toLowerCase().includes(searchValue) ||
      product.sku?.toLowerCase().includes(searchValue) ||
      product.barcode?.toLowerCase().includes(searchValue)
    );
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(Number(value) || 0);
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const selectedSupplierData = suppliers.find(
    (supplier) =>
      Number(supplier.id) === Number(selectedSupplier)
  );

  const selectedProductData = products.find(
    (product) =>
      Number(product.id) === Number(selectedProduct)
  );

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Compras</h1>

          <p className="text-muted mb-0">
            Gestiona tus compras y entradas de stock.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw size={17} className="me-2" />
          Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <Truck size={28} />
              </div>

              <div>
                <div className="text-muted small">
                  Proveedores
                </div>

                <div className="fs-4 fw-semibold">
                  {suppliers.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <Package size={28} />
              </div>

              <div>
                <div className="text-muted small">
                  Productos
                </div>

                <div className="fs-4 fw-semibold">
                  {products.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <ShoppingCart size={28} />
              </div>

              <div>
                <div className="text-muted small">
                  Compras registradas
                </div>

                <div className="fs-4 fw-semibold">
                  {purchases.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nueva compra */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <ShoppingCart size={20} className="me-2" />

            <h5 className="mb-0">
              Nueva compra
            </h5>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">
                Proveedor
              </label>

              <select
                className="form-select"
                value={selectedSupplier}
                onChange={(event) =>
                  setSelectedSupplier(event.target.value)
                }
              >
                <option value="">
                  Seleccionar proveedor
                </option>

                {suppliers.map((supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Producto
              </label>

              <select
                className="form-select"
                value={selectedProduct}
                onChange={(event) =>
                  setSelectedProduct(event.target.value)
                }
              >
                <option value="">
                  Seleccionar producto
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} — {product.sku}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <label className="form-label">
                Buscar producto
              </label>

              <div className="input-group">
                <span className="input-group-text">
                  <Search size={17} />
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre, SKU o código de barras..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {selectedSupplierData && (
            <div className="alert alert-light border mt-3 mb-0">
              Proveedor seleccionado:{" "}
              <strong>
                {selectedSupplierData.name}
              </strong>
            </div>
          )}

          {selectedProductData && (
            <div className="alert alert-light border mt-3 mb-0">
              Producto seleccionado:{" "}
              <strong>
                {selectedProductData.name}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Productos */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              Productos disponibles
            </h5>

            <span className="text-muted small">
              {filteredProducts.length} productos
            </span>
          </div>

          {loading ? (
            <div className="text-muted">
              Cargando productos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-muted">
              No se encontraron productos.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Código de barras</th>
                    <th>Stock</th>
                    <th>Precio compra</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="fw-medium">
                        {product.name}
                      </td>

                      <td>
                        {product.sku || "-"}
                      </td>

                      <td>
                        {product.barcode || "-"}
                      </td>

                      <td>
                        {product.stock}
                      </td>

                      <td>
                        {formatCurrency(product.buyPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Historial */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              Historial de compras
            </h5>

            <span className="text-muted small">
              {purchases.length} registros
            </span>
          </div>

          {loading ? (
            <div className="text-muted">
              Cargando compras...
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-muted">
              No hay compras registradas.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th>Productos</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td>
                        #{purchase.id}
                      </td>

                      <td>
                        {formatDate(
                          purchase.createdAt
                        )}
                      </td>

                      <td>
                        {purchase.supplierName}
                      </td>

                      <td>
                        {purchase.items?.length || 0}
                      </td>

                      <td className="fw-semibold">
                        {formatCurrency(
                          purchase.total
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}