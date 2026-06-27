import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TorneosService } from '../../services/torneos.service';

@Component({
  selector: 'app-torneos-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './torneos-page.html'
})
export class TorneosPage implements OnInit {
  torneos: any[] = [];
  loading = false;

  constructor(private readonly torneosService: TorneosService) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const res = await this.torneosService.obtenerTorneos();
      this.torneos = res.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}
