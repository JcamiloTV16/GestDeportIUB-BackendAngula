import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.user && auth.token ? true : router.parseUrl('/login');
};

export const publicOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.user || !auth.role) return true;
  return router.parseUrl(auth.role === 'admin' ? '/admin' : auth.role === 'entrenador' ? '/entrenador' : '/estudiante');
};
