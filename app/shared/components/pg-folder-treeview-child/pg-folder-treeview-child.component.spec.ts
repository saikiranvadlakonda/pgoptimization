import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgFolderTreeviewChildComponent } from './pg-folder-treeview-child.component';

describe('PgFolderTreeviewChildComponent', () => {
  let component: PgFolderTreeviewChildComponent;
  let fixture: ComponentFixture<PgFolderTreeviewChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PgFolderTreeviewChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PgFolderTreeviewChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
