// =========================================================
// PERMISOS POR ROL (copia de backend/role_protection.py)
// =========================================================
// Las claves son los mismos nombres de endpoint que usa
// ROLE_PERMISSIONS en el backend, para poder compararlos línea
// a línea. Si cambias un permiso allí, cámbialo también aquí.
//
// Esto solo decide qué botones se muestran. La seguridad real
// está en el backend, que rechaza con 403 lo que no esté permitido.
// =========================================================

const ALL_ROLES = ["administrator", "manager", "cashier", "employee"];
const ADMIN = ["administrator"];
const ADMIN_MANAGER = ["administrator", "manager"];
const SELLERS = ["administrator", "manager", "cashier"];

export const PERMISSIONS = {
  // Company
  "companies.update_current_company": ADMIN,

  // Products
  "products.get_products": ALL_ROLES,
  "products.create_product": ADMIN_MANAGER,
  "products.update_product": ADMIN_MANAGER,
  "products.delete_product": ADMIN_MANAGER,
  "products.archive_product": ADMIN_MANAGER,
  "products.restore_product": ADMIN_MANAGER,

  // Sales
  "sales.get_sales": ALL_ROLES,
  "sales.create_sale": SELLERS,

  // Clients
  "clients.get_clients": ALL_ROLES,
  "clients.create_client": SELLERS,
  "clients.update_client": SELLERS,
  "clients.delete_client": ADMIN_MANAGER,

  // Suppliers
  "supplier.get_suppliers": ADMIN_MANAGER,
  "supplier.create_supplier": ADMIN_MANAGER,
  "supplier.update_supplier": ADMIN_MANAGER,
  "supplier.delete_supplier": ADMIN_MANAGER,

  // Purchases
  "purchase.get_purchases": ADMIN_MANAGER,
  "purchase.create_purchase": ADMIN_MANAGER,

  // Stock movements
  "stock_movements.get_stock_movements": ALL_ROLES,
  "stock_movements.create_stock_movement": ADMIN_MANAGER,

  // Users
  "users.get_users": ADMIN,
  "users.create_user": ADMIN,
  "users.update_user": ADMIN,
};

export function roleCan(role, permission) {
  const roles = PERMISSIONS[permission];

  // Igual que el backend: sin permiso configurado, denegado.
  return Boolean(role && roles && roles.includes(role));
}
