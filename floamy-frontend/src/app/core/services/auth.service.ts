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

const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  administrador: {
    dashboard: true, marketing: true, coupons: true, pos: true, orders: true, cash_register: true,
    products: true, catalog_options: true, inventory: true, purchases: true,
    movements: true, suppliers: true, clients: true, users: true, roles: true, reviews: true
  },
  empleado: {
    dashboard: false, marketing: false, coupons: false, pos: true, orders: true, cash_register: true,
    products: true, catalog_options: false, inventory: true, purchases: false,
    movements: false, suppliers: false, clients: true, users: false, roles: false, reviews: true
  },
  cocina: {
    dashboard: false, marketing: false, coupons: false, pos: false, orders: true, cash_register: false,
    products: true, catalog_options: false, inventory: true, purchases: false,
    movements: true, suppliers: false, clients: false, users: false, roles: false, reviews: false
  },
  cliente: {
    dashboard: false, marketing: false, coupons: false, pos: false, orders: true, cash_register: false,
    products: true, catalog_options: false, inventory: false, purchases: false,
    movements: false, suppliers: false, clients: false, users: false, roles: false, reviews: true
  }
};

const ADMIN_ROUTE_ORDER: Array<{ key: string; route: string }> = [
  { key: 'dashboard', route: '/admin/resumen' },
  { key: 'coupons', route: '/admin/cupones' },
  { key: 'marketing', route: '/admin/marketing' },
  { key: 'pos', route: '/admin/pos' },
  { key: 'orders', route: '/admin/pedidos' },
  { key: 'cash_register', route: '/admin/corte-caja' },
  { key: 'products', route: '/admin/productos' },
  { key: 'catalog_options', route: '/admin/tamanos' },
  { key: 'inventory', route: '/admin/inventario' },
  { key: 'purchases', route: '/admin/compras' },
  { key: 'movements', route: '/admin/movimientos' },
  { key: 'suppliers', route: '/admin/proveedores' },
  { key: 'clients', route: '/admin/clientes' },
  { key: 'users', route: '/admin/usuarios' },
  { key: 'roles', route: '/admin/roles' },
  { key: 'reviews', route: '/admin/resenas' }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<AuthUser | null>(this.readStoredUser());

  private isJwtValid(token: string | null): boolean {
    if (!token) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  private readStoredUser(): AuthUser | null {
    try {
      const token = localStorage.getItem('floamy_token');
      const raw = localStorage.getItem('floamy_user');
      if (!raw || !this.isJwtValid(token)) {
        localStorage.removeItem('floamy_token');
        localStorage.removeItem('floamy_user');
        return null;
      }
      return JSON.parse(raw);
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

  hasPermission(key: string): boolean {
    const user = this.currentUser();
    if (!user) return false;
    if (user.permisos && typeof user.permisos[key] === 'boolean') {
      return user.permisos[key];
    }
    const roleKey = (user.rol || '').trim().toLowerCase();
    return !!DEFAULT_ROLE_PERMISSIONS[roleKey]?.[key];
  }

  getDefaultAdminRoute(): string {
    const firstAllowed = ADMIN_ROUTE_ORDER.find((item) => this.hasPermission(item.key));
    return firstAllowed ? firstAllowed.route : '/';
  }

  updateCurrentUserPermissions(roleName: string, permisos: Record<string, boolean>) {
    const user = this.currentUser();
    if (!user) return;
    if ((user.rol || '').trim().toLowerCase() === roleName.trim().toLowerCase()) {
      this.persistSession({ ...user, permisos: { ...permisos } });
    }
  }

  login(correo: string, password: string, portal?: string) {
    return this.http.post<AuthUser>(`${this.baseUrl}/login`, { correo, password, portal }).pipe(
      switchMap((user) => {
        const isClient = (user.rol || '').trim().toLowerCase() === 'cliente';
        if (portal === 'admin' && isClient) {
          return throwError(() => ({
            error: { error: 'Esta cuenta es de cliente. Usa "Ingresar / Registrarme" en la tienda.' }
          }));
        }
        this.persistSession(user);
        return of(user);
      })
    );
  }

  registerClient(payload: {
    nombre: string;
    correo: string;
    telefono?: string;
    password: string;
    edad?: number | null;
    genero?: string;
    zona?: string;
  }) {
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