import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditoriasService } from '../../services/auditorias.service';
import { DataTableDirective } from '../../../../core/directives/data-table.directive';

@Component({
  selector: 'app-auditorias-page',
  standalone: true,
  imports: [CommonModule, DataTableDirective],
  templateUrl: './auditorias-page.html'
})
export class AuditoriasPage implements OnInit {
  usuariosInactivos: any[] = [];
  deportesInactivos: any[] = [];
  cursosInactivos: any[] = [];
  
  loading = false;
  error = '';
  mensajeExito = '';
  tabActiva: 'usuarios' | 'deportes' | 'cursos' = 'usuarios';

  constructor(private readonly auditoriasService: AuditoriasService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;
    this.error = '';
    try {
      const [usuRes, depRes, curRes] = await this.auditoriasService.cargarInactivos();
      this.usuariosInactivos = usuRes.resultado || [];
      this.deportesInactivos = depRes.resultado || [];
      this.cursosInactivos = curRes.resultado || [];
    } catch (e: any) {
      this.error = e.message || 'Error cargando datos inactivos';
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async reactivar(tipo: 'usuario' | 'deporte' | 'curso', id: number) {
    if (!confirm('¿Está seguro de reactivar este registro?')) return;
    
    try {
      if (tipo === 'usuario') await this.auditoriasService.reactivarUsuario(id);
      if (tipo === 'deporte') await this.auditoriasService.reactivarDeporte(id);
      if (tipo === 'curso') await this.auditoriasService.reactivarCurso(id);
      
      this.mensajeExito = 'Registro reactivado exitosamente';
      setTimeout(() => this.mensajeExito = '', 3000);
      await this.cargarDatos();
    } catch (e: any) {
      this.error = e.message || 'Error al reactivar el registro';
      setTimeout(() => this.error = '', 5000);
    }
  }
}
