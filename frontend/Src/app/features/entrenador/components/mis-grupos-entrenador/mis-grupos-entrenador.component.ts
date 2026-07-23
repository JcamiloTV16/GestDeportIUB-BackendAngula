import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursosService } from '../../../cursos/services/cursos.service';
import { AuthService } from '../../../../core/auth/auth.service';

import { DataTableDirective } from '../../../../core/directives/data-table.directive';

import { PdfExportService } from '../../../../core/services/pdf-export.service';

@Component({
  selector: 'app-mis-grupos-entrenador',
  standalone: true,
  imports: [CommonModule, DataTableDirective],
  templateUrl: './mis-grupos-entrenador.component.html'
})
export class MisGruposEntrenadorComponent implements OnInit {
  cursos: any[] = [];
  loading = false;
  
  // Para ver estudiantes
  estudiantesCurso: any[] = [];
  cursoSeleccionado: any = null;
  viendoEstudiantes = false;

  constructor(
    private readonly cursosService: CursosService,
    private readonly authService: AuthService,
    private readonly pdfService: PdfExportService
  ) {}


  ngOnInit() {
    this.cargarCursos();
  }

  async cargarCursos() {
    this.loading = true;
    try {
      const user = this.authService.user;
      if (!user) return;
      
      const res = await this.cursosService.obtenerHorariosPorEntrenador(user.id);
      this.cursos = res.resultado || [];
    } catch (error) {
      console.error('Error al cargar cursos del entrenador', error);
    } finally {
      this.loading = false;
    }
  }

  async verEstudiantes(curso: any) {
    this.cursoSeleccionado = curso;
    this.viendoEstudiantes = true;
    try {
      const res = await this.cursosService.obtenerInscritosPorHorario(curso.id);
      this.estudiantesCurso = res.resultado || [];
    } catch (error) {
      console.error('Error al cargar estudiantes', error);
      this.estudiantesCurso = [];
    }
  }

  descargarPlanillaPDF() {
    if (!this.cursoSeleccionado) return;
    this.pdfService.generarPlanillaAsistencia(this.cursoSeleccionado, this.estudiantesCurso);
  }

  volverACursos() {
    this.viendoEstudiantes = false;
    this.cursoSeleccionado = null;
    this.estudiantesCurso = [];
  }
}

