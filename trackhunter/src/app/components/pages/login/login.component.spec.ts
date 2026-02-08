import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AccountService } from 'src/app/services/account.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let accountService: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeModule
      ],
      declarations: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        AccountService
      ]
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    accountService = TestBed.inject(AccountService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('Email-Password input fields', () => {
    let emailField: HTMLInputElement;
    let passwordField: HTMLInputElement;
    let submitBtn: HTMLInputElement;
    let valMsg;

    beforeEach(() => {
      emailField = fixture.debugElement.query(By.css('[formControlName="userEmail"]')).nativeElement;
      passwordField = fixture.debugElement.query(By.css('[formControlName="userPassword"]')).nativeElement;
      submitBtn = fixture.debugElement.query(By.css('#login-form-submit')).nativeElement;
    });


    describe('Before Submit Clicked', () => {
      it('should not print validation error msg when field is empty', () => {
        emailField.value = '';
        valMsg = fixture.debugElement.query(By.css('#val-msg'));
        expect(valMsg).toBeNull();
      });

      it('should not print validation error msg when field has text', () => {
        emailField.value = 'abc@def';
        valMsg = fixture.debugElement.query(By.css('#val-msg'));
        expect(valMsg).toBeNull();
      });
    });


    describe('After Submit Clicked', () => {
      let submitBtn: HTMLInputElement;
      let valMsg: HTMLElement;

      beforeEach(() => {
        fixture.detectChanges();
        submitBtn = fixture.debugElement.query(By.css('#login-form-submit')).nativeElement;
      });

      it('should print "*Email required" when field is empty', () => {
        emailField.value = '';
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*Email required');
      });


      it('should print "*Invalid email format" when field fails regex pattern', () => {
        emailField.value = 'brokenemail.c';
        passwordField.value = '';
        emailField.dispatchEvent(new Event('input'));
        passwordField.dispatchEvent(new Event('input'));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*Invalid email format');
      });


      it('should print "*Email not registered" when 404 server response', () => {
        emailField.value = 'unregisteredEmail@domain.com';
        passwordField.value = 'abcdef'
        emailField.dispatchEvent(new Event('input'));
        passwordField.dispatchEvent(new Event('input'));

        const mockResponse = { status: 404, body: { status: 'fail', message: 'Email not registered' } };
        spyOn(accountService, 'authenticateLogin').and.returnValue(throwError(() => mockResponse));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*Email not registered');
      });

      it('should print "*Password required" when field is empty (w/ valid format email entered)', () => {
        emailField.value = 'placeholder@domain.com';
        passwordField.value = '';
        emailField.dispatchEvent(new Event('input'));
        passwordField.dispatchEvent(new Event('input'));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*Password required');
      });


      it('should print "*Incorrect password" when server response 401', () => {
        emailField.value = 'emailIsRegistered@domain.com';
        passwordField.value = 'wrongPasswordThough';
        emailField.dispatchEvent(new Event('input'));
        passwordField.dispatchEvent(new Event('input'));

        const mockResponse = { status: 401, body: { status: "fail", message: "Unauthorized" } };
        spyOn(accountService, 'authenticateLogin').and.returnValue(throwError(() => mockResponse));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*Incorrect password');
      });

      it('should print "*There was a problem registering: 500" when server response 500', () => {
        emailField.value = 'emailIsRegistered@domain.com';
        passwordField.value = 'rightPassword';
        emailField.dispatchEvent(new Event('input'));
        passwordField.dispatchEvent(new Event('input'));

        const mockResponse = { status: 500, body: { status: "fail", message: "Server Error" } };
        spyOn(accountService, 'authenticateLogin').and.returnValue(throwError(() => mockResponse));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*There was a problem logging in: 500');
      });
    });
  });
});
