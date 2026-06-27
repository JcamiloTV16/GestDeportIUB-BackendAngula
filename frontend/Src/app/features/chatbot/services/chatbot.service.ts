import { Injectable } from '@angular/core';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  constructor(private readonly api: ApiService) {}

  enviarMensaje(mensaje: string) {
    return this.api.request(`${API}/chatbot/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje })
    });
  }
}
