import { Injectable } from '@angular/core';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private readonly api: ApiService) {}

  obtenerEstadisticas() {
    return this.api.request(`${API}/dashboard/stats`, { headers: this.api.authHeaders() });
  }

  obtenerRoles() {
    return this.api.request(`${API}/roles/`, { headers: this.api.authHeaders() });
  }

  obtenerEntrenadores() {
    return this.api.request(`${API}/entrenadores/`, { headers: this.api.authHeaders() });
  }
}
