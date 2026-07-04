import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TorneosService } from '../../services/torneos.service';
import { DeportesService } from '../../../deportes/services/deportes.service';

@Component({
  selector: 'app-gestion-torneos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-torneos.component.html'
})
export class GestionTorneosComponent implements OnInit {
  torneos: any[] = [];
  deportes: any[] = [];
  loadingTorneos = false;
  torneoForm!: FormGroup;
  mostrarModalTorneo = false;
  editandoTorneoId: number | null = null;

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly torneosService: TorneosService,
    private readonly deportesService: DeportesService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarDatos();
  }

  initForm() {
    this.torneoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      fecha_inicio: ['', Validators.required],
      fecha_fin: [''],
      lugar: [''],
      deporte_id: [null],
      poblacion_objetivo: ['Todos'],
      reglas_json_texto: ['{}']
    });
  }

  async cargarDatos() {
    this.loadingTorneos = true;
    try {
      const [tornRes, depRes] = await Promise.all([
        this.torneosService.obtenerTorneos(),
        this.deportesService.obtenerDeportes()
      ]);
      this.torneos = tornRes.resultado || [];
      this.deportes = depRes.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingTorneos = false;
    }
  }

  abrirModalTorneo(torneo?: any) {
    this.limpiarMensajes();
    if (torneo) {
      this.editandoTorneoId = torneo.id;
      this.torneoForm.patchValue({
        nombre: torneo.nombre,
        descripcion: torneo.descripcion,
        fecha_inicio: torneo.fecha_inicio,
        fecha_fin: torneo.fecha_fin,
        lugar: torneo.lugar,
        deporte_id: torneo.deporte_id,
        poblacion_objetivo: torneo.poblacion_objetivo || 'Todos',
        reglas_json_texto: torneo.reglas_json ? JSON.stringify(torneo.reglas_json, null, 2) : '{}'
      });
    } else {
      this.editandoTorneoId = null;
      this.torneoForm.reset({ poblacion_objetivo: 'Todos', reglas_json_texto: '{}' });
    }
    this.mostrarModalTorneo = true;
  }

  cerrarModalTorneo() {
    this.mostrarModalTorneo = false;
    this.editandoTorneoId = null;
    this.torneoForm.reset({ poblacion_objetivo: 'Todos', reglas_json_texto: '{}' });
  }

  async guardarTorneo() {
    if (this.torneoForm.invalid) {
      this.torneoForm.markAllAsTouched();
      return;
    }
    
    let reglas_json = null;
    try {
      const texto = this.torneoForm.value.reglas_json_texto;
      if (texto && texto.trim() !== '') {
        reglas_json = JSON.parse(texto);
      }
    } catch (e) {
      this.mostrarError('El formato de las Reglas (JSON) es inválido.');
      return;
    }

    const payload = {
      ...this.torneoForm.value,
      reglas_json
    };
    delete payload.reglas_json_texto;

    try {
      if (this.editandoTorneoId) {
        await this.torneosService.actualizarTorneo(this.editandoTorneoId, payload);
        this.mostrarExito('Torneo actualizado correctamente');
      } else {
        await this.torneosService.crearTorneo(payload);
        this.mostrarExito('Torneo creado correctamente');
      }
      this.cerrarModalTorneo();
      await this.cargarDatos();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al guardar torneo');
    }
  }

  async eliminarTorneo(id: number) {
    if (!confirm('¿Está seguro de eliminar este torneo? (Esta acción podría fallar si hay inscripciones vinculadas)')) return;
    try {
      alert('Implementación pendiente en torneosService si no existe (usualmente no se eliminan, se cambian de estado).');
      await this.cargarDatos();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al eliminar torneo');
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
