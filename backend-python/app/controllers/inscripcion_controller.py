from app.controllers.base_controller import BaseController
from app.config.db_config import get_db_connection
from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException

class InscripcionController(BaseController):
    def get_estudiantes_por_horario(self, horario_id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """
                SELECT DISTINCT 
                    u.id, 
                    u.numero_documento as estudiante_documento,
                    u.nombre as estudiante_nombre, 
                    u.email as estudiante_email, 
                    i.create_ as fecha_inscripcion, 
                    CASE WHEN i.estado = TRUE THEN 'Aprobada' ELSE 'Rechazada' END as estado_nombre
                FROM inscripciones i
                JOIN usuarios u ON i.estudiante_id = u.id
                WHERE i.horario_id = %s
            """
            cursor.execute(query, (horario_id,))
            result = cursor.fetchall()
            
            colnames = [desc[0] for desc in cursor.description]
            payload = []
            for row in result:
                content = dict(zip(colnames, row))
                payload.append(content)
                
            return {"resultado": jsonable_encoder(payload)}
                
        except Exception as err:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn:
                conn.close()

    def get_deportes_por_estudiante(self, estudiante_id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            query = """
                SELECT DISTINCT d.id, d.nombre, d.descripcion,
                       h.dia_semana, h.hora_inicio, h.hora_fin, h.lugar,
                       i.create_ as fecha_inscripcion
                FROM inscripciones i
                JOIN deportes d ON i.deporte_id = d.id
                LEFT JOIN horarios h ON i.horario_id = h.id
                WHERE i.estudiante_id = %s AND i.estado = TRUE
                ORDER BY d.nombre
            """
            cursor.execute(query, (estudiante_id,))
            result = cursor.fetchall()
            
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
                
            return {"resultado": jsonable_encoder(payload)}
                
        except Exception as err:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn:
                conn.close()

inscripcion_controller = InscripcionController("inscripciones")
