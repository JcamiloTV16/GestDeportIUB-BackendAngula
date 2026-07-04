import { Injectable } from '@angular/core';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  constructor(private readonly api: ApiService) {}

  obtenerEstadisticasTorneo(torneoId: number) {
    return this.api.request(`${API}/estadisticas/${torneoId}`);
  }

  crearEstadistica(datos: Record<string, unknown>) {
    return this.api.request(`${API}/estadisticas/`, {
      method: 'POST',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(datos)
    });
  }

  eliminarEstadistica(id: number) {
    return this.api.request(`${API}/estadisticas/${id}`, {
      method: 'DELETE',
      headers: this.api.authHeaders()
    });
  }
}
