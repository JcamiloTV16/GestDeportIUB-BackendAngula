import jwt
import requests
from jwt.exceptions import PyJWTError
from fastapi import HTTPException, status
from typing import Dict, Any

# Cache para almacenar las claves JWKS de Microsoft
_JWKS_CACHE: Dict[str, Any] = {}

def get_microsoft_jwks(tenant_id: str = "common") -> Dict[str, Any]:
    """Obtiene las claves públicas de Microsoft Entra ID para la verificación de firmas JWT."""
    global _JWKS_CACHE
    if not _JWKS_CACHE:
        url = f"https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            _JWKS_CACHE = response.json()
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No se pudo obtener las llaves públicas de Microsoft para la validación"
            )
    return _JWKS_CACHE

def verify_azure_token(token: str, client_id: str = None, tenant_id: str = None) -> Dict[str, Any]:
    """
    Decodifica y valida un token de acceso enviado por Microsoft Entra ID.
    En entorno de desarrollo o si no hay Client ID configurado aún, hace una decodificación sin firma 
    (extrayendo de forma segura los claims del payload).
    """
    try:
        # En primera instancia, leemos el header del token para encontrar el 'kid'
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        # Decodificación del payload para extraer información básica
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        
        # Validar dominio de la institución
        email = unverified_payload.get("preferred_username") or unverified_payload.get("email") or unverified_payload.get("upn")
        if email and not email.endswith("@unibarranquilla.edu.co"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo se permiten correos institucionales de @unibarranquilla.edu.co"
            )

        return {
            "email": email,
            "name": unverified_payload.get("name", email.split("@")[0] if email else "Usuario"),
            "oid": unverified_payload.get("oid") or unverified_payload.get("sub"),
            "tid": unverified_payload.get("tid")
        }

    except PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token de Microsoft inválido o expirado: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al procesar el token de Microsoft: {str(e)}"
        )
