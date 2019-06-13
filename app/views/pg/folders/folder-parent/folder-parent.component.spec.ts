import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderParentComponent } from './folder-parent.component';

describe('FolderParentComponent', () => {
  let component: FolderParentComponent;
  let fixture: ComponentFixture<FolderParentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderParentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
