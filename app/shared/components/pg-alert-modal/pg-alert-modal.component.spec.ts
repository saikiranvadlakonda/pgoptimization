import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgAlertModalComponent } from './pg-alert-modal.component';

describe('PgAlertModalComponent', () => {
  let component: PgAlertModalComponent;
  let fixture: ComponentFixture<PgAlertModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PgAlertModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PgAlertModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
