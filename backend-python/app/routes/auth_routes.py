from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.controllers.auth_controller import auth_controller
from app.models.user import LoginRequest, Token

router = APIRouter(prefix="/auth", tags=["Autenticación"])

class RecoverRequest(BaseModel):
    email: str

class GoogleAuthRequest(BaseModel):
    id_token: str

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest):
    return auth_controller.login(login_data)

@router.post("/google", response_model=Token)
def login_google(data: GoogleAuthRequest):
    return auth_controller.login_google(data.id_token)


@router.post("/recover")
def recover_password(data: RecoverRequest):
    return auth_controller.recover_password(data.email)

