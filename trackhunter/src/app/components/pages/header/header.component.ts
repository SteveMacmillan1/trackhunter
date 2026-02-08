import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent {
  userEmail: string | null;

  ngOnInit() {
    this.userEmail = sessionStorage.getItem('userEmail');
  }

  public isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userEmail');
  }

  public getSessionEmail(): string | null {
    return sessionStorage.getItem('userEmail');
  }

}
