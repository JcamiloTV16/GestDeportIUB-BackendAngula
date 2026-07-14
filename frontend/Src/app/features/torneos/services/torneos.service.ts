import { Injectable } from '@angular/core';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class TorneosService {
  constructor(private readonly api: ApiService) {}

  obtenerTorneos() {
    return this.api.request(`${API}/torneos/`);
  }

  obtenerHistorialTorneos() {
    return this.api.request(`${API}/torneos/historial`);
  }

  crearTorneo(datos: Record<string, unknown>) {
    return this.api.request(`${API}/torneos/`, {
      method: 'POST',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(datos)
    });
  }

  actualizarTorneo(id: number, datos: Record<string, unknown>) {
    return this.api.request(`${API}/torneos/${id}`, {
      method: 'PUT',
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

  obtenerInscritosPorTorneo(torneoId: number) {
    return this.api.request(`${API}/inscripciones-torneo/torneo/${torneoId}`);
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

  actualizarEstadoInscripcion(id: number, estado_inscripcion: string) {
    return this.api.request(`${API}/inscripciones-torneo/${id}/estado`, {
      method: 'PATCH',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify({ estado_inscripcion })
    });
  }
}
