from app.controllers.base_controller import BaseController
from app.config.db_config import get_db_connection
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

class EstadisticasController(BaseController):
    def __init__(self):
        super().__init__("estadisticas_torneo")

    def get_by_torneo(self, torneo_id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT e.*, u.nombre as usuario_nombre
                FROM estadisticas_torneo e
                JOIN usuarios u ON e.usuario_id = u.id
                WHERE e.torneo_id = %s
                ORDER BY e.fecha_registro DESC
            """, (torneo_id,))
            result = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
            return {"resultado": jsonable_encoder(payload)}
        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn: conn.close()

estadisticas_controller = EstadisticasController()
