import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-entrenador-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entrenador-page.html'
})
export class EntrenadorPage {
  vistaActual = 'grupos';

  cambiarVista(vista: string) {
    this.vistaActual = vista;
  }
}
