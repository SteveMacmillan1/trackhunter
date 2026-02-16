import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TrackService } from '../../../services/track.service';

@Component({
  selector: 'app-seed-track-card',
  templateUrl: './seed-track-card.component.html',
  styleUrl: './seed-track-card.component.css'
})
export class SeedTrackCardComponent {

  @Input() track: any;
  @Output() onSelectTrack: EventEmitter<any> = new EventEmitter();
  selected: boolean = false;
  truncTrackName: string;
  truncArtistName: string;
  // truncAlbumName: string;


  constructor(private trackService: TrackService) {}


  ngOnInit() {
    // Truncate fields "gracefully"
    // i.e. don't split words, truncate at last space before limit
    this.truncTrackName = this.trackService.trimTrackField(this.track?.name, 70);
    this.truncArtistName = this.trackService.trimTrackField(this.track?.album?.artists[0]?.name, 38);
    // this.truncAlbumName = this.trackService.trimTrackField(this.track.album.name, 38);
  }


  public onSelect(track:any): void {
    this.onSelectTrack.emit(track);
  }

  
  public hasAllFields(): boolean {
    // Filters track cards missing any required field
    // (albumName deprecated from this card)
    return this.truncTrackName && this.truncArtistName && this.track.album.images[1].url;
  }


  // Prevent "View on Spotify" click from selecting the seed track as well
  public stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}

