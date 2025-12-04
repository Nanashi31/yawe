import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, switchMap, of } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost';
  private apiUrl = `${this.baseUrl}/api`;
  
  // Estado de autenticación
  private _isAuthenticated = signal<boolean>(false);
  private _currentUser = signal<User | null>(null);

  public readonly isAuthenticated = this._isAuthenticated.asReadonly();
  public readonly currentUser = this._currentUser.asReadonly();

  // Método helper para el guard
  isAuthenticatedSync(): boolean {
    return this._isAuthenticated();
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar si hay sesión guardada al iniciar
    this.checkAuthStatus();
  }

  login(credentials: LoginRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.ensureCsrfCookie().pipe(
      switchMap(() =>
        this.http.post(`${this.baseUrl}/login`, credentials, {
          headers,
          withCredentials: true // Importante para cookies de sesión
        })
      ),
      tap(() => {
        this._isAuthenticated.set(true);
        // Obtener información del usuario
        this.getCurrentUser().subscribe();
      })
    );
  }

  register(data: RegisterRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.ensureCsrfCookie().pipe(
      switchMap(() =>
        this.http.post(`${this.baseUrl}/register`, data, {
          headers,
          withCredentials: true
        })
      ),
      tap(() => {
        this._isAuthenticated.set(true);
        this.getCurrentUser().subscribe();
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}, {
      withCredentials: true
    }).pipe(
      tap(() => {
        this._isAuthenticated.set(false);
        this._currentUser.set(null);
        this.router.navigate(['/login']);
      })
    );
  }

  createRequest(requestData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.ensureCsrfCookie().pipe(
      switchMap(() =>
        this.http.post(`${this.apiUrl}/solicitudes`, requestData, {
          headers,
          withCredentials: true
        })
      )
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`, {
      withCredentials: true
    }).pipe(
      tap(user => {
        this._currentUser.set(user);
        this._isAuthenticated.set(true);
      })
    );
  }

  private checkAuthStatus(): void {
    // Intentar obtener el usuario actual
    this.getCurrentUser().subscribe({
      next: () => {
        // Usuario autenticado
      },
      error: () => {
        // No autenticado
        this._isAuthenticated.set(false);
        this._currentUser.set(null);
      }
    });
  }

  private csrfInitialized = false;

  private ensureCsrfCookie(): Observable<void> {
    return this.http
      .get<void>(`${this.baseUrl}/sanctum/csrf-cookie`, {
        withCredentials: true
      })
      .pipe(
        tap(() => {
          this.csrfInitialized = true;
        })
      );
  }
}

