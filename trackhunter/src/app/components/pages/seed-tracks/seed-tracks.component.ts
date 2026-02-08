import { Component, ChangeDetectorRef } from '@angular/core';
import { TrackService } from '../../../services/track.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-seed-tracks',
  templateUrl: './seed-tracks.component.html',
  styleUrl: './seed-tracks.component.css'
})
export class SeedTracksComponent {

  tracks: any;
  popularity: string = '50';
  selectedTrackId: string | null = null;
  searchSubmitted: boolean = false;
  loaded: boolean = false;
  validResults: boolean = false;


  constructor (private trackService: TrackService, 
                private spinner: NgxSpinnerService,
                private cdRef: ChangeDetectorRef) {}


  ngOnInit() {}


  public isLoaded(): boolean {
    return this.loaded;
  }


  public isSearchSubmitted(): boolean {
    // Used to prevent any validation msg before user submits
    return this.searchSubmitted;
  }


  public hasResults(): boolean {
    // Used to control the 'no results found' error msg
    return this.tracks.length > 0;
  }


   public onPopularityChange(): void {
    const popularitySlider = document.getElementById('popularity-slider') as HTMLInputElement;
    this.popularity = popularitySlider.value;
  }


  public onClickMagGlass(event: MouseEvent) {
    const searchFieldText = document.getElementById('search-field') as HTMLInputElement;
    const clickOffset = searchFieldText.offsetWidth - event.clientX;

    if ((event.target as HTMLElement).id === 'search' && 
      clickOffset < -210 && searchFieldText.value)
        this.submitSearch();
  }


  public submitSearch(): void {
    const searchField = document.getElementById('search-field') as HTMLInputElement;
    const searchDiv = document.getElementById('search-div') as HTMLElement;
    const spinnerDiv = document.getElementById('spinner-div') as HTMLElement;

    if (searchField.value) {
      // Query is valid (not empty), so hide search field & show loading spinner 
      const query = searchField.value;
      this.searchSubmitted = true;
      searchDiv.classList.remove('slide-fade-in');
      searchDiv.classList.add('slide-fade-out');
      this.spinner.show();

      this.trackService.getSeedTracks(query).subscribe((resp) => {
        if (resp.status == 200) {
          // Response received, hide loading spinner
          this.spinner.hide();
          this.loaded = true;
          this.tracks = resp.body.data.tracks.items;
          console.log(this.tracks)
          spinnerDiv.style.display = 'none';
          searchDiv.style.display = 'none'; 
          // Hide searchDiv here so its fade-out animation fully plays earlier
        } else {
          console.log('There was a problem getting seed tracks: ' + resp.status);
        }
      });
    }
  }


  public selectTrack(track): void {
    // Apply grey highlight bg to selected track card
    const selectedSeedDiv = document.getElementById('seed-div-' + track.id);
    selectedSeedDiv?.classList.remove('bg-not-selected');
    selectedSeedDiv?.classList.add('bg-selected');
    void selectedSeedDiv?.offsetWidth;  // Forces DOM reflow

    this.selectedTrackId = track.id;
    this.cdRef.detectChanges();   // Force Angular re-detection

    for (let i=0; i < this.tracks.length; i++) {
        // Unselected tracks: slide-out, then remove from DOM after animation finishes
        if (this.tracks[i].id != this.selectedTrackId) {
          const unselectedTrack = document.getElementById('seed-div-' + this.tracks[i].id);
          
          if (unselectedTrack) {
            void unselectedTrack.offsetWidth;
            unselectedTrack.classList.add('slide-fade-out');
            unselectedTrack.addEventListener('animationend', () => {
              unselectedTrack.style.display = 'none'
            });
          }

        /* 
          Selected track: slide-up to top of container
          The slide-up distance depends on which seed track was clicked
          They're displayed on page from tracks[i].id in top-to-bottom order
          When i == 0, it's already the top card, so doesn't need to slide-up
          When i == 1, it needs to move up one 'spot' to where card 0 was
        */
        } else {
          switch (i) {
            case 0:
              // Since the first card doesn't move / doesn't have an animation,
              // a dummy is used to trigger the animationend callback
              selectedSeedDiv?.classList.add('dummyAnimation');
              break;
            case 1:
              selectedSeedDiv?.classList.add('slide-card-up-one-spot');
              break;
            case 2:
              selectedSeedDiv?.classList.add('slide-card-up-two-spots');
              break;
          }
        }
      }
      const imLookingForDiv = document.getElementById('im-looking-for-div');
      const popularityDiv = document.getElementById('popularity-div');
      const submitDiv = document.getElementById('submit-div');

      this.cdRef.detectChanges();         // Force Angular re-detection
      void popularityDiv?.offsetWidth;    // Force DOM reflow

      setTimeout(() => {
        // The card was selected & slid-upwards to top of container
        // Now there's room to show the next set of form controls
        imLookingForDiv?.style.setProperty('display', 'block');
        popularityDiv?.classList.add('slide-fade-in');
        submitDiv?.classList.add('slide-fade-in');
      }, 800);
  }
}

