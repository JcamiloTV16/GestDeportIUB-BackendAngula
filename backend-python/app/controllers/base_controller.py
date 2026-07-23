import psycopg2
import json
from fastapi import HTTPException
from app.config.db_config import get_db_connection
from fastapi.encoders import jsonable_encoder

class BaseController:
    def __init__(self, table_name):
        self.table_name = table_name

    #LEER TODOS
    def get_all(self):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {self.table_name}")
            result = cursor.fetchall()
            
            colnames = [desc[0] for desc in cursor.description]
            payload = []
            for row in result:
                content = dict(zip(colnames, row))
                payload.append(content)
                
            return {"resultado": jsonable_encoder(payload)}
                
        except psycopg2.Error as err:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn:
                conn.close()

    #LEER POR ID
    def get_by_id(self, id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {self.table_name} WHERE id = %s", (id,))
            result = cursor.fetchone()
            
            if result:
                colnames = [desc[0] for desc in cursor.description]
                content = dict(zip(colnames, result))
                return jsonable_encoder(content)
            else:
                raise HTTPException(status_code=404, detail=f"{self.table_name} not found")
                
        except psycopg2.Error as err:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn:
                conn.close()

    #CREAR
    def create(self, data: dict):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            columns = list(data.keys())
            values = [json.dumps(val) if isinstance(val, (dict, list)) else val for val in data.values()]
            
            placeholders = ",".join(["%s"] * len(values))
            columns_str = ",".join(columns)
            
            query = f"INSERT INTO {self.table_name} ({columns_str}) VALUES ({placeholders}) RETURNING *"
            
            cursor.execute(query, values)
            result = cursor.fetchone()
            conn.commit()
            
            colnames = [desc[0] for desc in cursor.description]
            content = dict(zip(colnames, result))
            return jsonable_encoder(content)
            
        except Exception as err:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn:
                conn.close()

    #ACTUALIZAR
    def update(self, id: int, data: dict):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            set_clauses = [f"{key} = %s" for key in data.keys()]
            values = [json.dumps(val) if isinstance(val, (dict, list)) else val for val in data.values()]
            values.append(id)
            
            query = f"UPDATE {self.table_name} SET {', '.join(set_clauses)} WHERE id = %s"
            
            cursor.execute(query, values)
            conn.commit()
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"{self.table_name} with id {id} not found")
                
            return {"resultado": f"{self.table_name} updated"}
            
        except psycopg2.Error as err:

            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn:
                conn.close()

    #ELIMINAR
    def delete(self, id: int):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute(f"DELETE FROM {self.table_name} WHERE id = %s", (id,))
            conn.commit()
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail=f"{self.table_name} with id {id} not found")
                
            return {"resultado": f"{self.table_name} deleted"}
            
        except psycopg2.Error as err:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=str(err))
        finally:
            if conn:
                conn.close()
