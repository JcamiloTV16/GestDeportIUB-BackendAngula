-- ============================================================
-- SEED REALISTA - GestionDeporIUB
-- Ejecuta este script en tu cliente de BD (pgAdmin / DBeaver)
-- ============================================================

-- 1. Limpiar datos previos
DELETE FROM estadisticas_torneo;
DELETE FROM inscripciones_torneo;
DELETE FROM torneos;

-- 2. Asegurar deportes necesarios
INSERT INTO deportes (nombre) VALUES ('Fútbol')    ON CONFLICT (nombre) DO NOTHING;
INSERT INTO deportes (nombre) VALUES ('Baloncesto') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO deportes (nombre) VALUES ('Ajedrez')   ON CONFLICT (nombre) DO NOTHING;
INSERT INTO deportes (nombre) VALUES ('Atletismo') ON CONFLICT (nombre) DO NOTHING;

-- 3. Variables de referencia (IDs de deportes)
DO $$
DECLARE
    id_fut  INT; id_bas INT; id_aje INT; id_atl INT;
    id_t1   INT; id_t2  INT; id_t3  INT; id_t4  INT; id_t5  INT;
    ref_uid INT;
    today   DATE := CURRENT_DATE;
BEGIN
    SELECT id INTO id_fut FROM deportes WHERE nombre = 'Fútbol';
    SELECT id INTO id_bas FROM deportes WHERE nombre = 'Baloncesto';
    SELECT id INTO id_aje FROM deportes WHERE nombre = 'Ajedrez';
    SELECT id INTO id_atl FROM deportes WHERE nombre = 'Atletismo';

    -- Usuario de referencia (primer usuario que NO sea el primero/admin)
    SELECT id INTO ref_uid FROM usuarios WHERE id != 1 AND estado = TRUE LIMIT 1;
    IF ref_uid IS NULL THEN SELECT id INTO ref_uid FROM usuarios LIMIT 1; END IF;

    -- ============================================================
    -- TORNEOS ACTIVOS (5)
    -- ============================================================
    INSERT INTO torneos (nombre,descripcion,fecha_inicio,fecha_fin,lugar,estado_torneo,deporte_id,poblacion_objetivo,reglas_json)
    VALUES ('Liga de Fútbol Estudiantil — Semestre B 2025','Torneo interfacultades de fútbol 11. Fase de grupos en curso.',
            today-5, today+55, 'Cancha Principal IUB', 'En Curso', id_fut, 'Estudiantes',
            '{"fase":"Grupos","equipos":8,"duracion_partido":"90min"}') RETURNING id INTO id_t1;

    INSERT INTO torneos (nombre,descripcion,fecha_inicio,fecha_fin,lugar,estado_torneo,deporte_id,poblacion_objetivo,reglas_json)
    VALUES ('Torneo Relámpago de Baloncesto 2025','Competencia open 5x5 para toda la comunidad universitaria.',
            today-2, today+13, 'Coliseo IUB', 'En Curso', id_bas, 'Todos',
            '{"cuartos":4,"minutos":10,"formato":"5x5"}') RETURNING id INTO id_t2;

    INSERT INTO torneos (nombre,descripcion,fecha_inicio,fecha_fin,lugar,estado_torneo,deporte_id,poblacion_objetivo,reglas_json)
    VALUES ('Gran Abierto de Ajedrez IUB 2025','Torneo clásico por sistema Suizo, 7 rondas.',
            today-3, today+4, 'Biblioteca — Sala Silenciosa', 'En Curso', id_aje, 'Todos',
            '{"ritmo":"15+10","rondas":7,"sistema":"Suizo"}') RETURNING id INTO id_t3;

    INSERT INTO torneos (nombre,descripcion,fecha_inicio,fecha_fin,lugar,estado_torneo,deporte_id,poblacion_objetivo,reglas_json)
    VALUES ('Clasificatorio Atletismo — Pista 2025','Pruebas: 100m, 400m y relevos 4x100.',
            today+5, today+10, 'Pista Sintética IUB', 'Inscripciones Abiertas', id_atl, 'Estudiantes',
            '{"pruebas":["100m","400m","4x100m"]}') RETURNING id INTO id_t4;

    INSERT INTO torneos (nombre,descripcion,fecha_inicio,fecha_fin,lugar,estado_torneo,deporte_id,poblacion_objetivo,reglas_json)
    VALUES ('Copa Fútbol 5 Docentes 2025','Evento de integración para el cuerpo docente y administrativo.',
            today-1, today+29, 'Cancha Auxiliar IUB', 'En Curso', id_fut, 'Funcionarios',
            '{"jugadores_por_equipo":5,"tiempo_partido":"40min"}') RETURNING id INTO id_t5;

    -- ============================================================
    -- HISTORIAL (15 torneos finalizados)
    -- ============================================================
    INSERT INTO torneos (nombre,descripcion,fecha_inicio,fecha_fin,lugar,estado_torneo,deporte_id,poblacion_objetivo,reglas_json) VALUES
    ('Copa IUB Fútbol 2024','Torneo finalizado.',today-110,today-90,'Sede IUB','Finalizado',id_fut,'Todos','{}'),
    ('Torneo Baloncesto Interfacultades 2024','Torneo finalizado.',today-122,today-102,'Coliseo IUB','Finalizado',id_bas,'Todos','{}'),
    ('Open Ajedrez Primavera 2024','Torneo finalizado.',today-134,today-114,'Biblioteca','Finalizado',id_aje,'Todos','{}'),
    ('Atletismo IUB — Pruebas de pista 2023','Torneo finalizado.',today-146,today-126,'Pista IUB','Finalizado',id_atl,'Todos','{}'),
    ('Liga Fútbol Egresados 2024','Torneo finalizado.',today-158,today-138,'Cancha Principal','Finalizado',id_fut,'Egresados','{}'),
    ('Torneo Baloncesto Funcionarios 2023','Torneo finalizado.',today-170,today-150,'Coliseo IUB','Finalizado',id_bas,'Funcionarios','{}'),
    ('Gran Premio Ajedrez 2023','Torneo finalizado.',today-182,today-162,'Biblioteca','Finalizado',id_aje,'Todos','{}'),
    ('Clasificatorio Atletismo 2023','Torneo finalizado.',today-194,today-174,'Pista IUB','Finalizado',id_atl,'Estudiantes','{}'),
    ('Copa Rector Fútbol 2023','Torneo finalizado.',today-206,today-186,'Cancha Principal','Finalizado',id_fut,'Todos','{}'),
    ('Torneo 3x3 Baloncesto 2023','Torneo finalizado.',today-218,today-198,'Coliseo IUB','Finalizado',id_bas,'Todos','{}'),
    ('Abierto Ajedrez IUB 2022','Torneo finalizado.',today-230,today-210,'Biblioteca','Finalizado',id_aje,'Todos','{}'),
    ('Maratón IUB 5K 2023','Torneo finalizado.',today-242,today-222,'Campus IUB','Finalizado',id_atl,'Todos','{}'),
    ('Liga Fútbol Estudiantil 2022','Torneo finalizado.',today-254,today-234,'Cancha Principal','Finalizado',id_fut,'Estudiantes','{}'),
    ('Copa Baloncesto Aniversario 2022','Torneo finalizado.',today-266,today-246,'Coliseo IUB','Finalizado',id_bas,'Todos','{}'),
    ('Torneo Ajedrez Rápido 2022','Torneo finalizado.',today-278,today-258,'Biblioteca','Finalizado',id_aje,'Todos','{}');

    -- ============================================================
    -- INSCRIPCIONES: Inscribir 4 usuarios (no admin) en cada torneo activo
    -- ============================================================
    INSERT INTO inscripciones_torneo (torneo_id, estudiante_id, estado)
    SELECT t.id, u.id, TRUE FROM torneos t, (
        SELECT id FROM usuarios WHERE id != 1 AND estado = TRUE LIMIT 4
    ) u ON CONFLICT DO NOTHING;

    -- ============================================================
    -- ESTADÍSTICAS - FÚTBOL (Torneos t1 y t5)
    -- ============================================================
    INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES
    (id_t1, ref_uid, 'Goles',       '{"jugador":"Carlos Ramírez","cantidad":4}'),
    (id_t1, ref_uid, 'Goles',       '{"jugador":"Luis Martínez","cantidad":3}'),
    (id_t1, ref_uid, 'Goles',       '{"jugador":"Andrés Torres","cantidad":2}'),
    (id_t1, ref_uid, 'Goles',       '{"jugador":"Diego López","cantidad":2}'),
    (id_t1, ref_uid, 'Goles',       '{"jugador":"Sergio Gómez","cantidad":1}'),
    (id_t1, ref_uid, 'Asistencias', '{"jugador":"Andrés Torres","cantidad":3}'),
    (id_t1, ref_uid, 'Asistencias', '{"jugador":"Carlos Ramírez","cantidad":2}'),
    (id_t1, ref_uid, 'Asistencias', '{"jugador":"Sergio Gómez","cantidad":2}'),
    (id_t1, ref_uid, 'Asistencias', '{"jugador":"Luis Martínez","cantidad":1}'),
    (id_t1, ref_uid, 'Asistencias', '{"jugador":"Felipe Herrera","cantidad":4}'),
    (id_t5, ref_uid, 'Goles',       '{"jugador":"Ramón Gutiérrez","cantidad":3}'),
    (id_t5, ref_uid, 'Goles',       '{"jugador":"Pedro Álvarez","cantidad":2}'),
    (id_t5, ref_uid, 'Asistencias', '{"jugador":"Ramón Gutiérrez","cantidad":1}'),
    (id_t5, ref_uid, 'Asistencias', '{"jugador":"Jorge Castillo","cantidad":3}');

    -- ============================================================
    -- ESTADÍSTICAS - BALONCESTO (Torneo t2)
    -- ============================================================
    INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES
    (id_t2, ref_uid, 'Puntos',  '{"jugador":"Jhon Cárdenas","cantidad":28}'),
    (id_t2, ref_uid, 'Puntos',  '{"jugador":"Mario Peña","cantidad":22}'),
    (id_t2, ref_uid, 'Puntos',  '{"jugador":"Samuel Rivera","cantidad":19}'),
    (id_t2, ref_uid, 'Puntos',  '{"jugador":"Camilo Díaz","cantidad":15}'),
    (id_t2, ref_uid, 'Puntos',  '{"jugador":"Iván Cruz","cantidad":12}'),
    (id_t2, ref_uid, 'Rebotes', '{"jugador":"Mario Peña","cantidad":12}'),
    (id_t2, ref_uid, 'Rebotes', '{"jugador":"Jhon Cárdenas","cantidad":7}'),
    (id_t2, ref_uid, 'Rebotes', '{"jugador":"Camilo Díaz","cantidad":9}'),
    (id_t2, ref_uid, 'Rebotes', '{"jugador":"Samuel Rivera","cantidad":5}'),
    (id_t2, ref_uid, 'Rebotes', '{"jugador":"Iván Cruz","cantidad":6}');

    -- ============================================================
    -- ESTADÍSTICAS - AJEDREZ (Torneo t3) — Sistema Suizo
    -- ============================================================
    INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES
    -- Sebastián Orozco: 6V 1E 0D
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Sebastián Orozco","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Sebastián Orozco","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Sebastián Orozco","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Sebastián Orozco","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Sebastián Orozco","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Sebastián Orozco","puntos":1}'),
    (id_t3, ref_uid, 'Empate',   '{"jugador":"Sebastián Orozco"}'),
    -- Mariana Salcedo: 5V 0E 1D
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Mariana Salcedo","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Mariana Salcedo","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Mariana Salcedo","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Mariana Salcedo","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Mariana Salcedo","puntos":1}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Mariana Salcedo"}'),
    -- Roberto Nieto: 4V 1E 2D
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Roberto Nieto","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Roberto Nieto","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Roberto Nieto","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Roberto Nieto","puntos":1}'),
    (id_t3, ref_uid, 'Empate',   '{"jugador":"Roberto Nieto"}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Roberto Nieto"}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Roberto Nieto"}'),
    -- Valentina Mejía: 3V 1E 3D
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Valentina Mejía","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Valentina Mejía","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Valentina Mejía","puntos":1}'),
    (id_t3, ref_uid, 'Empate',   '{"jugador":"Valentina Mejía"}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Valentina Mejía"}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Valentina Mejía"}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Valentina Mejía"}'),
    -- Nicolás Arango: 2V 0E 4D
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Nicolás Arango","puntos":1}'),
    (id_t3, ref_uid, 'Victoria', '{"jugador":"Nicolás Arango","puntos":1}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Nicolás Arango"}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Nicolás Arango"}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Nicolás Arango"}'),
    (id_t3, ref_uid, 'Derrota',  '{"jugador":"Nicolás Arango"}');

    -- ============================================================
    -- ESTADÍSTICAS - ATLETISMO (Torneo t4)
    -- ============================================================
    INSERT INTO estadisticas_torneo (torneo_id, usuario_id, tipo_estadistica, valor_json) VALUES
    (id_t4, ref_uid, 'Tiempo 100m', '{"jugador":"Ana Moreno","segundos":11.2}'),
    (id_t4, ref_uid, 'Tiempo 100m', '{"jugador":"Paola Suárez","segundos":11.8}'),
    (id_t4, ref_uid, 'Tiempo 100m', '{"jugador":"Laura Castro","segundos":12.1}'),
    (id_t4, ref_uid, 'Tiempo 100m', '{"jugador":"Juliana Ríos","segundos":12.5}'),
    (id_t4, ref_uid, 'Tiempo 100m', '{"jugador":"Natalia Vega","segundos":13.0}');

END $$;
