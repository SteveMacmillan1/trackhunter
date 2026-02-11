import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.css']
})
export class DropdownMenuComponent {


  constructor(private accountService: AccountService, private router: Router) {}


  public onLogout(): void {
    this.accountService.logout().subscribe((resp) => {
      if (resp.status == 200) {
        this.router.navigate(['/logout']).then(() => {
          sessionStorage.clear()
        });
      } else {
        console.log('There was a problem logging out: ' + resp.status);
      }
    });
  }


  public isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userEmail');
  }
  
}
