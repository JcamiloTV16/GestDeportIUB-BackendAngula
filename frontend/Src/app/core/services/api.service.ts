import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export const API = environment.apiUrl;
export const NODE_API = environment.nodeApiUrl;


@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly auth: AuthService) {}

  async request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, options);
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (response.status === 401 && !url.includes('/auth/login')) {
      this.auth.logout();
      throw new Error('Sesion expirada. Por favor, inicia sesion nuevamente.');
    }

    if (!response.ok) {
      throw new Error(data.detail || 'Error en la solicitud.');
    }


    return data;
  }

  authHeaders(token = this.auth.token): HeadersInit {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  jsonHeaders(token = this.auth.token): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...this.authHeaders(token)
    };
  }
}
