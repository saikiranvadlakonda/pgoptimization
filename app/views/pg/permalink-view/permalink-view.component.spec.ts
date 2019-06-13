import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermalinkViewComponent } from './permalink-view.component';

describe('PermalinkViewComponent', () => {
  let component: PermalinkViewComponent;
  let fixture: ComponentFixture<PermalinkViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermalinkViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermalinkViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
