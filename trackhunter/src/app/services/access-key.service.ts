import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccessKeyService {
  accessToken: string;

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    this.reqAccessToken().subscribe((resp) => {
      this.accessToken = resp.access_token;
    });
  }

  reqAccessToken(): Observable<any> {
    const apiUrl = 'https://accounts.spotify.com/api/token?grant_type=client_credentials&client_id=26403ee1192e4a589f5e2c9295581ca3&client_secret=65724c7fed9f4e86ad2576950722da0a';
    return this.httpClient.get<any>(apiUrl, {headers: { ["Content-type"]: "application/x-www-form-urlencoded" }});
  }

  getAccessToken() {
    return this.accessToken;
  }
}
