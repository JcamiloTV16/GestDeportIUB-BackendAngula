import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * Interceptor funcional que inyecta el token de autorización
 * en las peticiones HTTP hechas con HttpClient de Angular.
 *
 * Nota: Las peticiones a Microsoft Graph son manejadas por MsalInterceptor.
 * Este interceptor se encarga solo de las peticiones al backend propio.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth = inject(AuthService);

  // No interceptar peticiones a Microsoft
  if (req.url.includes('login.microsoftonline.com') || req.url.includes('graph.microsoft.com')) {
    return next(req);
  }

  const token = auth.token;
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedReq);
  }

  return next(req);
};
