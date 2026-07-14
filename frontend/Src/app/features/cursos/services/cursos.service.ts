import { Injectable } from '@angular/core';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class CursosService {
  constructor(private readonly api: ApiService) {}

  obtenerHorarios() {
    return this.api.request(`${API}/horarios/`, { headers: this.api.authHeaders() });
  }

  obtenerInactivos() {
    return this.api.request(`${API}/horarios/inactivos/`, { headers: this.api.authHeaders() });
  }

  obtenerHorariosPorDeporte(deporteId: string | number) {
    return this.api.request(`${API}/horarios/deporte/${deporteId}`);
  }

  obtenerHorariosPorEntrenador(entrenadorId: number) {
    return this.api.request(`${API}/horarios/entrenador/${entrenadorId}`, { headers: this.api.authHeaders() });
  }

  obtenerInscritosPorHorario(horarioId: number) {
    return this.api.request(`${API}/inscripciones/horario/${horarioId}`, { headers: this.api.authHeaders() });
  }

  obtenerInscritosPorEstudiante(estudianteId: number) {
    return this.api.request(`${API}/inscripciones/estudiante/${estudianteId}/deportes`, { headers: this.api.authHeaders() });
  }

  obtenerDisponiblesParaUsuario(usuarioId: number) {
    return this.api.request(`${API}/horarios/disponibles/${usuarioId}`, { headers: this.api.authHeaders() });
  }

  inscribirse(datos: Record<string, unknown>) {
    return this.api.request(`${API}/inscripciones/`, {
      method: 'POST',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(datos)
    });
  }

  crearHorario(horario: Record<string, unknown>) {
    return this.api.request(`${API}/horarios/`, {
      method: 'POST',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(horario)
    });
  }

  actualizarHorario(id: number, horario: Record<string, unknown>) {
    return this.api.request(`${API}/horarios/${id}`, {
      method: 'PUT',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(horario)
    });
  }

  eliminarHorario(id: number) {
    return this.api.request(`${API}/horarios/${id}`, {
      method: 'DELETE',
      headers: this.api.authHeaders()
    });
  }

  reactivarHorario(id: number) {
    return this.api.request(`${API}/horarios/${id}/reactivar/`, {
      method: 'POST',
      headers: this.api.authHeaders()
    });
  }
}
