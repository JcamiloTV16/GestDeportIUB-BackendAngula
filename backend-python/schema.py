import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.config.db_config import get_db_connection

conn = get_db_connection()
cursor = conn.cursor()
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'torneos';
""")
rows = cursor.fetchall()
print("Torneos Table Columns:")
for row in rows:
    print(f"- {row[0]}: {row[1]}")

cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'inscripciones_torneo';
""")
rows2 = cursor.fetchall()
print("\nInscripciones Torneo Table Columns:")
for row in rows2:
    print(f"- {row[0]}: {row[1]}")

conn.close()
