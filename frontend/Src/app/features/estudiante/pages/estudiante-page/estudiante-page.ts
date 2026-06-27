import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-estudiante-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estudiante-page.html'
})
export class EstudiantePage {
  vistaActual = 'deportes';

  cambiarVista(vista: string) {
    this.vistaActual = vista;
  }
}
