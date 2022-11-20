import { TestBed } from '@angular/core/testing';

import { MsalConfService } from './msal-conf-service';

describe('MsalConfServiceService', () => {
  let service: MsalConfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MsalConfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
