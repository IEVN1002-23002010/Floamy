import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private usersUrl = `${environment.apiUrl}/users`;
  private rolesUrl = `${environment.apiUrl}/users/roles`;

  roles = signal<any[]>([]);

  private defaultsByRole: Record<string, Record<string, boolean>> = {
    Administrador: {
      resumen: true, punto_de_venta: true, pedidos: true, productos: true,
      inventario: true, movimientos: true, clientes: true, usuarios: true,
      roles: true, resenas: true
    },
    Empleado: {
      resumen: false, punto_de_venta: true, pedidos: true, productos: true,
      inventario: true, movimientos: false, clientes: true, usuarios: false,
      roles: false, resenas: true
    },
    Cocina: {
      resumen: false, punto_de_venta: false, pedidos: true, productos: true,
      inventario: true, movimientos: true, clientes: false, usuarios: false,
      roles: false, resenas: false
    },
    Cliente: {
      resumen: false, punto_de_venta: false, pedidos: true, productos: true,
      inventario: false, movimientos: false, clientes: false, usuarios: false,
      roles: false, resenas: true
    }
  };

  getUsers() {
    return this.http.get<any[]>(`${this.usersUrl}/`);
  }

  createUser(data: any) {
    return this.http.post(`${this.usersUrl}/`, data);
  }

  updateUser(id: number, data: { nombre: string; correo: string; rol: string; password?: string }) {
    return this.http.put(`${this.usersUrl}/${id}`, data);
  }

  toggleUser(id: number) {
    return this.http.patch(`${this.usersUrl}/${id}/toggle`, {});
  }

  getRoles() {
    return this.http.get<any[]>(this.rolesUrl).pipe(
      tap((list) => {
        const parsed = list.map((r) => {
          let perms = r.permisos;
          if (typeof perms === 'string' && perms.trim()) {
            try { perms = JSON.parse(perms); } catch { perms = null; }
          }
          const permisosMap = perms && typeof perms === 'object' && Object.keys(perms).length > 0
            ? perms
            : { ...(this.defaultsByRole[r.nombre] || {}) };
          return { ...r, permisosMap };
        });
        this.roles.set(parsed);
      })
    );
  }

  loadRoles() {
    this.getRoles().subscribe();
  }

  updateRolePermissions(roleId: number, permisos: Record<string, boolean>) {
    return this.http.put(`${this.rolesUrl}/${roleId}`, { permisos }).pipe(
      tap(() => {
        this.roles.update((list) =>
          list.map((r) => (r.id === roleId ? { ...r, permisos, permisosMap: { ...permisos } } : r))
        );
      })
    );
  }
}