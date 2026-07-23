import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { API, ApiService } from '../services/api.service';
import { AppUser, AuthService } from './auth.service';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private scriptLoaded = false;

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly ngZone: NgZone
  ) {}

  /**
   * Carga el SDK oficial de Google Identity Services dinámicamente.
   */
  loadGoogleSdk(): Promise<void> {
    return new Promise((resolve) => {
      if (this.scriptLoaded || typeof google !== 'undefined') {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Inicializa Google GIS y renderiza el botón en un contenedor HTML.
   */
  async renderGoogleButton(elementId: string): Promise<void> {
    await this.loadGoogleSdk();

    if (typeof google === 'undefined' || !google.accounts?.id) {
      console.error('El SDK de Google no está disponible');
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleCredentialResponse(response),
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    const targetElem = document.getElementById(elementId);
    if (targetElem) {
      google.accounts.id.renderButton(targetElem, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320,
      });
    }
  }

  /**
   * Procesa el token enviado por Google e inicia sesión en el backend.
   */
  private async handleCredentialResponse(response: any): Promise<void> {
    if (!response || !response.credential) {
      console.error('No se recibió la credencial de Google');
      return;
    }

    try {
      const data = await this.apiService.request<{
        access_token: string;
        user: AppUser;
      }>(`${API}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential }),
      });

      this.ngZone.run(() => {
        this.authService.setSession(data.user, data.access_token);
        const redirectPath =
          data.user.rol === 'admin'
            ? '/admin'
            : data.user.rol === 'entrenador'
            ? '/entrenador'
            : '/estudiante';
        void this.router.navigate([redirectPath]);
      });
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  }
}
