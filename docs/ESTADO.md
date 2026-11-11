# Estado de MyStock

_Actualizado: 11/11/2026_

## 1. Qué es

MyStock es una aplicación SaaS multiempresa para que pequeños negocios gestionen inventario, ventas, compras, clientes y proveedores.
**Frontend:** React 19 + Vite + React Router + Recharts. **Backend:** Flask 3 + SQLAlchemy + Flask-Migrate + JWT.
**Base de datos:** SQLite en local y PostgreSQL en producción (Railway). El frontend irá a Vercel.

## 2. Hecho y funcionando

| Módulo | Estado |
|---|---|
| **Autenticación** | Registro de empresa + administrador, login con JWT, sesión persistente, mostrar/ocultar contraseña, página "¿Olvidaste tu contraseña?" (fase 1: avisa de que el administrador la cambie). |
| **Multiempresa** | Todos los datos aislados por empresa (cubierto por tests). |
| **Roles y permisos** | Administrador, Encargado, Cajero y Empleado; el backend lo aplica y el frontend solo muestra lo permitido (los permisos se comprueban sincronizados con un test). |
| **Usuarios** | El administrador crea, edita, desactiva y borra usuarios y les cambia la contraseña. |
| **Empresa** | Datos fiscales, país y moneda; la moneda se usa en toda la app (formato español: 1.234,56 €). |
| **Productos** | Alta, edición, búsqueda, SKU automático según el formato de la empresa, código de barras, categorías propias, stock mínimo por producto. Los productos con historial se archivan (y se pueden restaurar) en lugar de borrarse. |
| **Stock / Inventario** | Movimientos de entrada, salida y ajuste con historial filtrable; los cambios de stock desde la edición quedan como ajuste; aviso de stock bajo según el mínimo de cada producto. |
| **Ventas** | TPV con carrito, búsqueda por SKU/código de barras, cliente asociado; descuenta stock y crea movimientos. |
| **Compras** | Carrito de compra por proveedor, detalle de cada compra; suma stock y crea movimientos. |
| **Clientes y proveedores** | CRUD completo; historial y métricas de compra por cliente. |
| **Dashboard** | Datos reales: ventas, margen, gráfico de ventas, ventas recientes (con varios artículos) y productos con stock bajo. |
| **Informes** | Ventas por día (7/30 días…), productos más vendidos y valor del stock. |
| **Producción** | Configuración por variables de entorno, migraciones, gunicorn, `railway.json` con `flask db upgrade` en el pre-deploy y healthcheck `/api/health`. Guía en `docs/deployment.md`. |
| **Tests** | 50 tests del backend, todos en verde (`python -m unittest discover -s tests` en `backend/`). |

## 3. A medias o con problemas conocidos

- **Ventas y compras no se pueden anular ni editar**: la API solo permite crearlas y listarlas. Un error hay que corregirlo con un ajuste de stock.
- **Informes y dashboard se calculan en el navegador** descargando todas las ventas y productos. Sin paginación: irá lento cuando haya muchos datos.
- **Sin tests del frontend.**
- **Documentos vacíos en `docs/`**: `architecture.md`, `api.md`, `database.md`, `roadmap.md`, etc. (el `README.md` y el `ROADMAP.md` ya están al día).
- **Bundle del frontend de más de 500 kB**: Vite avisa al construir. Funciona, pero conviene dividirlo por páginas (`import()` dinámico).
- **Recuperación de contraseña** solo en fase 1 (hay que pedírsela al administrador).

## 4. Qué falta para publicar

1. **Backend en Railway**: crear el proyecto y la base PostgreSQL, definir `APP_ENV`, `DATABASE_URL`, `JWT_SECRET_KEY` y `CORS_ORIGINS`, generar dominio y comprobar `/api/health` (pasos en `docs/deployment.md`).
2. **Frontend en Vercel**: importar el repo con Root Directory `frontend` y definir `VITE_API_URL` con la URL de Railway. `frontend/vercel.json` ya está listo (build de Vite, salida `dist/` y fallback SPA a `index.html`); pasos en `docs/deployment.md`.
3. Poner la URL de Vercel en `CORS_ORIGINS` y probar registro, login, venta y compra de punta a punta.
4. **Recuperación de contraseña por email** (fase 2): Resend o similar, token de un solo uso con caducidad, enlace para fijar la nueva contraseña y sin revelar si el email existe.
5. Revisar copias de seguridad de PostgreSQL en Railway.
6. Recomendable antes de abrir a clientes: anular ventas/compras, aviso legal / política de privacidad.
7. Más adelante: suscripciones con Stripe.

## 5. Ideas para después

- **IA**: asistente que responda en lenguaje natural ("¿qué vendí más este mes?"), recomendaciones de reposición, previsión de demanda e informes automáticos.
- **Automatizaciones con n8n**: aviso de stock bajo por email/WhatsApp/Telegram, resumen diario o semanal de ventas, recordatorios de pedidos a proveedores.
- Importar/exportar productos en CSV/Excel, imágenes de producto (Cloudinary), lector de códigos de barras con la cámara, tickets/facturas en PDF.

## 6. Demo: Bella Cosmética

El script `backend/scripts/seed_demo.py` crea una tienda de cosmética de Madrid con productos, proveedores, clientes, compras de los últimos 45 días y unas 150 ventas de los últimos 30 días, todo cuadrado con el stock. Usa una base **separada** (`backend/instance/demo.db`) y se niega a tocar `mystock.db`.

```powershell
cd backend
.\venv\Scripts\Activate.ps1
$env:DEMO_ADMIN_PASSWORD = "<contraseña del administrador>"   # mínimo 8 caracteres
$env:DEMO_STAFF_PASSWORD = "<contraseña encargada y cajero>"  # opcional; si falta se genera
python scripts/seed_demo.py --reset      # crea (o recrea) instance/demo.db

# Arrancar el backend con la base de demo
$env:DATABASE_URL = "sqlite:///demo.db"
python app.py

# En otra terminal
cd frontend
npm run dev
```

Accesos: `laura@bellacosmetica.example` (administradora), `carmen@bellacosmetica.example` (encargada) y `daniel@bellacosmetica.example` (cajero). Las fechas son relativas al día en que se ejecuta: **regenera la base justo antes de grabar**. Para volver a tus datos normales, cierra la terminal o borra `$env:DATABASE_URL`.

## 7. Último commit

`6e45f76` — 11/11/2026 15:41 — _docs: update README and ROADMAP to the real state and add vercel.json_

(Este documento se actualiza en el commit siguiente.)
