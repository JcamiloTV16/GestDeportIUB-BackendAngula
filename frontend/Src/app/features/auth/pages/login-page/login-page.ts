import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.html'
})
export class LoginPage {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private readonly authApi: AuthApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  async iniciarSesion(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, ingresa tus credenciales';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    try {
      const data = await this.authApi.login(this.email, this.password);
      this.auth.setSession(data.user, data.access_token);
      await this.router.navigate([this.auth.role === 'admin' ? '/admin' : this.auth.role === 'entrenador' ? '/entrenador' : '/estudiante']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error al iniciar sesion';
    } finally {
      this.loading = false;
    }
  }
}
