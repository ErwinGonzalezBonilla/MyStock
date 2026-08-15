import { useState } from "react";

import StatCard from "../components/common/StatCard";
import SalesChart from "../components/common/SalesChart";

export default function Dashboard() {
  const [products] = useState(() => {
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

  // =========================
  // FECHA ACTUAL
  // =========================

  const today = new Date();

  const isToday = (date) => {
    if (!date) {
      return false;
    }

    const saleDate = new Date(date);

    return (
      saleDate.getDate() ===
        today.getDate() &&
      saleDate.getMonth() ===
        today.getMonth() &&
      saleDate.getFullYear() ===
        today.getFullYear()
    );
  };

  // =========================
  // VENTAS DE HOY
  // =========================

  const todaySales = sales.filter(
    (sale) => isToday(sale.date)
  );

  const todayRevenue =
    todaySales.reduce(
      (total, sale) =>
        total +
        (Number(sale.total) || 0),
      0
    );

  // =========================
  // PRODUCTOS
  // =========================

  const totalProducts =
    products.length;

  // =========================
  // PRODUCTOS CON STOCK BAJO
  // =========================

  const lowStockProducts =
    products.filter((product) => {
      const stock =
        Number(product.stock) || 0;

      return stock > 0 && stock <= 10;
    }).length;

  // =========================
  // VALOR DEL INVENTARIO
  // =========================

  const inventoryValue =
    products.reduce(
      (total, product) => {
        const stock =
          Number(product.stock) || 0;

        const buyPrice =
          Number(product.buyPrice) || 0;

        return (
          total +
          stock * buyPrice
        );
      },
      0
    );

  // =========================
  // FORMATO MONEDA
  // =========================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "es-ES",
      {
        style: "currency",
        currency: "EUR",
      }
    ).format(value);
  };

  return (
    <div className="container-fluid p-4">

      <h2 className="mb-4 fw-bold">
        Dashboard
      </h2>

      {/* =========================
          KPIs
      ========================= */}

      <div className="row">

        {/* VENTAS HOY */}

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Ventas Hoy"
            value={formatCurrency(
              todayRevenue
            )}
            subtitle={`${todaySales.length} ${
              todaySales.length === 1
                ? "venta"
                : "ventas"
            } registradas`}
          />

        </div>

        {/* PRODUCTOS */}

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Productos"
            value={totalProducts}
            subtitle="Productos registrados"
          />

        </div>

        {/* VALOR INVENTARIO */}

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Valor Inventario"
            value={formatCurrency(
              inventoryValue
            )}
            subtitle="Valor según precio de compra"
          />

        </div>

        {/* STOCK BAJO */}

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Stock Bajo"
            value={lowStockProducts}
            subtitle={
              lowStockProducts === 1
                ? "Producto requiere reposición"
                : "Productos requieren reposición"
            }
          />

        </div>

      </div>

      {/* =========================
          SEGUNDA FILA
      ========================= */}

      <div className="row">

        {/* GRÁFICO */}

        <div className="col-lg-8">

          <div
            className="stat-card mb-4"
            style={{
              minHeight: "350px",
            }}
          >

            <h4 className="mb-4">
              Ventas últimos 30 días
            </h4>

            <SalesChart />

          </div>

        </div>

        {/* IA */}

        <div className="col-lg-4">

          <div
            className="stat-card"
            style={{
              minHeight: "350px",
            }}
          >

            <h4 className="mb-4">
              🤖 MyStock AI
            </h4>

            <p>
              Bienvenido a MyStock.
            </p>

            <p>
              Todavía no tienes suficientes
              datos para generar
              recomendaciones.
            </p>

            <p>
              Cuando registres productos,
              compras y ventas, comenzaré
              a analizar tu negocio para
              ayudarte a tomar mejores
              decisiones.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}