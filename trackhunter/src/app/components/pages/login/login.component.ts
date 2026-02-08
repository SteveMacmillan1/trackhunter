import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { SHA1 } from 'crypto-js';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = new FormGroup({
    userEmail: new FormControl(''),
    userPassword: new FormControl('')
  })

  valMsg: string;
  submitAttempted: boolean = false;
  unregisteredEmail: string;


  constructor(private accountService: AccountService) {}


  public submitLogin(): void {
    this.submitAttempted = true;

    if (this.emailVal() == null) {
      this.valMsg = '*Email required';
    } else if (!this.emailVal()) {
      this.valMsg = '*Invalid email format';
    } else if (!this.passwordVal()) {
      this.valMsg = '*Password required'

    } else {
      const userEmail = this.loginForm.value.userEmail?.toLowerCase();
      const hashedPassword = SHA1(this.loginForm.value.userPassword!);
      // Hash user password before sending to server
      this.accountService.authenticateLogin(userEmail, hashedPassword).subscribe({
        next: (resp) => {
          if (resp.status === 200) {
            this.valMsg = '';
            sessionStorage.setItem('userEmail', resp.body.userEmail);
            sessionStorage.setItem('userId', resp.body.userId);
            window.location.replace('/');
            // 200 login success, redirect user to song search page
          }
        },

        error: (err) => {
          if (err.status === 401) {
            this.valMsg = '*Incorrect password';

          } else if (err.status === 404) {
            this.valMsg = '*Email not registered';
            this.unregisteredEmail = this.loginForm.value.userEmail!;
            // 404 email not registered...
            // Prints "Would you like to <a href=''> Register? </a>
            // Save the unregistered email to auto-populate 
            // the email field on Register page if <a> clicked

          } else {
            this.valMsg = '*There was a problem logging in: ' + err.status;
          }
        }
      })
    }
  }

  
  public emailVal(): boolean | null {
    const pattern = /^[a-zA-Z0-9_-]{1,30}@[a-zA-Z0-9_-]{1,30}\.[a-zA-Z]{2,6}$/;
    const regex = new RegExp(pattern);
    const userEmail = this.loginForm.value.userEmail!;

     // Email left blank
    if (!userEmail)
      return null;

    return (regex.test(userEmail));

  }


  public passwordVal(): boolean {
    const userPassword = this.loginForm.value.userPassword;

    // Only check if empty string
    // i.e. allow user to send whatever pw they want to try, as long as not empty string
    return Boolean(userPassword);
  }
}
