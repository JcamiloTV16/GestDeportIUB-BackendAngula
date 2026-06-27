import { Injectable } from '@angular/core';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class InscripcionesService {
  constructor(private readonly api: ApiService) {}

  inscribirEstudiante(datos: Record<string, unknown>) {
    return this.api.request(`${API}/inscripciones/`, {
      method: 'POST',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(datos)
    });
  }
}
