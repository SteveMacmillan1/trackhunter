import { Component } from '@angular/core';
import { TrackService } from '../../../services/track.service';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-banned-artists',
  templateUrl: './banned-artists.component.html',
  styleUrl: './banned-artists.component.css'
})
export class BannedArtistsComponent {
  bannedArtists: any[];
  banIcon = faBan;


  constructor(private trackService: TrackService, private spinner: NgxSpinnerService) {}
  

  ngOnInit() {
    // "Loading" animation runs until resp received
    this.spinner.show();
    this.trackService.getBannedArtists().subscribe((resp) => {
      if (resp.status == 200) {
        this.spinner.hide();
        this.bannedArtists = resp.body.data;
        
        // Sort the banned artists alphabetically
          // https://www.w3schools.com/js/js_array_sort.asp
        this.bannedArtists.sort(function (a,b) {
          let x = a.artistName.toLowerCase();
          let y = b.artistName.toLowerCase();
          if (x < y) return -1;
          if (x > y) return 1;
          return 0;
        });
      } else {
        console.log('There was a problem retrieving banned artists: ' + resp.status);
      }
    });
  }
}

