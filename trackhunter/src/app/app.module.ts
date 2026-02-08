import { NgModule, CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes, CanActivate, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/pages/header/header.component';
import { FooterComponent } from './components/pages/footer/footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownMenuComponent } from './components/dropdown-menu/dropdown-menu.component';
import { LoginComponent } from './components/pages/login/login.component';
import { RegisterComponent } from './components/pages/register/register.component';
import { BannedArtistCardComponent } from './components/cards/banned-artist-card/banned-artist-card.component';
import { LoggedOutComponent } from './components/pages/logged-out/logged-out.component';
import { AboutComponent } from './components/pages/about/about.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BookmarkedTrackCardComponent } from './components/cards/bookmarked-track-card/bookmarked-track-card.component';
import { RecommendedTrackCardComponent } from './components/cards/recommended-track-card/recommended-track-card.component';
import { SeedTrackCardComponent } from './components/cards/seed-track-card/seed-track-card.component';
import { BannedArtistsComponent } from './components/pages/banned-artists/banned-artists.component';
import { BookmarkedTracksComponent } from './components/pages/bookmarked-tracks/bookmarked-tracks.component';
import { ResultTracksComponent } from './components/pages/result-tracks/result-tracks.component';
import { SeedTracksComponent } from './components/pages/seed-tracks/seed-tracks.component';
import { ViewedTracksComponent } from './components/pages/viewed-tracks/viewed-tracks.component';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  // Route guard stops login wall pages from loading when user isn't logged in
  canActivate(): boolean {
    if (!sessionStorage.getItem('userEmail')) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

// [AuthGuard] implements canActivate()
const appRoutes: Routes = [
  {path: '', component: SeedTracksComponent, title: 'TrackHunter'},
  {path: 'result-tracks/:id/:popularity', component: ResultTracksComponent},
  {path: 'bookmarked-tracks', component: BookmarkedTracksComponent, canActivate: [AuthGuard]},
  {path: 'banned-artists', component: BannedArtistsComponent, canActivate: [AuthGuard]},
  {path: 'viewed-tracks', component: ViewedTracksComponent, canActivate: [AuthGuard]},
  {path: 'about', component: AboutComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'logged-out', component: LoggedOutComponent}
];

interface NgxSpinnerConfig {
  type?: string;
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DropdownMenuComponent,
    LoginComponent,
    RegisterComponent,
    BannedArtistCardComponent,
    LoggedOutComponent,
    AboutComponent,
    BookmarkedTrackCardComponent,
    RecommendedTrackCardComponent,
    SeedTrackCardComponent,
    BannedArtistsComponent,
    BookmarkedTracksComponent,
    ResultTracksComponent,
    SeedTracksComponent,
    ViewedTracksComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, {enableTracing: true}),
    HttpClientModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgxSpinnerModule.forRoot({ type: 'pacman' })

  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] 
})
export class AppModule { 
}
