import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TorneosService } from '../../../torneos/services/torneos.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-torneos-estudiante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './torneos-estudiante.component.html'
})
export class TorneosEstudianteComponent implements OnInit {
  torneos: any[] = [];
  misInscripciones: any[] = [];
  loading = false;
  mensajeExito = '';
  mensajeError = '';
  
  constructor(
    private readonly torneosService: TorneosService,
    private readonly authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.loading = true;
    this.mensajeError = '';
    
    try {
      const user = this.authService.user;
      if (!user?.id) return;
      
      const [resTorneos, resInscripciones] = await Promise.all([
        this.torneosService.obtenerTorneos(),
        this.torneosService.obtenerMisTorneos(user.id)
      ]);
      
      this.torneos = resTorneos.resultado || [];
      this.misInscripciones = resInscripciones.resultado || [];
    } catch (e: any) {
      this.mensajeError = e.message || 'Error al cargar los torneos.';
    } finally {
      this.loading = false;
    }
  }
  
  estaInscrito(torneoId: number): boolean {
    return this.misInscripciones.some((ins: any) => ins.torneo_id === torneoId);
  }

  async inscribirse(torneo: any) {
    if (!confirm(`¿Estás seguro de que deseas inscribirte al torneo "${torneo.nombre}"?`)) return;
    
    const user = this.authService.user;
    if (!user?.id) return;
    
    try {
      await this.torneosService.inscribirseEnTorneo({
        torneo_id: torneo.id,
        estudiante_id: user.id
      });
      
      this.mostrarExito(`Inscripción a "${torneo.nombre}" realizada con éxito.`);
      await this.cargarDatos();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al procesar la inscripción.');
    }
  }

  async cancelarInscripcion(torneo: any) {
    if (!confirm(`¿Seguro que deseas cancelar tu inscripción al torneo "${torneo.nombre}"?`)) return;
    
    const inscripcion = this.misInscripciones.find((ins: any) => ins.torneo_id === torneo.id);
    if (!inscripcion) return;
    
    try {
      await this.torneosService.cancelarInscripcionTorneo(inscripcion.id);
      this.mostrarExito('Inscripción cancelada correctamente.');
      await this.cargarDatos();
    } catch (e: any) {
      this.mostrarError(e.message || 'Error al cancelar la inscripción.');
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
    setTimeout(() => this.mensajeError = '', 4000);
  }

  getDeporteIcon(nombreDeporte: string): string {
    const nombre = (nombreDeporte || '').toLowerCase();
    if (nombre.includes('baloncesto') || nombre.includes('basquet')) return 'bi-dribbble';
    if (nombre.includes('futbol') || nombre.includes('fútbol')) return 'bi-circle-fill';
    if (nombre.includes('voleibol') || nombre.includes('voley')) return 'bi-circle';
    if (nombre.includes('natación') || nombre.includes('natacion')) return 'bi-water';
    if (nombre.includes('ajedrez')) return 'bi-grid-3x3';
    if (nombre.includes('atletismo') || nombre.includes('correr')) return 'bi-person-walking';
    if (nombre.includes('ciclismo') || nombre.includes('bicicleta')) return 'bi-bicycle';
    if (nombre.includes('tenis')) return 'bi-record-circle';
    return 'bi-trophy-fill'; // icono de torneo genérico por defecto
  }
}
