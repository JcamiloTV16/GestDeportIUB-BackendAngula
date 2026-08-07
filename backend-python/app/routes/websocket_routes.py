from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import manager
import datetime

router = APIRouter()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(client_id, websocket)

    # Mensaje inicial de bienvenida al cliente
    await manager.send_personal_message({
        "type": "system",
        "sender": "Sistema",
        "sender_id": "system",
        "text": f"Conexión privada WebSocket lista para '{client_id}'",
        "timestamp": datetime.datetime.now().isoformat()
    }, client_id)

    try:
        while True:
            data = await websocket.receive_json()
            recipient_id = str(data.get("recipient_id", ""))
            message_text = data.get("text", data.get("message", ""))
            sender_name = data.get("sender", client_id)

            if not recipient_id:
                await manager.send_personal_message({
                    "type": "error",
                    "sender": "Sistema",
                    "sender_id": "system",
                    "text": "Selecciona un destinatario para enviar el mensaje privado.",
                    "timestamp": datetime.datetime.now().isoformat()
                }, client_id)
                continue

            payload = {
                "type": "private_chat",
                "sender": sender_name,
                "sender_id": client_id,
                "recipient_id": recipient_id,
                "text": message_text,
                "timestamp": datetime.datetime.now().isoformat()
            }

            # Enrutar el mensaje al destinatario y al emisor
            recipient_online = await manager.route_private_message(payload, client_id, recipient_id)

            if not recipient_online:
                await manager.send_personal_message({
                    "type": "info",
                    "sender": "Sistema",
                    "sender_id": "system",
                    "text": f"El destinatario '{recipient_id}' se encuentra desconectado actualmente.",
                    "timestamp": datetime.datetime.now().isoformat()
                }, client_id)

    except WebSocketDisconnect:
        manager.disconnect(client_id, websocket)
    except Exception as e:
        print(f"Error en WebSocket {client_id}: {e}")
        manager.disconnect(client_id, websocket)
