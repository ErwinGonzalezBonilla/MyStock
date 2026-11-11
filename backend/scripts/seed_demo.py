"""
Datos de demostración de MyStock: "Bella Cosmética" (Madrid).

Crea una base de datos SEPARADA para grabar demos. Nunca toca
instance/mystock.db: si la URL apunta a ella, el script se niega.

Uso (desde la carpeta backend, con el venv activado):

    # PowerShell
    $env:DEMO_ADMIN_PASSWORD = "<contraseña del administrador>"
    python scripts/seed_demo.py            # crea instance/demo.db
    python scripts/seed_demo.py --reset    # la borra y la vuelve a crear

Variables de entorno:

    DEMO_ADMIN_PASSWORD   obligatoria (mínimo 8 caracteres)
    DEMO_ADMIN_EMAIL      por defecto laura@bellacosmetica.example
    DEMO_STAFF_PASSWORD   para la encargada y el cajero; si falta se
                          genera una aleatoria y se muestra al final
    DEMO_DATABASE_URL     por defecto sqlite:///demo.db
                          (DATABASE_URL también vale si está definida
                          en el entorno; el fichero .env se ignora)
    DEMO_SEED             semilla aleatoria (por defecto 2026)

Las fechas son relativas al momento de ejecución: ventas de los
últimos 30 días y compras de los últimos 45. Conviene regenerar la
base justo antes de grabar.

Cada compra y cada venta se aplica como en la API (routes/purchase.py
y routes/sale.py): actualiza el stock y crea su movimiento con el
stock resultante, en orden cronológico, para que todo cuadre.
"""

import argparse
import math
import os
import random
import secrets
import sys
from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

PROTECTED_DB_FILES = {"mystock.db", "mystock.backup.db"}

TZ = ZoneInfo("Europe/Madrid")


# =========================================================
# DATOS
# =========================================================

COMPANY = {
    "name": "Bella Cosmética",
    "tax_id": "B00000000",
    "email": "hola@bellacosmetica.example",
    "phone": "+34 910 000 000",
    "country": "España",
    "currency": "EUR",
}

# (nombre, rol, email). El email del admin se puede cambiar por entorno.
STAFF = [
    ("Carmen Ruiz", "manager", "carmen@bellacosmetica.example"),
    ("Daniel Ortega", "cashier", "daniel@bellacosmetica.example"),
]
ADMIN_NAME = "Laura Martín"
DEFAULT_ADMIN_EMAIL = "laura@bellacosmetica.example"

SUPPLIERS = [
    {
        "key": "iberia",
        "name": "Distribuciones Cosméticas Iberia S.L.",
        "tax_id": "B00000001",
        "phone": "+34 916 000 101",
        "email": "pedidos@cosmeticasiberia.example",
        "address": "Polígono Industrial Las Fronteras, nave 12",
        "city": "Torrejón de Ardoz",
        "postal_code": "28850",
        "categories": ["Cuidado facial", "Corporal"],
    },
    {
        "key": "belleza",
        "name": "Belleza Profesional Centro S.L.",
        "tax_id": "B00000002",
        "phone": "+34 915 000 202",
        "email": "comercial@bellezacentro.example",
        "address": "Calle de la Industria, 8",
        "city": "Getafe",
        "postal_code": "28906",
        "categories": ["Maquillaje", "Uñas"],
    },
    {
        "key": "capilar",
        "name": "Capilar Pro Suministros S.L.",
        "tax_id": "B00000003",
        "phone": "+34 918 000 303",
        "email": "ventas@capilarpro.example",
        "address": "Avenida de la Técnica, 21",
        "city": "Alcobendas",
        "postal_code": "28108",
        "categories": ["Cabello"],
    },
    {
        "key": "esencias",
        "name": "Esencias del Mediterráneo S.A.",
        "tax_id": "A00000004",
        "phone": "+34 960 000 404",
        "email": "pedidos@esenciasmed.example",
        "address": "Carrer del Perfum, 3",
        "city": "Valencia",
        "postal_code": "46015",
        "categories": ["Perfumes"],
    },
]

# Días (respecto a hoy) en que cada proveedor sirve pedido. El primero
# es el pedido de apertura; los demás, reposiciones.
SUPPLIER_DELIVERY_DAYS = {
    "iberia": [-45, -31, -17, -6],
    "belleza": [-44, -30, -16, -5],
    "capilar": [-43, -29, -15, -4],
    "esencias": [-42, -28, -14, -3],
}

# (categoría, nombre, compra €, venta €, stock mínimo, popularidad)
PRODUCTS = [
    ("Cuidado facial", "Sérum facial vitamina C 30 ml", 9.80, 22.95, 5, 8),
    ("Cuidado facial", "Crema hidratante ácido hialurónico 50 ml", 7.40, 17.50, 6, 9),
    ("Cuidado facial", "Agua micelar 400 ml", 2.90, 6.95, 8, 10),
    ("Cuidado facial", "Contorno de ojos con cafeína 15 ml", 6.20, 14.90, 4, 5),
    ("Cuidado facial", "Protector solar facial SPF 50 50 ml", 7.10, 16.95, 6, 7),
    ("Maquillaje", "Base de maquillaje fluida 30 ml", 6.80, 15.95, 5, 7),
    ("Maquillaje", "Máscara de pestañas volumen", 4.20, 10.95, 6, 9),
    ("Maquillaje", "Barra de labios mate", 3.60, 8.95, 6, 8),
    ("Maquillaje", "Corrector líquido alta cobertura", 3.90, 9.50, 4, 6),
    ("Maquillaje", "Paleta de sombras 12 tonos", 8.50, 19.90, 3, 4),
    ("Cabello", "Champú reparador con keratina 400 ml", 3.40, 8.50, 6, 8),
    ("Cabello", "Acondicionador nutritivo de argán 300 ml", 3.60, 8.95, 5, 6),
    ("Cabello", "Mascarilla capilar intensiva 250 ml", 5.10, 12.50, 4, 5),
    ("Cabello", "Aceite capilar de argán 100 ml", 6.30, 14.95, 3, 4),
    ("Cabello", "Protector térmico en spray 200 ml", 4.10, 9.95, 4, 4),
    ("Corporal", "Crema corporal manteca de karité 400 ml", 4.30, 10.50, 5, 6),
    ("Corporal", "Gel de ducha de avena 750 ml", 1.90, 4.75, 8, 8),
    ("Corporal", "Exfoliante corporal de azúcar 200 ml", 4.60, 11.25, 3, 4),
    ("Corporal", "Aceite corporal seco 100 ml", 6.40, 15.50, 3, 3),
    ("Corporal", "Desodorante roll-on sin aluminio 50 ml", 2.10, 5.25, 6, 7),
    ("Perfumes", "Eau de parfum floral 100 ml", 18.50, 42.00, 2, 3),
    ("Perfumes", "Eau de toilette cítrica 100 ml", 13.90, 32.50, 2, 3),
    ("Perfumes", "Colonia fresca infantil 200 ml", 6.20, 13.95, 3, 3),
    ("Perfumes", "Bruma corporal de vainilla 250 ml", 5.40, 12.95, 4, 5),
    ("Perfumes", "Eau de parfum amaderado 50 ml", 16.20, 36.90, 2, 2),
    ("Uñas", "Esmalte de uñas rojo pasión 10 ml", 2.40, 5.95, 6, 7),
    ("Uñas", "Top coat efecto gel 10 ml", 2.70, 6.50, 5, 5),
    ("Uñas", "Quitaesmalte sin acetona 125 ml", 1.30, 3.50, 6, 6),
    ("Uñas", "Aceite de cutículas 15 ml", 2.90, 7.25, 3, 3),
    ("Uñas", "Kit lima y pulidor de uñas", 1.80, 4.95, 4, 4),
]

# Productos que deben acabar en stock bajo (stock final > 0 y <= mínimo).
LOW_STOCK_FINAL = {
    "Sérum facial vitamina C 30 ml": 2,
    "Máscara de pestañas volumen": 3,
    "Agua micelar 400 ml": 4,
}

# Producto agotado: se deja de vender este día (relativo a hoy) y
# acaba con stock 0.
OUT_OF_STOCK = "Eau de parfum floral 100 ml"
OUT_OF_STOCK_LAST_SALE_DAY = -6

CLIENTS = [
    ("María García López", "Calle de Fuencarral, 112, 3º B", "28004"),
    ("Lucía Fernández Gil", "Calle de Alcalá, 245, 1º A", "28028"),
    ("Paula Sánchez Moreno", "Calle de Bravo Murillo, 78, 4º D", "28003"),
    ("Elena Romero Díaz", "Calle de Goya, 54, 2º C", "28001"),
    ("Sara Navarro Torres", "Calle de Atocha, 31, 5º A", "28012"),
    ("Andrea Jiménez Ruiz", "Paseo de las Delicias, 90, 6º B", "28045"),
    ("Marta Álvarez Castro", "Calle de Toledo, 150, bajo", "28005"),
    ("Cristina Molina Ortiz", "Calle de Princesa, 22, 3º D", "28008"),
    ("Laura Delgado Vega", "Calle de Arturo Soria, 201, 1º C", "28043"),
    ("Irene Morales Prieto", "Calle de López de Hoyos, 66, 2º A", "28002"),
    ("Nuria Herrera Campos", "Calle del General Ricardos, 40, 4º B", "28019"),
    ("Javier Ramos Iglesias", "Calle de Embajadores, 87, 3º A", "28012"),
    ("Carlos Medina Santos", "Avenida de la Albufera, 120, 7º C", "28038"),
    ("Beatriz Cano Rubio", "Calle de Hortaleza, 15, 2º B", "28004"),
    ("Alba Serrano Marín", "Calle de Ríos Rosas, 33, 1º D", "28003"),
]

# Peso de cada día de la semana (lunes = 0). Domingo: horario reducido.
WEEKDAY_WEIGHT = [0.80, 0.85, 0.90, 1.00, 1.45, 1.70, 0.40]

# Horario comercial (hora local, peso) y el reducido del domingo.
HOURS = [(10, 0.6), (11, 0.9), (12, 1.3), (13, 1.3), (14, 0.7),
         (15, 0.5), (16, 0.6), (17, 1.0), (18, 1.4), (19, 1.5), (20, 1.0)]
SUNDAY_HOURS = [(11, 0.8), (12, 1.2), (13, 1.2), (14, 0.8)]

TOTAL_SALES = 150
SALES_DAYS = 30
SLOW_DAYS = 4                # días flojos (lluvia, puente…)
CLIENT_SHARE = 0.35          # ventas con cliente identificado


# =========================================================
# UTILIDADES
# =========================================================

def ean13(body12):
    """Añade el dígito de control a 12 dígitos."""
    total = sum(
        int(digit) * (3 if index % 2 else 1)
        for index, digit in enumerate(body12)
    )
    return body12 + str((10 - total % 10) % 10)


def to_utc(local_dt):
    """Hora local de Madrid -> UTC sin tzinfo (como guarda la app)."""
    return (
        local_dt.replace(tzinfo=TZ)
        .astimezone(timezone.utc)
        .replace(tzinfo=None)
    )


def local_at(day, hour, minute=0):
    return datetime.combine(day, time(hour, minute))


def hours_for(day):
    return SUNDAY_HOURS if day.weekday() == 6 else HOURS


def weighted_choice(rng, pairs):
    values, weights = zip(*pairs)
    return rng.choices(values, weights=weights, k=1)[0]


def round_up(value, step):
    return int(math.ceil(value / step) * step) if value > 0 else 0


def fail(message):
    print(f"ERROR: {message}", file=sys.stderr)
    sys.exit(1)


# =========================================================
# BASE DE DATOS
# =========================================================

def resolve_database_url():
    # Se lee ANTES de importar config (que carga .env), para que un
    # DATABASE_URL del .env apuntando a mystock.db no se cuele aquí.
    url = (
        os.environ.get("DEMO_DATABASE_URL")
        or os.environ.get("DATABASE_URL")
        or "sqlite:///demo.db"
    ).strip()
    os.environ["DATABASE_URL"] = url
    return url


def sqlite_file(app):
    """Ruta del fichero SQLite, o None si no es SQLite."""
    from sqlalchemy.engine import make_url

    url = make_url(app.config["SQLALCHEMY_DATABASE_URI"])

    if not url.drivername.startswith("sqlite"):
        return None

    if not url.database or url.database == ":memory:":
        return ":memory:"

    # Flask-SQLAlchemy resuelve las rutas relativas en instance/.
    path = url.database
    if not os.path.isabs(path):
        path = os.path.join(app.instance_path, path)
    return os.path.abspath(path)


def prepare_database(app, reset):
    from flask_migrate import upgrade
    from sqlalchemy import inspect, text

    from extensions import db
    from models import Company

    db_file = sqlite_file(app)

    if db_file and os.path.basename(db_file).lower() in PROTECTED_DB_FILES:
        fail(
            f"La URL apunta a {db_file}. Este script no toca la base "
            "de datos real; usa otra (por defecto sqlite:///demo.db)."
        )

    if db_file and db_file != ":memory:":
        os.makedirs(os.path.dirname(db_file), exist_ok=True)
        if reset and os.path.exists(db_file):
            os.remove(db_file)

    with app.app_context():
        tables = inspect(db.engine).get_table_names()

        if reset and not db_file and tables:
            db.drop_all()
            with db.engine.begin() as connection:
                connection.execute(text("DROP TABLE IF EXISTS alembic_version"))

        # Mismo esquema que la app: las migraciones.
        upgrade(directory=os.path.join(BACKEND_DIR, "migrations"))

        if Company.query.first():
            fail(
                "La base de datos de demo ya tiene datos. "
                "Ejecuta con --reset para regenerarla."
            )

    return db_file


# =========================================================
# GENERACIÓN
# =========================================================

def plan_sales(rng, products, today, now_local):
    """
    Devuelve [(datetime local, [(producto, cantidad), ...]), ...]:
    TOTAL_SALES ventas en los últimos SALES_DAYS días.
    """
    days = [today + timedelta(days=offset)
            for offset in range(-(SALES_DAYS - 1), 1)]

    # Los días flojos nunca caen en viernes ni sábado.
    slow_days = set(rng.sample(
        [day for day in days[:-1] if day.weekday() not in (4, 5)],
        SLOW_DAYS,
    ))

    weights = []
    for index, day in enumerate(days):
        trend = 1 + 0.30 * index / (len(days) - 1)
        weight = WEEKDAY_WEIGHT[day.weekday()] * trend * rng.uniform(0.85, 1.15)

        if day in slow_days:
            weight *= 0.35

        if day == today:
            # Solo la parte del día que ya ha pasado.
            hours = hours_for(day)
            elapsed = sum(w for h, w in hours if h + 1 <= now_local.hour)
            weight *= elapsed / sum(w for _, w in hours)

        weights.append(weight)

    # Reparto exacto de TOTAL_SALES (restos mayores).
    raw = [TOTAL_SALES * w / sum(weights) for w in weights]
    counts = [int(value) for value in raw]
    for index in sorted(range(len(raw)), key=lambda i: raw[i] - counts[i],
                        reverse=True)[:TOTAL_SALES - sum(counts)]:
        counts[index] += 1

    sales = []

    for day, count in zip(days, counts):
        hours = hours_for(day)
        if day == today:
            hours = [(h, w) for h, w in hours if h + 1 <= now_local.hour]
            if not hours:
                continue

        offset = (day - today).days
        sellable = [
            p for p in products
            if not (p["name"] == OUT_OF_STOCK
                    and offset > OUT_OF_STOCK_LAST_SALE_DAY)
        ]

        for _ in range(count):
            moment = local_at(day, weighted_choice(rng, hours),
                              rng.randint(0, 59))
            moment = moment.replace(second=rng.randint(0, 59))

            lines = weighted_choice(rng, [(1, 50), (2, 30), (3, 15), (4, 5)])
            chosen = []
            while len(chosen) < lines:
                product = rng.choices(
                    sellable, weights=[p["popularity"] for p in sellable]
                )[0]
                if product not in chosen:
                    chosen.append(product)

            items = [
                (product, weighted_choice(rng, [(1, 80), (2, 17), (3, 3)]))
                for product in chosen
            ]
            sales.append((moment, items))

    sales.sort(key=lambda sale: sale[0])
    return sales


def plan_purchases(rng, products, sales, today):
    """
    Calcula los pedidos a proveedores para cubrir las ventas y dejar
    el stock final buscado. Devuelve {(supplier_key, día): [(producto,
    cantidad), ...]}.
    """
    # Unidades vendidas por producto y día.
    sold = defaultdict(lambda: defaultdict(int))
    for moment, items in sales:
        for product, quantity in items:
            sold[product["sku"]][moment.date()] += quantity

    orders = defaultdict(list)

    for product in products:
        delivery_days = []
        for offset in SUPPLIER_DELIVERY_DAYS[product["supplier"]]:
            day = today + timedelta(days=offset)
            if day.weekday() == 6:          # domingo no se sirve
                day -= timedelta(days=1)
            delivery_days.append(day)

        # Ventas entre una entrega y la siguiente. La entrega llega por
        # la mañana, antes de abrir: cuenta para las ventas de ese día.
        segments = []
        for index, start in enumerate(delivery_days):
            end = (delivery_days[index + 1] if index + 1 < len(delivery_days)
                   else date.max)
            segments.append(sum(
                quantity for day, quantity in sold[product["sku"]].items()
                if start <= day < end
            ))

        name = product["name"]
        exact = name in LOW_STOCK_FINAL or name == OUT_OF_STOCK
        pack = 6 if product["buy_price"] < 5 else 3
        stock = 0

        for index, (day, demand) in enumerate(zip(delivery_days, segments)):
            last = index == len(segments) - 1

            if exact:
                # Pedido de apertura que cubre hasta la última entrega y
                # una última reposición justa para acabar en el objetivo
                # (el agotado no se repone).
                if index == 0:
                    quantity = sum(segments[:-1])
                elif last:
                    target = LOW_STOCK_FINAL.get(name, 0)
                    quantity = max(0, target + demand - stock)
                else:
                    quantity = 0
            else:
                margin = product["min_stock"] + rng.randint(4, 12 if last else 8)
                quantity = round_up(max(0, margin + demand - stock), pack)
                if index == 0:
                    # Pedido de apertura: algo más generoso.
                    quantity = round_up(quantity * 1.3, pack)

            if quantity:
                orders[(product["supplier"], day)].append((product, quantity))
            stock += quantity - demand

    return orders


def seed(rng, admin_email, admin_password, staff_password, commit=True):
    """
    Añade la empresa demo y todos sus datos a la sesión. Con
    commit=False solo hace flush: quien llama decide si confirma o
    deshace (lo usa scripts/add_demo_company.py).
    """
    from werkzeug.security import generate_password_hash

    from extensions import db
    from models import (
        Client, Company, Product, Purchase, PurchaseItem,
        Sale, SaleItem, StockMovement, Supplier, User,
    )

    now_local = datetime.now(TZ).replace(tzinfo=None)
    today = now_local.date()
    setup_local = local_at(today - timedelta(days=46), 9, 15)

    company = Company(**COMPANY, created_at=to_utc(setup_local))
    db.session.add(company)
    db.session.flush()

    # ---------- Usuarios ----------

    db.session.add(User(
        name=ADMIN_NAME,
        email=admin_email,
        password_hash=generate_password_hash(admin_password),
        role="administrator",
        company_id=company.id,
        created_at=to_utc(setup_local),
    ))
    for name, role, email in STAFF:
        db.session.add(User(
            name=name,
            email=email,
            password_hash=generate_password_hash(staff_password),
            role=role,
            company_id=company.id,
            created_at=to_utc(setup_local + timedelta(minutes=20)),
        ))

    # ---------- Proveedores ----------

    suppliers = {}
    category_supplier = {}
    for data in SUPPLIERS:
        data = dict(data)
        key = data.pop("key")
        for category in data.pop("categories"):
            category_supplier[category] = key
        supplier = Supplier(
            company_id=company.id,
            created_at=to_utc(setup_local + timedelta(minutes=40)),
            updated_at=to_utc(setup_local + timedelta(minutes=40)),
            **data,
        )
        db.session.add(supplier)
        suppliers[key] = supplier

    # ---------- Productos ----------

    products = []
    for index, (category, name, buy, sell, min_stock, popularity) in \
            enumerate(PRODUCTS, start=1):
        created = to_utc(setup_local + timedelta(hours=1, minutes=index))
        model = Product(
            company_id=company.id,
            name=name,
            sku=f"COS-{index:04d}",
            # Prefijo 20: uso interno de tienda (GS1), no choca con
            # productos reales.
            barcode=ean13(f"2000000{index:05d}"),
            category=category,
            buy_price=buy,
            sell_price=sell,
            stock=0,
            min_stock=min_stock,
            created_at=created,
            updated_at=created,
        )
        db.session.add(model)
        products.append({
            "model": model,
            "name": name,
            "sku": model.sku,
            "buy_price": buy,
            "min_stock": min_stock,
            "popularity": popularity,
            "supplier": category_supplier[category],
        })

    # ---------- Clientes ----------

    clients = []
    for name, address, postal_code in CLIENTS:
        first, last = name.split()[0], name.split()[1]
        created = to_utc(local_at(
            today - timedelta(days=rng.randint(31, 44)),
            rng.randint(10, 20), rng.randint(0, 59),
        ))
        client = Client(
            company_id=company.id,
            name=name,
            phone=f"+34 6{rng.randint(0, 99):02d} {rng.randint(0, 999):03d} "
                  f"{rng.randint(0, 999):03d}",
            email=f"{first}.{last}@example.com".lower()
            .translate(str.maketrans("áéíóúñ", "aeioun")),
            address=address,
            city="Madrid",
            postal_code=postal_code,
            created_at=created,
            updated_at=created,
        )
        db.session.add(client)
        clients.append(client)

    db.session.flush()

    # ---------- Plan de compras y ventas ----------

    sales = plan_sales(rng, products, today, now_local)
    orders = plan_purchases(rng, products, sales, today)

    events = []
    for (supplier_key, day), items in orders.items():
        moment = local_at(day, 9, rng.randint(0, 40))
        events.append((moment, "purchase", suppliers[supplier_key], items))
    for moment, items in sales:
        client = rng.choice(clients) if rng.random() < CLIENT_SHARE else None
        events.append((moment, "sale", client, items))

    events.sort(key=lambda event: event[0])

    # ---------- Aplicar en orden, como la API ----------

    for moment, kind, party, items in events:
        created = to_utc(moment)

        if kind == "purchase":
            lines = [
                (p["model"], quantity, p["model"].buy_price,
                 round(quantity * p["model"].buy_price, 2))
                for p, quantity in items
            ]
            record = Purchase(
                company_id=company.id,
                supplier_id=party.id,
                supplier_name=party.name,
                total=round(sum(line[3] for line in lines), 2),
                created_at=created,
            )
        else:
            lines = [
                (p["model"], quantity, float(p["model"].sell_price),
                 round(float(p["model"].sell_price) * quantity, 2))
                for p, quantity in items
            ]
            record = Sale(
                company_id=company.id,
                client_id=party.id if party else None,
                client_name=party.name if party else None,
                total=round(sum(line[3] for line in lines), 2),
                created_at=created,
            )

        db.session.add(record)
        db.session.flush()

        for product, quantity, unit_price, subtotal in lines:
            if kind == "purchase":
                product.stock += quantity
                db.session.add(PurchaseItem(
                    purchase_id=record.id, product_id=product.id,
                    quantity=quantity, unit_price=unit_price,
                    subtotal=subtotal,
                ))
                movement_type, reason = "entrada", f"Compra #{record.id}"
            else:
                if quantity > product.stock:
                    raise RuntimeError(
                        f"Stock insuficiente de {product.name} el {moment}"
                    )
                product.stock -= quantity
                db.session.add(SaleItem(
                    sale_id=record.id, product_id=product.id,
                    quantity=quantity, unit_price=unit_price,
                    subtotal=subtotal,
                ))
                movement_type, reason = "salida", f"Venta #{record.id}"

            product.updated_at = created
            db.session.add(StockMovement(
                company_id=company.id,
                product_id=product.id,
                type=movement_type,
                quantity=quantity,
                reason=reason,
                resulting_stock=product.stock,
                created_at=created,
            ))

    if commit:
        db.session.commit()
    else:
        db.session.flush()
    return company, [p["model"] for p in products]


# =========================================================
# COMPROBACIÓN Y RESUMEN
# =========================================================

def verify_and_report(company, products, admin_email, staff_password,
                      generated_staff_password, db_label):
    from sqlalchemy import func

    from extensions import db
    from models import Purchase, PurchaseItem, Sale, SaleItem, StockMovement

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
            problems.append(f"{product.sku}: compras-ventas != stock")
        if last and last.resulting_stock != product.stock:
            problems.append(f"{product.sku}: último movimiento != stock")

    status = {"out": [], "low": [], "ok": []}
    for product in products:
        if product.stock <= 0:
            status["out"].append(product)
        elif product.stock <= product.min_stock:
            status["low"].append(product)
        else:
            status["ok"].append(product)

    if len(status["out"]) != 1 or len(status["low"]) != 3:
        problems.append(
            f"se esperaban 1 sin stock y 3 en stock bajo; hay "
            f"{len(status['out'])} y {len(status['low'])}"
        )

    sales_count = Sale.query.filter_by(company_id=company.id).count()
    revenue = db.session.query(func.sum(Sale.total)).filter_by(
        company_id=company.id).scalar() or 0
    purchases_count = Purchase.query.filter_by(company_id=company.id).count()

    print(f"\nBase de datos de demo creada: {db_label}")
    print(f"  Empresa:     {company.name}")
    print(f"  Productos:   {len(products)}  (1 sin stock, 3 en stock bajo)")
    print(f"  Compras:     {purchases_count}")
    print(f"  Ventas:      {sales_count}  ({revenue:,.2f} € facturados)")
    print(f"  Movimientos: {StockMovement.query.count()}")

    for label, key in (("Sin stock", "out"), ("Stock bajo", "low")):
        for product in status[key]:
            print(f"  {label}: {product.name} "
                  f"({product.stock}/{product.min_stock})")

    print("\nAcceso:")
    print(f"  Administrador: {admin_email}  (contraseña: DEMO_ADMIN_PASSWORD)")
    for name, role, email in STAFF:
        print(f"  {name} ({role}): {email}")
    if generated_staff_password:
        print(f"  Contraseña de encargada y cajero (generada): {staff_password}")
    else:
        print("  Contraseña de encargada y cajero: DEMO_STAFF_PASSWORD")

    if problems:
        fail("Los datos no cuadran:\n  - " + "\n  - ".join(problems))

    print("\nComprobado: compras - ventas = stock y movimientos coherentes.")


# =========================================================
# MAIN
# =========================================================

def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[1])
    parser.add_argument(
        "--reset", action="store_true",
        help="borra la base de datos de demo y la vuelve a crear",
    )
    args = parser.parse_args()

    admin_password = os.environ.get("DEMO_ADMIN_PASSWORD") or ""
    if len(admin_password) < 8:
        fail("Define DEMO_ADMIN_PASSWORD (mínimo 8 caracteres).")

    admin_email = (os.environ.get("DEMO_ADMIN_EMAIL")
                   or DEFAULT_ADMIN_EMAIL).strip().lower()

    staff_password = os.environ.get("DEMO_STAFF_PASSWORD") or ""
    generated_staff_password = not staff_password
    if generated_staff_password:
        staff_password = secrets.token_urlsafe(9)
    elif len(staff_password) < 8:
        fail("DEMO_STAFF_PASSWORD debe tener al menos 8 caracteres.")

    if (os.environ.get("APP_ENV") or "").strip().lower() == "production":
        fail("No ejecutes el seed de demo con APP_ENV=production.")

    database_url = resolve_database_url()

    sys.path.insert(0, BACKEND_DIR)
    from app import create_app  # noqa: E402  (tras fijar DATABASE_URL)
    from extensions import db  # noqa: E402

    app = create_app()
    db_file = prepare_database(app, args.reset)

    rng = random.Random(int(os.environ.get("DEMO_SEED") or "2026"))

    with app.app_context():
        try:
            company, products = seed(rng, admin_email, admin_password,
                                     staff_password)
        except Exception:
            db.session.rollback()
            raise

        verify_and_report(
            company, products, admin_email, staff_password,
            generated_staff_password,
            db_file or database_url.split("@")[-1],
        )


if __name__ == "__main__":
    main()
