// =========================================================
// ESTADO DEL STOCK DE UN PRODUCTO
// =========================================================
// Única regla de "stock bajo" para toda la app (Dashboard,
// Productos, Inventario). Usa el stock mínimo de CADA producto:
//
//   - "out" Sin stock:  stock <= 0
//   - "low" Stock bajo: stock <= stock mínimo del producto
//   - "ok"  Correcto:   el resto
//
// Un producto con stock mínimo 0 solo avisa cuando se agota.
// =========================================================

export const STOCK_STATUS = {
  out: {
    label: "Sin stock",
    badgeClass: "bg-danger",
    textClass: "text-danger",
  },
  low: {
    label: "Stock bajo",
    badgeClass: "bg-warning text-dark",
    textClass: "text-warning",
  },
  ok: {
    label: "Correcto",
    badgeClass: "bg-success",
    textClass: "text-success",
  },
};

export function getStockStatus(product) {
  const stock = Number(product?.stock) || 0;
  const minStock = Number(product?.minStock) || 0;

  if (stock <= 0) {
    return "out";
  }

  if (stock <= minStock) {
    return "low";
  }

  return "ok";
}

// Sin stock o por debajo del mínimo: hay que reponer.
export function needsRestock(product) {
  return getStockStatus(product) !== "ok";
}
