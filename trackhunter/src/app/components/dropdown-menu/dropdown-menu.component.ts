import { Component } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-dropdown-menu',
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.css']
})
export class DropdownMenuComponent {


  constructor(private accountService: AccountService) {}


  public onLogout(): void {
    this.accountService.logout().subscribe((resp) => {
      console.log(resp)
      if (resp.status == 200) {
        sessionStorage.clear();
        window.location.replace('/logout'); 
      } else {
        console.log('There was a problem logging out: ' + resp.status);
      }
    });
  }


  public isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userEmail');
  }
  
}
