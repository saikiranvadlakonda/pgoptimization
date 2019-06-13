import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTopicGuidanceComponent } from './sub-topic-guidance.component';

describe('SubTopicGuidanceComponent', () => {
  let component: SubTopicGuidanceComponent;
  let fixture: ComponentFixture<SubTopicGuidanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubTopicGuidanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubTopicGuidanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
