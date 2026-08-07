from fastapi import APIRouter, HTTPException
from app.config.db_config import get_db_connection
from fastapi.encoders import jsonable_encoder

router = APIRouter()

@router.get("/chat/contacts/{user_id}", tags=["Chat"])
async def get_chat_contacts(user_id: int):
    """
    Devuelve la lista de contactos disponibles para chatear 1 a 1
    (Deportistas, Entrenadores, Administradores).
    """
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Obtener todos los usuarios activos salvo el usuario actual
        cursor.execute("""
            SELECT u.id, u.nombre, u.email, COALESCE(r.nombre_rol, 'Usuario') as rol
            FROM usuarios u
            LEFT JOIN roles r ON u.rol_id = r.id
            WHERE u.estado = TRUE AND u.id != %s
            ORDER BY u.nombre ASC
        """, (user_id,))

        rows = cursor.fetchall()
        colnames = [desc[0] for desc in cursor.description]
        contacts = [dict(zip(colnames, row)) for row in rows]

        return {"contacts": jsonable_encoder(contacts)}
    except Exception as e:
        print(f"Error obteniendo contactos de chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()
