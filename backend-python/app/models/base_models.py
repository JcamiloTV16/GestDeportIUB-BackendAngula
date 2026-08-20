from datetime import datetime
from pydantic import Field

def get_colombia_time():
    try:
        # Intentamos usar la zona nativa de Python (disponible desde 3.9)
        from zoneinfo import ZoneInfo
        tz = ZoneInfo('America/Bogota')
    except Exception:
        # Si falla (p. ej. zona no disponible), usamos pytz como respaldo
        try:
            import pytz
            tz = pytz.timezone('America/Bogota')
        except Exception:
            from datetime import timezone
            tz = timezone.utc
    return datetime.now(tz)

