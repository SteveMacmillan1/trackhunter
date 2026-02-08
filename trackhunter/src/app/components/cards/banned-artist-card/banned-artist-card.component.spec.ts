import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { TrackService } from 'src/app/services/track.service';
import { BannedArtistCardComponent } from './banned-artist-card.component';

describe('BannedArtistCardComponent', () => {
  let component: BannedArtistCardComponent;
  let fixture: ComponentFixture<BannedArtistCardComponent>;
  let trackService: TrackService;
  let bannedArtistCard: HTMLElement;
  let unbanIcon: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontAwesomeModule],
      declarations: [BannedArtistCardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        TrackService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannedArtistCardComponent);
    trackService = TestBed.inject(TrackService);
    component = fixture.componentInstance;
    component.bannedArtist = {
      artistId: '568ZhdwyaiCyOGJRtNYhWf',
      artistName: 'Deep Purple',
      artistImgUrl: 'https://i.scdn.co/image/ab6761610000e5eb3a475812e97ee788cfd5fd1a',
      date: '1743891257'
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  beforeEach(() => {
    sessionStorage.setItem('userId', '123');
    unbanIcon = fixture.debugElement.query(By.css('#unban-icon-' + component.bannedArtist.artistId)).nativeElement;
    bannedArtistCard = fixture.debugElement.query(By.css('[id="' + component.bannedArtist.artistId + '"]')).nativeElement;
                                              // Property binding based query can detect ID starting with a number
  });

  it('should hide the card when unban icon clicked & server response 201', fakeAsync(() => {
    let mockResponse = { status: 201, body: { status: "Success", message: "Unbanned" } };
    spyOn(trackService, 'unbanArtist').and.returnValue(of(mockResponse));
    unbanIcon.click();
    // Card is removed from DOM on animationend callback, simulate running the animation
    const animationEvent = new AnimationEvent('animationend', {
        animationName: 'slide-left'
    });
    bannedArtistCard.dispatchEvent(animationEvent);
    fixture.detectChanges();
    expect(window.getComputedStyle(bannedArtistCard).display).toBe('none');
  }));


  it('should not hide the card when unban icon clicked & server response 500', fakeAsync(() => {
    let mockResponse = { status: 500, body: { status: "Fail", message: "Server Error" } };
    spyOn(trackService, 'unbanArtist').and.returnValue(throwError(() => mockResponse));
    unbanIcon.click();
    // Card is removed from DOM on animationend callback, simulate running the animation
    const animationEvent = new AnimationEvent('animationend', {
        animationName: 'slide-left'
    });
    bannedArtistCard.dispatchEvent(animationEvent);
    fixture.detectChanges();
    expect(window.getComputedStyle(bannedArtistCard).display).toBe('block');
  }));
});
