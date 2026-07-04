import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TorneosService } from '../../services/torneos.service';

@Component({
  selector: 'app-historial-torneos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historial-torneos.component.html'
})
export class HistorialTorneosComponent implements OnInit {
  historial: any[] = [];
  loading = false;

  constructor(private readonly torneosService: TorneosService) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  async cargarHistorial() {
    this.loading = true;
    try {
      const res = await this.torneosService.obtenerHistorialTorneos();
      this.historial = res.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}
