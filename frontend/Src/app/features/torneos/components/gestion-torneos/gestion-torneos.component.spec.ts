import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionTorneosComponent } from './gestion-torneos.component';

describe('GestionTorneosComponent', () => {
  let component: GestionTorneosComponent;
  let fixture: ComponentFixture<GestionTorneosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionTorneosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionTorneosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
