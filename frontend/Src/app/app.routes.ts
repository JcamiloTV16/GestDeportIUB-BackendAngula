import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    canActivate: [publicOnlyGuard],
    loadComponent: () => import('./features/auth/pages/login-page/login-page').then((m) => m.LoginPage)
  },
  {
    path: 'recover',
    canActivate: [publicOnlyGuard],
    loadComponent: () => import('./features/auth/pages/recover-page/recover-page').then((m) => m.RecoverPage)
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./features/perfil/pages/perfil-page/perfil-page').then((m) => m.PerfilPage)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./features/admin/pages/admin-page/admin-page').then((m) => m.AdminPageComponent)
  },
  {
    path: 'entrenador',
    canActivate: [authGuard],
    loadComponent: () => import('./features/entrenador/pages/entrenador-page/entrenador-page').then((m) => m.EntrenadorPage)
  },
  {
    path: 'estudiante',
    canActivate: [authGuard],
    loadComponent: () => import('./features/estudiante/pages/estudiante-page/estudiante-page').then((m) => m.EstudiantePage)
  },
  {
    path: 'deportes',
    canActivate: [authGuard],
    loadComponent: () => import('./features/deportes/pages/deportes-page/deportes-page').then((m) => m.DeportesPage)
  },
  {
    path: 'cursos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/cursos/pages/cursos-page/cursos-page').then((m) => m.CursosPage)
  },
  {
    path: 'torneos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/torneos/pages/torneos-page/torneos-page').then((m) => m.TorneosPage)
  },
  {
    path: 'usuarios',
    canActivate: [authGuard],
    loadComponent: () => import('./features/usuarios/pages/usuarios-page/usuarios-page').then((m) => m.UsuariosPage)
  },
  {
    path: 'auditorias',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auditorias/pages/auditorias-page/auditorias-page').then((m) => m.AuditoriasPage)
  },
  {
    path: 'inscripciones',
    canActivate: [authGuard],
    loadComponent: () => import('./features/inscripciones/pages/inscripciones-page/inscripciones-page').then((m) => m.InscripcionesPage)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
