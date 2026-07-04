from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from app.models.base_models import get_colombia_time

class TorneoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    deporte_id: Optional[int] = None
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    lugar: Optional[str] = None
    estado_torneo: Optional[str] = "Próximamente"
    poblacion_objetivo: Optional[str] = "Todos"
    reglas_json: Optional[dict] = None
    creado_por: Optional[int] = None

class TorneoCreate(TorneoBase):
    pass

class Torneo(TorneoBase):
    id: Optional[int] = None
    estado: bool = True
    create_: Optional[datetime] = Field(default_factory=get_colombia_time)
    update_: Optional[datetime] = Field(default_factory=get_colombia_time)
