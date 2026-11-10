from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData


# Nombres fijos para índices y constraints. Alembic los necesita para
# poder modificarlos o borrarlos en migraciones futuras (sobre todo en
# SQLite, donde cada ALTER se hace recreando la tabla).
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


db = SQLAlchemy(metadata=MetaData(naming_convention=NAMING_CONVENTION))

migrate = Migrate()
