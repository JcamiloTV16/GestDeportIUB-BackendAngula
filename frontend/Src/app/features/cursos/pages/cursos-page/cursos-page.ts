import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CursosService } from '../../services/cursos.service';

@Component({
  selector: 'app-cursos-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cursos-page.html'
})
export class CursosPage implements OnInit {
  horarios: any[] = [];
  loading = false;

  constructor(private readonly cursosService: CursosService) {}

  async ngOnInit() {
    this.loading = true;
    try {
      const res = await this.cursosService.obtenerHorarios();
      this.horarios = res.resultado || [];
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  }
}
