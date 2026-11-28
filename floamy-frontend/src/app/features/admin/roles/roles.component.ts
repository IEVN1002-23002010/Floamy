import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

interface PermissionGroup {
  title: string;
  subtitle: string;
  items: Array<{ key: string; label: string; hint: string }>;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [NgFor, NgIf, PageTitleComponent],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <app-page-title
        eyebrow="SEGURIDAD Y ACCESOS"
        title="Roles y permisos"
        subtitle="Selecciona un perfil y define a qué secciones del panel puede entrar." />

      <button *ngIf="selectedRole() as current"
              type="button"
              [disabled]="savingId() === current.id"
              (click)="saveRole(current)"
              class="px-5 py-2.5 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl shadow-xs disabled:opacity-50 transition">
        {{ savingId() === current.id ? 'Guardando cambios...' : 'Guardar permisos de ' + current.nombre + ' ✓' }}
      </button>
    </div>

    <div *ngIf="savedBanner()"
         role="alert"
         class="mb-5 p-3.5 text-xs font-semibold text-emerald-800 rounded-xl bg-emerald-50 border border-emerald-200">
      {{ savedBanner() }}
    </div>

    <div *ngIf="errorBanner()"
         role="alert"
         class="mb-5 p-3.5 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
      {{ errorBanner() }}
    </div>

    <!-- Selector superior de roles -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      <button *ngFor="let role of roles()"
              type="button"
              (click)="selectRole(role.id)"
              [class]="selectedRole()?.id === role.id
                ? 'text-left p-4 rounded-2xl bg-[#011640] text-white border border-[#011640] shadow-sm transition-all'
                : 'text-left p-4 rounded-2xl bg-white text-[#011640] border border-slate-200 hover:border-[#6da0bf] transition-all'">
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <strong class="text-sm font-bold truncate">{{ role.nombre }}</strong>
          <span [class]="selectedRole()?.id === role.id
                  ? 'bg-white/15 text-[#7dd3fc] text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0'
                  : 'bg-[#dff0f7] text-[#011640] text-[11px] font-bold px-2.5 py-0.5 rounded-full shrink-0'">
            {{ countActive(role) }}/{{ totalPermissions }}
          </span>
        </div>
        <p [class]="selectedRole()?.id === role.id
             ? 'text-xs text-slate-300 line-clamp-2'
             : 'text-xs text-slate-500 line-clamp-2'">
          {{ role.descripcion }}
        </p>
      </button>
    </section>

    <!-- Permisos del rol seleccionado organizados en 4 grupos -->
    <section *ngIf="selectedRole() as current" class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <article *ngFor="let group of permissionGroups"
               class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-3 pb-3.5 mb-3 border-b border-slate-100">
            <div>
              <h2 class="text-sm font-bold text-[#011640]">{{ group.title }}</h2>
              <p class="text-xs text-slate-500 mt-0.5">{{ group.subtitle }}</p>
            </div>

            <button type="button"
                    (click)="toggleGroup(current, group)"
                    class="px-2.5 py-1 text-[11px] font-semibold text-[#011640] bg-slate-100 hover:bg-[#dff0f7] rounded-lg transition shrink-0">
              {{ isGroupAllActive(current, group) ? 'Quitar todos' : 'Activar todos' }}
            </button>
          </div>

          <div class="divide-y divide-slate-100">
            <label *ngFor="let item of group.items"
                   class="py-3 flex items-center justify-between gap-4 cursor-pointer select-none group">
              <div class="min-w-0">
                <span class="block text-xs font-bold text-[#011640] group-hover:text-[#0b234a]">
                  {{ item.label }}
                </span>
                <small class="block text-[11px] text-slate-400 truncate">
                  {{ item.hint }}
                </small>
              </div>

              <span class="relative inline-flex items-center shrink-0">
                <input type="checkbox"
                       class="sr-only peer"
                       [checked]="!!current.permisos[item.key]"
                       (change)="togglePerm(current, item.key)" />
                <span class="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#011640] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4"></span>
              </span>
            </label>
          </div>
        </div>
      </article>
    </section>
  `
})
export class RolesComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private url = `${environment.apiUrl}/roles`;

  roles = signal<RoleCard[]>([]);
  selectedRoleId = signal<number | null>(null);
  savingId = signal<number | null>(null);
  savedBanner = signal('');
  errorBanner = signal('');

  permissionGroups: PermissionGroup[] = [
    {
      title: 'General y Ventas',
      subtitle: 'Indicadores, campañas y operación en mostrador',
      items: [
        { key: 'dashboard', label: 'Resumen ejecutivo', hint: 'KPIs, gráficas de ventas y demografía' },
        { key: 'marketing', label: 'Marketing y campañas', hint: 'Metas comerciales, anuncios y ROI' },
        { key: 'pos', label: 'Punto de venta (POS)', hint: 'Cobro rápido en sucursal' },
        { key: 'orders', label: 'Pedidos', hint: 'Seguimiento y estados de entrega' },
        { key: 'cash_register', label: 'Corte de caja', hint: 'Arqueo de efectivo y cierres de turno' },
      ],
    },
    {
      title: 'Catálogo y Experiencia',
      subtitle: 'Sabores, presentaciones y opiniones de clientes',
      items: [
        { key: 'products', label: 'Productos y sabores', hint: 'Alta, edición y disponibilidad de helados' },
        { key: 'catalog_options', label: 'Tamaños y toppings', hint: 'Presentaciones y complementos' },
        { key: 'reviews', label: 'Reseñas', hint: 'Lectura y respuesta a comentarios' },
      ],
    },
    {
      title: 'Operación e Inventario',
      subtitle: 'Insumos, compras y abastecimiento',
      items: [
        { key: 'inventory', label: 'Inventario de insumos', hint: 'Existencias actuales y mínimos' },
        { key: 'purchases', label: 'Compras a proveedores', hint: 'Órdenes de compra y pagos' },
        { key: 'movements', label: 'Movimientos y mermas', hint: 'Entradas, salidas y ajustes de stock' },
        { key: 'suppliers', label: 'Proveedores', hint: 'Directorio de abastecedores' },
      ],
    },
    {
      title: 'Personas y Seguridad',
      subtitle: 'Cuentas de clientes, personal y permisos',
      items: [
        { key: 'clients', label: 'Clientes', hint: 'Historial de pedidos y fidelidad' },
        { key: 'users', label: 'Usuarios internos', hint: 'Cuentas del equipo de trabajo' },
        { key: 'roles', label: 'Roles y permisos', hint: 'Configuración de accesos al sistema' },
      ],
    },
  ];

  totalPermissions = this.permissionGroups.reduce((acc, g) => acc + g.items.length, 0);

  selectedRole = computed(() => {
    const list = this.roles();
    if (!list.length) return null;
    return list.find((r) => r.id === this.selectedRoleId()) || list[0];
  });

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.errorBanner.set('');
    this.http.get<RoleCard[]>(`${this.url}/`).subscribe({
      next: (list) => {
        const normalized = list.map((r) => {
          const isAdmin = r.nombre.trim().toLowerCase() === 'administrador';
          const perms = { ...(r.permisos || {}) };
          if (perms['purchases'] === undefined) {
            perms['purchases'] = !!perms['suppliers'];
          }
          if (perms['marketing'] === undefined) {
            perms['marketing'] = isAdmin;
          }
          return { ...r, permisos: perms };
        });

        this.roles.set(normalized);
        if (!this.selectedRoleId() && normalized.length > 0) {
          this.selectedRoleId.set(normalized[0].id);
        }
      },
      error: (err) => {
        this.errorBanner.set(err?.error?.error || 'No se pudieron cargar los roles. Verifica que Flask esté activo.');
      },
    });
  }

  selectRole(id: number) {
    this.savedBanner.set('');
    this.errorBanner.set('');
    this.selectedRoleId.set(id);
  }

  countActive(role: RoleCard): number {
    return this.permissionGroups.reduce(
      (sum, g) => sum + g.items.filter((i) => !!role.permisos[i.key]).length,
      0
    );
  }

  isGroupAllActive(role: RoleCard, group: PermissionGroup): boolean {
    return group.items.every((item) => !!role.permisos[item.key]);
  }

  toggleGroup(role: RoleCard, group: PermissionGroup) {
    this.savedBanner.set('');
    this.errorBanner.set('');
    const nextState = !this.isGroupAllActive(role, group);
    this.roles.update((list) =>
      list.map((r) => {
        if (r.id !== role.id) return r;
        const updated = { ...r.permisos };
        for (const item of group.items) {
          updated[item.key] = nextState;
        }
        return { ...r, permisos: updated };
      })
    );
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