import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgTabMenuComponent } from './pg-tab-menu.component';

describe('PgTabMenuComponent', () => {
  let component: PgTabMenuComponent;
  let fixture: ComponentFixture<PgTabMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PgTabMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PgTabMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
