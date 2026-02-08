import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AccessKeyService } from './access-key.service';

describe('AccessKeyService', () => {
  let service: AccessKeyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccessKeyService,
        provideHttpClient(),
        provideHttpClientTesting()]
    });
    service = TestBed.inject(AccessKeyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
