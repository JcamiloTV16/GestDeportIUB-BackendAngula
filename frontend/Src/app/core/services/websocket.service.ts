import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { API, ApiService } from './api.service';
import { environment } from '../../../environments/environment';


export interface ChatContact {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

export interface WebSocketMessage {
  type: string;
  sender: string;
  sender_id?: string;
  recipient_id?: string;
  text: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: WebSocket | null = null;
  private readonly messagesSubject = new Subject<WebSocketMessage>();
  public messages$: Observable<WebSocketMessage> = this.messagesSubject.asObservable();

  private readonly connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public isConnected$: Observable<boolean> = this.connectionStatusSubject.asObservable();

  private clientId: string = 'user_' + Math.random().toString(36).substring(2, 7);

  constructor(private readonly api: ApiService) {}

  public connect(customClientId?: string): void {
    let reconnectNeeded = false;
    
    if (customClientId && customClientId !== this.clientId) {
      this.clientId = customClientId;
      reconnectNeeded = true;
    }

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      if (reconnectNeeded) {
        this.socket.close(); // Forces a reconnect with the new clientId
      } else {
        return;
      }
    }

    const baseUrl = environment.apiUrl.replace(/^http/, 'ws');
    const wsUrl = `${baseUrl}/ws/${this.clientId}`;


    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log(`🔌 WebSocket conectado a ${wsUrl}`);
        this.connectionStatusSubject.next(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          this.messagesSubject.next(data);
        } catch (err) {
          console.error('Error procesando mensaje WebSocket:', err);
        }
      };

      this.socket.onerror = (error) => {
        console.error('⚠️ Error en conexión WebSocket:', error);
        this.connectionStatusSubject.next(false);
      };

      this.socket.onclose = () => {
        console.warn('❌ WebSocket desconectado. Intentando reconectar en 3s...');
        this.connectionStatusSubject.next(false);
        setTimeout(() => this.connect(), 3000);
      };
    } catch (e) {
      console.error('Excepción creando conexión WebSocket:', e);
    }
  }

  public sendMessage(text: string, recipientId: string, senderName?: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const payload = {
        text,
        recipient_id: recipientId,
        sender: senderName || this.clientId
      };
      this.socket.send(JSON.stringify(payload));
    } else {
      console.warn('No se puede enviar el mensaje, el WebSocket no está conectado');
    }
  }

  public getContacts(userId: number) {
    return this.api.request<{ contacts: ChatContact[] }>(`${API}/chat/contacts/${userId}`);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public getClientId(): string {
    return this.clientId;
  }
}
