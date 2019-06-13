import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FolderContainerComponent } from './folder-container.component';

describe('FolderContainerComponent', () => {
  let component: FolderContainerComponent;
  let fixture: ComponentFixture<FolderContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FolderContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FolderContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
