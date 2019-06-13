import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgEmailModalComponent } from './pg-email-modal.component';

describe('PgEmailModalComponent', () => {
  let component: PgEmailModalComponent;
  let fixture: ComponentFixture<PgEmailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PgEmailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PgEmailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
