import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GuidanceNoteComponent } from './guidance-note.component';

describe('GuidanceNoteComponent', () => {
  let component: GuidanceNoteComponent;
  let fixture: ComponentFixture<GuidanceNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GuidanceNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GuidanceNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
