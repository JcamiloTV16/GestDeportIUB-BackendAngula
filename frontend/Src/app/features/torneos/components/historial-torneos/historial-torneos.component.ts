import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TorneosService } from '../../services/torneos.service';
import { EstadisticasService } from '../../services/estadisticas.service';
import { DataTableDirective } from '../../../../core/directives/data-table.directive';
import { PdfExportService } from '../../../../core/services/pdf-export.service';

@Component({
  selector: 'app-historial-torneos',
  standalone: true,
  imports: [CommonModule, DataTableDirective],
  templateUrl: './historial-torneos.component.html'
})
export class HistorialTorneosComponent implements OnInit {

  historial: any[] = [];
  torneoSeleccionado: any = null;
  estadisticas: any[] = [];
  inscritos: any[] = [];
  loading = false;
  loadingEstadisticas = false;

  constructor(
    private readonly torneosService: TorneosService,
    private readonly estadisticasService: EstadisticasService,
    private readonly pdfService: PdfExportService
  ) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  async cargarHistorial() {
    this.loading = true;
    try {
      const res = await this.torneosService.obtenerHistorialTorneos();
      this.historial = res.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }

  async seleccionarTorneo(torneo: any) {
    this.torneoSeleccionado = torneo;
    this.estadisticas = [];
    this.inscritos = [];
    this.loadingEstadisticas = true;
    try {
      const [statsRes, inscritosRes] = await Promise.all([
        this.estadisticasService.obtenerEstadisticasTorneo(torneo.id),
        this.torneosService.obtenerInscritosPorTorneo(torneo.id)
      ]);
      this.estadisticas = statsRes.resultado || [];
      this.inscritos = inscritosRes.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loadingEstadisticas = false;
    }
  }

  async descargarPdfHistorial(torneo: any) {
    await this.seleccionarTorneo(torneo);

    let ranking: any[] = [];
    const deporte = torneo.deporte_nombre;
    if (deporte === 'Ajedrez') ranking = this.tablaRankingAjedrez;
    else if (deporte === 'Fútbol') ranking = this.tablaGoleadoresFutbol;
    else if (deporte === 'Baloncesto') ranking = this.tablaAnotadoresBaloncesto;
    else if (deporte === 'Atletismo') ranking = this.tablaTiemposAtletismo;
    else ranking = this.tablaGeneral;

    this.pdfService.generarPdfTorneo(torneo, this.inscritos, this.estadisticas, ranking);
  }


  get tablaGoleadoresFutbol() {
    if (this.torneoSeleccionado?.deporte_nombre !== 'Fútbol') return [];
    const stats: Record<string, { goles: number, asistencias: number }> = {};
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
    this.inscritos.forEach(i => {
      const nombre = i.estudiante_nombre || i.usuario_nombre || 'Ajedrecista';
      stats[nombre] = { puntos: 0, victorias: 0, derrotas: 0, empates: 0 };
    });
    this.estadisticas.forEach(e => {
      const nombre = e.usuario_nombre;
      if (nombre) {
        if (!stats[nombre]) stats[nombre] = { puntos: 0, victorias: 0, derrotas: 0, empates: 0 };
        if (e.tipo_estadistica === 'Victoria') { stats[nombre].puntos += 1; stats[nombre].victorias += 1; }
        else if (e.tipo_estadistica === 'Derrota') { stats[nombre].derrotas += 1; }
        else if (e.tipo_estadistica === 'Empate') { stats[nombre].puntos += 0.5; stats[nombre].empates += 1; }
      }
    });
    return Object.keys(stats).map(k => ({
      jugador: k, puntos: stats[k].puntos, victorias: stats[k].victorias,
      empates: stats[k].empates, derrotas: stats[k].derrotas
    })).sort((a, b) => b.puntos - a.puntos || b.victorias - a.victorias);
  }

  get tablaGeneral() {
    const stats: Record<string, number> = {};
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

}
