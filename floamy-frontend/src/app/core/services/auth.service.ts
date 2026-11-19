import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Role } from '../models/user.model';

export interface AuthUser {
  id: number;
  nombre: string;
  correo: string;
  rol: Role;
  permisos?: Record<string, boolean>;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<AuthUser | null>(this.readStoredUser());

  private readStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('floamy_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private persistSession(user: AuthUser) {
    if (user.token) {
      localStorage.setItem('floamy_token', user.token);
    }
    localStorage.setItem('floamy_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  login(correo: string, password: string, portal?: string) {
    return this.http.post<AuthUser>(`${this.baseUrl}/login`, { correo, password, portal }).pipe(
      switchMap((user) => {
        if (portal === 'admin' && user.rol === 'Cliente') {
          return throwError(() => ({
            error: { error: 'Esta cuenta es de cliente. Usa "Ingresar / Registrarme" en la tienda.' }
          }));
        }
        this.persistSession(user);
        return of(user);
      })
    );
  }

  registerClient(payload: { nombre: string; correo: string; telefono?: string; password: string }) {
    return this.http.post<AuthUser>(`${this.baseUrl}/register-client`, payload).pipe(
      tap((user) => this.persistSession(user))
    );
  }

  logout() {
    localStorage.removeItem('floamy_token');
    localStorage.removeItem('floamy_user');
    this.currentUser.set(null);
  }
}