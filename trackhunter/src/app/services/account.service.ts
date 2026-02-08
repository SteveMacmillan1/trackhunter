import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { TrackService } from 'src/app/services/track.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private trackService: TrackService, private http: HttpClient) {}


  public authenticateLogin(userEmail, hashedPassword): Observable<any> {
    var body = {
      userEmail: userEmail,
      userPassword: hashedPassword
    }
    return this.http.post<any>(this.trackService.getSiteUrl() + '/process-login', body, 
      {headers: { 'Content-Type': 'application/json' },
      responseType: 'json', 
      observe: 'response' 
    });
  }


  public processRegister(userEmail, hashedPassword): Observable<any> {
    var body = {
      userEmail: userEmail,
      userPassword: hashedPassword
    }
    return this.http.post<any>(this.trackService.getSiteUrl() + '/process-register', body, 
      {headers: { 'Content-Type': 'application/json' },
      responseType: 'json',
      observe: 'response' 
    });
  }


  public logout(): Observable<any> {
    return this.http.post<any>(this.trackService.getSiteUrl() + '/process-logout', {},
      {headers: { 'Content-type': 'application/json' },
      responseType: 'json',
      observe: 'response'
      });
  }
}
