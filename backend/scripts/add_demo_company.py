"""
Añade la empresa de demostración "Bella Cosmética" a una base de datos
que YA tiene datos (p. ej. producción en Railway), como una empresa más.

Modo seguro:

- Solo INSERTA: nunca borra, vacía ni migra nada. Si el esquema no está
  en la última migración, se niega (despliega primero el backend).
- Si la empresa demo ya existe (mismo nombre o CIF) o alguno de sus
  emails ya está en uso, no hace nada.
- Todo va en una sola transacción: si algo falla, no queda nada a medias.
- Antes de guardar comprueba que las filas de las demás empresas son
  exactamente las mismas que antes (huella de todas las tablas).
- --dry-run hace todo lo anterior y al final deshace: no guarda nada.
- Sin --yes pide confirmación escribiendo el nombre de la empresa.

Uso (desde backend/, con el venv activado):

    # PowerShell
    $env:DEMO_ADMIN_PASSWORD = "<contraseña administradora>"
    $env:DEMO_STAFF_PASSWORD = "<contraseña encargada y cajero>"
    $env:TARGET_DATABASE_URL = "<URL pública de PostgreSQL>"
    python scripts/add_demo_company.py --dry-run
    python scripts/add_demo_company.py

    # O sin copiar la URL, con la CLI de Railway (inyecta
    # DATABASE_PUBLIC_URL del servicio Postgres):
    railway run --service Postgres python scripts/add_demo_company.py --dry-run

Variables de entorno:

    TARGET_DATABASE_URL   base de datos destino; si falta se usa
                          DATABASE_PUBLIC_URL. DATABASE_URL y el fichero
                          .env se ignoran a propósito.
    DEMO_ADMIN_PASSWORD   obligatoria (mínimo 8 caracteres)
    DEMO_STAFF_PASSWORD   obligatoria (mínimo 8), encargada y cajero
    DEMO_ADMIN_EMAIL      por defecto laura@bellacosmetica.example
    DEMO_SEED             semilla aleatoria (por defecto 2026)
"""

import argparse
import hashlib
import os
import random
import sys


SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(SCRIPTS_DIR, ".."))
sys.path.insert(0, SCRIPTS_DIR)

import seed_demo  # noqa: E402  (solo datos y funciones; no ejecuta nada)
from seed_demo import (  # noqa: E402
    ADMIN_NAME, COMPANY, DEFAULT_ADMIN_EMAIL, LOW_STOCK_FINAL, STAFF, fail,
)

# Clave para pg_advisory_xact_lock: dos ejecuciones a la vez no pueden
# crear la demo dos veces.
LOCK_KEY = 2026_1111


def read_settings():
    url = (os.environ.get("TARGET_DATABASE_URL")
           or os.environ.get("DATABASE_PUBLIC_URL") or "").strip()
    if not url:
        fail("Define TARGET_DATABASE_URL (o ejecuta con `railway run "
             "--service Postgres`, que define DATABASE_PUBLIC_URL).")
    if ".railway.internal" in url:
        fail("Esa URL es la interna de Railway y no funciona desde tu "
             "ordenador. Usa DATABASE_PUBLIC_URL.")

    admin_password = os.environ.get("DEMO_ADMIN_PASSWORD") or ""
    staff_password = os.environ.get("DEMO_STAFF_PASSWORD") or ""
    if len(admin_password) < 8:
        fail("Define DEMO_ADMIN_PASSWORD (mínimo 8 caracteres).")
    if len(staff_password) < 8:
        fail("Define DEMO_STAFF_PASSWORD (mínimo 8 caracteres).")

    admin_email = (os.environ.get("DEMO_ADMIN_EMAIL")
                   or DEFAULT_ADMIN_EMAIL).strip().lower()

    return url, admin_email, admin_password, staff_password


def build_app(url):
    # Fijar el entorno ANTES de importar la app: config.py carga .env,
    # pero load_dotenv no pisa variables ya definidas.
    os.environ["DATABASE_URL"] = url
    os.environ["APP_ENV"] = "development"   # no sirve peticiones
    sys.path.insert(0, BACKEND_DIR)
    from app import create_app

    return create_app()


def check_schema_is_current(db):
    from alembic.runtime.migration import MigrationContext
    from alembic.script import ScriptDirectory

    script = ScriptDirectory(os.path.join(BACKEND_DIR, "migrations"))
    heads = set(script.get_heads())

    with db.engine.connect() as connection:
        current = set(MigrationContext.configure(connection)
                      .get_current_heads())

    if current != heads:
        fail(
            f"El esquema de la base de datos ({', '.join(current) or 'vacío'}) "
            f"no está en la última migración ({', '.join(heads)}). "
            "Despliega primero el backend; este script no migra."
        )


def existing_demo(admin_email):
    """Motivo por el que la demo ya existe, o None."""
    from models import Company, User

    company = Company.query.filter(
        (Company.name == COMPANY["name"]) | (Company.tax_id == COMPANY["tax_id"])
    ).first()
    if company:
        return f'ya existe la empresa "{company.name}" (id {company.id})'

    emails = [admin_email] + [email for _, _, email in STAFF]
    user = User.query.filter(User.email.in_(emails)).first()
    if user:
        return f"el email {user.email} ya está en uso"

    return None


def fingerprint(db, exclude_company_id=None):
    """
    {tabla: (filas, sha256)} de todas las tablas, sin las filas de la
    empresa indicada. Sirve para comprobar que nada ajeno cambia.
    """
    from sqlalchemy import select

    tables = {t.name: t for t in db.metadata.sorted_tables}
    result = {}

    for name, table in tables.items():
        query = select(table)
        cid = exclude_company_id

        if cid is not None:
            if name == "companies":
                query = query.where(table.c.id != cid)
            elif "company_id" in table.c:
                query = query.where(table.c.company_id != cid)
            elif "sale_id" in table.c:
                sales = tables["sales"]
                query = query.where(table.c.sale_id.not_in(
                    select(sales.c.id).where(sales.c.company_id == cid)))
            elif "purchase_id" in table.c:
                purchases = tables["purchases"]
                query = query.where(table.c.purchase_id.not_in(
                    select(purchases.c.id).where(purchases.c.company_id == cid)))

        query = query.order_by(*table.primary_key.columns)
        digest = hashlib.sha256()
        count = 0
        for row in db.session.execute(query):
            digest.update(repr(tuple(row)).encode())
            count += 1
        result[name] = (count, digest.hexdigest())

    return result


def check_demo(db, company, products):
    from sqlalchemy import func

    from models import PurchaseItem, SaleItem, StockMovement

    problems = []
    for product in products:
        bought = db.session.query(func.coalesce(func.sum(
            PurchaseItem.quantity), 0)).filter_by(product_id=product.id).scalar()
        sold = db.session.query(func.coalesce(func.sum(
            SaleItem.quantity), 0)).filter_by(product_id=product.id).scalar()
        last = (StockMovement.query.filter_by(product_id=product.id)
                .order_by(StockMovement.created_at.desc(),
                          StockMovement.id.desc()).first())
        if bought - sold != product.stock:
            problems.append(f"{product.sku}: compras - ventas != stock")
        if last and last.resulting_stock != product.stock:
            problems.append(f"{product.sku}: último movimiento != stock")

    out = sum(1 for p in products if p.stock <= 0)
    low = sum(1 for p in products if 0 < p.stock <= p.min_stock)
    if out != 1 or low != len(LOW_STOCK_FINAL):
        problems.append(f"se esperaban 1 sin stock y {len(LOW_STOCK_FINAL)} "
                        f"en stock bajo; hay {out} y {low}")
    return problems


def summary(db, company):
    from sqlalchemy import func

    from models import (Client, Product, Purchase, Sale, StockMovement,
                        Supplier, User)

    def count(model):
        return model.query.filter_by(company_id=company.id).count()

    revenue = db.session.query(func.coalesce(func.sum(Sale.total), 0)) \
        .filter_by(company_id=company.id).scalar()
    return (
        f"  Usuarios: {count(User)} · Proveedores: {count(Supplier)} · "
        f"Productos: {count(Product)} · Clientes: {count(Client)}\n"
        f"  Compras: {count(Purchase)} · Ventas: {count(Sale)} "
        f"({float(revenue):,.2f} €) · Movimientos: {count(StockMovement)}"
    )


def main():
    parser = argparse.ArgumentParser(
        description='Añade la empresa demo "Bella Cosmética" sin tocar '
                    "los datos existentes.")
    parser.add_argument("--dry-run", action="store_true",
                        help="hace todo y lo deshace al final; no guarda nada")
    parser.add_argument("--yes", action="store_true",
                        help="no pedir confirmación")
    args = parser.parse_args()

    url, admin_email, admin_password, staff_password = read_settings()

    app = build_app(url)

    from sqlalchemy.engine import make_url
    from sqlalchemy import text

    from extensions import db
    from models import Company, User

    target = make_url(app.config["SQLALCHEMY_DATABASE_URI"]) \
        .render_as_string(hide_password=True)

    with app.app_context():
        check_schema_is_current(db)

        if db.engine.dialect.name == "postgresql":
            db.session.execute(text("SELECT pg_advisory_xact_lock(:key)"),
                               {"key": LOCK_KEY})

        print(f"Base de datos: {target}")
        print(f"Empresas existentes: {Company.query.count()} · "
              f"usuarios: {User.query.count()}")

        reason = existing_demo(admin_email)
        if reason:
            db.session.rollback()
            print(f"No se hace nada: {reason}.")
            return

        before = fingerprint(db)

        try:
            rng = random.Random(int(os.environ.get("DEMO_SEED") or "2026"))
            company, products = seed_demo.seed(
                rng, admin_email, admin_password, staff_password,
                commit=False)

            problems = check_demo(db, company, products)
            after = fingerprint(db, exclude_company_id=company.id)
            changed = [name for name in before if before[name] != after[name]]
            if changed:
                problems.append("han cambiado datos ajenos a la demo en: "
                                + ", ".join(changed))
            if problems:
                raise RuntimeError("\n  - " + "\n  - ".join(problems))

            rows = sum(count for count, _ in before.values())
            print(f"\nComprobado: los datos existentes no cambian "
                  f"({rows} filas en {len(before)} tablas).")
            print(f'Empresa demo preparada: "{company.name}"')
            print(summary(db, company))

            if args.dry_run:
                db.session.rollback()
                print("\nSimulación (--dry-run): no se ha guardado nada.")
                return

            if not args.yes:
                answer = input(f'\nEscribe "{company.name}" para guardarla '
                               f"en {target}: ")
                if answer.strip() != company.name:
                    db.session.rollback()
                    print("Cancelado: no se ha guardado nada.")
                    return

            db.session.commit()
        except Exception as error:
            db.session.rollback()
            fail(f"No se ha guardado nada. {error}")

    print("\nGuardado. Accesos:")
    print(f"  {ADMIN_NAME} (administrator): {admin_email}  "
          "(contraseña: DEMO_ADMIN_PASSWORD)")
    for name, role, email in STAFF:
        print(f"  {name} ({role}): {email}  (contraseña: DEMO_STAFF_PASSWORD)")


if __name__ == "__main__":
    main()
