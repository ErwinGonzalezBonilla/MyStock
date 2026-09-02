import { useState, useEffect } from "react";

import ProductForm from "../components/products/ProductForm";
import ProductTable from "../components/products/ProductTable";
import StockHistory from "../components/products/StockHistory";

const API_URL = "http://127.0.0.1:5000/api/products";

const STOCK_MOVEMENTS_API_URL =
  "http://127.0.0.1:5000/api/stock-movements";

const EMPTY_PRODUCT = {
  id: "",
  sku: "",
  name: "",
  category: "",
  description: "",
  buyPrice: "",
  sellPrice: "",
  stock: "",
  minStock: 0,
  image: "",
  barcode: "",
};

// =========================
// GENERAR SKU AUTOMÁTICO
// =========================

const generateSku = (products) => {
  let highestNumber = 0;

  products.forEach((item) => {
    if (!item.sku) {
      return;
    }

    const match = item.sku.match(/^PET-(\d+)$/);

    if (match) {
      const number = Number(match[1]);

      if (number > highestNumber) {
        highestNumber = number;
      }
    }
  });

  return `PET-${String(highestNumber + 1).padStart(6, "0")}`;
};

export default function Products() {
  const [product, setProduct] = useState(EMPTY_PRODUCT);

  const [products, setProducts] = useState([]);

  const [movements, setMovements] = useState([]);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // =========================
  // CARGAR PRODUCTOS
  // =========================

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            "No se pudieron cargar los productos."
          );
        }

        const data = await response.json();

        setProducts(data);
      } catch (err) {
        console.error(
          "Error cargando productos:",
          err
        );

        setError(
          "No se pudieron cargar los productos."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // =========================
  // CARGAR MOVIMIENTOS
  // =========================

  useEffect(() => {
    const loadMovements = async () => {
      try {
        const response = await fetch(
          STOCK_MOVEMENTS_API_URL
        );

        if (!response.ok) {
          throw new Error(
            "No se pudieron cargar los movimientos."
          );
        }

        const data = await response.json();

        setMovements(data);
      } catch (err) {
        console.error(
          "Error cargando movimientos:",
          err
        );

        setError(
          "No se pudieron cargar los movimientos."
        );
      }
    };

    loadMovements();
  }, []);

  // =========================
  // CAMBIAR CAMPOS
  // =========================

  const handleChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
    setError("");
  };

  // =========================
  // IMAGEN
  // =========================

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    setProduct((prev) => ({
      ...prev,
      image: URL.createObjectURL(file),
    }));

    setMessage("");
    setError("");
  };

  // =========================
  // CREAR / ACTUALIZAR
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const isEditing = Boolean(editingId);

      const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = isEditing
        ? "PUT"
        : "POST";

      const sku = isEditing
        ? product.sku
        : generateSku(products);

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: product.name,
          sku: sku,
          barcode: product.barcode,
          category: product.category,

          buyPrice:
            Number(product.buyPrice) || 0,

          sellPrice:
            Number(product.sellPrice) || 0,

          stock:
            Number(product.stock) || 0,

          minStock:
            Number(product.minStock) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo guardar el producto."
        );
      }

      const savedProduct = data.product;

      if (isEditing) {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? savedProduct
              : item
          )
        );

        setMessage(
          "Producto actualizado correctamente."
        );
      } else {
        setProducts((prev) => [
          savedProduct,
          ...prev,
        ]);

        setMessage(
          "Producto creado correctamente."
        );

        // El movimiento de stock inicial
        // ya se crea en el backend.
      }

      setProduct({
        ...EMPTY_PRODUCT,
      });

      setEditingId(null);
    } catch (err) {
      console.error(
        "Error guardando producto:",
        err
      );

      setError(
        err.message ||
          "No se pudo guardar el producto."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ELIMINAR
  // =========================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este producto?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo eliminar el producto."
        );
      }

      setProducts((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );

      setMovements((prev) =>
        prev.filter(
          (movement) =>
            movement.productId !== id
        )
      );

      if (editingId === id) {
        setEditingId(null);

        setProduct({
          ...EMPTY_PRODUCT,
        });
      }

      setMessage(
        "Producto eliminado correctamente."
      );
    } catch (err) {
      console.error(
        "Error eliminando producto:",
        err
      );

      setError(
        err.message ||
          "No se pudo eliminar el producto."
      );
    }
  };

  // =========================
  // EDITAR
  // =========================

  const handleEdit = (id) => {
    const selected = products.find(
      (item) => item.id === id
    );

    if (!selected) {
      return;
    }

    setProduct({
      ...EMPTY_PRODUCT,
      ...selected,
    });

    setEditingId(id);

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // ENTRADA DE STOCK
  // =========================

  const handleIncreaseStock = async (
    id,
    quantity = 1,
    reason = "Entrada de stock"
  ) => {
    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      return;
    }

    const selectedProduct =
      products.find(
        (item) => item.id === id
      );

    if (!selectedProduct) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        STOCK_MOVEMENTS_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId: id,
            type: "entrada",
            quantity: amount,
            reason: reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo registrar la entrada."
        );
      }

      const updatedMovement =
        data.movement;

      setProducts((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                stock:
                  updatedMovement.resultingStock,
                lastStockUpdate:
                  updatedMovement.date,
              }
            : item
        )
      );

      setMovements((prev) => [
        updatedMovement,
        ...prev,
      ]);

      setMessage(
        "Entrada de stock registrada correctamente."
      );
    } catch (err) {
      console.error(
        "Error registrando entrada:",
        err
      );

      setError(
        err.message ||
          "No se pudo registrar la entrada."
      );
    }
  };

  // =========================
  // SALIDA DE STOCK
  // =========================

  const handleDecreaseStock = async (
    id,
    quantity = 1,
    reason = "Salida de stock"
  ) => {
    const amount = Number(quantity);

    if (!amount || amount <= 0) {
      return;
    }

    const selectedProduct =
      products.find(
        (item) => item.id === id
      );

    if (!selectedProduct) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        STOCK_MOVEMENTS_API_URL,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId: id,
            type: "salida",
            quantity: amount,
            reason: reason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "No se pudo registrar la salida."
        );
      }

      const updatedMovement =
        data.movement;

      setProducts((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                stock:
                  updatedMovement.resultingStock,
                lastStockUpdate:
                  updatedMovement.date,
              }
            : item
        )
      );

      setMovements((prev) => [
        updatedMovement,
        ...prev,
      ]);

      setMessage(
        "Salida de stock registrada correctamente."
      );
    } catch (err) {
      console.error(
        "Error registrando salida:",
        err
      );

      setError(
        err.message ||
          "No se pudo registrar la salida."
      );
    }
  };

  // =========================
  // BÚSQUEDA
  // =========================

  const filteredProducts =
    products.filter((item) => {
      const searchTerm =
        search.toLowerCase().trim();

      if (!searchTerm) {
        return true;
      }

      return (
        item.name
          ?.toLowerCase()
          .includes(searchTerm) ||
        item.sku
          ?.toLowerCase()
          .includes(searchTerm) ||
        item.category
          ?.toLowerCase()
          .includes(searchTerm)
      );
    });

  // =========================
  // RESUMEN
  // =========================

  const totalProducts =
    products.length;

  const inventoryValue =
    products.reduce(
      (total, item) => {
        const buyPrice =
          Number(item.buyPrice) || 0;

        const stock =
          Number(item.stock) || 0;

        return (
          total +
          buyPrice * stock
        );
      },
      0
    );

  const lowStockProducts =
    products.filter(
      (item) =>
        Number(item.stock) > 0 &&
        Number(item.stock) <=
          Number(item.minStock || 10)
    ).length;

  const outOfStockProducts =
    products.filter(
      (item) =>
        Number(item.stock) === 0
    ).length;

  return (
    <div className="container-fluid p-4">

      <h2 className="fw-bold mb-4">
        Productos
      </h2>

      {/* MENSAJES */}

      {message && (
        <div className="alert alert-success">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          ⚠️ {error}
        </div>
      )}

      {/* RESUMEN */}

      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="stat-card h-100">

            <div className="text-muted">
              📦 Productos
            </div>

            <h3 className="fw-bold mt-2 mb-0">
              {totalProducts}
            </h3>

          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card h-100">

            <div className="text-muted">
              💰 Valor del inventario
            </div>

            <h3 className="fw-bold mt-2 mb-0">
              €{" "}
              {inventoryValue.toFixed(
                2
              )}
            </h3>

          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card h-100">

            <div className="text-muted">
              ⚠️ Stock bajo
            </div>

            <h3 className="fw-bold mt-2 mb-0">
              {lowStockProducts}
            </h3>

          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card h-100">

            <div className="text-muted">
              ❌ Sin stock
            </div>

            <h3 className="fw-bold mt-2 mb-0">
              {outOfStockProducts}
            </h3>

          </div>
        </div>

      </div>

      {/* FORMULARIO */}

      <ProductForm
        product={product}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleImage={handleImage}
        editingIndex={editingId}
      />

      {/* BÚSQUEDA */}

      <div className="stat-card mb-4">

        <label className="form-label fw-semibold">
          Buscar producto
        </label>

        <input
          type="text"
          className="form-control"
          placeholder="🔍 Buscar por nombre, SKU o categoría..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* CARGANDO */}

      {loading && (
        <div className="alert alert-info">
          Cargando...
        </div>
      )}

      {/* TABLA */}

      <ProductTable
        products={filteredProducts}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        handleIncreaseStock={
          handleIncreaseStock
        }
        handleDecreaseStock={
          handleDecreaseStock
        }
      />

      {/* HISTORIAL */}

      <StockHistory
        movements={movements}
      />

    </div>
  );
}