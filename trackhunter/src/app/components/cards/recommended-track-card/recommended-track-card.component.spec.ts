import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { TrackService } from 'src/app/services/track.service';
import { RecommendedTrackCardComponent } from './recommended-track-card.component';

describe('RecommendedTrackCardComponent', () => {
  let component: RecommendedTrackCardComponent;
  let fixture: ComponentFixture<RecommendedTrackCardComponent>;
  let trackService: TrackService;
  let bookmarkIcon: HTMLElement;
  let artistName: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontAwesomeModule],
      declarations: [RecommendedTrackCardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        TrackService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendedTrackCardComponent);
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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  beforeEach(() => {
    sessionStorage.setItem('userId', '123');
    bookmarkIcon = fixture.debugElement.query(By.css('#bookmark-icon-' + component.track.trackId)).nativeElement;
    artistName = fixture.debugElement.query(By.css('#artist-name-' + component.track.trackId)).nativeElement;
  });

  
  it('should keep bookmarkIcon clicked appearance when server response 201', () => {
    let mockResponse = { status: 201, body: { status: 'Success', message: 'Created' } };
    spyOn(trackService, 'addRemoveBookmark').and.returnValue(of(mockResponse));
    let beforeClickIcon = component.bookmarkIcon;
    bookmarkIcon.click();
    fixture.detectChanges();
    let afterClickIcon = component.bookmarkIcon;
    expect(beforeClickIcon).not.toEqual(afterClickIcon);
  });


  it('should keep artistName clicked appearance when server response 201', () => {
    let mockResponse = { status: 201, body: { status: 'Success', message: 'Created' } };
    spyOn(trackService, 'addRemoveBan').and.returnValue(of(mockResponse));
    let beforeClickColor = window.getComputedStyle(artistName).color;
    artistName.click();
    fixture.detectChanges();
    let afterClickColor = window.getComputedStyle(artistName).color;
    expect(beforeClickColor).not.toEqual(afterClickColor);
  });
  

  /*
    The UI immediately changes the icon to "bookmarked" state in response to click
    In very small amount of cases, bookmarking a track will fail
    When this happens, the UI must revert the icon to its state before it was clicked since operation failed 
  */
  it('should revert bookmarkIcon clicked appearance when server response 500', () => {
    let mockResponse = { status: 500, body: { status: 'Fail', message: 'Server Error' } };
    spyOn(trackService, 'addRemoveBookmark').and.returnValue(throwError(() => mockResponse));
    let beforeClickIcon = component.bookmarkIcon;
    bookmarkIcon.click();
    fixture.detectChanges();
    let afterClickIcon = component.bookmarkIcon;
    expect(beforeClickIcon).toEqual(afterClickIcon);
  });


  it('should revert artistName clicked appearance when server response 500', () => {
    let mockResponse = { status: 500, body: { status: 'Fail', message: 'Server Error' } };
    spyOn(trackService, 'addRemoveBan').and.returnValue(throwError(() => mockResponse));
    let beforeClickColor = window.getComputedStyle(artistName).color;
    artistName.click();
    fixture.detectChanges();
    let afterClickColor = window.getComputedStyle(artistName).color;
    expect(beforeClickColor).toEqual(afterClickColor);
  });
});
