import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveToFolderModalComponent } from './save-to-folder-modal.component';

describe('SaveToFolderModalComponent', () => {
  let component: SaveToFolderModalComponent;
  let fixture: ComponentFixture<SaveToFolderModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveToFolderModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveToFolderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
