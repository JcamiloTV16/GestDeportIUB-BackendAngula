import json
import urllib.request
import urllib.parse
from fastapi import HTTPException, status
from typing import Dict, Any

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"

def verify_google_id_token(id_token: str) -> Dict[str, Any]:
    """
    Verifica la autenticidad de un ID Token JWT de Google consultando 
    la API oficial de tokeninfo de Google OAuth2 usando la librería estándar urllib.
    """
    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de Google no proporcionado"
        )

    try:
        url = f"{GOOGLE_TOKENINFO_URL}?id_token={urllib.parse.quote(id_token)}"
        req = urllib.request.Request(url, headers={"User-Agent": "FastAPI-App"})
        
        with urllib.request.urlopen(req, timeout=10) as response:
            if response.status != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de Google inválido o expirado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            body = response.read().decode('utf-8')
            token_info = json.loads(body)

        # Verificar que el token contenga el email
        email = token_info.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El token de Google no contiene una dirección de correo válida"
            )

        # Verificar que el email esté verificado por Google
        email_verified = token_info.get("email_verified")
        if not email_verified or str(email_verified).lower() != 'true':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El correo electrónico de Google no ha sido verificado"
            )

        return {
            "email": email,
            "name": token_info.get("name") or email.split("@")[0],
            "picture": token_info.get("picture"),
            "sub": token_info.get("sub")
        }

    except urllib.error.HTTPError as e:
        error_detail = "Token de Google inválido o expirado"
        try:
            err_body = e.read().decode('utf-8')
            err_json = json.loads(err_body)
            error_detail = err_json.get("error_description") or err_json.get("error") or error_detail
        except Exception:
            pass

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Error al validar token con Google: {error_detail}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Error al comunicar con los servidores de Google: {str(e)}"
        )
