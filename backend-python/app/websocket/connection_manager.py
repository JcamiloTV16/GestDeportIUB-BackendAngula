from typing import Dict, List
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Almacena las conexiones activas: user_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        print(f"🔌 WebSocket conectado para usuario '{user_id}'")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
            print(f"❌ WebSocket desconectado para usuario '{user_id}'")

    async def send_personal_message(self, message: dict, recipient_id: str) -> bool:
        """Envía el mensaje en tiempo real a las conexiones del destinatario."""
        sent = False
        if recipient_id in self.active_connections:
            for socket in list(self.active_connections[recipient_id]):
                try:
                    await socket.send_json(message)
                    sent = True
                except Exception as e:
                    print(f"⚠️ Error enviando mensaje a '{recipient_id}': {e}")
        return sent

    async def route_private_message(self, message: dict, sender_id: str, recipient_id: str):
        """
        Enruta el mensaje privado 1 a 1 al destinatario y confirma la emisión al remitente.
        """
        recipient_online = await self.send_personal_message(message, recipient_id)

        # Enviar también la confirmación al remitente
        if sender_id != recipient_id:
            await self.send_personal_message(message, sender_id)

        return recipient_online

manager = ConnectionManager()
