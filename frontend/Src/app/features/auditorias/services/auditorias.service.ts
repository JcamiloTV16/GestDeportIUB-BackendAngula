import { Injectable } from '@angular/core';
import { CursosService } from '../../cursos/services/cursos.service';
import { DeportesService } from '../../deportes/services/deportes.service';
import { UsuariosService } from '../../usuarios/services/usuarios.service';

@Injectable({ providedIn: 'root' })
export class AuditoriasService {
  constructor(
    private readonly usuarios: UsuariosService,
    private readonly deportes: DeportesService,
    private readonly cursos: CursosService
  ) {}

  cargarInactivos() {
    return Promise.all([
      this.usuarios.obtenerInactivos().catch(() => ({ resultado: [] })),
      this.deportes.obtenerInactivos().catch(() => ({ resultado: [] })),
      this.cursos.obtenerInactivos().catch(() => ({ resultado: [] }))
    ]);
  }
}
