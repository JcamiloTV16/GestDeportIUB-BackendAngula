from datetime import datetime
import pytz
from pydantic import Field

def get_colombia_time():
    try:
        # Intentamos usar la zona nativa de Python (disponible desde 3.9)
        from zoneinfo import ZoneInfo
        tz = ZoneInfo('America/Bogota')
    except Exception:
        # Si falla (p. ej. zona no disponible), usamos pytz como respaldo
        try:
            tz = pytz.timezone('America/Bogota')
        except Exception:
            tz = pytz.UTC
    return datetime.now(tz)
