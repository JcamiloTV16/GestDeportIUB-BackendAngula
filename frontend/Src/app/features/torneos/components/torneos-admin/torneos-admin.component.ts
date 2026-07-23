import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionTorneosComponent } from '../gestion-torneos/gestion-torneos.component';
import { DashboardTorneosComponent } from '../dashboard-torneos/dashboard-torneos.component';
import { SeguimientoTorneosComponent } from '../seguimiento-torneos/seguimiento-torneos.component';
import { HistorialTorneosComponent } from '../historial-torneos/historial-torneos.component';
import { InscripcionesTorneosComponent } from '../inscripciones-torneos/inscripciones-torneos.component';
import { TorneosService } from '../../services/torneos.service';

@Component({
  selector: 'app-torneos-admin',
  standalone: true,
  imports: [
    CommonModule,
    GestionTorneosComponent,
    DashboardTorneosComponent,
    SeguimientoTorneosComponent,
    HistorialTorneosComponent,
    InscripcionesTorneosComponent
  ],
  templateUrl: './torneos-admin.component.html'
})
export class TorneosAdminComponent implements OnInit {
  tabActual: 'dashboard' | 'gestion' | 'inscripciones' | 'seguimiento' | 'historial' = 'gestion';
  totalPendientesCount = 0;

  constructor(private readonly torneosService: TorneosService) {}

  ngOnInit() {
    this.cargarConteoPendientes();
  }

  async cargarConteoPendientes() {
    try {
      const res = await this.torneosService.obtenerTorneos();
      const list = res.resultado || [];
      this.totalPendientesCount = list.reduce((acc: number, t: any) => acc + Number(t.pendientes_count || 0), 0);
    } catch (e) {
      console.error(e);
    }
  }
}


