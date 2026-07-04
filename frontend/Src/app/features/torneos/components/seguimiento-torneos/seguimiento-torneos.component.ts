import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TorneosService } from '../../services/torneos.service';
import { EstadisticasService } from '../../services/estadisticas.service';

@Component({
  selector: 'app-seguimiento-torneos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seguimiento-torneos.component.html'
})
export class SeguimientoTorneosComponent implements OnInit {
  torneosActivos: any[] = [];
  torneoSeleccionado: any = null;
  inscritos: any[] = [];
  estadisticas: any[] = [];
  
  loadingTorneos = false;
  loadingDetalle = false;
  
  statForm!: FormGroup;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly torneosService: TorneosService,
    private readonly estadisticasService: EstadisticasService
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarTorneosActivos();
  }

  initForm() {
    this.statForm = this.fb.group({
      usuario_id: [null, Validators.required],
      tipo_estadistica: ['', Validators.required],
      valor_json_texto: ['{}', Validators.required]
    });
  }

  async cargarTorneosActivos() {
    this.loadingTorneos = true;
    try {
      const res = await this.torneosService.obtenerTorneos();
      // Filtrar torneos que están En Curso
      this.torneosActivos = (res.resultado || []).filter((t: any) => t.estado_torneo === 'En Curso' || t.estado_torneo === 'Inscripciones Abiertas');
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingTorneos = false;
    }
  }

  async seleccionarTorneo(torneo: any) {
    this.torneoSeleccionado = torneo;
    this.statForm.reset({ valor_json_texto: '{}' });
    await this.cargarDetalleTorneo();
  }

  async cargarDetalleTorneo() {
    if (!this.torneoSeleccionado) return;
    this.loadingDetalle = true;
    try {
      const [inscritosRes, statsRes] = await Promise.all([
        this.torneosService.obtenerInscritosPorTorneo(this.torneoSeleccionado.id),
        this.estadisticasService.obtenerEstadisticasTorneo(this.torneoSeleccionado.id)
      ]);
      this.inscritos = inscritosRes.resultado || [];
      this.estadisticas = statsRes.resultado || [];
    } catch (e: any) {
      this.mostrarError('Error al cargar datos del torneo: ' + (e.message || ''));
    } finally {
      this.loadingDetalle = false;
    }
  }

  async guardarEstadistica() {
    if (this.statForm.invalid) {
      this.statForm.markAllAsTouched();
      return;
    }
    
    let valor_json = null;
    try {
      const texto = this.statForm.value.valor_json_texto;
      valor_json = JSON.parse(texto);
    } catch (e) {
      this.mostrarError('El valor JSON ingresado no es válido.');
      return;
    }

    const payload = {
      torneo_id: this.torneoSeleccionado.id,
      usuario_id: this.statForm.value.usuario_id,
      tipo_estadistica: this.statForm.value.tipo_estadistica,
      valor_json
    };

    try {
      await this.estadisticasService.crearEstadistica(payload);
      this.mostrarExito('Estadística registrada correctamente.');
      this.statForm.reset({ valor_json_texto: '{}' });
      await this.cargarDetalleTorneo();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al registrar estadística.');
    }
  }

  get tablaGoleadoresFutbol() {
    if (this.torneoSeleccionado?.deporte_nombre !== 'Fútbol') return [];
    const stats: Record<string, { goles: number, asistencias: number }> = {};
    this.estadisticas.forEach(e => {
      const nombre = e.valor_json?.jugador || e.usuario_nombre;
      if (!stats[nombre]) stats[nombre] = { goles: 0, asistencias: 0 };
      if (e.tipo_estadistica === 'Goles') stats[nombre].goles += (e.valor_json?.cantidad || 0);
      if (e.tipo_estadistica === 'Asistencias') stats[nombre].asistencias += (e.valor_json?.cantidad || 0);
    });
    return Object.keys(stats)
      .map(k => ({ jugador: k, goles: stats[k].goles, asistencias: stats[k].asistencias }))
      .sort((a, b) => b.goles - a.goles || b.asistencias - a.asistencias);
  }

  get tablaAnotadoresBaloncesto() {
    if (this.torneoSeleccionado?.deporte_nombre !== 'Baloncesto') return [];
    const stats: Record<string, { puntos: number, rebotes: number }> = {};
    this.estadisticas.forEach(e => {
      const nombre = e.valor_json?.jugador || e.usuario_nombre;
      if (!stats[nombre]) stats[nombre] = { puntos: 0, rebotes: 0 };
      if (e.tipo_estadistica === 'Puntos') stats[nombre].puntos += (e.valor_json?.cantidad || 0);
      if (e.tipo_estadistica === 'Rebotes') stats[nombre].rebotes += (e.valor_json?.cantidad || 0);
    });
    return Object.keys(stats).map(k => ({ jugador: k, puntos: stats[k].puntos, rebotes: stats[k].rebotes })).sort((a, b) => b.puntos - a.puntos);
  }

  get tablaTiemposAtletismo() {
    if (this.torneoSeleccionado?.deporte_nombre !== 'Atletismo') return [];
    const tiempos: Record<string, number> = {};
    this.estadisticas.filter(e => e.tipo_estadistica.includes('Tiempo')).forEach(e => {
      const nombre = e.valor_json?.jugador || e.usuario_nombre;
      const t = e.valor_json?.segundos || 999;
      if (!tiempos[nombre] || t < tiempos[nombre]) tiempos[nombre] = t;
    });
    return Object.keys(tiempos).map(k => ({ atleta: k, tiempo: tiempos[k] })).sort((a, b) => a.tiempo - b.tiempo);
  }

  get tablaRankingAjedrez() {
    if (this.torneoSeleccionado?.deporte_nombre !== 'Ajedrez') return [];
    const stats: Record<string, { puntos: number, victorias: number, derrotas: number, empates: number }> = {};
    this.estadisticas.forEach(e => {
      const nombre = e.valor_json?.jugador || e.usuario_nombre;
      if (!stats[nombre]) stats[nombre] = { puntos: 0, victorias: 0, derrotas: 0, empates: 0 };
      if (e.tipo_estadistica === 'Victoria') {
        stats[nombre].puntos += (e.valor_json?.puntos || 1);
        stats[nombre].victorias += 1;
      } else if (e.tipo_estadistica === 'Derrota') {
        stats[nombre].derrotas += 1;
      } else if (e.tipo_estadistica === 'Empate') {
        stats[nombre].puntos += 0.5;
        stats[nombre].empates += 1;
      }
    });
    return Object.keys(stats).map(k => ({
      jugador: k, puntos: stats[k].puntos, victorias: stats[k].victorias,
      empates: stats[k].empates, derrotas: stats[k].derrotas
    })).sort((a, b) => b.puntos - a.puntos);
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
