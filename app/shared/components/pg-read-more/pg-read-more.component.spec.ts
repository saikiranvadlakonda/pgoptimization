import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgReadMoreComponent } from './pg-read-more.component';

describe('PgReadMoreComponent', () => {
  let component: PgReadMoreComponent;
  let fixture: ComponentFixture<PgReadMoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PgReadMoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PgReadMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
