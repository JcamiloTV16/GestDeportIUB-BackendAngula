import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MisCursosComponent } from '../../components/mis-cursos/mis-cursos.component';
import { TorneosEstudianteComponent } from '../../components/torneos-estudiante/torneos-estudiante.component';
import { InscripcionDeportesComponent } from '../../components/inscripcion-deportes/inscripcion-deportes.component';

@Component({
  selector: 'app-estudiante-page',
  standalone: true,
  imports: [CommonModule, MisCursosComponent, TorneosEstudianteComponent, InscripcionDeportesComponent],
  templateUrl: './estudiante-page.html'
})
export class EstudiantePage {
  vistaActual = 'deportes';

  cambiarVista(vista: string) {
    this.vistaActual = vista;
  }
}
