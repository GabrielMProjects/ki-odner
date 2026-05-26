import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;

  currentUser = signal<Customer | null>(null);
  isLoggedIn = signal(false);

  constructor(private http: HttpClient, private router: Router) {
    this.checkSession();
  }

  checkSession(): void {
    this.http.get<{ customer: Customer | null }>(`${this.api}/customer/me`, { withCredentials: true })
      .subscribe({
        next: res => {
          this.currentUser.set(res.customer);
          this.isLoggedIn.set(!!res.customer);
        },
        error: () => {
          this.currentUser.set(null);
          this.isLoggedIn.set(false);
        }
      });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/customer/login`, { email, password }, { withCredentials: true }).pipe(
      tap(() => this.checkSession())
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<{ customer: Customer }>(`${this.api}/customer/register`, data, { withCredentials: true }).pipe(
      tap(res => {
        this.currentUser.set(res.customer);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.api}/customer/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        // Auch bei Server-Fehler lokal ausloggen
        this.currentUser.set(null);
        this.isLoggedIn.set(false);
        this.router.navigate(['/']);
      }
    });
  }
}
