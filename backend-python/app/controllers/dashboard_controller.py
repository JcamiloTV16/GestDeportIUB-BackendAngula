from app.config.db_config import get_db_connection
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder


class DashboardController:
    def get_stats(self):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("SELECT COUNT(*) FROM usuarios WHERE estado = TRUE")
            total_usuarios = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM deportes WHERE estado = TRUE")
            total_deportes = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM horarios WHERE estado = TRUE")
            total_cursos = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM torneos WHERE estado = TRUE")
            total_torneos = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM entrenadores WHERE estado = TRUE")
            total_entrenadores = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM inscripciones WHERE estado = TRUE")
            total_inscripciones = cursor.fetchone()[0]

            return {
                "resultado": {
                    "total_usuarios": total_usuarios,
                    "total_deportes": total_deportes,
                    "total_cursos": total_cursos,
                    "total_torneos": total_torneos,
                    "total_entrenadores": total_entrenadores,
                    "total_inscripciones": total_inscripciones,
                }
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if conn:
                conn.close()


dashboard_controller = DashboardController()
