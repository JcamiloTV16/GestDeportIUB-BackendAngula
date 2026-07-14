import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursosService } from '../../../cursos/services/cursos.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-inscripcion-deportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inscripcion-deportes.component.html'
})
export class InscripcionDeportesComponent implements OnInit {
  cursos: any[] = [];
  loading = false;
  error = '';
  mensajeExito = '';
  inscribiendose: number | null = null;

  constructor(
    private readonly cursosService: CursosService,
    private readonly auth: AuthService
  ) {}

  ngOnInit() {
    this.cargarDisponibles();
  }

  async cargarDisponibles() {
    this.loading = true;
    this.error = '';
    try {
      const user = this.auth.user;
      if (!user?.id) throw new Error('Usuario no autenticado');
      const res = await this.cursosService.obtenerDisponiblesParaUsuario(user.id);
      this.cursos = res.resultado || [];
    } catch (e: any) {
      this.error = e.message || 'Error cargando cursos disponibles';
    } finally {
      this.loading = false;
    }
  }

  async inscribirse(horario: any) {
    if (!confirm(`¿Inscribirse al curso de ${horario.deporte_nombre} (${horario.dia_semana})?`)) return;

    this.inscribiendose = horario.id;
    this.error = '';
    try {
      const user = this.auth.user;
      if (!user?.id) throw new Error('Usuario no autenticado');

      await this.cursosService.inscribirse({
        estudiante_id: user.id,
        horario_id: horario.id,
        deporte_id: horario.deporte_id,
        programa_id: user.programa_id ?? 1
      });

      this.mensajeExito = `¡Inscripción exitosa en ${horario.deporte_nombre}!`;
      setTimeout(() => this.mensajeExito = '', 4000);
      this.cursos = this.cursos.filter(c => c.id !== horario.id);
    } catch (e: any) {
      this.error = e.message || 'Error al inscribirse';
      setTimeout(() => this.error = '', 5000);
    } finally {
      this.inscribiendose = null;
    }
  }

  getCuposRestantes(horario: any): number {
    return (horario.cupo || 20) - (horario.inscritos || 0);
  }

  getIconoDeporte(nombre: string): string {
    const n = (nombre || '').toLowerCase();
    if (n.includes('futbol') || n.includes('fútbol')) return 'bi-dribbble';
    if (n.includes('basket') || n.includes('baloncesto')) return 'bi-trophy';
    if (n.includes('volei') || n.includes('vólei')) return 'bi-circle';
    if (n.includes('tenis')) return 'bi-circle-half';
    if (n.includes('natacion') || n.includes('natación')) return 'bi-water';
    if (n.includes('atletismo')) return 'bi-lightning';
    return 'bi-activity';
  }
}
