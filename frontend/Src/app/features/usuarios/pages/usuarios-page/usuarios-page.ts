import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-page.html'
})
export class UsuariosPage implements OnInit {
  usuarios: any[] = [];
  loading = false;

  constructor(private readonly usuariosService: UsuariosService) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const res = await this.usuariosService.obtenerUsuarios();
      this.usuarios = res.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}
