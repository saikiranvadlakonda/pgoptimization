import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhatsnewCarouselComponent } from './whatsnew-carousel.component';

describe('WhatsnewCarouselComponent', () => {
  let component: WhatsnewCarouselComponent;
  let fixture: ComponentFixture<WhatsnewCarouselComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhatsnewCarouselComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhatsnewCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
