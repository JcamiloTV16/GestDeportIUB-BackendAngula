import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialTorneosComponent } from './historial-torneos.component';

describe('HistorialTorneosComponent', () => {
  let component: HistorialTorneosComponent;
  let fixture: ComponentFixture<HistorialTorneosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialTorneosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialTorneosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
