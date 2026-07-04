from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.controllers.estadisticas_controller import estadisticas_controller

router = APIRouter()

class EstadisticaCreate(BaseModel):
    torneo_id: int
    usuario_id: int
    tipo_estadistica: str
    valor_json: Optional[dict] = None

@router.get("/estadisticas/{torneo_id}", tags=["Estadisticas"])
async def get_estadisticas(torneo_id: int):
    return estadisticas_controller.get_by_torneo(torneo_id)

@router.post("/estadisticas/", tags=["Estadisticas"])
async def create_estadistica(data: EstadisticaCreate):
    return estadisticas_controller.create(data.dict(exclude_unset=True))

@router.delete("/estadisticas/{id}", tags=["Estadisticas"])
async def delete_estadistica(id: int):
    return estadisticas_controller.delete(id)
