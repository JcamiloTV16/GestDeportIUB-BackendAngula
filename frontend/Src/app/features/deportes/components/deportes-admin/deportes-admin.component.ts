import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeportesService } from '../../services/deportes.service';

@Component({
  selector: 'app-deportes-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './deportes-admin.component.html'
})
export class DeportesAdminComponent implements OnInit {
  deportes: any[] = [];
  loadingDeportes = false;
  deporteForm!: FormGroup;
  mostrarModalDeporte = false;
  editandoDeporteId: number | null = null;

  mensajeExito = '';
  mensajeError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly deportesService: DeportesService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarDeportes();
  }

  initForm() {
    this.deporteForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['']
    });
  }

  async cargarDeportes() {
    this.loadingDeportes = true;
    try {
      const res = await this.deportesService.obtenerDeportes();
      this.deportes = res.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingDeportes = false;
    }
  }

  abrirModalDeporte(deporte?: any) {
    this.limpiarMensajes();
    if (deporte) {
      this.editandoDeporteId = deporte.id;
      this.deporteForm.patchValue({
        nombre: deporte.nombre,
        descripcion: deporte.descripcion
      });
    } else {
      this.editandoDeporteId = null;
      this.deporteForm.reset();
    }
    this.mostrarModalDeporte = true;
  }

  cerrarModalDeporte() {
    this.mostrarModalDeporte = false;
    this.editandoDeporteId = null;
    this.deporteForm.reset();
  }

  async guardarDeporte() {
    if (this.deporteForm.invalid) {
      this.deporteForm.markAllAsTouched();
      return;
    }
    try {
      if (this.editandoDeporteId) {
        await this.deportesService.actualizarDeporte(this.editandoDeporteId, this.deporteForm.value);
        this.mostrarExito('Deporte actualizado correctamente');
      } else {
        await this.deportesService.agregarDeporte(this.deporteForm.value);
        this.mostrarExito('Deporte creado correctamente');
      }
      this.cerrarModalDeporte();
      await this.cargarDeportes();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al guardar deporte');
    }
  }

  async desactivarDeporte(id: number) {
    if (!confirm('¿Está seguro de desactivar este deporte?')) return;
    try {
      await this.deportesService.eliminarDeporte(id);
      this.mostrarExito('Deporte desactivado correctamente');
      await this.cargarDeportes();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al desactivar deporte');
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
