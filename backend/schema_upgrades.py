"""
Actualizaciones mínimas del esquema para bases de datos ya existentes.

El proyecto todavía no usa migraciones (Alembic): las tablas se crean
con db.create_all(), que NO añade columnas nuevas a tablas que ya
existen. Este módulo añade esas columnas para que una mystock.db creada
con una versión anterior siga funcionando sin perder datos.

Cuando se adopte Flask-Migrate, este módulo debería sustituirse por
migraciones reales.
"""

from sqlalchemy import inspect, text

from extensions import db


# (tabla, columna, definición SQL compatible con SQLite y PostgreSQL)
COLUMN_UPGRADES = (
    ("products", "is_active", "BOOLEAN NOT NULL DEFAULT TRUE"),
)


def apply_schema_upgrades():
    inspector = inspect(db.engine)
    tables = set(inspector.get_table_names())

    for table, column, definition in COLUMN_UPGRADES:
        if table not in tables:
            continue

        existing = {
            info["name"]
            for info in inspector.get_columns(table)
        }

        if column in existing:
            continue

        with db.engine.begin() as connection:
            connection.execute(text(
                f"ALTER TABLE {table} ADD COLUMN {column} {definition}"
            ))
