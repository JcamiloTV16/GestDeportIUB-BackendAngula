import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TorneosService } from '../../services/torneos.service';
import { DataTableDirective } from '../../../../core/directives/data-table.directive';

@Component({
  selector: 'app-inscripciones-torneos',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableDirective],
  templateUrl: './inscripciones-torneos.component.html'
})
export class InscripcionesTorneosComponent implements OnInit {
  torneos: any[] = [];
  torneoSeleccionadoId: number | null = null;
  inscripciones: any[] = [];
  loadingTorneos = false;
  loadingInscripciones = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(private readonly torneosService: TorneosService) {}

  ngOnInit() {
    this.cargarTorneos();
  }

  async cargarTorneos() {
    this.loadingTorneos = true;
    try {
      const res = await this.torneosService.obtenerTorneos();
      this.torneos = (res.resultado || []).filter(
        (t: any) => t.estado_torneo === 'Inscripciones Abiertas' || t.estado_torneo === 'En Curso'
      );

      if (this.torneos.length > 0) {
        // Priorizar seleccionar el primer torneo que tenga pendientes por aprobar
        const torneoConPendiente = this.torneos.find((t: any) => Number(t.pendientes_count || 0) > 0);
        this.torneoSeleccionadoId = torneoConPendiente ? torneoConPendiente.id : this.torneos[0].id;
        await this.onTorneoChange();
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingTorneos = false;
    }
  }

  async seleccionarTorneoDirecto(id: number) {
    this.torneoSeleccionadoId = id;
    await this.onTorneoChange();
  }

  get torneosConPendientes(): any[] {
    return this.torneos.filter((t: any) => Number(t.pendientes_count || 0) > 0);
  }



  async onTorneoChange() {
    if (!this.torneoSeleccionadoId) {
      this.inscripciones = [];
      return;
    }
    this.loadingInscripciones = true;
    try {
      const res = await this.torneosService.obtenerInscritosPorTorneo(this.torneoSeleccionadoId);
      this.inscripciones = res.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingInscripciones = false;
    }
  }

  async aceptarInscripcion(inscripcion: any) {
    try {
      await this.torneosService.actualizarEstadoInscripcion(inscripcion.id, 'Aprobada');
      this.mostrarExito(`Inscripción de ${inscripcion.estudiante_nombre} aprobada.`);
      await this.onTorneoChange();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al aprobar inscripción');
    }
  }

  async rechazarInscripcion(inscripcion: any) {
    if (!confirm(`¿Seguro que deseas rechazar la inscripción de ${inscripcion.estudiante_nombre}?`)) return;
    try {
      await this.torneosService.actualizarEstadoInscripcion(inscripcion.id, 'Rechazada');
      this.mostrarExito(`Inscripción de ${inscripcion.estudiante_nombre} rechazada.`);
      await this.onTorneoChange();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al rechazar inscripción');
    }
  }

  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'Aprobada': return 'bg-success';
      case 'Rechazada': return 'bg-danger';
      case 'Pendiente': return 'bg-warning text-dark';
      default: return 'bg-secondary';
    }
  }

  get pendientes(): any[] {
    return this.inscripciones.filter((i: any) => i.estado_inscripcion === 'Pendiente');
  }

  get procesadas(): any[] {
    return this.inscripciones.filter((i: any) => i.estado_inscripcion !== 'Pendiente');
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
}
