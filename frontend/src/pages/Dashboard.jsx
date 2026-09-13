import { useEffect, useState } from "react";
import {
  DollarSign,
  Package,
  Warehouse,
  AlertTriangle,
  TrendingUp,
  Percent,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import SalesChart from "../components/common/SalesChart";
import RecentSales from "../components/common/RecentSales";
import LowStockProducts from "../components/common/LowStockProducts";

const API_URL = "http://127.0.0.1:5000";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setError("");

      const [productsResponse, salesResponse] =
        await Promise.all([
          fetch(`${API_URL}/api/products`),
          fetch(`${API_URL}/api/sales`),
        ]);

      if (!productsResponse.ok || !salesResponse.ok) {
        throw new Error(
          "No se pudieron cargar los datos"
        );
      }

      const productsData =
        await productsResponse.json();

      const salesData =
        await salesResponse.json();

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : productsData.value || []
      );

      setSales(
        Array.isArray(salesData)
          ? salesData
          : salesData.value || []
      );
    } catch (err) {
      console.error(
        "Error al cargar Dashboard:",
        err
      );

      setError(
        "No se pudieron cargar los datos del negocio."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const today = new Date();

  const isToday = (date) => {
    if (!date) {
      return false;
    }

    const saleDate = new Date(date);

    return (
      saleDate.getDate() === today.getDate() &&
      saleDate.getMonth() === today.getMonth() &&
      saleDate.getFullYear() === today.getFullYear()
    );
  };

  const todaySales = sales.filter((sale) =>
    isToday(sale.date)
  );

  const todayRevenue = todaySales.reduce(
    (total, sale) =>
      total + (Number(sale.total) || 0),
    0
  );

  const totalProducts = products.length;

  const lowStockCount = products.filter(
    (product) => {
      const stock =
        Number(product.stock) || 0;

      const minimum =
        Number(product.minStock) ||
        Number(product.minimumStock) ||
        10;

      return stock >= 0 && stock <= minimum;
    }
  ).length;

  const inventoryCost = products.reduce(
    (total, product) => {
      const stock =
        Number(product.stock) || 0;

      const buyPrice =
        Number(product.buyPrice) || 0;

      return total + stock * buyPrice;
    },
    0
  );

  const inventorySalesValue =
    products.reduce(
      (total, product) => {
        const stock =
          Number(product.stock) || 0;

        const sellPrice =
          Number(product.sellPrice) || 0;

        return total + stock * sellPrice;
      },
      0
    );

  const potentialProfit =
    inventorySalesValue -
    inventoryCost;

  const potentialMargin =
    inventorySalesValue > 0
      ? (
          (potentialProfit /
            inventorySalesValue) *
          100
        ).toFixed(1)
      : 0;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(Number(value) || 0);
  };

  if (loading) {
    return (
      <div className="container-fluid mystock-dashboard py-4">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              Dashboard
            </h1>

            <p className="dashboard-subtitle">
              Cargando los datos de tu negocio...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mystock-dashboard">

      {/* CABECERA */}

      <div className="dashboard-header">

        <div>
          <h1 className="dashboard-title">
            Dashboard
          </h1>

          <p className="dashboard-subtitle">
            Aquí tienes el resumen de tu negocio.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadDashboardData}
        >
          <RefreshCw
            size={17}
            className="me-2"
          />
          Actualizar
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div
          className="alert alert-danger"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* KPIs PRINCIPALES */}

      <div className="row g-4 mb-4">

        {/* VENTAS HOY */}

        <div className="col-xl-3 col-md-6">

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <div className="dashboard-kpi-icon">
                <DollarSign size={21} />
              </div>

              <span className="dashboard-kpi-label">
                VENTAS HOY
              </span>

            </div>

            <div className="dashboard-kpi-value">
              {formatCurrency(todayRevenue)}
            </div>

            <div className="dashboard-kpi-description">
              {todaySales.length}{" "}
              {todaySales.length === 1
                ? "venta registrada"
                : "ventas registradas"}
            </div>

          </div>

        </div>

        {/* PRODUCTOS */}

        <div className="col-xl-3 col-md-6">

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <div className="dashboard-kpi-icon">
                <Package size={21} />
              </div>

              <span className="dashboard-kpi-label">
                PRODUCTOS
              </span>

            </div>

            <div className="dashboard-kpi-value">
              {totalProducts}
            </div>

            <div className="dashboard-kpi-description">
              Productos registrados
            </div>

          </div>

        </div>

        {/* INVENTARIO */}

        <div className="col-xl-3 col-md-6">

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <div className="dashboard-kpi-icon">
                <Warehouse size={21} />
              </div>

              <span className="dashboard-kpi-label">
                INVENTARIO
              </span>

            </div>

            <div className="dashboard-kpi-value">
              {formatCurrency(inventoryCost)}
            </div>

            <div className="dashboard-kpi-description">
              Valor al precio de compra
            </div>

          </div>

        </div>

        {/* STOCK BAJO */}

        <div className="col-xl-3 col-md-6">

          <div className="dashboard-kpi-card">

            <div className="dashboard-kpi-top">

              <div className="dashboard-kpi-icon dashboard-kpi-icon-warning">
                <AlertTriangle size={21} />
              </div>

              <span className="dashboard-kpi-label">
                STOCK BAJO
              </span>

            </div>

            <div className="dashboard-kpi-value">
              {lowStockCount}
            </div>

            <div className="dashboard-kpi-description">
              {lowStockCount === 1
                ? "Producto requiere reposición"
                : "Productos requieren reposición"}
            </div>

          </div>

        </div>

      </div>

      {/* RENTABILIDAD */}

      <div className="dashboard-section-header">

        <div>
          <h2>
            Rentabilidad del inventario
          </h2>

          <p>
            Una estimación del valor de tu stock actual.
          </p>
        </div>

      </div>

      <div className="row g-4 mb-4">

        {/* VALOR POTENCIAL */}

        <div className="col-lg-4">

          <div className="dashboard-profit-card">

            <div className="dashboard-profit-icon">
              <TrendingUp size={21} />
            </div>

            <div>

              <div className="dashboard-profit-label">
                Valor potencial de venta
              </div>

              <div className="dashboard-profit-value">
                {formatCurrency(
                  inventorySalesValue
                )}
              </div>

              <div className="dashboard-profit-description">
                Si vendieras todo el stock
              </div>

            </div>

          </div>

        </div>

        {/* BENEFICIO */}

        <div className="col-lg-4">

          <div className="dashboard-profit-card">

            <div className="dashboard-profit-icon">
              <DollarSign size={21} />
            </div>

            <div>

              <div className="dashboard-profit-label">
                Beneficio potencial
              </div>

              <div className="dashboard-profit-value">
                {formatCurrency(
                  potentialProfit
                )}
              </div>

              <div className="dashboard-profit-description">
                Venta total menos coste
              </div>

            </div>

          </div>

        </div>

        {/* MARGEN */}

        <div className="col-lg-4">

          <div className="dashboard-profit-card">

            <div className="dashboard-profit-icon">
              <Percent size={21} />
            </div>

            <div>

              <div className="dashboard-profit-label">
                Margen potencial
              </div>

              <div className="dashboard-profit-value">
                {potentialMargin}%
              </div>

              <div className="dashboard-profit-description">
                Margen sobre el valor de venta
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* GRÁFICO + IA */}

      <div className="row g-4 mb-4">

        {/* GRÁFICO */}

        <div className="col-xl-8">

          <div className="dashboard-panel">

            <div className="dashboard-panel-header">

              <div>

                <h2>
                  Ventas últimos 30 días
                </h2>

                <p>
                  Evolución de las ventas de tu negocio.
                </p>

              </div>

            </div>

            <div className="dashboard-chart-container">

              <SalesChart
                sales={sales}
              />

            </div>

          </div>

        </div>

        {/* IA */}

        <div className="col-xl-4">

          <div className="dashboard-ai-card">

            <div className="dashboard-ai-header">

              <div className="dashboard-ai-icon">
                <Sparkles size={22} />
              </div>

              <div>

                <h2>
                  MyStock AI
                </h2>

                <span>
                  Asistente inteligente
                </span>

              </div>

            </div>

            <div className="dashboard-ai-content">

              <p>
                Bienvenido a MyStock.
              </p>

              <p>
                Estamos preparando el análisis
                inteligente de tu negocio.
              </p>

              <div className="dashboard-ai-list">

                <div>
                  <span>•</span>
                  Analizar productos
                </div>

                <div>
                  <span>•</span>
                  Detectar productos a reponer
                </div>

                <div>
                  <span>•</span>
                  Analizar ventas
                </div>

                <div>
                  <span>•</span>
                  Mejorar la rentabilidad
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ÚLTIMAS VENTAS + STOCK */}

      <div className="row g-4">

        {/* ÚLTIMAS VENTAS */}

        <div className="col-xl-8">

          <div className="dashboard-panel">

            <RecentSales
              sales={sales}
            />

          </div>

        </div>

        {/* STOCK BAJO */}

        <div className="col-xl-4">

          <div className="dashboard-panel">

            <LowStockProducts
              products={products}
            />

          </div>

        </div>

      </div>

    </div>
  );
}