from app.config.db_config import get_db_connection

def fix_inscriptions_status():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Actualizar inscripciones de torneos 'En Curso' o 'Finalizado' a 'Aprobada'
        cursor.execute("""
            UPDATE inscripciones_torneo
            SET estado_inscripcion = 'Aprobada', update_ = NOW()
            WHERE torneo_id IN (
                SELECT id FROM torneos WHERE estado_torneo IN ('En Curso', 'Finalizado')
            )
        """)
        updated_rows = cursor.rowcount
        conn.commit()

        print(f"¡Se actualizaron {updated_rows} inscripciones a estado 'Aprobada' exitosamente!")

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error actualizando inscripciones: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    fix_inscriptions_status()
