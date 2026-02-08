import { TestBed } from '@angular/core/testing';
import { HeaderComponent } from './components/pages/header/header.component';
import { FooterComponent } from './components/pages/footer/footer.component';
import { DropdownMenuComponent } from './components/dropdown-menu/dropdown-menu.component';
import { RouterModule } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { Router } from 'express';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterModule],
    declarations: [
      AppComponent,
      HeaderComponent,
      FooterComponent,
      DropdownMenuComponent
    ],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([])
    ]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'spotifinder'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('spotifinder');
  });

  
});
