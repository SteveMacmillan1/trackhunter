// Model for all data requests with the TrackHunter web server
// (and a few odds and ends)

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})

export class TrackService {


  constructor(private https: HttpClient) {}
  // Angular HTTPClient automatically uses SSL/TLS when the passed URL uses https://


  public getRecTracks(seedTrackId: string, popularity: string): Observable<any> {
    const body = {
      seedTrackId: seedTrackId,
      popularity: popularity
    }
    return this.https.post<any>(this.getSiteUrl() + '/get-result-tracks', body, 
      {headers: { 'Content-type': 'application/json' },
      responseType: 'json',
      observe: 'response' 
      });
  }


  public getSeedTracks(query: string): Observable<any> {
    const body = { query: query };
    return this.https.post<any>(this.getSiteUrl() + '/get-seed-tracks', body, 
      {headers: { 'Content-type': 'application/json' },
      responseType: 'json',
      observe: 'response'
      });
  }


  public getBookmarkedTracks(): Observable<any> {
    return this.https.get<any>(this.getSiteUrl() + '/get-bookmarked-tracks',
      {headers: { 'Content-type': 'application/json' },
      responseType: 'json',
      observe: 'response'
      });
  }


  public getViewedTracks(): Observable<any> {
    return this.https.get<any>(this.getSiteUrl() + '/get-viewed-tracks',
      {headers: { 'Content-Type': 'application/json' },
      responseType: 'json',
      observe: 'response'
      });
  }


  public getBannedArtists(): Observable<any> {
    return this.https.get<any>(this.getSiteUrl() + '/get-banned-artists',
      {headers: { 'Content-type': 'application/json' },
      responseType: 'json',
      observe: 'response'
      });
  }


  public resetViewedTracks(): Observable<any> {
    const body = {};
    return this.https.post<any>(this.getSiteUrl() + '/reset-viewed-tracks', body,
      {headers: { 'Content-type': 'application/json' },
      responseType: 'json',
      observe: 'response'
      });
  }


  public unbanArtist(userId: string, artistId: string): Observable<any> {
    const body = {
      userId: userId,
      artistId: artistId
    }
    return this.https.post<any>(this.getSiteUrl() + '/add-remove-ban', body, 
      {headers: { 'Content-Type': 'application/json' },
      responseType: 'json',
      observe: 'response' 
      });
  }


  public addRemoveBan(artistId: string): Observable<any> {
    const body = { artistId: artistId }
    return this.https.post<any>(this.getSiteUrl() + '/add-remove-ban', body, 
      {headers: { 'Content-Type': 'application/json' },
      responseType: 'json',
      observe: 'response' 
      });
  }


  public addRemoveBookmark(artistId: string, trackId: string): Observable<any> {
    const body = {
      artistId: artistId,
      trackId: trackId
    }
    return this.https.post<any>(this.getSiteUrl() + '/add-remove-bookmark', body, 
      {headers: { 'Content-Type': 'application/json' },
      responseType: 'json',
      observe: 'response'
      });
  }


  public isBookmarked(trackId: string): Observable<any> {
    return this.https.get<any>(this.getSiteUrl() + '/is-bookmarked?trackId=' + trackId);
  }


  public exportTracks(playlistName: string): Observable<any> {
    const body = { playlistName: playlistName }
    return this.https.post<any>(this.getSiteUrl() + '/export-bookmarked-tracks', body, 
      {headers: { 'Content-type': 'application/json' },
      responseType: 'json',
      observe: 'response'
      });
  }



  // Odds and ends

  public trimTrackField(field: string | null | undefined, maxLen: number): string {
    if (!field)
      return '';
    // Truncate song title 'gracefully'
    // i.e. don't split words, truncate at last space before limit
    var trimmedField: string = field.substring(0, maxLen);
    if (trimmedField.length == maxLen) {
      var lastSpaceIdx = 70;
      for (var i = maxLen - 1; i >= 0; i--) {
        if (trimmedField[i] == ' ') {
          lastSpaceIdx = i;
          break;
        }
      }
      trimmedField = trimmedField.substring(0, lastSpaceIdx);
      trimmedField += ' ...';
    }
    return trimmedField;
  }


  public getSiteUrl(): string {
    // return 'https://127.0.0.1';
    return 'https://trackhunter-production.up.railway.app';
  }
}
