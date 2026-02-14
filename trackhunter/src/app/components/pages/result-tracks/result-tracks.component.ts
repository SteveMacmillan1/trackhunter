import { Component, inject } from '@angular/core';
import { TrackService } from '../../../services/track.service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { faBookmark as faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBan } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-result-tracks',
  templateUrl: './result-tracks.component.html',
  styleUrl: './result-tracks.component.css'
})
export class ResultTracksComponent {

  tracks: any[] = [];
  loaded: boolean = false;
  seedTrackId: string;
  popularity: string;
  route: ActivatedRoute = inject(ActivatedRoute);
  dropBtn: HTMLImageElement | null;
  underlay: HTMLDivElement | null;
  alertBubble: HTMLDivElement | null;
  isAlertBubbleViewed: boolean = false;
  currPage = 1;
  banIcon = faBan;
  bookmarkIcon = faBookmark;


  constructor(private trackService: TrackService, private spinner: NgxSpinnerService) {
    // Preserve URL params for when 'Next' results page button is clicked
    this.seedTrackId = String(this.route.snapshot.params['id']);
    this.popularity = String(this.route.snapshot.params['popularity']);
  }


  ngOnInit(): void {
    this.getRecTracks();
  }


  public isLoaded(): boolean {
    return this.loaded;
  }


  public goToPage(page: number): void {
    this.currPage = page;
  }


  public closeBubble(): void {
    document.getElementById('alert-bubble')?.style.setProperty('display', 'none');
    document.getElementById('alert-bubble-underlay')?.style.setProperty('display', 'none');
  }


  public isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userEmail');
  }


  public resetViewedTracks(): void {
    this.trackService.resetViewedTracks().subscribe({
      next: (resp) => {
        const btn = document.getElementById('reset-viewed-btn') as HTMLElement;
        btn.innerHTML = 'Viewed tracks reset!';
      },
      error: (err) => {
        console.log('There was a problem resetting viewed tracks: ' + err.status);
      }
    });
  }


  public getRecTracks(): void {
    /*
      Always start by fading out current result tracks on page & showing loading spinner
      This order is a little counterintuitive for the 1st results page,
      But it works fine, no need for special 1st page case handling
    */
    const nextBtn = document.getElementById('next-btn') as HTMLElement;
    if (nextBtn)
      nextBtn.style.pointerEvents = 'none';
      // This method fires onInit i.e. before nextBtn is in the DOM

    const resultTracksDiv = document.getElementById('result-tracks-div') as HTMLElement;
    resultTracksDiv.classList.remove('slide-fade-in');
    resultTracksDiv.classList.add('slide-fade-out');
    const spinnerDiv = document.getElementById('spinner-div') as HTMLElement;
    spinnerDiv.style.display = 'block';
    this.spinner.show();
    window.scrollTo(0, 0);

    // Response with tracks received, so fade them in and hide loading spinner
    this.trackService.getRecTracks(this.seedTrackId, this.popularity).subscribe((resp) => {
      if (resp.status == 200) {
        this.spinner.hide();
        spinnerDiv.style.display = 'none';
        this.tracks = resp.body.data;
        this.loaded = true;
        resultTracksDiv.style.display = 'block';
        resultTracksDiv.classList.remove('slide-fade-out');
        resultTracksDiv.classList.add('slide-fade-in');
        const nextBtn = document.getElementById('next-btn') as HTMLElement;
        if (nextBtn)
          nextBtn.style.pointerEvents = 'auto';
        window.scrollTo(0, 0);
      } else {
        console.log('There was a problem getting track recommendations: ' + resp.status);
      }
    });
  }


  public showAlertBubble(): void {
    if (!this.isAlertBubbleViewed) {
      const alertBubbleTimeout = setTimeout(() => {
        this.dropBtn = document.getElementById('dropbtn') as HTMLImageElement;
        this.alertBubble = document.getElementById('alert-bubble') as HTMLDivElement;
        this.underlay = document.getElementById('alert-bubble-underlay') as HTMLDivElement;
        this.dropBtn.style.display = 'block';
        this.alertBubble.style.display = 'block';
        this.underlay.style.display = 'block';
        this.alertBubble.classList.add('slide-fade-in');
        this.isAlertBubbleViewed = true;
      }, 1500);
    }
  }

  public hasTracks(): boolean {
    return this.tracks.length > 0;
  }

}

