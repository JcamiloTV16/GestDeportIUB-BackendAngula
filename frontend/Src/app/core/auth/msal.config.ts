import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
  ProtectedResourceScopes,
} from '@azure/msal-angular';
import {
  BrowserCacheLocation,
  InteractionType,
  LogLevel,
  PublicClientApplication,
} from '@azure/msal-browser';
import { environment } from '../../../environments/environment';

/**
 * Configuración de la instancia MSAL.
 * Authority apunta al tenant de la IUB (Unibarranquilla).
 */
export function msalInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.azure.clientId,
      authority: `https://login.microsoftonline.com/${environment.azure.tenantId}`,
      redirectUri: environment.azure.redirectUri,
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri,
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        logLevel: environment.production ? LogLevel.Error : LogLevel.Warning,
        piiLoggingEnabled: false,
      },
    },
  });
}

/**
 * Configuración del MsalGuard.
 * Usa InteractionType.Redirect para redirigir a Microsoft si no hay sesión.
 */
export function msalGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: environment.azure.scopes,
    },
    loginFailedRoute: '/login',
  };
}

/**
 * Configuración del MsalInterceptor.
 * Define qué URLs protegidas deben recibir el token de Azure automáticamente.
 * Solo aplica para llamadas hechas con HttpClient de Angular (no fetch nativo).
 */
export function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, (string | ProtectedResourceScopes)[]>();

  // Microsoft Graph API — MSAL inyecta el token automáticamente
  protectedResourceMap.set('https://graph.microsoft.com/v1.0/*', ['User.Read']);

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}
