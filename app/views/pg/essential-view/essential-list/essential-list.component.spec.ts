import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EssentialListComponent } from './essential-list.component';

describe('EssentialListComponent', () => {
  let component: EssentialListComponent;
  let fixture: ComponentFixture<EssentialListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EssentialListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EssentialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
