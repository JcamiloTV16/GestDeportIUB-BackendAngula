from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.torneo_controller import torneo_controller
from app.models.torneo import Torneo, TorneoCreate

router = APIRouter()

class CambiarEstadoTorneo(BaseModel):
    estado_torneo: str

@router.get("/torneos/", tags=["Torneos"])
async def get_torneos():
    return torneo_controller.get_all()

@router.get("/torneos/historial", tags=["Torneos"])
async def get_torneos_historial():
    return torneo_controller.get_historial()

@router.get("/torneos/{id}", response_model=Torneo, tags=["Torneos"])
async def get_torneo(id: int):
    return torneo_controller.get_by_id(id)

@router.post("/torneos/", response_model=Torneo, tags=["Torneos"])
async def create_torneo(torneo: TorneoCreate):
    return torneo_controller.create(torneo.dict(exclude_unset=True))

@router.patch("/torneos/{id}/estado", tags=["Torneos"])
async def cambiar_estado_torneo(id: int, data: CambiarEstadoTorneo):
    return torneo_controller.cambiar_estado(id, data.estado_torneo)

@router.put("/torneos/{id}", tags=["Torneos"])
async def update_torneo(id: int, torneo: Torneo):
    return torneo_controller.update(id, torneo.dict(exclude_unset=True))

@router.delete("/torneos/{id}", tags=["Torneos"])
async def delete_torneo(id: int):
    return torneo_controller.delete(id)
