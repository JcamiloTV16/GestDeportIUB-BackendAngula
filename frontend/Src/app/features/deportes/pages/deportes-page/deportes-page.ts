import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeportesService } from '../../services/deportes.service';

@Component({
  selector: 'app-deportes-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deportes-page.html'
})
export class DeportesPage implements OnInit {
  deportes: any[] = [];
  loading = false;

  constructor(private readonly deportesService: DeportesService) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const res = await this.deportesService.obtenerDeportes();
      this.deportes = res.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}
