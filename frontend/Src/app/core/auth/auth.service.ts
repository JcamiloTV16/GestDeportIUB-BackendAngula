import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface AppUser {
  id: number;
  nombre?: string;
  email?: string;
  rol?: string;
  programa_id?: number;
  numero_documento?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AppUser | null>(this.readUser());
  private readonly roleSubject = new BehaviorSubject<string>(localStorage.getItem('rol') || '');
  private readonly tokenSubject = new BehaviorSubject<string>(localStorage.getItem('token') || '');

  readonly user$ = this.userSubject.asObservable();
  readonly role$ = this.roleSubject.asObservable();
  readonly token$ = this.tokenSubject.asObservable();

  constructor(private readonly router: Router) {}

  get user(): AppUser | null {
    return this.userSubject.value;
  }

  get role(): string {
    return this.roleSubject.value;
  }

  get token(): string {
    return this.tokenSubject.value;
  }

  setSession(user: AppUser, accessToken: string): void {
    const normalizedRole = this.normalizeRole(String(user.rol || ''));
    this.userSubject.next(user);
    this.roleSubject.next(normalizedRole);
    this.tokenSubject.next(accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('rol', normalizedRole);
    localStorage.setItem('token', accessToken);
  }

  updateUser(user: AppUser): void {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout(): void {
    this.userSubject.next(null);
    this.roleSubject.next('');
    this.tokenSubject.next('');
    localStorage.removeItem('user');
    localStorage.removeItem('rol');
    localStorage.removeItem('token');
    void this.router.navigate(['/login']);
  }

  private readUser(): AppUser | null {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  }

  private normalizeRole(role: string): string {
    const value = role.toLowerCase();
    if (value.includes('admin')) return 'admin';
    if (value.includes('entrenador')) return 'entrenador';
    if (value.includes('deportista') || value.includes('estudiante')) return 'estudiante';
    return value;
  }
}
