import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PgRepoTabMenuComponent } from './pg-Repotab-menu.component';

describe('PgTabMenuComponent', () => {
    let component: PgRepoTabMenuComponent;
    let fixture: ComponentFixture<PgRepoTabMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [PgRepoTabMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
      fixture = TestBed.createComponent(PgRepoTabMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
