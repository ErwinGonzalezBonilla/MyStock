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
    productId: "",
    quantity: 1,
  });

  const [scannerCode, setScannerCode] =
    useState("");

  const [scannedProduct, setScannedProduct] =
    useState(null);

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
  // CAMBIOS DEL FORMULARIO
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
        setScannedProduct(null);

        setError(
          data.error ||
            "Producto no encontrado."
        );

        return;
      }

      const product = data.product;

      if (Number(product.stock) <= 0) {
        setScannedProduct(null);

        setError(
          "El producto no tiene stock disponible."
        );

        return;
      }

      setScannedProduct(product);

      setSale((prev) => ({
        ...prev,
        productId: String(product.id),
        quantity: 1,
      }));

      setSuccess(
        `Producto encontrado: ${product.name}`
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
  // SCANNER / ENTER
  // =========================

  const handleScannerKeyDown = (e) => {
    if (e.key !== "Enter") {
      return;
    }

    e.preventDefault();

    lookupProduct(scannerCode);
  };

  // =========================
  // SELECCIONAR PRODUCTO
  // =========================

  const handleProductSelect = (e) => {
    const productId = e.target.value;

    setSale((prev) => ({
      ...prev,
      productId,
      quantity: 1,
    }));

    const product = products.find(
      (item) =>
        String(item.id) === String(productId)
    );

    setScannedProduct(product || null);

    setError("");
    setSuccess("");
  };

  // =========================
  // REGISTRAR VENTA
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    setError(
      "El registro de ventas con descuento de stock se conectará al backend en el siguiente paso."
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
            Escanea un producto o búscalo por SKU.
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
            onKeyDown={handleScannerKeyDown}
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
          Un lector USB o Bluetooth puede utilizar este
          campo como teclado y enviar Enter automáticamente.
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
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        selectedProduct={scannedProduct}
        onProductSelect={handleProductSelect}
        loadingProducts={loadingProducts}
      />

      <SaleTable
        sales={sales}
      />

    </div>
  );
}