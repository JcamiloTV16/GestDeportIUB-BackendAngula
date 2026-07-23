from app.controllers.base_controller import BaseController
from app.config.db_config import get_db_connection
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

ESTADOS_TORNEO = ["Próximamente", "Inscripciones Abiertas", "En Curso", "Finalizado"]

class TorneoController(BaseController):
    def __init__(self):
        super().__init__("torneos")

    def get_historial(self):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT t.*, d.nombre as deporte_nombre, u.nombre as creador_nombre,
                       (SELECT COUNT(*) FROM inscripciones_torneo it
                        WHERE it.torneo_id = t.id AND it.estado = TRUE) as total_inscritos
                FROM torneos t
                LEFT JOIN deportes d ON t.deporte_id = d.id
                LEFT JOIN usuarios u ON t.creado_por = u.id
                WHERE t.estado = TRUE AND t.estado_torneo = 'Finalizado'
                ORDER BY t.fecha_inicio DESC
            """)
            result = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
            return {"resultado": jsonable_encoder(payload)}
        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn: conn.close()

    def get_all(self):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT t.*, d.nombre as deporte_nombre, u.nombre as creador_nombre,
                       (SELECT COUNT(*) FROM inscripciones_torneo it
                        WHERE it.torneo_id = t.id AND it.estado = TRUE) as total_inscritos,
                       (SELECT COUNT(*) FROM inscripciones_torneo it
                        WHERE it.torneo_id = t.id AND it.estado_inscripcion = 'Pendiente' AND it.estado = TRUE) as pendientes_count
                FROM torneos t
                LEFT JOIN deportes d ON t.deporte_id = d.id
                LEFT JOIN usuarios u ON t.creado_por = u.id
                WHERE t.estado = TRUE AND t.estado_torneo != 'Finalizado'
                ORDER BY pendientes_count DESC, t.fecha_inicio ASC
            """)
            result = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
            return {"resultado": jsonable_encoder(payload)}
        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn: conn.close()


    def cambiar_estado(self, id: int, nuevo_estado: str):
        conn = None
        try:
            if nuevo_estado not in ESTADOS_TORNEO:
                raise HTTPException(
                    status_code=400,
                    detail=f"Estado inválido. Debe ser uno de: {', '.join(ESTADOS_TORNEO)}"
                )
            conn = get_db_connection()
            cursor = conn.cursor()

            # Obtener estado actual
            cursor.execute("SELECT estado_torneo FROM torneos WHERE id = %s AND estado = TRUE", (id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Torneo no encontrado")

            estado_actual = row[0]
            idx_actual = ESTADOS_TORNEO.index(estado_actual) if estado_actual in ESTADOS_TORNEO else -1
            idx_nuevo = ESTADOS_TORNEO.index(nuevo_estado)

            # Solo se permite avanzar al siguiente estado
            if idx_nuevo != idx_actual + 1:
                raise HTTPException(
                    status_code=400,
                    detail=f"No se puede cambiar de '{estado_actual}' a '{nuevo_estado}'. El siguiente estado es '{ESTADOS_TORNEO[idx_actual + 1] if idx_actual + 1 < len(ESTADOS_TORNEO) else 'N/A'}'."
                )

            cursor.execute(
                "UPDATE torneos SET estado_torneo = %s, update_ = NOW() WHERE id = %s",
                (nuevo_estado, id)
            )
            conn.commit()
            return {"resultado": f"Estado del torneo actualizado a '{nuevo_estado}'"}

        except HTTPException:
            if conn: conn.rollback()
            raise
        except Exception as err:
            if conn: conn.rollback()
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn: conn.close()

    def delete(self, id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE torneos SET estado = FALSE WHERE id = %s", (id,))
            conn.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Torneo no encontrado")
            return {"resultado": "Torneo eliminado correctamente"}
        except Exception as e:
            if conn: conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if conn: conn.close()

torneo_controller = TorneoController()
