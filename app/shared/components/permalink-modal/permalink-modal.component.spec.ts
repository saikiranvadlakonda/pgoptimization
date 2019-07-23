import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermalinkModalComponent } from './permalink-modal.component';

describe('PermalinkModalComponent', () => {
  let component: PermalinkModalComponent;
  let fixture: ComponentFixture<PermalinkModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermalinkModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermalinkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
