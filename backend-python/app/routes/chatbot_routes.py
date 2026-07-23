from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.controllers.chatbot_controller import detectar_intencion
import time

router = APIRouter()

class ChatMessage(BaseModel):
    mensaje: str

class RAGQuestion(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000)

@router.post("/chatbot/", tags=["Chatbot"])
async def chatbot(data: ChatMessage):
    resultado = detectar_intencion(data.mensaje)
    return resultado

@router.post("/chatbot/rag/", tags=["Chatbot"])
async def chatbot_rag(data: RAGQuestion):
    """
    Endpoint RAG: responde usando el motor de IA con documentos indexados.
    Si el RAG falla, cae al chatbot de keywords como fallback.
    """
    start_time = time.time()

    try:
        from app.rag.chain import get_answer
        result = get_answer(data.question)
        processing_time = round(time.time() - start_time, 2)

        return {
            "respuesta": result["answer"],
            "fuente": "rag",
            "tiempo_procesamiento": processing_time,
        }

    except Exception as e:
        print(f"⚠️ RAG falló, usando fallback de keywords: {e}")
        # Fallback al chatbot basado en palabras clave
        fallback = detectar_intencion(data.question)
        processing_time = round(time.time() - start_time, 2)

        return {
            "respuesta": fallback["respuesta"],
            "fuente": "keywords",
            "tiempo_procesamiento": processing_time,
        }
