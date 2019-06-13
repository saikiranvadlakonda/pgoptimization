import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHeader1Component } from './app-header1.component';

describe('AppHeader1Component', () => {
  let component: AppHeader1Component;
  let fixture: ComponentFixture<AppHeader1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppHeader1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppHeader1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
