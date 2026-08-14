import { useState, useEffect } from "react";

import ProductForm from "../components/products/ProductForm";
import ProductTable from "../components/products/ProductTable";
import StockHistory from "../components/products/StockHistory";

const EMPTY_PRODUCT = {
  id: "",
  sku: "",
  name: "",
  category: "",
  description: "",
  buyPrice: "",
  sellPrice: "",
  stock: "",
  image: "",
};

const generateSku = (products) => {
  let highestNumber = 0;

  products.forEach((item) => {
    if (!item.sku) return;

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

  const [products, setProducts] = useState(() => {
    const savedProducts =
      localStorage.getItem("products");

    if (!savedProducts) {
      return [];
    }

    try {
      return JSON.parse(savedProducts);
    } catch (error) {
      console.error(
        "Error al cargar productos:",
        error
      );

      return [];
    }
  });

  const [movements, setMovements] = useState(() => {
    const savedMovements =
      localStorage.getItem("stockMovements");

    if (!savedMovements) {
      return [];
    }

    try {
      return JSON.parse(savedMovements);
    } catch (error) {
      console.error(
        "Error al cargar movimientos:",
        error
      );

      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "products",
      JSON.stringify(products)
    );
  }, [products]);

  useEffect(() => {
    localStorage.setItem(
      "stockMovements",
      JSON.stringify(movements)
    );
  }, [movements]);

  const handleChange = (e) => {
    setProduct((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setProduct((prev) => ({
      ...prev,
      image: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...product,
                id: editingId,
              }
            : item
        )
      );

      setEditingId(null);
    } else {
      const initialStock =
        Number(product.stock) || 0;

      const newProduct = {
        ...product,
        id: crypto.randomUUID(),
        sku: generateSku(products),
        stock: initialStock,
        lastStockUpdate:
          initialStock > 0
            ? new Date().toISOString()
            : "",
      };

      setProducts((prev) => [
        ...prev,
        newProduct,
      ]);

      if (initialStock > 0) {
        const initialMovement = {
          id: crypto.randomUUID(),
          productId: newProduct.id,
          productName: newProduct.name,
          sku: newProduct.sku,
          type: "entrada",
          quantity: initialStock,
          resultingStock: initialStock,
          date: new Date().toISOString(),
        };

        setMovements((prev) => [
          initialMovement,
          ...prev,
        ]);
      }
    }

    setProduct(EMPTY_PRODUCT);
  };

  const handleDelete = (id) => {
    setProducts((prev) =>
      prev.filter((item) => item.id !== id)
    );

    setMovements((prev) =>
      prev.filter(
        (movement) =>
          movement.productId !== id
      )
    );

    if (editingId === id) {
      setEditingId(null);
      setProduct(EMPTY_PRODUCT);
    }
  };

  const handleEdit = (id) => {
    const selected = products.find(
      (item) => item.id === id
    );

    if (!selected) return;

    setProduct({
      ...selected,
    });

    setEditingId(id);
  };

  const handleIncreaseStock = (id) => {
    const selectedProduct = products.find(
      (item) => item.id === id
    );

    if (!selectedProduct) return;

    const currentStock =
      Number(selectedProduct.stock) || 0;

    const newStock =
      currentStock + 1;

    const now =
      new Date().toISOString();

    const movement = {
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      type: "entrada",
      quantity: 1,
      resultingStock: newStock,
      date: now,
    };

    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: newStock,
              lastStockUpdate: now,
            }
          : item
      )
    );

    setMovements((prev) => [
      movement,
      ...prev,
    ]);
  };

  const handleDecreaseStock = (id) => {
    const selectedProduct = products.find(
      (item) => item.id === id
    );

    if (!selectedProduct) return;

    const currentStock =
      Number(selectedProduct.stock) || 0;

    if (currentStock <= 0) {
      return;
    }

    const newStock =
      currentStock - 1;

    const now =
      new Date().toISOString();

    const movement = {
      id: crypto.randomUUID(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      sku: selectedProduct.sku,
      type: "salida",
      quantity: 1,
      resultingStock: newStock,
      date: now,
    };

    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              stock: newStock,
              lastStockUpdate: now,
            }
          : item
      )
    );

    setMovements((prev) => [
      movement,
      ...prev,
    ]);
  };

  const filteredProducts = products.filter(
    (item) => {
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
    }
  );

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
        Number(item.stock) <= 10
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
              € {inventoryValue.toFixed(2)}
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

      <ProductForm
        product={product}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleImage={handleImage}
        editingIndex={editingId}
      />

      <div className="mb-4">

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

      <StockHistory
        movements={movements}
      />

    </div>
  );
}