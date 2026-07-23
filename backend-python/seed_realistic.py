import psycopg2
import json
from datetime import date, timedelta
from app.config.db_config import get_db_connection

def seed_realistic():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Delete previous test tournaments (by name matching)
        cursor.execute("DELETE FROM estadisticas_torneo")
        cursor.execute("DELETE FROM inscripciones_torneo")
        cursor.execute("DELETE FROM torneos")
        
        # Ensure we have users
        cursor.execute("SELECT id FROM usuarios LIMIT 5")
        users = [row[0] for row in cursor.fetchall()]
        if not users:
            print("No users found to seed.")
            return

        # Ensure we have sports (Futbol, Baloncesto, Ajedrez)
        deportes_data = ['Fútbol', 'Baloncesto', 'Ajedrez', 'Atletismo']
        deportes_ids = {}
        for d in deportes_data:
            cursor.execute("SELECT id FROM deportes WHERE nombre = %s", (d,))
            res = cursor.fetchone()
            if res:
                deportes_ids[d] = res[0]
            else:
                cursor.execute("INSERT INTO deportes (nombre) VALUES (%s) RETURNING id", (d,))
                deportes_ids[d] = cursor.fetchone()[0]
                
        today = date.today()

        torneos = [
            # Activos
            ("Liga de Fútbol Estudiantil - Semestre B", "Torneo oficial interfacultades", today, today + timedelta(days=60), "Cancha Principal IUB", "En Curso", deportes_ids["Fútbol"], "Estudiantes", {"duracion_partido": "90min", "fase": "Grupos"}),
            ("Torneo Relámpago de Baloncesto", "Evento para toda la comunidad", today, today + timedelta(days=15), "Coliseo IUB", "En Curso", deportes_ids["Baloncesto"], "Todos", {"cuartos": 4, "tiempo": "10min"}),
            ("Gran Abierto de Ajedrez", "Torneo clásico por sistema Suizo", today, today + timedelta(days=7), "Biblioteca", "En Curso", deportes_ids["Ajedrez"], "Todos", {"ritmo": "15+10", "rondas": 7}),
            ("Clasificatorio de Atletismo", "Pruebas de pista 100m y 400m", today + timedelta(days=5), today + timedelta(days=10), "Pista Olímpica", "Inscripciones Abiertas", deportes_ids["Atletismo"], "Estudiantes", {"pruebas": ["100m", "400m"]}),
            ("Copa Docentes - Fútbol 5", "Evento exclusivo para el cuerpo docente y administrativo", today, today + timedelta(days=30), "Cancha Auxiliar", "En Curso", deportes_ids["Fútbol"], "Funcionarios", {"jugadores_por_equipo": 5}),
        ]
        
        # Add 15 Historial (just quickly generated with variety)
        for i in range(1, 16):
            dep_name = deportes_data[i % 4]
            torneos.append(
                (f"Copa IUB {dep_name} {2020 + (i%5)}", "Torneo finalizado", today - timedelta(days=90 + i*10), today - timedelta(days=70 + i*10), "Sede IUB", "Finalizado", deportes_ids[dep_name], "Todos", {})
            )
            
        torneo_ids = []
        for t in torneos:
            cursor.execute("""
                INSERT INTO torneos (nombre, descripcion, fecha_inicio, fecha_fin, lugar, estado_torneo, deporte_id, poblacion_objetivo, reglas_json)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
            """, t)
            torneo_ids.append((cursor.fetchone()[0], t[0], t[6])) # id, nombre, deporte_id
            
        # Inscribir usuarios
        for t_id, t_name, d_id in torneo_ids:
            for u in users[:4]:  # Enrolar a 4 usuarios en cada torneo
                cursor.execute("""
                    INSERT INTO inscripciones_torneo (torneo_id, estudiante_id, estado_inscripcion, estado)
                    VALUES (%s, %s, 'Aprobada', TRUE) ON CONFLICT DO NOTHING
                """, (t_id, u))

                
                # Si está en curso, agregar estadísticas
                if "Activo" in t_name or "En Curso" in t_name or "Fútbol" in t_name:
                    if d_id == deportes_ids.get("Fútbol"):
                        cursor.execute("INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                                      (t_id, u, "Goles", json.dumps({"cantidad": (u % 3) + 1})))
                        cursor.execute("INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                                      (t_id, u, "Asistencias", json.dumps({"cantidad": u % 2})))
                    elif d_id == deportes_ids.get("Baloncesto"):
                        cursor.execute("INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                                      (t_id, u, "Puntos", json.dumps({"cantidad": (u % 15) + 10})))
                        cursor.execute("INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                                      (t_id, u, "Rebotes", json.dumps({"cantidad": (u % 5) + 2})))
                    elif d_id == deportes_ids.get("Atletismo"):
                        cursor.execute("INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                                      (t_id, u, "Tiempo 100m", json.dumps({"segundos": 11.5 + (u % 3)})))
                    elif d_id == deportes_ids.get("Ajedrez"):
                        cursor.execute("INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                                      (t_id, u, "Victoria", json.dumps({"puntos": 1})))

        conn.commit()
        print("Base de datos repoblada con datos reales.")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    seed_realistic()
