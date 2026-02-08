import { Component, Input } from '@angular/core';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSaved } from '@fortawesome/free-solid-svg-icons';
import { TrackService } from '../../../services/track.service';
import { Track, EMPTY_TRACK } from '../../../models/models.track';

@Component({
  selector: 'app-bookmarked-track-card',
  templateUrl: './bookmarked-track-card.component.html',
  styleUrl: './bookmarked-track-card.component.css'
})
export class BookmarkedTrackCardComponent {
  @Input() track: Track = EMPTY_TRACK;
  @Input() type: string;                  // Used to prevent bookmarkIcon from appearing
  truncTrackName: string;
  truncArtistName: string;
  // truncAlbumName: string;
  bookmarkedTracks = [];
  bookmarkIcon = faBookmarkSaved;
  bookmarked: boolean = true;             // Reflects db state
  bookmarkIconClicked: boolean = false;   // Used for hover state

  constructor(private trackService: TrackService) {}

  ngOnInit() {
    console.log(this.track)
    // Truncate song title "gracefully"
    // i.e. don't split words, truncate at last space before limit
    this.truncTrackName = this.trackService.trimTrackField(this.track?.trackName, 70);
    this.truncArtistName = this.trackService.trimTrackField(this.track?.artistName, 38);
    // this.truncAlbumName = this.trackService.trimTrackField(this.track.albumName, 38);
  }


  private isBookmarked(): boolean {
    return this.bookmarked;
  }

  private isBookmarkIconClicked(): boolean {
    return this.bookmarkIconClicked;
  }


  public onRemoveBookmark(): void {
    if (this.isBookmarked()) {
      // Change the icon from solid-filled to outline-only
      this.bookmarkIcon = faBookmark;
      this.bookmarked = false;
      this.trackService.addRemoveBookmark(this.track.artistId, this.track.trackId).subscribe({
        next: (resp) => {
          // Animate bookmarked track card off of page
          const bookmarkedTrackCard = document.getElementById(this.track.trackId);
          bookmarkedTrackCard?.classList.add('slide-fade-out-no-delay');
          // Remove from DOM once animation completes
          bookmarkedTrackCard?.addEventListener('animationend', (event) => {
            if (event.animationName == 'slide-left')
              bookmarkedTrackCard.style.display = 'none';
          });
        },

        error: (err) => {
          console.log('There was a problem unbookmarking a track: ' + err.status);
        }
      });   
    }
  }
  

  public hoverBookmarkIcon(): void {
    const id = this.track.trackId;
    const bookmarkIcon = <HTMLElement | null>document.getElementById('bookmark-icon-' + id) as HTMLElement;
    bookmarkIcon.style.opacity = '0.8';
    this.bookmarkIcon = (this.isBookmarked()) ? faBookmark : faBookmarkSaved;

    /*
      Prevent hover from 'overriding' & showing the wrong icon after user clicks it
      i.e. unbookmarked track: 
        icon starts unfilled, user hovers in, becomes filled, user clicks it,
        icon should stay filled, but it won't without this
    */
    if (this.isBookmarkIconClicked()) {
      this.bookmarkIcon = (this.isBookmarked()) ? faBookmarkSaved : faBookmark;
    }
  }


  public unhoverBookmarkIcon(): void {
      const id = this.track.trackId;
      const bookmarkIcon = <HTMLElement | null>document.getElementById('bookmark-icon-' + id) as HTMLElement;
      bookmarkIcon.style.opacity = '1';
      this.bookmarkIcon = (this.isBookmarked()) ? faBookmarkSaved : faBookmark;
      this.bookmarkIconClicked = false;
  }

  // onPlay() {
  //   this.onPlayEmitter.emit(this.track);
  // }

  // onPauseStop() {
  //   this.onPauseStopEmitter.emit(this.track);
  // }
}


