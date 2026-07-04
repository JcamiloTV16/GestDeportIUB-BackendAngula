import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoTorneosComponent } from './seguimiento-torneos.component';

describe('SeguimientoTorneosComponent', () => {
  let component: SeguimientoTorneosComponent;
  let fixture: ComponentFixture<SeguimientoTorneosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguimientoTorneosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeguimientoTorneosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
