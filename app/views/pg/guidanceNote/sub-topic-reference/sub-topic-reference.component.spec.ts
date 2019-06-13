import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTopicReferenceComponent } from './sub-topic-reference.component';

describe('SubTopicReferenceComponent', () => {
  let component: SubTopicReferenceComponent;
  let fixture: ComponentFixture<SubTopicReferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubTopicReferenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubTopicReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
