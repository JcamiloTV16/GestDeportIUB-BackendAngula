from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, time
from app.models.base_models import get_colombia_time

class HorarioBase(BaseModel):
    deporte_id: int
    entrenador_id: int
    dia_semana: str
    hora_inicio: time
    hora_fin: time
    lugar: Optional[str] = None
    cupo: Optional[int] = 20

class HorarioCreate(HorarioBase):
    pass

class Horario(HorarioBase):
    id: Optional[int] = None
    estado: bool = True
    create_: Optional[datetime] = Field(default_factory=get_colombia_time)
    update_: Optional[datetime] = Field(default_factory=get_colombia_time)
