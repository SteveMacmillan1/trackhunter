import { Component, Input, inject } from '@angular/core';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSaved } from '@fortawesome/free-solid-svg-icons';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { TrackService } from 'src/app/services/track.service';
import { Track, EMPTY_TRACK } from '../../../models/models.track';

@Component({
  selector: 'app-recommended-track-card',
  templateUrl: './recommended-track-card.component.html',
  styleUrl: './recommended-track-card.component.css'
})
export class RecommendedTrackCardComponent {

@Input() track: Track = EMPTY_TRACK;
  // @Output() onPlayEmitter: EventEmitter<any> = new EventEmitter();
  // @Output() onPauseStopEmitter: EventEmitter<any> = new EventEmitter();
  route: ActivatedRoute = inject(ActivatedRoute);
  bookmarkIcon = faBookmark;
  bookmarked: boolean = false;            // Reflects db state
  bookmarkIconClicked: boolean = false;   // Used for hover state
  banIcon = faBan;
  banned: boolean = false;
  truncTrackName: string;
  truncArtistName: string;

  
  constructor(private trackService: TrackService) {}


  ngOnInit() {
    // Truncates song titles 'gracefully' i.e. doesn't split words
    this.truncTrackName = this.trackService.trimTrackField(this.track?.trackName, 70);
    this.truncArtistName = this.trackService.trimTrackField(this.track?.artistName, 38);
    // this.truncAlbumName = this.trackService.trimTrackField(this.track.albumName, 38);
  }


  public isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userId');
  }


  public isBookmarked(): boolean {
    return this.bookmarked;
  }


  private isBookmarkIconClicked(): boolean {
    return this.bookmarkIconClicked;
  }


  public isBanned(): boolean {
    return this.banned;
  }


  public hasAllFields(): boolean {
    return Boolean(this.truncTrackName && this.truncArtistName && this.track.albumImgUrl);
    // Used to filter track cards without full data
    // albumName deprecated from card
  }


  public hoverArtistName(): void {
    const id = this.track.trackId;
    const artistName = document.getElementById('artist-name-' + id);
    if (this.isLoggedIn()) {
      if (this.isBanned()) {
        artistName?.style.setProperty('textDecoration', 'none');
        artistName?.style.setProperty('color', '#e8e6e3');
      } else {
        artistName?.style.setProperty('textDecoration', 'line-through');
        artistName?.style.setProperty('color', '#fa3939');
      }
    }
  }


  public unhoverArtistName(): void {
    const id = this.track.trackId;
    const artistName = <HTMLElement | null> document.getElementById('artist-name-' + id);

    if (this.isLoggedIn()) {
      if (this.isBanned()) {
        artistName?.style.setProperty('textDecoration', 'line-through');
        artistName?.style.setProperty('color', '#fa3939');
      } else {
        artistName?.style.setProperty('textDecoration', 'none');
        artistName?.style.setProperty('color', '#e8e6e3');
      }
    }
  }


  public hoverBookmarkIcon(): void {
    if (!this.isBookmarkIconClicked()) {
      const id = this.track.trackId;
      const bookmarkIcon = <HTMLElement | null> document.getElementById('bookmark-icon-' + id);
      this.bookmarkIcon = faBookmarkSaved;
      bookmarkIcon?.style.setProperty('opacity', '0.7');
    }
  }


  public unhoverBookmarkIcon(): void {
      const id = this.track.trackId;
      const bookmarkIcon = <HTMLElement | null> document.getElementById('bookmark-icon-' + id);
      bookmarkIcon?.style.setProperty('opacity', '1');
      this.bookmarkIcon = (this.isBookmarked()) ? faBookmarkSaved : faBookmark;
      this.bookmarkIconClicked = false;
  }

  /*
    Clicking bookmarkIcon immediately changes its visual state. So doesn't wait for 2xx OK, very clunky feel to do so
    In very small number of cases, server might respond with 5xx error
    If it does, undo the onClick icon change to reflect adding/removing bookmark was not successful
  */
  public bookmarkTrack(): void {
    if (this.isLoggedIn()) {
      this.bookmarked = !this.bookmarked;
      this.bookmarkIconClicked = !this.bookmarkIconClicked;
      var id = this.track.trackId;
      let tooltip = (this.isBookmarked()) ? 'Remove from Bookmarked List' : 'Add to Bookmarked List';
      const icon = <HTMLElement | null> document.getElementById('bookmark-icon-' + id);
      icon?.setAttribute('title', tooltip);
      icon?.style.setProperty('opacity', '1');
      this.bookmarkIcon = (this.isBookmarked()) ? faBookmarkSaved : faBookmark;

      this.trackService.addRemoveBookmark(this.track.artistId, this.track.trackId).subscribe({
        next: (resp) => {
          // Don't change UI on resp success, everything's fine
        },
        error: (err) => {
          // There was an error, so undo the onClick icon change
          this.bookmarked = !this.bookmarked;
          this.bookmarkIcon = (this.isBookmarked()) ? faBookmarkSaved : faBookmark;
          let tooltip = (this.isBookmarked()) ? 'Remove from Bookmarked List' : 'Add to Bookmarked List';
          icon?.setAttribute('title', tooltip);
          console.log('There was a problem bookmarking (or unbookmarking) a track: ' + err.status);
        }
      });
    }
    
  }

   /*
    Clicking bookmarkIcon immediately changes its visual state. So doesn't wait for 2xx OK, very clunky feel to do so
    In very small number of cases, server might respond with 5xx error
    If it does, undo the onClick icon change to reflect adding/removing bookmark was not successful
  */
  public banArtist(): void {
    if (this.isLoggedIn()) {
      this.banned = !this.banned;
      var id = this.track.trackId;
      var artistName = document.getElementById('artist-name-' + id);
      var banIcon = document.getElementById('ban-icon-' + id);
      if (this.isBanned()) {
        // Make several visible style changes when artist is banned 
        artistName?.style.setProperty('textDecoration', 'line-through');
        artistName?.style.setProperty('color', '#fa3939');
        artistName?.setAttribute('title', this.getBanArtistTooltip());
        banIcon?.style.setProperty('display', 'inline');
      } else {
        // Return to site's standard font style when artist is unbanned
        artistName?.style.setProperty('textDecoration', 'none');
        artistName?.style.setProperty('color', '#e8e6e3');
        artistName?.setAttribute('title', this.getBanArtistTooltip());
        banIcon?.style.setProperty('display', 'none');
        this.unhoverArtistName();
      }

      this.trackService.addRemoveBan(this.track.artistId).subscribe({
        next: (resp) => {

        },
        error: (err) => {
          this.banned = !this.banned;
          if (this.isBanned()) {
            // Make several visible style changes when artist is banned 
            artistName?.style.setProperty('textDecoration', 'line-through');
            artistName?.style.setProperty('color', '#fa3939');
            artistName?.setAttribute('title', this.getBanArtistTooltip());
            banIcon?.style.setProperty('display', 'inline');
          } else {
            // Return to site's standard font style when artist is unbanned
            artistName?.style.setProperty('textDecoration', 'none');
            artistName?.style.setProperty('color', '#e8e6e3');
            artistName?.setAttribute('title', this.getBanArtistTooltip());
            banIcon?.style.setProperty('display', 'none');
            this.unhoverArtistName();
          }
          console.log('There was a problem banning (or unbanning) an artist: ' + err.status);
        }
      });
    }
  }


  public getBanArtistTooltip(): string {
    /* 
      Banning artist only supported while logged in
      So don't show a tooltip while logged out
      (Empty string won't generate a tooltip, .title property doesn't support null)
    */
    if (!this.isLoggedIn())
      return '';
    else if (this.isLoggedIn() && this.banned)
      return 'Click to restore Artist to Future Results';
    else 
      return 'Click to ban Artist from Future Results';
  }

}

