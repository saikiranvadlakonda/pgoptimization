import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubTopicViewComponent } from './sub-topic-view.component';

describe('SubTopicViewComponent', () => {
  let component: SubTopicViewComponent;
  let fixture: ComponentFixture<SubTopicViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubTopicViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubTopicViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
