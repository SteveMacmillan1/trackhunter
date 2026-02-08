import { Component } from '@angular/core';
import { TrackService } from '../../../services/track.service';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-bookmarked-tracks',
  templateUrl: './bookmarked-tracks.component.html',
  styleUrl: './bookmarked-tracks.component.css'
})
export class BookmarkedTracksComponent {

  exportForm = new FormGroup({
    playlistName: new FormControl(''),
    spotifyUserId: new FormControl(''),
    spotifyPassword: new FormControl('')
  })

  bookmarkedTracks: any[] = [];
  permissionCode: string;
  permissionError: string;
  bookmarkIcon = faBookmark;
  loaded: boolean = false;


  constructor(private trackService: TrackService, 
              private http: HttpClient, 
              private route: ActivatedRoute,
              private spinner: NgxSpinnerService) {}


  ngOnInit() {
    // Show loading animation until response is received
    this.spinner.show();
    this.trackService.getBookmarkedTracks().subscribe((resp) => {
      if (resp.status == 200) {
        this.bookmarkedTracks = resp.body.data;
        console.log(this.bookmarkedTracks)
        this.spinner.hide();
        this.loaded = true;
      } else {
        console.log('There was a problem getting bookmarked tracks: ' + resp.status);
      }
    })
    /*
      permissionCode & permissionError indicate whether user has granted TrackHunter 
      permissions to their Spotify account.
      After granting (or declining) through Spotify login/approval pages, they are 
      redirected back to this page.

      So these are important for showing the right UI state in the template:
          'Add app permissions' button (initial page load)   or   
          'Add app permissions' button with valiadtion msg (user declined permissions)  or
          'Export' to Spotify button (user granted permissions)
    */
    this.permissionCode = this.route.snapshot.queryParams['code'] ?? '';
    this.permissionError = this.route.snapshot.queryParams['error'] ?? '';
    if (this.permissionCode) {
      // If success code received, upgrade the Spotify access token to include
      // the user's granted permission
      this.authSpotifyAcc(this.permissionCode).subscribe();
    }
  }


  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userEmail');
  }


  isLoaded(): boolean {
    return this.loaded;
  }


  closeBubble() {
    document.getElementById('alert-bubble')?.style.setProperty('display', 'none');
    document.getElementById('alert-bubble-underlay')?.style.setProperty('display', 'none');
  }


  public exportTracksSubmit(): void {
    const playlistName = this.exportForm.value.playlistName!;
    this.trackService.exportTracks(playlistName).subscribe((resp) => {
      if (resp.status == 200) {
        /* 
          Bookmarked tracks get deleted from user's TrackHunter account 
          after they're exported to Spotify.
          So reinitialize page to reflect its new data state
        */
        this.ngOnInit();
        this.exportForm.get('playlistName')?.reset();

        const p = document.getElementById('p-export-success') as HTMLElement;
        p.style.visibility = 'visible';
      } else {
        console.log('There was a problem exporting tracks to Spotify account: ' + resp.status);
      }
    });
  }
  

  private authSpotifyAcc(permissionCode): Observable<any> {
    const body = { permissionCode: permissionCode }
    return this.http.post<any>(
      this.trackService.getSiteUrl() + '/auth-spotify-acc', body, 
      {headers: { 'Content-type': 'application/json' },
        responseType: 'json',
        observe: 'response'
      });
  }


  public addPermissions(): void {
      window.location.replace(this.trackService.getSiteUrl() + '/get-spotify-permissions');
  }

  public showAlertBubble(): void {
    const underlay = document.getElementById('alert-bubble-underlay') as HTMLElement;
    const alertBubble = document.getElementById('alert-bubble') as HTMLElement;
    underlay.style.display = 'block';
    alertBubble.style.display = 'block';
  }

  /* 

  // Remove src for all tracks except the one playing
  onPlay(playingTrack) {
    const players = Array.from(document.getElementsByTagName('audio'));
    for (const player of players) {
      if (player.id !== ('audio-' + playingTrack.trackId))
        player.src = '';
    }
  }

  // Readd src for all tracks except the one that was just playing
  onPauseStop(playingTrack) {
    const players = Array.from(document.getElementsByTagName('audio'));
    for (const player of players) {
      for (const bookmarkedTrack of this.bookmarkedTracks) {
        if (player.id == ('audio-' + bookmarkedTrack.trackId))
          player.src = bookmarkedTrack.trackPreviewUrl;
      }
    }
  }
    
  */
}
