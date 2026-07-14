import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CursosService } from '../../services/cursos.service';
import { DeportesService } from '../../../deportes/services/deportes.service';
import { AdminService } from '../../../admin/services/admin.service';
import { UsuariosService } from '../../../usuarios/services/usuarios.service';
import { API, ApiService } from '../../../../core/services/api.service';

import { DataTableDirective } from '../../../../core/directives/data-table.directive';

@Component({
  selector: 'app-cursos-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DataTableDirective],
  templateUrl: './cursos-admin.component.html'
})
export class CursosAdminComponent implements OnInit {
  cursos: any[] = [];
  deportes: any[] = [];
  entrenadores: any[] = [];
  estudiantes: any[] = [];
  loadingCursos = false;
  cursoForm!: FormGroup;
  matricularForm!: FormGroup;
  mostrarModalCurso = false;
  mostrarModalMatricular = false;
  editandoCursoId: number | null = null;
  cursoSeleccionadoParaMatricula: any = null;

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly cursosService: CursosService,
    private readonly deportesService: DeportesService,
    private readonly adminService: AdminService,
    private readonly usuariosService: UsuariosService,
    private readonly api: ApiService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarDatos();
  }

  initForm() {
    this.cursoForm = this.fb.group({
      deporte_id: [null, Validators.required],
      entrenador_id: [null, Validators.required],
      dia_semana: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      hora_fin: ['', Validators.required],
      lugar: [''],
      cupo: [20, [Validators.required, Validators.min(1)]]
    });

    this.matricularForm = this.fb.group({
      estudiante_id: [null, Validators.required]
    });
  }

  async cargarDatos() {
    this.loadingCursos = true;
    try {
      const [curRes, depRes, entRes, usuRes] = await Promise.all([
        this.cursosService.obtenerHorarios(),
        this.deportesService.obtenerDeportes(),
        this.adminService.obtenerEntrenadores(),
        this.usuariosService.obtenerUsuarios()
      ]);
      this.cursos = curRes.resultado || [];
      this.deportes = depRes.resultado || [];
      this.entrenadores = entRes.resultado || [];
      
      const allUsers = usuRes.resultado || [];
      // Asumiendo que el rol_id = 2 es Estudiante
      this.estudiantes = allUsers.filter((u: any) => u.rol_id === 2 || u.nombre_rol === 'Estudiante');
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingCursos = false;
    }
  }

  abrirModalCurso(curso?: any) {
    this.limpiarMensajes();
    if (curso) {
      this.editandoCursoId = curso.id;
      this.cursoForm.patchValue({
        deporte_id: curso.deporte_id,
        entrenador_id: curso.entrenador_id,
        dia_semana: curso.dia_semana,
        hora_inicio: curso.hora_inicio,
        hora_fin: curso.hora_fin,
        lugar: curso.lugar,
        cupo: curso.cupo
      });
    } else {
      this.editandoCursoId = null;
      this.cursoForm.reset({ cupo: 20 });
    }
    this.mostrarModalCurso = true;
  }

  cerrarModalCurso() {
    this.mostrarModalCurso = false;
    this.editandoCursoId = null;
    this.cursoForm.reset();
  }

  async guardarCurso() {
    if (this.cursoForm.invalid) {
      this.cursoForm.markAllAsTouched();
      return;
    }
    try {
      if (this.editandoCursoId) {
        await this.cursosService.actualizarHorario(this.editandoCursoId, this.cursoForm.value);
        this.mostrarExito('Curso actualizado correctamente');
      } else {
        await this.cursosService.crearHorario(this.cursoForm.value);
        this.mostrarExito('Curso creado correctamente');
      }
      this.cerrarModalCurso();
      await this.cargarDatos();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al guardar curso');
    }
  }

  abrirModalMatricular(curso: any) {
    this.limpiarMensajes();
    this.cursoSeleccionadoParaMatricula = curso;
    this.matricularForm.reset();
    this.mostrarModalMatricular = true;
  }

  cerrarModalMatricular() {
    this.mostrarModalMatricular = false;
    this.cursoSeleccionadoParaMatricula = null;
    this.matricularForm.reset();
  }

  async matricularEstudiante() {
    if (this.matricularForm.invalid) {
      this.matricularForm.markAllAsTouched();
      return;
    }
    try {
      const estudiante_id = this.matricularForm.value.estudiante_id;
      const estudiante = this.estudiantes.find(e => e.id === estudiante_id);
      
      const payload = {
        estudiante_id: estudiante_id,
        deporte_id: this.cursoSeleccionadoParaMatricula.deporte_id,
        horario_id: this.cursoSeleccionadoParaMatricula.id,
        programa_id: estudiante?.programa_id || 1 // Fallback if no program
      };

      await this.api.request(`${API}/inscripciones/`, {
        method: 'POST',
        headers: this.api.jsonHeaders(),
        body: JSON.stringify(payload)
      });
      
      this.mostrarExito('Estudiante matriculado exitosamente en el curso');
      this.cerrarModalMatricular();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al matricular estudiante');
    }
  }

  async desactivarCurso(id: number) {
    if (!confirm('¿Está seguro de desactivar este curso (horario)?')) return;
    try {
      alert('Funcionalidad de desactivar curso está pendiente de implementar en el servicio si no existe.');
      await this.cargarDatos();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al desactivar curso');
    }
  }

  mostrarExito(msg: string) {
    this.mensajeExito = msg;
    this.mensajeError = '';
    setTimeout(() => this.mensajeExito = '', 4000);
  }

  mostrarError(msg: string) {
    this.mensajeError = msg;
    this.mensajeExito = '';
    setTimeout(() => this.mensajeError = '', 5000);
  }

  limpiarMensajes() {
    this.mensajeExito = '';
    this.mensajeError = '';
  }
}

