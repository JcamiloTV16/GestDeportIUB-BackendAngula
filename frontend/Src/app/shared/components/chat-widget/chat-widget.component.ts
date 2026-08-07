import { Component, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebSocketService, WebSocketMessage, ChatContact } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/auth/auth.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot' | 'system';
  senderName?: string;
  senderId?: string;
  recipientId?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('widgetMessages') widgetMessages!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  contacts: ChatContact[] = [];
  selectedContactId: number | null = null;
  userInput = '';
  hasNewMessage = false;
  isConnected = false;

  private wsSubscription!: Subscription;
  private statusSubscription!: Subscription;

  constructor(
    private readonly wsService: WebSocketService,
    private readonly authService: AuthService
  ) {}

  get selectedContact(): ChatContact | null {
    if (!this.selectedContactId) return null;
    return this.contacts.find(c => c.id === Number(this.selectedContactId)) || null;
  }

  async ngOnInit() {
    const currentUser = this.authService.user;
    const currentUserId = currentUser?.id || 1;
    const clientId = `user_${currentUserId}`;

    this.wsService.connect(clientId);

    // Cargar lista de contactos disponibles (Entrenadores, Admins, Deportistas)
    try {
      const res = await this.wsService.getContacts(currentUserId);
      this.contacts = res.contacts || [];
      if (this.contacts.length > 0) {
        this.selectedContactId = this.contacts[0].id;
      }
    } catch (e) {
      console.error('Error cargando contactos de chat:', e);
    }

    this.statusSubscription = this.wsService.isConnected$.subscribe(connected => {
      this.isConnected = connected;
    });

    this.wsSubscription = this.wsService.messages$.subscribe((msg: WebSocketMessage) => {
      const myClientId = this.wsService.getClientId();
      const isMe = msg.sender_id === myClientId;

      if (msg.type === 'system' || msg.type === 'info') {
        this.messages.push({
          text: msg.text,
          sender: 'system',
          senderName: msg.sender,
          timestamp: new Date(msg.timestamp)
        });
      } else if (!isMe) {
        this.messages.push({
          text: msg.text,
          sender: 'bot',
          senderName: msg.sender,
          senderId: msg.sender_id,
          recipientId: msg.recipient_id,
          timestamp: new Date(msg.timestamp)
        });

        if (!this.isOpen) {
          this.hasNewMessage = true;
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.wsSubscription) this.wsSubscription.unsubscribe();
    if (this.statusSubscription) this.statusSubscription.unsubscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.hasNewMessage = false;
    }
  }

  closeChat() {
    this.isOpen = false;
  }

  get activeMessages(): ChatMessage[] {
    if (!this.selectedContactId) return this.messages;
    const targetClientId = `user_${this.selectedContactId}`;

    return this.messages.filter(m =>
      m.sender === 'system' ||
      (m.recipientId === targetClientId) ||
      (m.senderId === targetClientId) ||
      (m.sender === 'user' && m.recipientId === targetClientId)
    );
  }

  enviarMensaje() {
    const texto = this.userInput.trim();
    if (!texto || !this.selectedContactId) return;

    const currentUser = this.authService.user;
    const senderName = currentUser?.nombre || currentUser?.email || 'Usuario';
    const targetClientId = `user_${this.selectedContactId}`;

    // Agregar mensaje localmente
    this.messages.push({
      text: texto,
      sender: 'user',
      senderName: senderName,
      senderId: this.wsService.getClientId(),
      recipientId: targetClientId,
      timestamp: new Date()
    });

    // Enviar por WebSocket al destinatario seleccionado
    this.wsService.sendMessage(texto, targetClientId, senderName);

    this.userInput = '';
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  private scrollToBottom() {
    try {
      if (this.widgetMessages) {
        this.widgetMessages.nativeElement.scrollTop =
          this.widgetMessages.nativeElement.scrollHeight;
      }
    } catch {}
  }
}
