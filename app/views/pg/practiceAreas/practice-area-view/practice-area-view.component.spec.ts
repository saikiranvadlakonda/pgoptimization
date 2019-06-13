import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeAreaViewComponent } from './practice-area-view.component';

describe('PracticeAreaViewComponent', () => {
  let component: PracticeAreaViewComponent;
  let fixture: ComponentFixture<PracticeAreaViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeAreaViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeAreaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
