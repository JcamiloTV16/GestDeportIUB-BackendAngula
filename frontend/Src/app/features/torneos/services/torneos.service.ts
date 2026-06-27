import { Injectable } from '@angular/core';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class TorneosService {
  constructor(private readonly api: ApiService) {}

  obtenerTorneos() {
    return this.api.request(`${API}/torneos/`);
  }

  crearTorneo(datos: Record<string, unknown>) {
    return this.api.request(`${API}/torneos/`, {
      method: 'POST',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(datos)
    });
  }

  eliminarTorneo(id: number) {
    return this.api.request(`${API}/torneos/${id}`, {
      method: 'DELETE',
      headers: this.api.authHeaders()
    });
  }

  cambiarEstadoTorneo(id: number, estado_torneo: string) {
    return this.api.request(`${API}/torneos/${id}/estado`, {
      method: 'PATCH',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify({ estado_torneo })
    });
  }

  inscribirseEnTorneo(datos: Record<string, unknown>) {
    return this.api.request(`${API}/inscripciones-torneo/`, {
      method: 'POST',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(datos)
    });
  }

  obtenerMisTorneos(estudianteId: number) {
    return this.api.request(`${API}/inscripciones-torneo/estudiante/${estudianteId}`, {
      headers: this.api.authHeaders()
    });
  }

  cancelarInscripcionTorneo(id: number) {
    return this.api.request(`${API}/inscripciones-torneo/${id}`, {
      method: 'DELETE',
      headers: this.api.authHeaders()
    });
  }
}
