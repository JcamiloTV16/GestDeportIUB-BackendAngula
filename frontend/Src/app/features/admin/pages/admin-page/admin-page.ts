import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdminService } from '../../services/admin.service';

// Importar los nuevos componentes standalone orientados a funcionalidades
import { UsuariosAdminComponent } from '../../../usuarios/components/usuarios-admin/usuarios-admin.component';
import { DeportesAdminComponent } from '../../../deportes/components/deportes-admin/deportes-admin.component';
import { CursosAdminComponent } from '../../../cursos/components/cursos-admin/cursos-admin.component';
import { TorneosAdminComponent } from '../../../torneos/components/torneos-admin/torneos-admin.component';
import { AuditoriasPage } from '../../../auditorias/pages/auditorias-page/auditorias-page';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [
    CommonModule, 
    UsuariosAdminComponent, 
    DeportesAdminComponent, 
    CursosAdminComponent, 
    TorneosAdminComponent,
    AuditoriasPage
  ],
  templateUrl: './admin-page.html'
})
export class AdminPageComponent implements OnInit {
  vistaActual: 'dashboard' | 'usuarios' | 'deportes' | 'cursos' | 'torneos' | 'auditorias' = 'dashboard';
  
  // Dashboard state
  stats: any = {};
  loadingStats = true;
  powerbiUrl: SafeResourceUrl;

  constructor(
    private readonly adminService: AdminService,
    private readonly sanitizer: DomSanitizer
  ) {
    this.powerbiUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://app.powerbi.com/reportEmbed?reportId=12d96640-04ea-4993-aee3-e0350a632983&autoAuth=true&ctid=1e9aabe8-67f8-4f1c-a329-a754e92499ae');
  }

  ngOnInit() {
    this.cargarStats();
  }

  cambiarVista(vista: 'dashboard' | 'usuarios' | 'deportes' | 'cursos' | 'torneos' | 'auditorias') {
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