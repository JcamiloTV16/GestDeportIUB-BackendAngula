from app.controllers.base_controller import BaseController
from app.config.db_config import get_db_connection
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder

class HorarioController(BaseController):
    def __init__(self):
        super().__init__("horarios")

    def get_all(self):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT h.*, d.nombre as deporte_nombre
                FROM horarios h
                LEFT JOIN deportes d ON h.deporte_id = d.id
                WHERE h.estado = TRUE
                ORDER BY h.id DESC
            """)
            result = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
            return {"resultado": jsonable_encoder(payload)}
        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn: conn.close()

    def get_inactive(self):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT h.*, d.nombre as deporte_nombre
                FROM horarios h
                LEFT JOIN deportes d ON h.deporte_id = d.id
                WHERE h.estado = FALSE
                ORDER BY h.id DESC
            """)
            result = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
            return {"resultado": jsonable_encoder(payload)}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if conn: conn.close()

    def get_by_entrenador(self, usuario_id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT h.id, h.entrenador_id, h.deporte_id, d.nombre as deporte_nombre,
                       h.dia_semana, h.hora_inicio, h.hora_fin, h.lugar, h.estado
                FROM horarios h
                LEFT JOIN deportes d ON h.deporte_id = d.id
                JOIN entrenadores e ON h.entrenador_id = e.id
                WHERE e.usuario_id = %s AND h.estado = TRUE
            """, (usuario_id,))
            result = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
            return {"resultado": jsonable_encoder(payload)}
        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn: conn.close()

    def get_disponibles_para_usuario(self, usuario_id: int):
        """Retorna horarios activos donde el usuario NO está inscrito."""
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT h.id, h.deporte_id, d.nombre as deporte_nombre,
                       h.dia_semana, h.hora_inicio, h.hora_fin, h.lugar, h.cupo,
                       h.entrenador_id,
                       u.nombre as entrenador_nombre,
                       (
                           SELECT COUNT(*) FROM inscripciones i2
                           WHERE i2.horario_id = h.id AND i2.estado = TRUE
                       ) as inscritos
                FROM horarios h
                LEFT JOIN deportes d ON h.deporte_id = d.id
                LEFT JOIN entrenadores e ON h.entrenador_id = e.id
                LEFT JOIN usuarios u ON e.usuario_id = u.id
                WHERE h.estado = TRUE
                  AND h.id NOT IN (
                      SELECT i.horario_id FROM inscripciones i
                      WHERE i.estudiante_id = %s AND i.estado = TRUE
                  )
                ORDER BY d.nombre, h.dia_semana
            """, (usuario_id,))
            result = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
            return {"resultado": jsonable_encoder(payload)}
        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn: conn.close()

    def delete(self, id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE horarios SET estado = FALSE WHERE id = %s", (id,))
            conn.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Horario no encontrado")
            return {"resultado": "Horario desactivado correctamente"}
        except Exception as e:
            if conn: conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if conn: conn.close()

    def reactivate(self, id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE horarios SET estado = TRUE WHERE id = %s", (id,))
            conn.commit()
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Horario no encontrado")
            return {"resultado": "Horario reactivado correctamente"}
        except Exception as e:
            if conn: conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if conn: conn.close()

    def get_by_deporte(self, deporte_id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT h.id, h.entrenador_id, h.deporte_id, d.nombre as deporte_nombre,
                       h.dia_semana, h.hora_inicio, h.hora_fin, h.lugar, h.estado
                FROM horarios h
                LEFT JOIN deportes d ON h.deporte_id = d.id
                WHERE h.deporte_id = %s AND h.estado = TRUE
            """, (deporte_id,))
            result = cursor.fetchall()
            colnames = [desc[0] for desc in cursor.description]
            payload = [dict(zip(colnames, row)) for row in result]
            return {"resultado": jsonable_encoder(payload)}
        except Exception as err:
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn: conn.close()

    def update(self, id: int, data: dict):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Check if active
            cursor.execute("SELECT estado FROM horarios WHERE id = %s", (id,))
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Horario no encontrado")
            if not row[0]:
                raise HTTPException(status_code=400, detail="No se puede modificar un curso inactivo")
                
            cursor.execute("""
                UPDATE horarios
                SET deporte_id = %s, entrenador_id = %s, dia_semana = %s,
                    hora_inicio = %s, hora_fin = %s, lugar = %s, cupo = %s,
                    update_ = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (data.get("deporte_id"), data.get("entrenador_id"), 
                  data.get("dia_semana"), data.get("hora_inicio"), 
                  data.get("hora_fin"), data.get("lugar"), data.get("cupo"), id))
            conn.commit()
            return {"resultado": "Horario actualizado correctamente"}
        except HTTPException:
            raise
        except Exception as e:
            if conn: conn.rollback()
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if conn: conn.close()

horario_controller = HorarioController()
