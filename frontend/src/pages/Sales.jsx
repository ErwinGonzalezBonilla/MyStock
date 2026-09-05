import { useEffect, useRef, useState } from "react";

import SaleForm from "../components/sales/SaleForm";
import SaleTable from "../components/sales/SaleTable";

const API_URL = "http://127.0.0.1:5000";

export default function Sales() {
  const scannerRef = useRef(null);

  const [products, setProducts] = useState([]);

  const [clients] = useState(() => {
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

  const [sale, setSale] = useState({
    clientId: "",
    quantity: 1,
  });

  const [cart, setCart] = useState([]);

  const [scannerCode, setScannerCode] =
    useState("");

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [lookupLoading, setLookupLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================
  // CARGAR PRODUCTOS DESDE API
  // =========================

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/products`
        );

        if (!response.ok) {
          throw new Error(
            "No se pudieron cargar los productos."
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setProducts(data);
          setLoadingProducts(false);
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setError(
            "No se pudieron cargar los productos desde el servidor."
          );

          setLoadingProducts(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // ENFOCAR SCANNER
  // =========================

  useEffect(() => {
    const timer = setTimeout(() => {
      scannerRef.current?.focus();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // =========================
  // CAMBIOS DEL CLIENTE
  // =========================

  const handleChange = (e) => {
    setSale((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =========================
  // BUSCAR PRODUCTO
  // =========================

  const lookupProduct = async (code) => {
    const cleanCode = code.trim();

    if (!cleanCode) {
      return;
    }

    setLookupLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/products/lookup?code=${encodeURIComponent(
          cleanCode
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Producto no encontrado."
        );

        return;
      }

      const product = data.product;

      if (Number(product.stock) <= 0) {
        setError(
          "El producto no tiene stock disponible."
        );

        return;
      }

      addToCart(product);

      setSuccess(
        `${product.name} añadido al carrito.`
      );
    } catch (error) {
      console.error(error);

      setError(
        "No se pudo conectar con el servidor."
      );
    } finally {
      setLookupLoading(false);
      setScannerCode("");

      setTimeout(() => {
        scannerRef.current?.focus();
      }, 50);
    }
  };

  // =========================
  // AÑADIR AL CARRITO
  // =========================

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem =
        currentCart.find(
          (item) =>
            Number(item.productId) ===
            Number(product.id)
        );

      if (existingItem) {
        const newQuantity =
          existingItem.quantity + 1;

        if (
          newQuantity >
          Number(product.stock)
        ) {
          setError(
            `No hay suficiente stock de ${product.name}.`
          );

          return currentCart;
        }

        return currentCart.map((item) =>
          Number(item.productId) ===
          Number(product.id)
            ? {
                ...item,
                quantity: newQuantity,
                subtotal:
                  newQuantity *
                  Number(product.sellPrice || 0),
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          unitPrice:
            Number(product.sellPrice) || 0,
          quantity: 1,
          stock: Number(product.stock) || 0,
          subtotal:
            Number(product.sellPrice) || 0,
        },
      ];
    });
  };

  // =========================
  // AÑADIR PRODUCTO MANUALMENTE
  // =========================

  const handleProductSelect = (e) => {
    const productId = e.target.value;

    if (!productId) {
      return;
    }

    const product = products.find(
      (item) =>
        String(item.id) ===
        String(productId)
    );

    if (!product) {
      return;
    }

    if (Number(product.stock) <= 0) {
      setError(
        "El producto no tiene stock disponible."
      );

      return;
    }

    addToCart(product);

    setSuccess(
      `${product.name} añadido al carrito.`
    );

    setError("");

    setTimeout(() => {
      scannerRef.current?.focus();
    }, 50);
  };

  // =========================
  // CAMBIAR CANTIDAD
  // =========================

  const updateCartQuantity = (
    productId,
    quantity
  ) => {
    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 1
    ) {
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          Number(item.productId) !==
          Number(productId)
        ) {
          return item;
        }

        if (newQuantity > item.stock) {
          setError(
            `No hay suficiente stock de ${item.name}.`
          );

          return item;
        }

        return {
          ...item,
          quantity: newQuantity,
          subtotal:
            newQuantity * item.unitPrice,
        };
      })
    );
  };

  // =========================
  // ELIMINAR DEL CARRITO
  // =========================

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          Number(item.productId) !==
          Number(productId)
      )
    );

    setError("");
    setSuccess("");
  };

  // =========================
  // TOTAL DEL CARRITO
  // =========================

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.subtotal || 0),
    0
  );

  const cartItemsCount = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  // =========================
  // REGISTRAR VENTA
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setError(
        "Añade al menos un producto al carrito."
      );

      return;
    }

    setError(
      "El registro de ventas y descuento de stock se conectará al backend en el siguiente paso."
    );
  };

  return (
    <div className="container-fluid p-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            Ventas
          </h2>

          <p className="text-muted mb-0">
            Escanea productos para crear una venta.
          </p>
        </div>

      </div>

      {/* =========================
          SCANNER
      ========================= */}

      <div className="stat-card mb-4">

        <h4 className="mb-3">
          Buscar producto
        </h4>

        <div className="input-group input-group-lg">

          <span className="input-group-text">
            🔎
          </span>

          <input
            ref={scannerRef}
            type="text"
            className="form-control"
            value={scannerCode}
            onChange={(e) =>
              setScannerCode(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();

                lookupProduct(scannerCode);
              }
            }}
            placeholder="Escanea o introduce SKU / código de barras..."
            autoComplete="off"
            disabled={lookupLoading}
          />

          <button
            type="button"
            className="btn btn-primary"
            onClick={() =>
              lookupProduct(scannerCode)
            }
            disabled={
              lookupLoading ||
              !scannerCode.trim()
            }
          >
            {lookupLoading
              ? "Buscando..."
              : "Buscar"}
          </button>

        </div>

        <small className="text-muted d-block mt-2">
          Escanea un código y pulsa Enter. Si el
          producto ya está en el carrito, aumentará
          automáticamente su cantidad.
        </small>

        {error && (
          <div className="alert alert-danger mt-3 mb-0">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success mt-3 mb-0">
            {success}
          </div>
        )}

      </div>

      <SaleForm
        products={products}
        clients={clients}
        sale={sale}
        cart={cart}
        cartTotal={cartTotal}
        cartItemsCount={cartItemsCount}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        onProductSelect={handleProductSelect}
        updateCartQuantity={updateCartQuantity}
        removeFromCart={removeFromCart}
        loadingProducts={loadingProducts}
      />

      <SaleTable
        sales={sales}
      />

    </div>
  );
}