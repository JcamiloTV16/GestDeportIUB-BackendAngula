import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTorneosComponent } from './dashboard-torneos.component';

describe('DashboardTorneosComponent', () => {
  let component: DashboardTorneosComponent;
  let fixture: ComponentFixture<DashboardTorneosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTorneosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardTorneosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
