import { Injectable } from '@angular/core';
import { API, NODE_API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  constructor(private readonly api: ApiService) {}

  obtenerUsuarios() {
    return this.api.request(`${API}/usuarios/`, { headers: this.api.authHeaders() });
  }

  obtenerInactivos() {
    return this.api.request(`${API}/usuarios/inactivos/`, { headers: this.api.authHeaders() });
  }

  crearUsuario(usuario: Record<string, unknown>) {
    return this.api.request(`${API}/usuarios/`, {
      method: 'POST',
      headers: this.api.jsonHeaders(),
      body: JSON.stringify(usuario)
    });
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

  // ─── Datos auxiliares desde la API de Node ───
  obtenerProgramas() {
    return this.api.request(`${NODE_API}/programas`);
  }

  obtenerFacultades() {
    return this.api.request(`${NODE_API}/facultades`);
  }

  obtenerTiposDocumento() {
    return this.api.request(`${NODE_API}/tipos-documento`);
  }

  obtenerNivelesEducativos() {
    return this.api.request(`${NODE_API}/niveles-educativos`);
  }
}

