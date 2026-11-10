"""name legacy unique constraints

Las bases de datos SQLite creadas antes de las migraciones (con
db.create_all()) tienen sin nombre los UNIQUE de companies.tax_id y
users.email. Funcionan igual, pero Alembic necesita un nombre para
poder modificarlos o borrarlos en migraciones futuras.

Esta migración reconstruye esas dos tablas (modo batch: crea una tabla
nueva, copia los datos, borra la antigua y renombra) para que los
constraints tengan el nombre de la convención de extensions.py.

Es idempotente: en bases de datos creadas con `flask db upgrade`
(o en PostgreSQL) los constraints ya tienen nombre y no hace nada.

Revision ID: 5f0c2a9d7e31
Revises: b4ec8d26cf1c
Create Date: 2026-11-10 01:05:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5f0c2a9d7e31'
down_revision = 'b4ec8d26cf1c'
branch_labels = None
depends_on = None


# Igual que extensions.NAMING_CONVENTION (copiado: una migración no
# debe depender del código de la app, que puede cambiar).
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

LEGACY_UNIQUES = (
    ("companies", "tax_id"),
    ("users", "email"),
)


def has_unnamed_unique(inspector, table, column):
    return any(
        not constraint.get("name")
        and constraint.get("column_names") == [column]
        for constraint in inspector.get_unique_constraints(table)
    )


def upgrade():
    bind = op.get_bind()

    if bind.dialect.name != "sqlite":
        return

    inspector = sa.inspect(bind)

    for table, column in LEGACY_UNIQUES:
        if not has_unnamed_unique(inspector, table, column):
            continue

        # Con naming_convention, el UNIQUE reflejado sin nombre recibe
        # "uq_<tabla>_<columna>" y la tabla se recrea ya con ese nombre.
        with op.batch_alter_table(
            table,
            recreate="always",
            naming_convention=NAMING_CONVENTION,
        ):
            pass


def downgrade():
    # Volver a dejar los constraints sin nombre no aporta nada.
    pass
