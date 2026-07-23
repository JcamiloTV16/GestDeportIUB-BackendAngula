import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MisGruposEntrenadorComponent } from '../../components/mis-grupos-entrenador/mis-grupos-entrenador.component';
import { TorneosAdminComponent } from '../../../torneos/components/torneos-admin/torneos-admin.component';

@Component({
  selector: 'app-entrenador-page',
  standalone: true,
  imports: [CommonModule, MisGruposEntrenadorComponent, TorneosAdminComponent],
  templateUrl: './entrenador-page.html'
})


export class EntrenadorPage {
  vistaActual = 'grupos';

  cambiarVista(vista: string) {
    this.vistaActual = vista;
  }
}
