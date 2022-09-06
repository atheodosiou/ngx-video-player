import { TestBed } from '@angular/core/testing';

import { NgxVideoPlayerService } from './ngx-video-player.service';

describe('NgxVideoPlayerService', () => {
  let service: NgxVideoPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxVideoPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
