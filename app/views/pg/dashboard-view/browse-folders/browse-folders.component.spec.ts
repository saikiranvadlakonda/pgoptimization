import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseFoldersComponent } from './browse-folders.component';

describe('BrowseFoldersComponent', () => {
  let component: BrowseFoldersComponent;
  let fixture: ComponentFixture<BrowseFoldersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseFoldersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseFoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
