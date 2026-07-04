import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

// Importar los nuevos componentes standalone orientados a funcionalidades
import { UsuariosAdminComponent } from '../../../usuarios/components/usuarios-admin/usuarios-admin.component';
import { DeportesAdminComponent } from '../../../deportes/components/deportes-admin/deportes-admin.component';
import { CursosAdminComponent } from '../../../cursos/components/cursos-admin/cursos-admin.component';
import { TorneosAdminComponent } from '../../../torneos/components/torneos-admin/torneos-admin.component';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule, 
    UsuariosAdminComponent, 
    DeportesAdminComponent, 
    CursosAdminComponent, 
    TorneosAdminComponent
  ],
  templateUrl: './admin-page.html'
})
export class AdminPage implements OnInit {
  vistaActual: 'dashboard' | 'usuarios' | 'deportes' | 'cursos' | 'torneos' = 'dashboard';
  
  // Dashboard state
  stats: any = {};
  loadingStats = true;

  constructor(
    private readonly adminService: AdminService
  ) {}

  ngOnInit() {
    this.cargarStats();
  }

  cambiarVista(vista: 'dashboard' | 'usuarios' | 'deportes' | 'cursos' | 'torneos') {
    this.vistaActual = vista;
    if (vista === 'dashboard') {
      this.cargarStats();
    }
  }

  async cargarStats() {
    this.loadingStats = true;
    try {
      const res = await this.adminService.obtenerEstadisticas();
      this.stats = res.resultado || {};
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingStats = false;
    }
  }
}