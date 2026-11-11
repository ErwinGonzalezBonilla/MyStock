<div align="center">

# 📦 MyStock

### Inventory & Business Management for Small Businesses

Manage inventory, sales, purchases, customers and suppliers from one place.

Built with React, Flask and PostgreSQL.

---

🚧 **Project Status:** MVP complete — preparing the first deployment (Railway + Vercel)

</div>

---

# 📖 About

MyStock is a multi-company (multi-tenant) SaaS platform that helps small and medium-sized businesses manage their inventory, point of sale (POS), purchases, sales, customers and suppliers.

The project is being developed as a real commercial product. Artificial Intelligence and workflow automation are planned on top of the current core.

---

# ✅ Features (available today)

- **Multi-company:** every company only sees its own data.
- **Authentication:** company + administrator sign-up, JWT login, show/hide password, "forgot password" page (the company administrator resets it).
- **Roles & permissions:** Administrator, Manager, Cashier and Employee, enforced by the API and reflected in the UI.
- **Users:** administrators create, edit, deactivate and delete users and reset their passwords.
- **Company:** tax details, country and currency (used across the app).
- **Products:** create, edit, search, automatic SKU, barcode, categories, per-product minimum stock, archive/restore.
- **Inventory:** stock movements (in, out, adjustment) with a filterable history and low stock alerts.
- **Sales (POS):** cart, SKU/barcode lookup, customer selection; stock is updated automatically.
- **Purchases:** purchase cart by supplier and purchase details; stock is updated automatically.
- **Customers & suppliers:** full management, customer purchase history and metrics.
- **Dashboard:** sales, margin, sales chart, recent sales and low stock products.
- **Reports:** sales per day, best-selling products and stock value.

---

# 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Recharts, lucide-react |
| Backend | Python 3.13, Flask 3, Flask-SQLAlchemy, Flask-Migrate (Alembic), Flask-JWT-Extended, gunicorn |
| Database | SQLite (local development), PostgreSQL (production) |
| Deployment | Railway (API + PostgreSQL), Vercel (frontend) |

---

# 🏗 Architecture

```text
React (Vite, Vercel)
        │  REST + JWT
        ▼
Flask API (gunicorn, Railway)
        │  SQLAlchemy
        ▼
PostgreSQL (Railway)  ·  SQLite in local development
```

```text
backend/    Flask API: models/, routes/, migrations/, tests/, scripts/seed_demo.py
frontend/   React app: src/pages, src/components, src/services/api.js
docs/       ESTADO.md (current status), deployment.md (Railway + Vercel)
```

---

# 🚀 Getting Started (local)

**Backend** (Windows PowerShell):

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
flask db upgrade          # creates instance/mystock.db
python app.py             # http://127.0.0.1:5000
```

**Frontend:**

```powershell
cd frontend
npm install
npm run dev               # http://localhost:5173
```

Configuration is optional in development. See `.env.example` (backend) and `frontend/.env.example`.

**Tests** (backend):

```powershell
cd backend
python -m unittest discover -s tests
```

**Demo data:** `backend/scripts/seed_demo.py` creates a separate demo database ("Bella Cosmética"). See [docs/ESTADO.md](docs/ESTADO.md#6-demo-bella-cosmética).

---

# ☁️ Deployment

- **Backend:** Railway with PostgreSQL. Migrations run automatically before each deploy and `/api/health` is used as healthcheck.
- **Frontend:** Vercel with Root Directory `frontend` and `VITE_API_URL` pointing to the API. `frontend/vercel.json` handles the SPA routing.

Step-by-step guide: [docs/deployment.md](docs/deployment.md).

---

# 🗺 Roadmap

See [ROADMAP.md](ROADMAP.md). Next steps: first deployment, password recovery by email, voiding sales and purchases. Later: AI assistant, n8n automations and Stripe subscriptions.

---

# 📂 Documentation

- [docs/ESTADO.md](docs/ESTADO.md) — current status, known issues and demo (Spanish)
- [docs/deployment.md](docs/deployment.md) — deployment on Railway + Vercel (Spanish)
- [CHANGELOG.md](CHANGELOG.md)

---

# 👨‍💻 Author

**Erwin Alexander González Bonilla**

Full Stack Developer

Madrid, Spain 🇪🇸
