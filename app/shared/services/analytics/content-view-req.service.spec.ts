import { TestBed, inject } from '@angular/core/testing';

import { ContentViewReqService } from './content-view-req.service';

describe('ContentViewReqService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContentViewReqService]
    });
  });

  it('should be created', inject([ContentViewReqService], (service: ContentViewReqService) => {
    expect(service).toBeTruthy();
  }));
});
