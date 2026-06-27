import { Injectable } from '@angular/core';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private readonly api: ApiService) {}

  obtenerUsuarios() {
    return this.api.request(`${API}/usuarios/`, { headers: this.api.authHeaders() });
  }

  obtenerInactivos() {
    return this.api.request(`${API}/usuarios/inactivos/`, { headers: this.api.authHeaders() });
  }

  actualizarUsuario(id: number, usuario: Record<string, unknown>) {
    return this.api.request(`${API}/usuarios/${id}`, {
      method: 'PUT',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(usuario)
    });
  }

  eliminarUsuario(id: number) {
    return this.api.request(`${API}/usuarios/${id}`, {
      method: 'DELETE',
      headers: this.api.authHeaders()
    });
  }

  reactivarUsuario(id: number) {
    return this.api.request(`${API}/usuarios/${id}/reactivar/`, {
      method: 'POST',
      headers: this.api.authHeaders()
    });
  }
}
