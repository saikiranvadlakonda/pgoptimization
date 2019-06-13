import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeAreaSearchComponent } from './practice-area-search.component';

describe('PracticeAreaSearchComponent', () => {
  let component: PracticeAreaSearchComponent;
  let fixture: ComponentFixture<PracticeAreaSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeAreaSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeAreaSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
