import { Component } from '@angular/core';
import { TrackService} from '../../../services/track.service';
import { faBinoculars } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-viewed-tracks',
  templateUrl: './viewed-tracks.component.html',
  styleUrl: './viewed-tracks.component.css'
})
export class ViewedTracksComponent {

  viewedTracks: any[] = [];
  tracksChunk: any[] = [];
  viewedIcon = faBinoculars;
  histIndex: number = 0;


  constructor(private trackService: TrackService, private spinner: NgxSpinnerService) {}


  ngOnInit() {
    window.addEventListener('scroll', this.onWindowScroll.bind(this));
    // Retrieve user's viewedTrack data on page load
    this.spinner.show();

    this.trackService.getViewedTracks().subscribe((resp) => {
      if (resp.status == 200) {
        this.spinner.hide();
        this.viewedTracks = resp.body.data;
        // Sort it in reverse chronological order (see below)
        this.viewedTracks.sort(function(a,b) {return b.date - a.date})
        // Add up to 20 viewed tracks on initial page load (see below)
        this.addChunk();
      } else {
        console.log('There was a problem getting viewed track history: ' + resp.status);
      }
    });
  }


  /*
    Viewed Tracks card content loads dynamically as the user scrolls down
    20 tracks load initially, then user has to scroll to load 20 more, and so on
    A real world user might have hundreds or thousands of viewed tracks
    Will often be looking for something they saw 10 minutes ago rather than 2 weeks ago
    So save resources from loading them all at once
  */
  public onWindowScroll(): void {
    // If the container hasn't loaded yet, then don't add things to it
    const viewedTracksContainer = document.getElementById('viewed-tracks-container') as HTMLElement;
    if (!viewedTracksContainer) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
    const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // Make user scroll to very near the bottom of page before adding another chunk of track history  
    if (scrollTop + clientHeight >= scrollHeight - 5)
      this.addChunk();

  }


  private addChunk(): void {
    const chunk = this.viewedTracks.slice(this.histIndex, this.histIndex + 20);
    for (const track of chunk)
      this.tracksChunk.push(track);

    this.histIndex += 20;
  }
}
