import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TorneosService } from '../../services/torneos.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-torneos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-torneos.component.html',
  styleUrl: './dashboard-torneos.component.css'
})
export class DashboardTorneosComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('deportesChartCanvas') deportesChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('estadosChartCanvas') estadosChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('participantesChartCanvas') participantesChartCanvas!: ElementRef<HTMLCanvasElement>;

  torneos: any[] = [];
  loading = true;

  // Métricas KPI
  totalTorneos = 0;
  torneosEnCurso = 0;
  torneosInscripcionesAbiertas = 0;
  totalInscritos = 0;
  deporteMasPopular = 'N/A';

  private chartDeportes: Chart | null = null;
  private chartEstados: Chart | null = null;
  private chartParticipantes: Chart | null = null;

  torneosFinalizados = 0;

  constructor(private readonly torneosService: TorneosService) {}

  ngOnInit() {
    this.cargarDatosDashboard();
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.destruirGraficos();
  }

  async cargarDatosDashboard() {
    this.loading = true;
    try {
      const [activosRes, historialRes] = await Promise.all([
        this.torneosService.obtenerTorneos(),
        this.torneosService.obtenerHistorialTorneos()
      ]);

      const activos = activosRes.resultado || [];
      const finalizados = historialRes.resultado || [];

      // Unir todos los torneos (activos + finalizados)
      this.torneos = [...activos, ...finalizados];
      this.calcularMetricas();
      
      // Esperar a que el DOM renderice los canvas
      setTimeout(() => {
        this.renderizarGraficos();
      }, 100);
    } catch (e) {
      console.error('Error al cargar datos del dashboard de torneos:', e);
    } finally {
      this.loading = false;
    }
  }

  calcularMetricas() {
    this.totalTorneos = this.torneos.length;
    this.torneosEnCurso = this.torneos.filter(t => t.estado_torneo === 'En Curso').length;
    this.torneosInscripcionesAbiertas = this.torneos.filter(t => t.estado_torneo === 'Inscripciones Abiertas').length;
    this.torneosFinalizados = this.torneos.filter(t => t.estado_torneo === 'Finalizado').length;
    
    // Suma total de inscritos
    const deportesInscritos: Record<string, number> = {};
    let totalInsc = 0;

    this.torneos.forEach(t => {
      const num = Number(t.total_inscritos || 0);
      totalInsc += num;
      const dep = t.deporte_nombre || 'Otro';
      deportesInscritos[dep] = (deportesInscritos[dep] || 0) + num;
    });

    this.totalInscritos = totalInsc;

    // Obtener deporte más popular
    let maxInsc = -1;
    Object.keys(deportesInscritos).forEach(dep => {
      if (deportesInscritos[dep] > maxInsc) {
        maxInsc = deportesInscritos[dep];
        this.deporteMasPopular = dep;
      }
    });
  }


  destruirGraficos() {
    if (this.chartDeportes) this.chartDeportes.destroy();
    if (this.chartEstados) this.chartEstados.destroy();
    if (this.chartParticipantes) this.chartParticipantes.destroy();
  }

  renderizarGraficos() {
    this.destruirGraficos();

    // 1. Conteo de torneos por Deporte
    const torneoPorDeporte: Record<string, number> = {};
    const inscritosPorDeporte: Record<string, number> = {};
    const estadosCount: Record<string, number> = {
      'En Curso': 0,
      'Inscripciones Abiertas': 0,
      'Finalizado': 0
    };

    this.torneos.forEach(t => {
      const dep = t.deporte_nombre || 'Sin Deporte';
      torneoPorDeporte[dep] = (torneoPorDeporte[dep] || 0) + 1;
      inscritosPorDeporte[dep] = (inscritosPorDeporte[dep] || 0) + Number(t.total_inscritos || 0);

      const st = t.estado_torneo || 'En Curso';
      estadosCount[st] = (estadosCount[st] || 0) + 1;
    });

    // --- GRÁFICO 1: Torneos por Deporte (Barras IUB) ---
    if (this.deportesChartCanvas?.nativeElement) {
      const ctx = this.deportesChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chartDeportes = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(torneoPorDeporte),
            datasets: [{
              label: 'Cantidad de Torneos',
              data: Object.values(torneoPorDeporte),
              backgroundColor: [
                '#1a2b4b', // Azul Marino IUB
                '#f2cb05', // Dorado IUB
                '#2a3b5b', // Azul Light IUB
                '#198754', // Verde
                '#495057'  // Gris
              ],
              borderColor: '#1a2b4b',
              borderWidth: 1,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { enabled: true }
            },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          }
        });
      }
    }

    // --- GRÁFICO 2: Distribución por Estado (Dona IUB) ---
    if (this.estadosChartCanvas?.nativeElement) {
      const ctx = this.estadosChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chartEstados = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(estadosCount),
            datasets: [{
              data: Object.values(estadosCount),
              backgroundColor: [
                '#2a3b5b', // En Curso -> Azul IUB
                '#f2cb05', // Inscripciones Abiertas -> Dorado IUB
                '#6c757d'  // Finalizado -> Gris
              ],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      }
    }

    // --- GRÁFICO 3: Participación Estudiantil por Deporte (Barras Horizontales IUB) ---
    if (this.participantesChartCanvas?.nativeElement) {
      const ctx = this.participantesChartCanvas.nativeElement.getContext('2d');
      if (ctx) {
        this.chartParticipantes = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: Object.keys(inscritosPorDeporte),
            datasets: [{
              label: 'Estudiantes Inscritos',
              data: Object.values(inscritosPorDeporte),
              backgroundColor: '#1a2b4b', // Azul Marino IUB
              borderColor: '#f2cb05', // Borde Dorado
              borderWidth: 1.5,
              borderRadius: 6
            }]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          }
        });
      }
    }
  }
}

