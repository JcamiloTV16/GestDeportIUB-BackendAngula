from app.controllers.base_controller import BaseController
from app.config.db_config import get_db_connection
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

class AuditoriaController(BaseController):
    def __init__(self):
        super().__init__("auditoria_accesos")

    def get_all(self):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """
                SELECT a.id, a.admin_id, u.nombre as admin_nombre, 
                       a.tabla_afectada, a.accion, a.fecha_cambio
                FROM auditoria_accesos a
                LEFT JOIN usuarios u ON a.admin_id = u.id
                ORDER BY a.fecha_cambio DESC
            """
            cursor.execute(query)
            result = cursor.fetchall()
            
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
                
            return {"resultado": jsonable_encoder(payload)}
                
        except Exception as err:
            if conn: conn.rollback()
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn: conn.close()

auditoria_controller = AuditoriaController()
