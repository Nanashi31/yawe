import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost/api'; // Assuming the same base URL

  constructor(private http: HttpClient) { }

  createRequest(requestData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // The backend already has a POST /api/solicitudes route from the apiResource
    return this.http.post(`${this.apiUrl}/solicitudes`, requestData, {
      headers,
      withCredentials: true 
    });
  }
}
