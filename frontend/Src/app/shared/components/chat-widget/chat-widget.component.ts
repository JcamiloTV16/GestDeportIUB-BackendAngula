import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../features/chatbot/services/chatbot.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent implements AfterViewChecked {
  @ViewChild('widgetMessages') widgetMessages!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;
  hasNewMessage = false;

  constructor(private readonly chatbotService: ChatbotService) {
    this.messages.push({
      text: '¡Hola! 👋 Soy el Asistente Virtual del Departamento de Deportes de la IUB. ¿En qué puedo ayudarte?',
      sender: 'bot',
      timestamp: new Date()
    });
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

  async enviarMensaje() {
    const texto = this.userInput.trim();
    if (!texto || this.isLoading) return;

    this.messages.push({
      text: texto,
      sender: 'user',
      timestamp: new Date()
    });

    this.userInput = '';
    this.isLoading = true;

    const typingMsg: ChatMessage = {
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    this.messages.push(typingMsg);

    try {
      const res = await this.chatbotService.enviarMensajeRAG(texto);
      const idx = this.messages.indexOf(typingMsg);
      if (idx > -1) {
        this.messages[idx] = {
          text: res.respuesta,
          sender: 'bot',
          timestamp: new Date(),
          isTyping: false
        };
      }
      if (!this.isOpen) {
        this.hasNewMessage = true;
      }
    } catch {
      const idx = this.messages.indexOf(typingMsg);
      if (idx > -1) {
        this.messages[idx] = {
          text: 'Lo siento, no pude procesar tu consulta. Intenta de nuevo en un momento.',
          sender: 'bot',
          timestamp: new Date(),
          isTyping: false
        };
      }
    } finally {
      this.isLoading = false;
    }
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
