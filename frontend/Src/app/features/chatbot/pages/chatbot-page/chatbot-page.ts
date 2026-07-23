import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../services/chatbot.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
}

@Component({
  selector: 'app-chatbot-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-page.html',
  styleUrls: ['./chatbot-page.css']
})
export class ChatbotPage implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  userInput = '';
  isLoading = false;

  constructor(private readonly chatbotService: ChatbotService) {
    // Mensaje de bienvenida
    this.messages.push({
      text: '¡Hola! 👋 Soy el Asistente Virtual del Departamento de Deportes de la IUB. Puedo ayudarte con información sobre reglamentos, inscripciones, escenarios deportivos, protocolos y más. ¿En qué puedo ayudarte?',
      sender: 'bot',
      timestamp: new Date()
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  async enviarMensaje() {
    const texto = this.userInput.trim();
    if (!texto || this.isLoading) return;

    // Agregar mensaje del usuario
    this.messages.push({
      text: texto,
      sender: 'user',
      timestamp: new Date()
    });

    this.userInput = '';
    this.isLoading = true;

    // Agregar indicador de "escribiendo..."
    const typingMsg: ChatMessage = {
      text: '',
      sender: 'bot',
      timestamp: new Date(),
      isTyping: true
    };
    this.messages.push(typingMsg);

    try {
      const res = await this.chatbotService.enviarMensajeRAG(texto);
      // Reemplazar indicador de typing con respuesta real
      const idx = this.messages.indexOf(typingMsg);
      if (idx > -1) {
        this.messages[idx] = {
          text: res.respuesta,
          sender: 'bot',
          timestamp: new Date(),
          isTyping: false
        };
      }
    } catch (error) {
      const idx = this.messages.indexOf(typingMsg);
      if (idx > -1) {
        this.messages[idx] = {
          text: 'Lo siento, en este momento no puedo procesar tu consulta. Por favor, intenta de nuevo en un momento.',
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
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }
}
