import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { Footer } from './shared/components/footer/footer';
import { Navbar } from './shared/components/navbar/navbar';
import { ChatWidgetComponent } from './shared/components/chat-widget/chat-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Footer, ChatWidgetComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(
    public readonly auth: AuthService,
    private readonly router: Router
  ) {}

  get showShell(): boolean {
    return !['/login', '/recover'].includes(this.router.url.split('?')[0]);
  }

  get showChatbot(): boolean {
    return this.showShell && this.auth.role === 'estudiante';
  }

}
