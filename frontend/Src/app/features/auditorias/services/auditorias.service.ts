import { Injectable } from '@angular/core';
import { CursosService } from '../../cursos/services/cursos.service';
import { DeportesService } from '../../deportes/services/deportes.service';
import { UsuariosService } from '../../usuarios/services/usuarios.service';
import { API, ApiService } from '../../../core/services/api.service';

@Injectable({ providedIn: 'root' })
export class AuditoriasService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly deportes: DeportesService,
    private readonly cursos: CursosService,
    private readonly api: ApiService
  ) {}

  cargarInactivos() {
    return Promise.all([
      this.usuarios.obtenerInactivos().catch(() => ({ resultado: [] })),
      this.deportes.obtenerInactivos().catch(() => ({ resultado: [] })),
      this.cursos.obtenerInactivos().catch(() => ({ resultado: [] }))
    ]);
  }

  reactivarUsuario(id: number) {
    return this.api.request(`${API}/usuarios/${id}/reactivar/`, { method: 'POST', headers: this.api.authHeaders() });
  }

  reactivarDeporte(id: number) {
    return this.api.request(`${API}/deportes/${id}/reactivar/`, { method: 'POST', headers: this.api.authHeaders() });
  }

  reactivarCurso(id: number) {
    return this.api.request(`${API}/horarios/${id}/reactivar/`, { method: 'POST', headers: this.api.authHeaders() });
  }
}
