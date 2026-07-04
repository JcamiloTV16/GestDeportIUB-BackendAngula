import psycopg2

url = "postgresql://neondb_owner:npg_wZv7pWo2bULH@ep-wild-sunset-ai2qrg11-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(url)
    cursor = conn.cursor()
    
    # Insert new roles
    cursor.execute("INSERT INTO roles (nombre, descripcion) VALUES ('Funcionario', 'Personal administrativo') ON CONFLICT (nombre) DO NOTHING;")
    cursor.execute("INSERT INTO roles (nombre, descripcion) VALUES ('Egresado', 'Egresados de la institucion') ON CONFLICT (nombre) DO NOTHING;")
    conn.commit()
    print("Roles inserted.")
    
    # Alter torneos table (safe alter)
    try:
        cursor.execute("ALTER TABLE torneos ADD COLUMN poblacion_objetivo VARCHAR(50) DEFAULT 'Todos';")
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Column poblacion_objetivo might already exist:", e)
        
    try:
        cursor.execute("ALTER TABLE torneos ADD COLUMN reglas_json JSONB;")
        conn.commit()
    except Exception as e:
        conn.rollback()
        print("Column reglas_json might already exist:", e)

    # Create estadisticas_torneo
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS estadisticas_torneo (
            id SERIAL PRIMARY KEY,
            torneo_id INTEGER REFERENCES torneos(id) ON DELETE CASCADE,
            usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
            tipo_estadistica VARCHAR(50) NOT NULL,
            valor_json JSONB,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()
    print("Database updated successfully.")
except Exception as e:
    print("Error:", e)
finally:
    if 'conn' in locals() and conn: conn.close()
