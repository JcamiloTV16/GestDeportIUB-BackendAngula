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

    def login_google(self, id_token: str):
        from app.utils.google_auth import verify_google_id_token

        # Validar el token de Google
        google_user = verify_google_id_token(id_token)
        email = google_user["email"]
        nombre = google_user["name"]

        conn = None
        try:
            conn = get_db_connection()
            cursor = conn.cursor()

            # Buscar usuario en la base de datos por email
            cursor.execute("""
                SELECT u.id, u.nombre, r.nombre_rol, u.programa_id 
                FROM usuarios u
                LEFT JOIN roles r ON u.rol_id = r.id
                WHERE u.email = %s AND u.estado = TRUE
            """, (email,))
            user = cursor.fetchone()

            # Auto-provisioning si el usuario no existe en la base de datos
            if not user:
                # Obtener el rol predeterminado de 'Estudiante' / 'Deportista'
                cursor.execute("SELECT id FROM roles WHERE LOWER(nombre_rol) LIKE '%estudiante%' OR LOWER(nombre_rol) LIKE '%deportista%' LIMIT 1")
                role_row = cursor.fetchone()
                rol_id = role_row[0] if role_row else 3

                num_doc = f"GOO-{email.split('@')[0]}"[:20]

                cursor.execute("""
                    INSERT INTO usuarios (
                        rol_id, tipo_documento_id, numero_documento, facultad_id, 
                        nombre, email, password, estado, create_, update_
                    )
                    VALUES (%s, 1, %s, 1, %s, %s, %s, TRUE, (NOW() AT TIME ZONE 'America/Bogota'), (NOW() AT TIME ZONE 'America/Bogota'))
                    RETURNING id
                """, (rol_id, num_doc, nombre, email, "GOOGLE_OAUTH_ACCOUNT"))

                user_id = cursor.fetchone()[0]
                conn.commit()

                role_name = "Estudiante"
                programa_id = None
            else:
                user_id, nombre, role_name, programa_id = user

            # Generar token JWT interno del backend
            access_token = create_access_token(data={"sub": str(user_id)})

            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {
                    "id": user_id,
                    "nombre": nombre,
                    "email": email,
                    "rol": role_name or "Estudiante",
                    "programa_id": programa_id
                }
            }

        except HTTPException:
            if conn:
                conn.rollback()
            raise
        except Exception as e:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=f"Error en inicio de sesión con Google: {str(e)}")
        finally:
            if conn:
                conn.close()



auth_controller = AuthController()


