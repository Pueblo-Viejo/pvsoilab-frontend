import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export type AuthUser = {
  id: string | null;
  name: string;
  username: string;
  email: string;
  userLevel: number | null;
  status: number | null;
  imageUrl?: string | null;
};

type AuthResponse = {
  authenticated: boolean;
  user?: AuthUser;
  message?: string;
  token?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth.php`;
  private readonly tokenKey = 'pvsoilab_auth_token';

  readonly user = signal<AuthUser | null>(null);
  readonly checkedSession = signal(false);

  login(username: string, password: string): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(
        `${this.authUrl}?action=login`,
        { username, password },
        { withCredentials: true }
      )
      .pipe(
        map((response) => this.saveSession(response)),
        tap((user) => {
          this.user.set(user);
          this.checkedSession.set(true);
        }),
        catchError((error) => throwError(() => this.getErrorMessage(error)))
      );
  }

  register(payload: { name: string; username: string; email: string; password: string }): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${this.authUrl}?action=register`, payload, { withCredentials: true })
      .pipe(
        map((response) => this.saveSession(response)),
        tap((user) => {
          this.user.set(user);
          this.checkedSession.set(true);
        }),
        catchError((error) => throwError(() => this.getErrorMessage(error)))
      );
  }

  me(): Observable<AuthUser | null> {
    return this.http
      .get<AuthResponse>(`${this.authUrl}?action=me`, {
        withCredentials: true,
        headers: this.authHeaders(),
      })
      .pipe(
        map((response) => (response.authenticated && response.user ? this.saveSession(response) : null)),
        tap((user) => {
          this.user.set(user);
          this.checkedSession.set(true);
        }),
        catchError(() => {
          this.user.set(null);
          this.checkedSession.set(true);
          return of(null);
        })
      );
  }

  logout(): Observable<void> {
    return this.http
      .get<{ ok: boolean }>(`${this.authUrl}?action=logout`, { withCredentials: true })
      .pipe(
        map(() => undefined),
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of(undefined);
        })
      );
  }

  private authHeaders(): Record<string, string> {
    const token = localStorage.getItem(this.tokenKey);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private saveSession(response: AuthResponse): AuthUser {
    if (!response.authenticated || !response.user) {
      throw new Error(response.message || 'No pudimos completar la solicitud. Intenta de nuevo en unos momentos.');
    }

    if (response.token) {
      localStorage.setItem(this.tokenKey, response.token);
    }

    return response.user;
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    this.user.set(null);
  }

  legacyToken(): string {
    return localStorage.getItem(this.tokenKey) || '';
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error?.message === 'string') {
        return error.error.message;
      }

      if (error.status === 0) {
        return 'No pudimos completar la solicitud. Intenta de nuevo en unos momentos.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'No pudimos completar la solicitud. Intenta de nuevo en unos momentos.';
  }
}
