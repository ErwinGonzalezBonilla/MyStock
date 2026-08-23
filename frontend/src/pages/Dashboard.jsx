import { useState } from "react";

import StatCard from "../components/common/StatCard";
import SalesChart from "../components/common/SalesChart";
import RecentSales from "../components/common/RecentSales";
import LowStockProducts from "../components/common/LowStockProducts";

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
  // STOCK BAJO
  // =========================

  const lowStockProducts =
    products.filter((product) => {
      const stock =
        Number(product.stock) || 0;

      return stock > 0 && stock <= 10;
    }).length;

  // =========================
  // COSTE DEL INVENTARIO
  // =========================

  const inventoryCost =
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
  // VALOR POTENCIAL DE VENTA
  // =========================

  const inventorySalesValue =
    products.reduce(
      (total, product) => {
        const stock =
          Number(product.stock) || 0;

        const sellPrice =
          Number(product.sellPrice) || 0;

        return (
          total +
          stock * sellPrice
        );
      },
      0
    );

  // =========================
  // BENEFICIO POTENCIAL
  // =========================

  const potentialProfit =
    inventorySalesValue -
    inventoryCost;

  // =========================
  // MARGEN POTENCIAL
  // =========================

  const potentialMargin =
    inventorySalesValue > 0
      ? (
          (potentialProfit /
            inventorySalesValue) *
          100
        ).toFixed(1)
      : 0;

  // =========================
  // CLIENTES
  // =========================

  const totalClients =
    clients.length;

  const clientSales =
    sales.filter(
      (sale) => sale.clientId
    );

  const clientsWithPurchases =
    new Set(
      clientSales.map(
        (sale) => sale.clientId
      )
    ).size;

  const clientSalesRevenue =
    clientSales.reduce(
      (total, sale) =>
        total +
        (Number(sale.total) || 0),
      0
    );

  const clientAverageTicket =
    clientSales.length > 0
      ? clientSalesRevenue /
        clientSales.length
      : 0;

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
          KPIs PRINCIPALES
      ========================= */}

      <div className="row">

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

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Productos"
            value={totalProducts}
            subtitle="Productos registrados"
          />

        </div>

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Coste Inventario"
            value={formatCurrency(
              inventoryCost
            )}
            subtitle="Valor según precio de compra"
          />

        </div>

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
          RENTABILIDAD
      ========================= */}

      <div className="row">

        <div className="col-lg-4 col-md-6 mb-4">

          <StatCard
            title="Valor Potencial de Venta"
            value={formatCurrency(
              inventorySalesValue
            )}
            subtitle="Si vendieras todo el stock"
          />

        </div>

        <div className="col-lg-4 col-md-6 mb-4">

          <StatCard
            title="Beneficio Potencial"
            value={formatCurrency(
              potentialProfit
            )}
            subtitle="Venta total menos coste"
          />

        </div>

        <div className="col-lg-4 col-md-12 mb-4">

          <StatCard
            title="Margen Potencial"
            value={`${potentialMargin}%`}
            subtitle="Margen sobre el valor de venta"
          />

        </div>

      </div>

      {/* =========================
          CLIENTES
      ========================= */}

      <div className="row">

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Clientes"
            value={totalClients}
            subtitle="Clientes registrados"
          />

        </div>

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Clientes con compras"
            value={clientsWithPurchases}
            subtitle="Clientes que han comprado"
          />

        </div>

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Ventas a clientes"
            value={formatCurrency(
              clientSalesRevenue
            )}
            subtitle="Ventas asociadas a clientes"
          />

        </div>

        <div className="col-lg-3 col-md-6 mb-4">

          <StatCard
            title="Ticket medio"
            value={formatCurrency(
              clientAverageTicket
            )}
            subtitle="Promedio por venta"
          />

        </div>

      </div>

      {/* =========================
          GRÁFICO + IA
      ========================= */}

      <div className="row">

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

        <div className="col-lg-4">

          <div
            className="stat-card mb-4"
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

      {/* =========================
          ÚLTIMAS VENTAS + STOCK BAJO
      ========================= */}

      <div className="row">

        <div className="col-lg-8">

          <RecentSales
            sales={sales}
          />

        </div>

        <div className="col-lg-4">

          <LowStockProducts
            products={products}
          />

        </div>

      </div>

    </div>
  );
}