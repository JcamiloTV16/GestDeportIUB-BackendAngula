import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursosService } from '../../../cursos/services/cursos.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-mis-cursos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-cursos.component.html'
})
export class MisCursosComponent implements OnInit {
  cursos: any[] = [];
  loading = false;
  mensajeError = '';

  constructor(
    private readonly cursosService: CursosService,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarMisCursos();
  }

  async cargarMisCursos() {
    const user = this.authService.user;
    if (!user?.id) return;

    this.loading = true;
    this.mensajeError = '';
    try {
      const res = await this.cursosService.obtenerInscritosPorEstudiante(user.id);
      const rawData = res.resultado || res || [];
      
      // Filtrar duplicados basados en el nombre, día y hora
      this.cursos = rawData.filter((curso: any, index: number, self: any[]) =>
        index === self.findIndex((t) => (
          t.nombre === curso.nombre &&
          t.dia_semana === curso.dia_semana &&
          t.hora_inicio === curso.hora_inicio
        ))
      );
    } catch (e: any) {
      this.mensajeError = e.message || 'Error al cargar tus cursos.';
    } finally {
      this.loading = false;
    }
  }

  getDiaBadgeClass(dia: string): string {
    const map: Record<string, string> = {
      'Lunes': 'bg-primary',
      'Martes': 'bg-success',
      'Miércoles': 'bg-warning text-dark',
      'Jueves': 'bg-info text-dark',
      'Viernes': 'bg-danger',
      'Sábado': 'bg-secondary'
    };
    return map[dia] || 'bg-secondary';
  }

  getDeporteIcon(nombreDeporte: string): string {
    const nombre = (nombreDeporte || '').toLowerCase();
    if (nombre.includes('baloncesto') || nombre.includes('basquet')) return 'bi-dribbble';
    if (nombre.includes('futbol') || nombre.includes('fútbol')) return 'bi-circle-fill';
    if (nombre.includes('voleibol') || nombre.includes('voley')) return 'bi-circle';
    if (nombre.includes('natación') || nombre.includes('natacion')) return 'bi-water';
    if (nombre.includes('ajedrez')) return 'bi-grid-3x3';
    if (nombre.includes('atletismo') || nombre.includes('correr')) return 'bi-person-walking';
    if (nombre.includes('ciclismo') || nombre.includes('bicicleta')) return 'bi-bicycle';
    if (nombre.includes('tenis')) return 'bi-record-circle';
    return 'bi-trophy'; // por defecto
  }
}
