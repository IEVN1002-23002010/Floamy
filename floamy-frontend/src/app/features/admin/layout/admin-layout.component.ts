import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, LogoComponent],
  template: `
    <div class="min-h-screen flex bg-[#f7f3e9] text-[#011640]">
      <!-- Backdrop móvil -->
      <div *ngIf="sidebarOpen()"
           (click)="sidebarOpen.set(false)"
           class="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"></div>

      <!-- Sidebar -->
      <aside [class]="sidebarOpen()
               ? 'fixed inset-y-0 left-0 z-40 w-64 bg-[#011640] text-white flex flex-col justify-between p-4 transition-transform translate-x-0 lg:static lg:translate-x-0 shrink-0'
               : 'fixed inset-y-0 left-0 z-40 w-64 bg-[#011640] text-white flex flex-col justify-between p-4 transition-transform -translate-x-full lg:static lg:translate-x-0 shrink-0'">
        <div class="space-y-5 overflow-y-auto pr-1">
          <div class="flex items-center justify-between px-1 pt-1">
            <a routerLink="/admin/resumen" style="text-decoration:none;">
              <app-logo [light]="true" />
            </a>
            <button type="button"
                    (click)="sidebarOpen.set(false)"
                    class="lg:hidden text-slate-300 hover:text-white p-1.5 rounded-lg">
              ✕
            </button>
          </div>

          <!-- Tarjeta de sucursal -->
          <div class="flex items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/10">
            <span class="w-9 h-9 rounded-xl bg-[#6da0bf] text-[#011640] font-extrabold text-xs grid place-items-center shrink-0">
              FC
            </span>
            <div class="leading-tight">
              <strong class="block text-xs font-bold text-white">Floamy Centro</strong>
              <small class="text-[11px] text-[#aac8e0]">Sucursal principal</small>
            </div>
          </div>

          <!-- Navegación -->
          <nav class="space-y-5 text-xs">
            <div class="space-y-1">
              <span class="block px-3 text-[10px] font-bold tracking-wider uppercase text-[#6da0bf]">General</span>
              <a routerLink="/admin/resumen"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Resumen
              </a>
              <a routerLink="/admin/pos"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Punto de venta
              </a>
              <a routerLink="/admin/pedidos"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Pedidos
              </a>
              <a routerLink="/admin/corte-caja"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Corte de caja
              </a>
            </div>

            <div class="space-y-1">
              <span class="block px-3 text-[10px] font-bold tracking-wider uppercase text-[#6da0bf]">Catálogo</span>
              <a routerLink="/admin/productos"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Productos
              </a>
              <a routerLink="/admin/tamanos"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Tamaños
              </a>
              <a routerLink="/admin/toppings"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Toppings
              </a>
            </div>

            <div class="space-y-1">
              <span class="block px-3 text-[10px] font-bold tracking-wider uppercase text-[#6da0bf]">Operación</span>
              <a routerLink="/admin/inventario"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Inventario
              </a>
              <a routerLink="/admin/movimientos"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Movimientos
              </a>
              <a routerLink="/admin/proveedores"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Proveedores
              </a>
            </div>

            <div class="space-y-1">
              <span class="block px-3 text-[10px] font-bold tracking-wider uppercase text-[#6da0bf]">Personas</span>
              <a routerLink="/admin/clientes"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Clientes
              </a>
              <a routerLink="/admin/usuarios"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Usuarios
              </a>
              <a routerLink="/admin/roles"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Roles y permisos
              </a>
            </div>

            <div class="space-y-1">
              <span class="block px-3 text-[10px] font-bold tracking-wider uppercase text-[#6da0bf]">Experiencia</span>
              <a routerLink="/admin/resenas"
                 routerLinkActive="bg-white/15 text-white font-semibold"
                 (click)="sidebarOpen.set(false)"
                 class="block px-3 py-2.5 rounded-xl text-slate-200 hover:bg-white/10 transition"
                 style="text-decoration:none;">
                Reseñas
              </a>
            </div>
          </nav>
        </div>

        <!-- Pie del sidebar -->
        <div class="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-8 h-8 rounded-full bg-[#dff0f7] text-[#011640] font-bold text-xs grid place-items-center shrink-0">
              {{ userInitial() }}
            </span>
            <div class="truncate">
              <strong class="block text-xs font-semibold text-white truncate">
                {{ auth.currentUser()?.nombre || 'Equipo Floamy' }}
              </strong>
              <small class="text-[11px] text-[#aac8e0]">{{ auth.currentUser()?.rol || 'Staff' }}</small>
            </div>
          </div>
          <button type="button"
                  (click)="logout()"
                  class="px-2.5 py-1.5 text-[11px] font-semibold text-red-200 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition">
            Salir
          </button>
        </div>
      </aside>

      <!-- Contenido principal -->
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div class="flex items-center gap-3">
            <button type="button"
                    (click)="sidebarOpen.set(true)"
                    class="lg:hidden p-2 rounded-lg text-[#011640] hover:bg-slate-100">
              ☰
            </button>
            <span class="text-xs text-slate-500">
              Panel administrativo › <strong class="text-[#011640]">Floamy</strong>
            </span>
          </div>

          <div class="flex items-center gap-2.5">
            <a routerLink="/"
               class="text-xs font-semibold text-[#6da0bf] hover:text-[#011640] transition"
               style="text-decoration:none;">
              Ver tienda ↗
            </a>
            <span class="px-3 py-1 text-xs font-semibold text-[#011640] bg-[#f7f3e9] border border-slate-200 rounded-xl">
              {{ auth.currentUser()?.rol || 'Administrador' }}
            </span>
          </div>
        </header>

        <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(false);

  userInitial = computed(() => {
    const name = this.auth.currentUser()?.nombre || 'A';
    return name[0].toUpperCase();
  });

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}