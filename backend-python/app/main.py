from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.user_routes import router as user_router
from app.routes.role_routes import router as role_router
from app.routes.modulo_routes import router as modulo_router
from app.routes.permiso_routes import router as permiso_router
from app.routes.deporte_routes import router as deporte_router
from app.routes.entrenador_routes import router as entrenador_router
from app.routes.horario_routes import router as horario_router
from app.routes.inscripcion_routes import router as inscripcion_router
from app.routes.auditoria_routes import router as auditoria_router
from app.routes.auth_routes import router as auth_router
from app.routes.torneo_routes import router as torneo_router
from app.routes.inscripcion_torneo_routes import router as inscripcion_torneo_router
from app.routes.chatbot_routes import router as chatbot_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.estadisticas_routes import router as estadisticas_router

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "API de GestionDeporIUB funcionando correctamente en Vercel"}

origins = [
    "http://localhost",
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Error interno del servidor: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "*"}
    )



app.include_router(user_router)
app.include_router(role_router)
app.include_router(modulo_router)
app.include_router(permiso_router)
app.include_router(deporte_router)
app.include_router(entrenador_router)
app.include_router(horario_router)
app.include_router(inscripcion_router)
app.include_router(auditoria_router)
app.include_router(auth_router)
app.include_router(torneo_router)
app.include_router(inscripcion_torneo_router)
app.include_router(chatbot_router)
app.include_router(dashboard_router)
app.include_router(estadisticas_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)