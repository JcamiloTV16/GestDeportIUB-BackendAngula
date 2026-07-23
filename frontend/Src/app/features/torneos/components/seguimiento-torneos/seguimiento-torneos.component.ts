import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TorneosService } from '../../services/torneos.service';
import { EstadisticasService } from '../../services/estadisticas.service';

import { PdfExportService } from '../../../../core/services/pdf-export.service';

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
    private readonly estadisticasService: EstadisticasService,
    private readonly pdfService: PdfExportService
  ) {}


  ngOnInit() {
    this.initForm();
    this.cargarTorneosActivos();
  }

  initForm() {
    this.statForm = this.fb.group({
      usuario_id: [null, Validators.required],
      tipo_estadistica: ['', Validators.required],
      cantidad: [1]
    });
  }

  async cargarTorneosActivos() {
    this.loadingTorneos = true;
    try {
      const res = await this.torneosService.obtenerTorneos();
      this.torneosActivos = (res.resultado || []).filter(
        (t: any) => t.estado_torneo === 'En Curso'
      );
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingTorneos = false;
    }
  }


  async seleccionarTorneo(torneo: any) {
    this.torneoSeleccionado = torneo;
    this.statForm.reset({ cantidad: 1 });
    // Set default tipo_estadistica by sport
    const deporte = torneo.deporte_nombre;
    if (deporte === 'Fútbol') this.statForm.patchValue({ tipo_estadistica: 'Goles' });
    else if (deporte === 'Baloncesto') this.statForm.patchValue({ tipo_estadistica: 'Puntos' });
    else if (deporte === 'Atletismo') this.statForm.patchValue({ tipo_estadistica: 'Tiempo Final' });
    else if (deporte === 'Ajedrez') this.statForm.patchValue({ tipo_estadistica: 'Victoria' });
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

    const { usuario_id, tipo_estadistica, cantidad } = this.statForm.value;
    const deporte = this.torneoSeleccionado.deporte_nombre;

    // Build valor_json based on sport type
    let valor_json: Record<string, unknown> = { cantidad };
    if (deporte === 'Atletismo') {
      valor_json = { segundos: cantidad };
    } else if (deporte === 'Ajedrez') {
      const pts: Record<string, number> = { 'Victoria': 1, 'Empate': 0.5, 'Derrota': 0 };
      valor_json = { puntos: pts[tipo_estadistica] ?? 0 };
    }

    const payload = {
      torneo_id: this.torneoSeleccionado.id,
      usuario_id,
      tipo_estadistica,
      valor_json
    };

    try {
      await this.estadisticasService.crearEstadistica(payload);
      this.mostrarExito('Estadística registrada correctamente.');
      this.statForm.patchValue({ cantidad: 1 });
      await this.cargarDetalleTorneo();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al registrar estadística.');
    }
  }

  get tablaGoleadoresFutbol() {
    if (this.torneoSeleccionado?.deporte_nombre !== 'Fútbol') return [];
    const stats: Record<string, { goles: number, asistencias: number }> = {};

    // Inicializar con todos los participantes inscritos en el torneo
    this.inscritos.forEach(i => {
      const nombre = i.estudiante_nombre || i.usuario_nombre || 'Participante';
      stats[nombre] = { goles: 0, asistencias: 0 };
    });

    this.estadisticas.forEach(e => {
      const nombre = e.usuario_nombre;
      if (nombre) {
        if (!stats[nombre]) stats[nombre] = { goles: 0, asistencias: 0 };
        if (e.tipo_estadistica === 'Goles') stats[nombre].goles += (e.valor_json?.cantidad || 1);
        if (e.tipo_estadistica === 'Asistencias') stats[nombre].asistencias += (e.valor_json?.cantidad || 1);
      }
    });

    return Object.keys(stats)
      .map(k => ({ jugador: k, goles: stats[k].goles, asistencias: stats[k].asistencias }))
      .sort((a, b) => b.goles - a.goles || b.asistencias - a.asistencias);
  }

  get tablaAnotadoresBaloncesto() {
    if (this.torneoSeleccionado?.deporte_nombre !== 'Baloncesto') return [];
    const stats: Record<string, { puntos: number, rebotes: number }> = {};

    // Inicializar con todos los participantes inscritos en el torneo
    this.inscritos.forEach(i => {
      const nombre = i.estudiante_nombre || i.usuario_nombre || 'Participante';
      stats[nombre] = { puntos: 0, rebotes: 0 };
    });

    this.estadisticas.forEach(e => {
      const nombre = e.usuario_nombre;
      if (nombre) {
        if (!stats[nombre]) stats[nombre] = { puntos: 0, rebotes: 0 };
        if (e.tipo_estadistica === 'Puntos') stats[nombre].puntos += (e.valor_json?.cantidad || 1);
        if (e.tipo_estadistica === 'Rebotes') stats[nombre].rebotes += (e.valor_json?.cantidad || 1);
      }
    });

    return Object.keys(stats)
      .map(k => ({ jugador: k, puntos: stats[k].puntos, rebotes: stats[k].rebotes }))
      .sort((a, b) => b.puntos - a.puntos);
  }

  get tablaTiemposAtletismo() {
    if (this.torneoSeleccionado?.deporte_nombre !== 'Atletismo') return [];
    const tiempos: Record<string, number> = {};

    // Inicializar con todos los participantes inscritos en el torneo
    this.inscritos.forEach(i => {
      const nombre = i.estudiante_nombre || i.usuario_nombre || 'Competidor';
      tiempos[nombre] = 0;
    });

    this.estadisticas
      .filter(e => e.tipo_estadistica === 'Tiempo Final' || e.tipo_estadistica === 'Tiempo Parcial')
      .forEach(e => {
        const nombre = e.usuario_nombre;
        const t = e.valor_json?.segundos || e.valor_json?.cantidad || 0;
        if (nombre && t > 0) {
          if (!tiempos[nombre] || tiempos[nombre] === 0 || t < tiempos[nombre]) {
            tiempos[nombre] = t;
          }
        }
      });

    return Object.keys(tiempos)
      .map(k => ({ atleta: k, tiempo: tiempos[k] }))
      .sort((a, b) => (a.tiempo === 0 ? 1 : b.tiempo === 0 ? -1 : a.tiempo - b.tiempo));
  }

  get tablaRankingAjedrez() {
    if (this.torneoSeleccionado?.deporte_nombre !== 'Ajedrez') return [];
    const stats: Record<string, { puntos: number, victorias: number, derrotas: number, empates: number }> = {};

    // Inicializar con todos los participantes inscritos en el torneo
    this.inscritos.forEach(i => {
      const nombre = i.estudiante_nombre || i.usuario_nombre || 'Ajedrecista';
      stats[nombre] = { puntos: 0, victorias: 0, derrotas: 0, empates: 0 };
    });

    this.estadisticas.forEach(e => {
      const nombre = e.usuario_nombre;
      if (nombre) {
        if (!stats[nombre]) stats[nombre] = { puntos: 0, victorias: 0, derrotas: 0, empates: 0 };
        if (e.tipo_estadistica === 'Victoria') {
          stats[nombre].puntos += 1;
          stats[nombre].victorias += 1;
        } else if (e.tipo_estadistica === 'Derrota') {
          stats[nombre].derrotas += 1;
        } else if (e.tipo_estadistica === 'Empate') {
          stats[nombre].puntos += 0.5;
          stats[nombre].empates += 1;
        }
      }
    });

    return Object.keys(stats).map(k => ({
      jugador: k, puntos: stats[k].puntos, victorias: stats[k].victorias,
      empates: stats[k].empates, derrotas: stats[k].derrotas
    })).sort((a, b) => b.puntos - a.puntos || b.victorias - a.victorias);
  }

  get tablaGeneral() {
    const stats: Record<string, number> = {};

    // Inicializar con todos los participantes inscritos en el torneo
    this.inscritos.forEach(i => {
      const nombre = i.estudiante_nombre || i.usuario_nombre || 'Participante';
      stats[nombre] = 0;
    });

    this.estadisticas.forEach(e => {
      const nombre = e.usuario_nombre;
      if (nombre) {
        stats[nombre] = (stats[nombre] || 0) + (e.valor_json?.cantidad || 1);
      }
    });

    return Object.keys(stats)
      .map(k => ({ jugador: k, total: stats[k] }))
      .sort((a, b) => b.total - a.total);
  }


  descargarInformePDF() {
    if (!this.torneoSeleccionado) return;

    let ranking: any[] = [];
    const deporte = this.torneoSeleccionado.deporte_nombre;
    if (deporte === 'Ajedrez') ranking = this.tablaRankingAjedrez;
    else if (deporte === 'Fútbol') ranking = this.tablaGoleadoresFutbol;
    else if (deporte === 'Baloncesto') ranking = this.tablaAnotadoresBaloncesto;
    else if (deporte === 'Atletismo') ranking = this.tablaTiemposAtletismo;
    else ranking = this.tablaGeneral;

    this.pdfService.generarPdfTorneo(
      this.torneoSeleccionado,
      this.inscritos,
      this.estadisticas,
      ranking
    );
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

