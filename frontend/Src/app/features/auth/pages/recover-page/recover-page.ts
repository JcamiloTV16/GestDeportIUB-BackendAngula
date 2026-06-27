import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-recover-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recover-page.html'
})
export class RecoverPage {
  email = '';
  loading = false;
  errorMessage = '';
  resultado: any = null;

  constructor(private readonly authApi: AuthApiService) {}

  async recuperar(): Promise<void> {
    if (!this.email) {
      this.errorMessage = 'Por favor, ingresa tu correo electronico';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.resultado = null;
    try {
      this.resultado = await this.authApi.recoverPassword(this.email);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al recuperar la contrasena';
    } finally {
      this.loading = false;
    }
  }
}
