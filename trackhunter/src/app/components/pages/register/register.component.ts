import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SHA1 } from 'crypto-js';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm = new FormGroup({
    userEmail: new FormControl(''),
    userPassword: new FormControl(''),
    confPassword: new FormControl('')
  })
  submitAttempted: boolean;   // Controls display of validation messages
  valMsg: string;
  unregisteredEmail: string;
  route: ActivatedRoute = inject(ActivatedRoute);
  checkIcon = faCheck;


  constructor(private accountService: AccountService) {}


  ngOnInit() {
    this.unregisteredEmail = this.route.snapshot.params['email'];
    if (this.route.snapshot.queryParams['email']) {
      this.unregisteredEmail = this.route.snapshot.queryParams['email'];
      this.registerForm.controls['userEmail'].setValue(this.unregisteredEmail);
    }
  }


  public submitRegister() {
    this.submitAttempted = true;
    if (this.emailVal() == null) {
      this.valMsg = '*Email required';
    } else if (!this.emailVal()) {
      this.valMsg = '*Invalid email format';
    } else if(!this.passwordVal()) {
      this.valMsg = '*Password missing requirement(s)';

    } else {
      const userEmail = this.registerForm.value.userEmail?.toLowerCase();
      const userPassword = this.registerForm.value.userPassword!;
      // Don't encrypt password before sending to server
      // Rely on SSL/TLS delivery
      this.accountService.processRegister(userEmail, userPassword).subscribe({
        next: (resp) => {
          sessionStorage.setItem('userEmail', resp.body.userEmail);
          sessionStorage.setItem('userId', resp.body.userId);
          window.location.replace('/');   // Redirect user to the main search page
        },
        error: (err) => {
        if (err.status === 409)
          this.valMsg = '*Email already registered';
        else if (err.status === 400)
          this.valMsg = '*Bad request: invalid email or password format';
        else 
          this.valMsg = '*There was a problem registering: ' + err.status;
        }
      });
    }
    
  }


  public emailVal(): boolean | null {
    const pattern = /^[a-zA-Z0-9_-]{1,30}@[a-zA-Z0-9_-]{1,30}\.[a-zA-Z]{2,6}$/;
    const regex = new RegExp(pattern);
    const userEmail = this.registerForm.value.userEmail!;

    // Email left blank
    if (!userEmail)  
      return null;

    return regex.test(userEmail);
  }


  public passwordVal():boolean {
  // Use one method for each password requirement, then bundle them into one master test
  // Easier than one single complex regex
    if (
      !this.lowerCaseVal() ||
      !this.upperCaseVal() ||
      !this.numberVal()    ||
      !this.specCharVal()  ||
      !this.lengthVal()    ||
      !this.matchVal()
    ) {
      this.valMsg = '*Password missing requirement(s)';  
      // Prepare validation msg if any test fails
      // The page shows specifically which were met / unmet with a color/icon scheme
      return false;
    }
    return true;
  }


  public lowerCaseVal(): boolean {
    const pattern = /[a-z]/;
    const regex = new RegExp(pattern);
    const userPassword = this.registerForm.value.userPassword!;
    return regex.test(userPassword);
  }


  public upperCaseVal(): boolean {
    const pattern = /[A-Z]/;
    const regex = new RegExp(pattern);
    const userPassword = this.registerForm.value.userPassword!;
    return regex.test(userPassword);
  }


  public numberVal(): boolean {
    const pattern = /[0-9]/;
    const regex = new RegExp(pattern);
    const userPassword = this.registerForm.value.userPassword!;
    return regex.test(userPassword);
  }


  public specCharVal(): boolean {
    // https://stackoverflow.com/questions/32311081/check-for-special-characters-in-string
    const pattern = /[!-\/:-@[-`{-~]/;
    const regex = new RegExp(pattern);
    const userPassword = this.registerForm.value.userPassword!;
    return regex.test(userPassword);
  }


  public lengthVal(): boolean {
    const pattern = /.{8,16}/;
    const regex = new RegExp(pattern);
    const userPassword = this.registerForm.value.userPassword!;
    return regex.test(userPassword);
  }

  
  public matchVal(): boolean {
    const userPassword = this.registerForm.value.userPassword!;
    const confPassword = this.registerForm.value.confPassword!;
    if (!userPassword && !confPassword)
      return false;

    return (userPassword === confPassword);
  }

}
