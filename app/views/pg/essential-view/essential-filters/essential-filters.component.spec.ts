import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EssentialFiltersComponent } from './essential-filters.component';

describe('EssentialFiltersComponent', () => {
  let component: EssentialFiltersComponent;
  let fixture: ComponentFixture<EssentialFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EssentialFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EssentialFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
