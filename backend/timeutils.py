from datetime import datetime, timezone


def utc_now():
    """
    Fecha y hora actual en UTC, sin tzinfo.

    Sustituye a datetime.utcnow() (obsoleto desde Python 3.12).

    Las columnas son DateTime sin zona horaria y siempre guardan UTC
    (el frontend las interpreta así, ver frontend/src/utils/dates.js).
    Se quita tzinfo a propósito: guardar un datetime con zona en una
    columna "timestamp without time zone" de PostgreSQL lo convertiría
    a la zona horaria de la sesión.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)
