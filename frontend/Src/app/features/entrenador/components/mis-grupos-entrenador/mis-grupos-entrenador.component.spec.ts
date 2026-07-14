import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisGruposEntrenadorComponent } from './mis-grupos-entrenador.component';

describe('MisGruposEntrenadorComponent', () => {
  let component: MisGruposEntrenadorComponent;
  let fixture: ComponentFixture<MisGruposEntrenadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisGruposEntrenadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisGruposEntrenadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
