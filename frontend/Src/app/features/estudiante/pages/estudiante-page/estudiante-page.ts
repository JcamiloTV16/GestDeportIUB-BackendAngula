import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MisCursosComponent } from '../../components/mis-cursos/mis-cursos.component';
import { TorneosEstudianteComponent } from '../../components/torneos-estudiante/torneos-estudiante.component';

@Component({
  selector: 'app-estudiante-page',
  standalone: true,
  imports: [CommonModule, MisCursosComponent, TorneosEstudianteComponent],
  templateUrl: './estudiante-page.html'
})
export class EstudiantePage {
  vistaActual = 'deportes';

  cambiarVista(vista: string) {
    this.vistaActual = vista;
  }
}
