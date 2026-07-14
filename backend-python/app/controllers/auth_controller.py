from fastapi import HTTPException, status
from app.config.db_config import get_db_connection
from app.utils.auth_utils import verify_password, create_access_token
import psycopg2

class AuthController:
    def login(self, login_data):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            
            # Buscar usuario por email con su rol
            cursor.execute("""
                SELECT u.id, u.password, u.nombre, r.nombre_rol, u.programa_id 
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.id
                WHERE u.email = %s AND u.estado = TRUE
            """, (login_data.email,))
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario o contraseña incorrectos",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            user_id, db_password, user_name, role_name, programa_id = user
            
            # Verificación de contraseña
            authenticated = False
            if login_data.password == db_password:
                authenticated = True
            else:
                try:
                    # Intentar verificar si es un hash de bcrypt
                    if db_password.startswith('$2b$') or db_password.startswith('$2y$'):
                        if verify_password(login_data.password, db_password):
                            authenticated = True
                except Exception:
                    pass
            
            if not authenticated:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario o contraseña incorrectos",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Crear token de acceso
            access_token = create_access_token(data={"sub": str(user_id)})
            
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user_id,
                    "nombre": user_name,
                    "email": login_data.email,
                    "rol": role_name or "Deportista", # Fallback if no role assigned
                    "programa_id": programa_id
                }
            }
            
        except psycopg2.Error as e:
            raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)}")
        finally:
            if conn:
                conn.close()

    def recover_password(self, email: str):
        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute(
                "SELECT password, nombre FROM usuarios WHERE email = %s AND estado = TRUE",
                (email,)
            )
            result = cursor.fetchone()

            if not result:
                raise HTTPException(
                    status_code=404,
                    detail="No se encontró una cuenta con ese correo electrónico"
                )

            password, nombre = result
            return {
                "mensaje": "Contraseña recuperada exitosamente",
                "password": password,
                "nombre": nombre
            }

        except HTTPException:
            raise
        except psycopg2.Error as e:
            raise HTTPException(status_code=500, detail=f"Error de base de datos: {str(e)}")
        finally:
            if conn:
                conn.close()

auth_controller = AuthController()
