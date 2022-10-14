import { TestBed } from '@angular/core/testing';

import { ExactPluginService } from './exact-plugin.service';

describe('ExactPluginService', () => {
  let service: ExactPluginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExactPluginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
