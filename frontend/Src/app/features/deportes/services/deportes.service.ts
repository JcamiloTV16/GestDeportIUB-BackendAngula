import { Injectable } from '@angular/core';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class DeportesService {
  constructor(private readonly api: ApiService) {}

  obtenerDeportes() {
    return this.api.request(`${API}/deportes/`);
  }

  obtenerInactivos() {
    return this.api.request(`${API}/deportes/inactivos/`, { headers: this.api.authHeaders() });
  }

  obtenerDeportesEstudiante(estudianteId: number) {
    return this.api.request(`${API}/inscripciones/estudiante/${estudianteId}/deportes`);
  }

  agregarDeporte(deporte: Record<string, unknown>) {
    return this.api.request(`${API}/deportes/`, {
      method: 'POST',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(deporte)
    });
  }

  actualizarDeporte(id: number, deporte: Record<string, unknown>) {
    return this.api.request(`${API}/deportes/${id}`, {
      method: 'PUT',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(deporte)
    });
  }

  eliminarDeporte(id: number) {
    return this.api.request(`${API}/deportes/${id}`, { method: 'DELETE' });
  }

  reactivarDeporte(id: number) {
    return this.api.request(`${API}/deportes/${id}/reactivar/`, {
      method: 'POST',
      headers: this.api.authHeaders()
    });
  }
}
