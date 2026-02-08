import { Component, Input, inject } from '@angular/core';
import { faMailReplyAll } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { TrackService } from '../../../services/track.service';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { BannedArtist, EMPTY_BANNED_ARTIST } from '../../../models/models.banned-artist';


@Component({
  selector: 'app-banned-artist-card',
  templateUrl: './banned-artist-card.component.html',
  styleUrl: './banned-artist-card.component.css'
})


export class BannedArtistCardComponent {
 @Input() bannedArtist: BannedArtist = EMPTY_BANNED_ARTIST;
  route: ActivatedRoute = inject(ActivatedRoute);
  banIcon = faBan;
  unbanIcon = faMailReplyAll;
  banned: boolean = true;
  // bannedArtists = [];
  truncArtistName: string | null = null;

  constructor(private trackService: TrackService) {}

  ngOnInit() {
    // this.trackService.getBannedArtists().subscribe((resp) => {
    //   if (resp.status == 200)
    //     this.bannedArtists = resp.body.data;
    //   else
    //     console.log('There was a problem getting data: ' + resp.status);
    // });
    // Truncates song title "gracefully" (i.e. doesn't split words etc.)
    this.truncArtistName = this.trackService.trimTrackField(this.bannedArtist.artistName!, 38);
  }
  

  public onClickUnbanArtist(event : MouseEvent): void {
    const userId = sessionStorage.getItem('userId');
    const artistId = this.bannedArtist.artistId;

    if (!userId || !artistId) 
      return;

    this.trackService.unbanArtist(userId, artistId).subscribe({
      next: (resp) => {
        // Animate artist card off of page
        const unbannedArtistCard = document.getElementById(this.bannedArtist.artistId);
        unbannedArtistCard?.classList.add('slide-fade-out-no-delay');
        // Remove from DOM once completed
        unbannedArtistCard?.addEventListener('animationend', (event) => {
          if (event.animationName == 'slide-left')
            unbannedArtistCard.style.display = 'none';     
        });
      },

      error: (err) => {
        console.log('There was a problem unbanning an artist: ' + err.status);
      }
    });
  }

}

