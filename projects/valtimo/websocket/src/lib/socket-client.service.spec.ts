import { TestBed } from '@angular/core/testing';

import { SocketClientService } from './socket-client.service';

describe('SocketClientService', () => {
  let service: SocketClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
