from fastapi import APIRouter
from pydantic import BaseModel
from app.controllers.torneo_controller import torneo_controller
from app.models.torneo import Torneo, TorneoCreate
import json

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
    data = torneo.dict(exclude_unset=True)
    if "reglas_json" in data and isinstance(data["reglas_json"], dict):
        data["reglas_json"] = json.dumps(data["reglas_json"])
    return torneo_controller.create(data)

@router.patch("/torneos/{id}/estado", tags=["Torneos"])
async def cambiar_estado_torneo(id: int, data: CambiarEstadoTorneo):
    return torneo_controller.cambiar_estado(id, data.estado_torneo)

@router.put("/torneos/{id}", tags=["Torneos"])
async def update_torneo(id: int, torneo: TorneoCreate):
    data = torneo.dict(exclude_unset=True)
    if "reglas_json" in data and isinstance(data["reglas_json"], dict):
        data["reglas_json"] = json.dumps(data["reglas_json"])
    return torneo_controller.update(id, data)

@router.delete("/torneos/{id}", tags=["Torneos"])
async def delete_torneo(id: int):
    return torneo_controller.delete(id)
