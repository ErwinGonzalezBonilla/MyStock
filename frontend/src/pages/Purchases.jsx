import { useEffect, useState } from "react";
import {
  Package,
  ShoppingCart,
  Truck,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Minus,
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000";

export default function Purchases() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");

  const [search, setSearch] = useState("");

  const [cart, setCart] = useState([]);

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

  const cartTotal = cart.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0
  );

  const cartItemsCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleAddToCart = () => {
    if (!selectedProductData) {
      setError("Selecciona un producto.");
      return;
    }

    const parsedQuantity = Number(quantity);
    const parsedPrice = Number(unitPrice);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("La cantidad debe ser un número entero mayor que cero.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("El precio de compra no puede ser negativo.");
      return;
    }

    setError("");

    const existingItem = cart.find(
      (item) => item.productId === selectedProductData.id
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === selectedProductData.id
            ? {
                ...item,
                quantity: item.quantity + parsedQuantity,
                unitPrice: parsedPrice,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProductData.id,
          productName: selectedProductData.name,
          sku: selectedProductData.sku,
          barcode: selectedProductData.barcode,
          quantity: parsedQuantity,
          unitPrice: parsedPrice,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
    setUnitPrice("");
  };

  const handleRemoveFromCart = (productId) => {
    setCart(
      cart.filter(
        (item) => item.productId !== productId
      )
    );
  };

  const handleChangeQuantity = (productId, change) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId !== productId) {
            return item;
          }

          const newQuantity = item.quantity + change;

          if (newQuantity <= 0) {
            return null;
          }

          return {
            ...item,
            quantity: newQuantity,
          };
        })
        .filter(Boolean)
    );
  };

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
            {/* Proveedor */}
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

            {/* Buscar */}
            <div className="col-md-6">
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

            {/* Producto */}
            <div className="col-md-6">
              <label className="form-label">
                Producto
              </label>

              <select
                className="form-select"
                value={selectedProduct}
                onChange={(event) => {
                  const productId = event.target.value;

                  setSelectedProduct(productId);

                  const product = products.find(
                    (item) =>
                      Number(item.id) === Number(productId)
                  );

                  if (product) {
                    setUnitPrice(
                      product.buyPrice ?? ""
                    );
                  }
                }}
              >
                <option value="">
                  Seleccionar producto
                </option>

                {filteredProducts.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name} — {product.sku}
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidad */}
            <div className="col-md-3">
              <label className="form-label">
                Cantidad
              </label>

              <input
                type="number"
                min="1"
                step="1"
                className="form-control"
                value={quantity}
                onChange={(event) =>
                  setQuantity(event.target.value)
                }
              />
            </div>

            {/* Precio */}
            <div className="col-md-3">
              <label className="form-label">
                Precio de compra
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                value={unitPrice}
                onChange={(event) =>
                  setUnitPrice(event.target.value)
                }
              />
            </div>

            {/* Add */}
            <div className="col-12">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddToCart}
              >
                <Plus size={17} className="me-2" />
                Añadir al carrito
              </button>
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

      {/* Carrito */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <ShoppingCart size={20} className="me-2" />

              <h5 className="mb-0">
                Carrito de compra
              </h5>
            </div>

            <span className="text-muted small">
              {cartItemsCount} unidades
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="text-muted">
              No hay productos en el carrito.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>SKU</th>
                      <th>Cantidad</th>
                      <th>Precio compra</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.productId}>
                        <td className="fw-medium">
                          {item.productName}
                        </td>

                        <td>
                          {item.sku || "-"}
                        </td>

                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                handleChangeQuantity(
                                  item.productId,
                                  -1
                                )
                              }
                            >
                              <Minus size={14} />
                            </button>

                            <span className="fw-semibold">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                handleChangeQuantity(
                                  item.productId,
                                  1
                                )
                              }
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </td>

                        <td>
                          {formatCurrency(
                            item.unitPrice
                          )}
                        </td>

                        <td className="fw-semibold">
                          {formatCurrency(
                            item.quantity *
                              item.unitPrice
                          )}
                        </td>

                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              handleRemoveFromCart(
                                item.productId
                              )
                            }
                            aria-label="Eliminar producto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <div className="text-end">
                  <div className="text-muted small">
                    Total de la compra
                  </div>

                  <div className="fs-3 fw-bold">
                    {formatCurrency(cartTotal)}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Productos disponibles */}
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
                        {formatCurrency(
                          product.buyPrice
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