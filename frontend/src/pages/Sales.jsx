import { useState, useEffect } from "react";

import SaleForm from "../components/sales/SaleForm";
import SaleTable from "../components/sales/SaleTable";

export default function Sales() {
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

  const [sales, setSales] = useState(() => {
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

  // =========================
  // GUARDAR VENTAS
  // =========================

  useEffect(() => {
    localStorage.setItem(
      "sales",
      JSON.stringify(sales)
    );
  }, [sales]);

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
  // REGISTRAR VENTA
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedProduct = products.find(
      (product) =>
        product.id === sale.productId
    );

    if (!selectedProduct) {
      return;
    }

    const selectedClient = clients.find(
      (client) =>
        client.id === sale.clientId
    );

    const quantity =
      Number(sale.quantity);

    const currentStock =
      Number(selectedProduct.stock) || 0;

    if (
      quantity <= 0 ||
      quantity > currentStock
    ) {
      return;
    }

    const unitPrice =
      Number(
        selectedProduct.sellPrice
      ) || 0;

    const total =
      unitPrice * quantity;

    const newStock =
      currentStock - quantity;

    const now =
      new Date().toISOString();

    // =========================
    // CREAR VENTA
    // =========================

    const newSale = {
      id: crypto.randomUUID(),

      clientId:
        selectedClient?.id || "",

      clientName:
        selectedClient?.name || "Venta sin cliente",

      productId:
        selectedProduct.id,

      productName:
        selectedProduct.name,

      sku:
        selectedProduct.sku,

      quantity,

      unitPrice,

      total,

      date: now,
    };

    // =========================
    // CREAR MOVIMIENTO
    // =========================

    const newMovement = {
      id: crypto.randomUUID(),

      productId:
        selectedProduct.id,

      productName:
        selectedProduct.name,

      sku:
        selectedProduct.sku,

      type: "salida",

      quantity,

      resultingStock:
        newStock,

      reason: "Venta",

      date: now,
    };

    // =========================
    // ACTUALIZAR PRODUCTOS
    // =========================

    const updatedProducts =
      products.map((item) =>
        item.id === selectedProduct.id
          ? {
              ...item,

              stock: newStock,

              lastStockUpdate: now,
            }
          : item
      );

    setProducts(updatedProducts);

    localStorage.setItem(
      "products",
      JSON.stringify(updatedProducts)
    );

    // =========================
    // ACTUALIZAR VENTAS
    // =========================

    setSales((prev) => [
      newSale,
      ...prev,
    ]);

    // =========================
    // ACTUALIZAR HISTORIAL
    // =========================

    const savedMovements =
      localStorage.getItem(
        "stockMovements"
      );

    let currentMovements = [];

    if (savedMovements) {
      try {
        currentMovements =
          JSON.parse(savedMovements);
      } catch (error) {
        console.error(
          "Error al cargar movimientos:",
          error
        );

        currentMovements = [];
      }
    }

    const updatedMovements = [
      newMovement,
      ...currentMovements,
    ];

    localStorage.setItem(
      "stockMovements",
      JSON.stringify(
        updatedMovements
      )
    );

    // =========================
    // LIMPIAR FORMULARIO
    // =========================

    setSale({
      clientId: "",
      productId: "",
      quantity: 1,
    });
  };

  return (
    <div className="container-fluid p-4">

      <h2 className="fw-bold mb-4">
        Ventas
      </h2>

      <SaleForm
        products={products}
        clients={clients}
        sale={sale}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <SaleTable
        sales={sales}
      />

    </div>
  );
}