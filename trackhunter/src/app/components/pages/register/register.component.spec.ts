import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AccountService } from 'src/app/services/account.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let accountService: AccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        FontAwesomeModule
      ],
      declarations: [RegisterComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        AccountService
      ]
    });
    fixture = TestBed.createComponent(RegisterComponent);
    accountService = TestBed.inject(AccountService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('Email-Pass-ConfPass Input Fields', () => {
    let emailField: HTMLInputElement;
    let passField: HTMLInputElement;
    let confirmPassField: HTMLInputElement;
    let submitBtn: HTMLInputElement;
    let valMsg;

    beforeEach(() => {
      emailField = fixture.debugElement.query(By.css('[formControlName="userEmail"]')).nativeElement;
      passField = fixture.debugElement.query(By.css('[formControlName="userPassword"]')).nativeElement;
      confirmPassField = fixture.debugElement.query(By.css('[formControlName="confPassword"]')).nativeElement;
      submitBtn = fixture.debugElement.query(By.css('input[type="submit"]')).nativeElement;
    });
    
    describe('Before Submit Clicked', () => {
      it('should not print validation msg when field is empty', () => {
        emailField.value = '';
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg'));
        expect(valMsg).toBeNull();
      });

      it('should not print validation msg when field has a typed entry', () => {
        emailField.value = 'partialEmail@beingTyp';
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg'));
        expect(valMsg).toBeNull();
      });
    });


    describe('After Submit Clicked', () => {
      it('should print "*Email required" when field is empty', () => {
        emailField.value = '';
        emailField.dispatchEvent(new Event('input'));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*Email required');
      });

      it('should print "*Invalid email format" when field fails regex pattern', () => {
        emailField.value = 'brokenemail.c';
        emailField.dispatchEvent(new Event('input'));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*Invalid email format');
      });

      it('should print "*Password missing requirement(s)" when one or more reqs missing', () => {
        emailField.value = 'validEmail@domain.com';
        passField.value = 'm!ssingcapital,#,andistoolong';
        confirmPassField.value = 'm!ssingcapital,#,andistoolong';
        emailField.dispatchEvent(new Event('input'));
        passField.dispatchEvent(new Event('input'));
        confirmPassField.dispatchEvent(new Event('input'));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*Password missing requirement(s)');
      });

      it('should print "*Password missing requirement(s)" when passwords don\'t match', () => {
        emailField.value = 'validEmail@domain.com';
        passField.value = 'M33tsAllReqs?';          
        confirmPassField.value = 'M33tsAllReqs??';
        emailField.dispatchEvent(new Event('input'));
        passField.dispatchEvent(new Event('input'));
        confirmPassField.dispatchEvent(new Event('input'));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*Password missing requirement(s)');
      });

      it('should print "*Email already registered" when server response 409', () => {
          emailField.value = 'alreadyExists@domain.com';
          passField.value = 'M33tsAllReqs!';          
          confirmPassField.value = 'M33tsAllReqs!';
          emailField.dispatchEvent(new Event('input'));
          passField.dispatchEvent(new Event('input'));
          confirmPassField.dispatchEvent(new Event('input'));

          let mockResponse = {status: 409, body: { status: 'fail', message: 'Email already exists' } };
          spyOn(accountService, 'processRegister').and.returnValue(throwError(() => mockResponse));
          submitBtn.click();
          fixture.detectChanges();
          valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
          expect(valMsg.innerText).toBe('*Email already registered');
      });

      it('should print "*There was a problem logging in: 500" when server response 500', () => {
        emailField.value = 'validEmail@domain.com';
        passField.value = 'r!ghtPa55word';
        confirmPassField.value = 'r!ghtPa55word';
        emailField.dispatchEvent(new Event('input'));
        passField.dispatchEvent(new Event('input'));
        confirmPassField.dispatchEvent(new Event('input'));

        const mockResponse = { status: 500, body: { status: "fail", message: "Server Error" } };
        spyOn(accountService, 'processRegister').and.returnValue(throwError(() => mockResponse));
        submitBtn.click();
        fixture.detectChanges();
        valMsg = fixture.debugElement.query(By.css('#val-msg')).nativeElement;
        expect(valMsg.innerText).toBe('*There was a problem registering: 500');
      });
    });
  });
});
