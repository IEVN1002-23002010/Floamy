import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgFor, NgIf } from '@angular/common';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../core/services/auth.service';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';

interface RoleCard {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: Record<string, boolean>;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [NgFor, NgIf, PageTitleComponent],
  template: `
    <app-page-title
      eyebrow="SEGURIDAD Y ACCESOS"
      title="Roles y permisos"
      subtitle="Activa o desactiva los módulos disponibles para cada perfil." />

    <div *ngIf="savedBanner()"
         role="alert"
         class="mb-5 p-3 text-xs font-semibold text-emerald-800 rounded-xl bg-emerald-50 border border-emerald-200">
      {{ savedBanner() }}
    </div>

    <div *ngIf="errorBanner()"
         role="alert"
         class="mb-5 p-3 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
      {{ errorBanner() }}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <article *ngFor="let role of roles()"
               class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-5">
        <div>
          <div class="flex items-center justify-between gap-2">
            <h2 class="text-lg font-bold text-[#011640]">{{ role.nombre }}</h2>
            <span class="bg-[#dff0f7] text-[#011640] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Perfil
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1 mb-5">{{ role.descripcion }}</p>

          <div class="divide-y divide-slate-100">
            <label *ngFor="let perm of permissionList"
                   class="py-2.5 flex items-center justify-between gap-3 cursor-pointer select-none">
              <span class="text-xs font-medium text-[#011640]">{{ perm.label }}</span>

              <span class="relative inline-flex items-center shrink-0">
                <input type="checkbox"
                       class="sr-only peer"
                       [checked]="!!role.permisos[perm.key]"
                       (change)="togglePerm(role, perm.key)" />
                <span class="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#011640] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></span>
              </span>
            </label>
          </div>
        </div>

        <button type="button"
                [disabled]="savingId() === role.id"
                (click)="saveRole(role)"
                class="w-full py-3 px-4 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl disabled:opacity-50 transition">
          {{ savingId() === role.id ? 'Guardando...' : 'Guardar cambios' }}
        </button>
      </article>
    </div>
  `
})
export class RolesComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private url = `${environment.apiUrl}/roles`;

  roles = signal<RoleCard[]>([]);
  savingId = signal<number | null>(null);
  savedBanner = signal('');
  errorBanner = signal('');

  permissionList = [
    { key: 'dashboard', label: 'Dashboard ejecutivo' },
    { key: 'pos', label: 'Punto de venta (POS)' },
    { key: 'orders', label: 'Seguimiento de pedidos' },
    { key: 'cash_register', label: 'Corte de caja' },
    { key: 'products', label: 'Catálogo de productos' },
    { key: 'catalog_options', label: 'Tamaños y toppings' },
    { key: 'inventory', label: 'Inventario de insumos' },
    { key: 'movements', label: 'Movimientos y mermas' },
    { key: 'suppliers', label: 'Gestión de proveedores' },
    { key: 'clients', label: 'Gestión de clientes' },
    { key: 'users', label: 'Usuarios internos' },
    { key: 'roles', label: 'Roles y permisos' },
    { key: 'reviews', label: 'Reseñas y respuestas' },
  ];

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.errorBanner.set('');
    this.http.get<RoleCard[]>(`${this.url}/`).subscribe({
      next: (list) => this.roles.set(list),
      error: (err) => {
        this.errorBanner.set(err?.error?.error || 'No se pudieron cargar los roles. Verifica que Flask esté activo.');
      }
    });
  }

  togglePerm(role: RoleCard, key: string) {
    this.savedBanner.set('');
    this.errorBanner.set('');
    this.roles.update((list) =>
      list.map((r) =>
        r.id === role.id
          ? { ...r, permisos: { ...r.permisos, [key]: !r.permisos[key] } }
          : r
      )
    );
  }

  saveRole(role: RoleCard) {
    this.savingId.set(role.id);
    this.savedBanner.set('');
    this.errorBanner.set('');

    this.http.put(`${this.url}/${role.id}`, { permisos: role.permisos }).subscribe({
      next: () => {
        this.savingId.set(null);
        this.auth.updateCurrentUserPermissions(role.nombre, role.permisos);
        this.savedBanner.set(`Permisos de "${role.nombre}" guardados correctamente.`);
      },
      error: (err) => {
        this.savingId.set(null);
        this.errorBanner.set(err?.error?.error || 'Error al guardar los permisos en el servidor.');
      },
    });
  }
}