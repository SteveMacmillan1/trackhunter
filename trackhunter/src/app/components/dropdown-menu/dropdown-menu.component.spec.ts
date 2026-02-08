import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';
import { DropdownMenuComponent } from './dropdown-menu.component';

describe('DropdownMenuComponent', () => {
  let component: DropdownMenuComponent;
  let fixture: ComponentFixture<DropdownMenuComponent>;
  let accountService: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DropdownMenuComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting,
        AccountService
      ]
    });
    fixture = TestBed.createComponent(DropdownMenuComponent);
    accountService = TestBed.inject(AccountService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
