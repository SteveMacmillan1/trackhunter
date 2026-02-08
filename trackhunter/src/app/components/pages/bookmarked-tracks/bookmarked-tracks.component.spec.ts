import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSpinnerService } from 'ngx-spinner';
import { provideRouter } from '@angular/router';
import { BookmarkedTracksComponent } from './bookmarked-tracks.component';

describe('BookmarkedTracksComponent', () => {
  let component: BookmarkedTracksComponent;
  let fixture: ComponentFixture<BookmarkedTracksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgxSpinnerModule,
        FontAwesomeModule
      ],
      declarations: [BookmarkedTracksComponent],
      providers: [
        NgxSpinnerService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookmarkedTracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
