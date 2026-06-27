import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-page.html'
})
export class AdminPage {
  vistaActual = 'dashboard';

  cambiarVista(vista: string) {
    this.vistaActual = vista;
  }
}
