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
};

type AuthResponse = {
  authenticated: boolean;
  user?: AuthUser;
  message?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth.php`;

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
        map((response) => {
          if (!response.authenticated || !response.user) {
            throw new Error(response.message || 'No se pudo iniciar sesion.');
          }

          return response.user;
        }),
        tap((user) => {
          this.user.set(user);
          this.checkedSession.set(true);
        }),
        catchError((error) => throwError(() => this.getErrorMessage(error)))
      );
  }

  me(): Observable<AuthUser | null> {
    return this.http
      .get<AuthResponse>(`${this.authUrl}?action=me`, { withCredentials: true })
      .pipe(
        map((response) => (response.authenticated && response.user ? response.user : null)),
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
        tap(() => this.user.set(null)),
        catchError(() => {
          this.user.set(null);
          return of(undefined);
        })
      );
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error?.message === 'string') {
        return error.error.message;
      }

      if (error.status === 0) {
        return 'No se pudo conectar con el servidor de autenticacion.';
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'No se pudo iniciar sesion.';
  }
}
