import { Injectable, OnDestroy } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import {
  AccountInfo,
  AuthenticationResult,
  EventMessage,
  EventType,
  InteractionStatus,
  SilentRequest,
} from '@azure/msal-browser';
import { Subject, filter, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { API, ApiService } from '../services/api.service';
import { AppUser, AuthService } from './auth.service';

/**
 * Servicio dedicado a la autenticación con Microsoft Entra ID.
 * Encapsula toda la interacción con MsalService y MsalBroadcastService.
 */
@Injectable({ providedIn: 'root' })
export class MsalAuthService implements OnDestroy {

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly msalService: MsalService,
    private readonly msalBroadcast: MsalBroadcastService,
    private readonly authService: AuthService,
    private readonly apiService: ApiService
  ) {
    this.initMsalListeners();
  }

  /**
   * Inicializa los listeners de eventos MSAL.
   * Captura el resultado del redirect cuando el usuario regresa de Microsoft.
   */
  private initMsalListeners(): void {
    // Escuchar cuando MSAL termina de procesar un redirect
    this.msalBroadcast.inProgress$
      .pipe(
        filter((status) => status === InteractionStatus.None),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.checkAndSetActiveAccount();
      });

    // Escuchar eventos de login exitoso
    this.msalBroadcast.msalSubject$
      .pipe(
        filter(
          (event: EventMessage) =>
            event.eventType === EventType.LOGIN_SUCCESS ||
            event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((event: EventMessage) => {
        const result = event.payload as AuthenticationResult;
        if (result?.account) {
          this.msalService.instance.setActiveAccount(result.account);
        }
      });
  }

  /**
   * Establece la cuenta activa si hay una disponible.
   */
  private checkAndSetActiveAccount(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    if (!activeAccount) {
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length > 0) {
        this.msalService.instance.setActiveAccount(accounts[0]);
      }
    }
  }

  /**
   * Inicia el flujo de login con Microsoft vía redirect.
   */
  loginWithMicrosoft(): void {
    this.msalService.loginRedirect({
      scopes: environment.azure.scopes,
      prompt: 'select_account',
      domainHint: 'unibarranquilla.edu.co',
    });
  }

  /**
   * Procesa el resultado del redirect de Microsoft.
   * Se llama desde el componente principal (App) al inicializar.
   */
  async handleRedirectResult(): Promise<void> {
    try {
      const result = await this.msalService.instance.handleRedirectPromise();
      if (result?.account && result.accessToken) {
        this.msalService.instance.setActiveAccount(result.account);
        await this.syncWithBackend(result.accessToken, result.account);
      }
    } catch (error) {
      console.error('Error procesando redirect de Microsoft:', error);
    }
  }

  /**
   * Obtiene un token de acceso de forma silenciosa.
   * Útil para refrescar el token sin interacción del usuario.
   */
  async getActiveToken(): Promise<string | null> {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) return null;

    try {
      const request: SilentRequest = {
        scopes: environment.azure.scopes,
        account,
      };
      const result = await this.msalService.instance.acquireTokenSilent(request);
      return result.accessToken;
    } catch {
      console.warn('No se pudo obtener token silencioso, se requiere interacción.');
      return null;
    }
  }

  /**
   * Verifica si hay una cuenta MSAL activa.
   */
  get isMsalAuthenticated(): boolean {
    return !!this.msalService.instance.getActiveAccount();
  }

  /**
   * Obtiene la cuenta activa de MSAL.
   */
  get activeAccount(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount();
  }

  /**
   * Sincroniza el token de Azure con el backend.
   * Envía el token de Microsoft al endpoint /auth/microsoft para obtener
   * un JWT local y los datos del usuario con roles del sistema.
   */
  async syncWithBackend(azureToken: string, account: AccountInfo): Promise<AppUser | null> {
    try {
      const data = await this.apiService.request<{
        access_token: string;
        user: AppUser;
      }>(`${API}/auth/microsoft`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          azure_token: azureToken,
          email: account.username,
          nombre: account.name || account.username.split('@')[0],
        }),
      });

      this.authService.setSession(data.user, data.access_token);
      return data.user;
    } catch (error) {
      console.error('Error sincronizando con backend:', error);
      return null;
    }
  }

  /**
   * Cierra la sesión de Microsoft.
   */
  logoutMicrosoft(): void {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
