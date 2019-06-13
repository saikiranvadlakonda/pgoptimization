import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgFolderTreeviewComponent } from './pg-folder-treeview.component';

describe('PgFolderTreeviewComponent', () => {
  let component: PgFolderTreeviewComponent;
  let fixture: ComponentFixture<PgFolderTreeviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PgFolderTreeviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PgFolderTreeviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
