import json
from app.config.db_config import get_db_connection

def populate_realistic_tournament_stats():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Obtener todos los torneos activos
        cursor.execute("""
            SELECT t.id, t.nombre, d.nombre as deporte_nombre
            FROM torneos t
            JOIN deportes d ON t.deporte_id = d.id
            WHERE t.estado = TRUE
        """)
        torneos = cursor.fetchall()

        if not torneos:
            print("No se encontraron torneos activos.")
            return

        for torneo_id, torneo_nombre, deporte in torneos:
            # Limpiar estadísticas anteriores del torneo para dejar datos limpios y realistas
            cursor.execute("DELETE FROM estadisticas_torneo WHERE torneo_id = %s", (torneo_id,))

            # Obtener los participantes inscritos reales en este torneo
            cursor.execute("""
                SELECT estudiante_id FROM inscripciones_torneo 
                WHERE torneo_id = %s AND estado = TRUE
            """, (torneo_id,))
            inscritos = [row[0] for row in cursor.fetchall()]

            if not inscritos:
                continue

            print(f"Generando estadísticas para '{torneo_nombre}' ({deporte}) con {len(inscritos)} inscritos...")

            if deporte == 'Ajedrez':
                # Asignar resultados variados y competitivos para Ajedrez (Sistema Suizo)
                # Rendimiento: 1er lugar (6v, 1e, 0d), 2do lugar (5v, 1e, 1d), 3er lugar (4v, 2e, 1d), 4to lugar (3v, 1e, 3d)...
                perfiles = [
                    {"v": 6, "e": 1, "d": 0},
                    {"v": 5, "e": 1, "d": 1},
                    {"v": 4, "e": 2, "d": 1},
                    {"v": 3, "e": 1, "d": 3},
                    {"v": 2, "e": 2, "d": 3},
                    {"v": 1, "e": 1, "d": 4},
                ]
                for idx, uid in enumerate(inscritos):
                    perf = perfiles[idx % len(perfiles)]
                    for _ in range(perf["v"]):
                        cursor.execute(
                            "INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                            (torneo_id, uid, "Victoria", json.dumps({"puntos": 1}))
                        )
                    for _ in range(perf["e"]):
                        cursor.execute(
                            "INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                            (torneo_id, uid, "Empate", json.dumps({"puntos": 0.5}))
                        )
                    for _ in range(perf["d"]):
                        cursor.execute(
                            "INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                            (torneo_id, uid, "Derrota", json.dumps({"puntos": 0}))
                        )

            elif deporte == 'Fútbol':
                # Asignar goles y asistencias realistas
                goles_list = [5, 4, 3, 2, 1, 1]
                asist_list = [3, 2, 4, 1, 2, 0]
                for idx, uid in enumerate(inscritos):
                    g = goles_list[idx % len(goles_list)]
                    a = asist_list[idx % len(asist_list)]
                    if g > 0:
                        cursor.execute(
                            "INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                            (torneo_id, uid, "Goles", json.dumps({"cantidad": g}))
                        )
                    if a > 0:
                        cursor.execute(
                            "INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                            (torneo_id, uid, "Asistencias", json.dumps({"cantidad": a}))
                        )

            elif deporte == 'Baloncesto':
                # Asignar puntos y rebotes realistas
                puntos_list = [42, 35, 28, 20, 14, 8]
                rebotes_list = [18, 12, 15, 8, 5, 3]
                for idx, uid in enumerate(inscritos):
                    pts = puntos_list[idx % len(puntos_list)]
                    reb = rebotes_list[idx % len(rebotes_list)]
                    cursor.execute(
                        "INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                        (torneo_id, uid, "Puntos", json.dumps({"cantidad": pts}))
                    )
                    cursor.execute(
                        "INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                        (torneo_id, uid, "Rebotes", json.dumps({"cantidad": reb}))
                    )

            elif deporte == 'Atletismo':
                # Asignar tiempos de carrera en segundos
                tiempos_list = [10.85, 11.20, 11.45, 11.90, 12.15, 12.50]
                for idx, uid in enumerate(inscritos):
                    t = tiempos_list[idx % len(tiempos_list)]
                    cursor.execute(
                        "INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES (%s, %s, %s, %s)",
                        (torneo_id, uid, "Tiempo Final", json.dumps({"segundos": t, "cantidad": t}))
                    )

        conn.commit()
        print("¡Estadísticas realistas pobladas exitosamente para todos los participantes inscritos!")

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error poblando estadísticas: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    populate_realistic_tournament_stats()
