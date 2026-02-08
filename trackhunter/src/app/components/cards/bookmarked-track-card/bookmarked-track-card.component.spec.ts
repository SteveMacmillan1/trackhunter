import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { TrackService } from 'src/app/services/track.service';
import { BookmarkedTrackCardComponent } from './bookmarked-track-card.component';

describe('BookmarkedTrackCardComponent', () => {
  let component: BookmarkedTrackCardComponent;
  let fixture: ComponentFixture<BookmarkedTrackCardComponent>;
  let trackService: TrackService;
  let bookmarkedTrackCard: HTMLElement;
  let unbookmarkIcon: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontAwesomeModule],
      declarations: [BookmarkedTrackCardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TrackService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookmarkedTrackCardComponent);
    trackService = TestBed.inject(TrackService);
    component = fixture.componentInstance;
    component.track = {
      trackId: '0NcpDHxwyI39iZhhuMya4j',
      trackName: 'Hush',
      artistId: '568ZhdwyaiCyOGJRtNYhWf',
      artistName: 'Deep Purple',
      artistImgUrl: 'https://i.scdn.co/image/ab6761610000e5eb3a475812e97ee788cfd5fd1a',
      trackPreviewUrl: 'https://p.scdn.co/mp3-preview/0bb10878976f05df8cbeb2e7672804c0b2061fbc',
      albumName: 'When We Rock, We Rock and When We Roll, We Roll',
      albumImgUrl: 'https://i.scdn.co/image/ab67616d00001e029b05eadd2a35acc39328402c',
      date: '1743891257'
    }
    component.bookmarked = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  beforeEach(() => {
    sessionStorage.setItem('userId', '123');
                                            // Property binding based query can detect ID starting with a number
    bookmarkedTrackCard = fixture.debugElement.query(By.css('[id="' + component.track.trackId + '"]')).nativeElement;
    unbookmarkIcon = fixture.debugElement.query(By.css('#bookmark-icon-' + component.track.trackId)).nativeElement;
  });

  it('should hide the card when unbookmark icon clicked & server response 201', fakeAsync(() => {
    let mockResponse = { status: 201, body: { status: "Success", message: "Unbookmarked" } };
    spyOn(trackService, 'addRemoveBookmark').and.returnValue(of(mockResponse));
    unbookmarkIcon.click();
    // Card is removed from DOM on animationend callback, simulate running the animation
    const animationEvent = new AnimationEvent('animationend', {
      animationName: 'slide-left'
    });
    bookmarkedTrackCard.dispatchEvent(animationEvent);
    fixture.detectChanges();
    expect(window.getComputedStyle(bookmarkedTrackCard).display).toBe('none');
  }));


  it('should not hide the card when unbookmark icon clicked & server response 500', fakeAsync(() => {
    let mockResponse = { status: 500, body: { status: "Fail", message: "Server Error" } };
    spyOn(trackService, 'addRemoveBookmark').and.returnValue(throwError(() => mockResponse));
    unbookmarkIcon.click();
    // Card is removed from DOM on animationend callback, simulate running the animation
    const animationEvent = new AnimationEvent('animationend', {
      animationName: 'slide-left'
    });
    bookmarkedTrackCard.dispatchEvent(animationEvent);
    fixture.detectChanges();
    expect(window.getComputedStyle(bookmarkedTrackCard).display).toBe('block');
  }));


});
