import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GestionTorneosComponent } from '../gestion-torneos/gestion-torneos.component';
import { DashboardTorneosComponent } from '../dashboard-torneos/dashboard-torneos.component';
import { SeguimientoTorneosComponent } from '../seguimiento-torneos/seguimiento-torneos.component';
import { HistorialTorneosComponent } from '../historial-torneos/historial-torneos.component';
import { InscripcionesTorneosComponent } from '../inscripciones-torneos/inscripciones-torneos.component';

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
export class TorneosAdminComponent {
  tabActual: 'dashboard' | 'gestion' | 'inscripciones' | 'seguimiento' | 'historial' = 'gestion';
}

