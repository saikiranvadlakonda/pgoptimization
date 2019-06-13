import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHeader2Component } from './app-header2.component';

describe('AppHeader2Component', () => {
  let component: AppHeader2Component;
  let fixture: ComponentFixture<AppHeader2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppHeader2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppHeader2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
