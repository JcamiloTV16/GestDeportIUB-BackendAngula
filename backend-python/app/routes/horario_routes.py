from fastapi import APIRouter
from app.controllers.horario_controller import horario_controller
from app.models import Horario, HorarioCreate

router = APIRouter()

@router.get("/horarios/", tags=["Horarios"])
async def get_horarios():
    return horario_controller.get_all()

@router.get("/horarios/inactivos/", tags=["Horarios"])
async def get_horarios_inactivos():
    return horario_controller.get_inactive()

@router.get("/horarios/disponibles/{usuario_id}", tags=["Horarios"])
async def get_horarios_disponibles(usuario_id: int):
    return horario_controller.get_disponibles_para_usuario(usuario_id)

@router.get("/horarios/entrenador/{entrenador_id}", tags=["Horarios"])
async def get_horarios_by_entrenador(entrenador_id: int):
    return horario_controller.get_by_entrenador(entrenador_id)

@router.get("/horarios/deporte/{deporte_id}", tags=["Horarios"])
async def get_horarios_by_deporte(deporte_id: int):
    return horario_controller.get_by_deporte(deporte_id)

@router.get("/horarios/{id}", response_model=Horario, tags=["Horarios"])
async def get_horario(id: int):
    return horario_controller.get_by_id(id)

@router.post("/horarios/", response_model=Horario, tags=["Horarios"])
async def create_horario(horario: HorarioCreate):
    return horario_controller.create(horario.dict(exclude_unset=True))

@router.put("/horarios/{id}", tags=["Horarios"])
async def update_horario(id: int, horario: Horario):
    return horario_controller.update(id, horario.dict(exclude_unset=True))

@router.put("/horarios/{id}", tags=["Horarios"])
async def update_horario(id: int, horario: dict):
    return horario_controller.update(id, horario)

@router.delete("/horarios/{id}", tags=["Horarios"])
async def delete_horario(id: int):
    return horario_controller.delete(id)

@router.post("/horarios/{id}/reactivar/", tags=["Horarios"])
async def reactivate_horario(id: int):
    return horario_controller.reactivate(id)
