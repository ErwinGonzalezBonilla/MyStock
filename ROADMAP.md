# 🚀 MyStock Roadmap

## ✅ Done

### Foundation
- [x] Project setup
- [x] Dashboard and sidebar
- [x] Company page (tax details, country, currency)
- [x] Flask REST API
- [x] Database schema managed with Flask-Migrate
- [x] Configuration through environment variables

### Products & inventory
- [x] Create, list, edit and search products
- [x] Automatic SKU and barcode lookup
- [x] Categories from the company's own products
- [x] Archive/restore products with history instead of deleting them
- [x] Stock movements (in, out, adjustment) with history
- [x] Low stock alerts using each product's minimum stock
- [x] Inventory page

### Sales, purchases, customers & suppliers
- [x] Sales (POS) with cart, SKU/barcode lookup and customer
- [x] Customers with purchase history and metrics
- [x] Suppliers
- [x] Purchases with cart and details

### Auth & multi-company
- [x] Sign-up, JWT login and sessions
- [x] Multi-company data isolation
- [x] Roles and permissions (Administrator, Manager, Cashier, Employee)
- [x] User management for administrators
- [x] Show/hide password
- [x] Forgot password (phase 1): link on the login page asking the user to contact their company administrator, who sets a new password from Users

### Reports & demo
- [x] Reports (sales per day, best-selling products, stock value)
- [x] Dashboard with real data
- [x] Demo database seed script ("Bella Cosmética")

### Deployment preparation
- [x] Backend ready for Railway (gunicorn, PostgreSQL, pre-deploy migrations, healthcheck)
- [x] Frontend ready for Vercel (`frontend/vercel.json`)

## 🔜 Next: first release
- [ ] Deploy backend + PostgreSQL on Railway
- [ ] Deploy frontend on Vercel and set `CORS_ORIGINS` / `VITE_API_URL`
- [ ] End-to-end check in production (sign-up, login, sale, purchase)
- [ ] Forgot password (phase 2): password recovery by email with Resend or similar (time-limited single-use reset token, link to set a new password, no user enumeration)
- [ ] Void sales and purchases (restoring stock)
- [ ] Review PostgreSQL backups
- [ ] Legal notice and privacy policy

## 🛠 Improvements
- [ ] Server-side reports and pagination (today they are computed in the browser)
- [ ] Frontend tests
- [ ] Import/export products (CSV/Excel)
- [ ] Product images
- [ ] Camera barcode scanner
- [ ] Printable receipts/invoices (PDF)

## 💡 Later
- [ ] AI assistant (natural language questions, restock recommendations, demand forecasting, automatic reports)
- [ ] Automations with n8n (low stock alerts, daily/weekly sales summary, supplier reminders)
- [ ] Stripe subscriptions
- [ ] Public SaaS launch
