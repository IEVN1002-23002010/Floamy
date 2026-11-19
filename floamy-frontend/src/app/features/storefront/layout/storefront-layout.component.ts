import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CustomerAuthModalComponent } from '../../auth/customer-auth-modal/customer-auth-modal.component';

@Component({
  selector: 'app-storefront-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf, LogoComponent, CustomerAuthModalComponent],
  template: `
    <div class="customer-app">
      <header class="customer-header">
        <a routerLink="/" style="text-decoration:none;"><app-logo /></a>

        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" style="text-decoration:none;">Inicio</a>
          <a routerLink="/sabores" routerLinkActive="active" style="text-decoration:none;">Sabores</a>
          <a routerLink="/pedido" routerLinkActive="active" style="text-decoration:none;">Mi pedido</a>
        </nav>

        <div class="flex items-center gap-2.5">
          <button type="button"
                  data-drawer-target="cart-drawer"
                  aria-controls="cart-drawer"
                  (click)="cartOpen.set(true)"
                  class="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-full hover:bg-[#dff0f7] transition">
            🛒
            <span class="bg-[#011640] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {{ cartCount() }}
            </span>
          </button>

          <button *ngIf="!auth.currentUser()"
                  type="button"
                  (click)="authModalOpen.set(true)"
                  class="px-4 py-2 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-full transition">
            Ingresar / Registrarme
          </button>

          <div *ngIf="auth.currentUser()"
               class="inline-flex items-center gap-2 bg-[#dff0f7] text-[#011640] py-1 px-3 pl-1.5 rounded-full text-xs font-semibold">
            <span class="w-6 h-6 rounded-full bg-[#011640] text-white grid place-items-center text-[11px] font-bold">
              {{ userInitial() }}
            </span>
            <span>Hola, {{ firstName() }}</span>
            <button type="button" (click)="auth.logout()" class="text-red-700 text-[11px] font-bold pl-1 hover:underline">
              Salir
            </button>
          </div>

          <a routerLink="/login" style="font-size:12px; color:var(--muted); text-decoration:none; font-weight:600;">
            Acceso equipo
          </a>
        </div>
      </header>

      <router-outlet />

      <nav class="mobile-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" style="text-decoration:none;">Inicio</a>
        <a routerLink="/sabores" routerLinkActive="active" style="text-decoration:none;">Sabores</a>
        <a routerLink="/pedido" routerLinkActive="active" style="text-decoration:none;">Pedido ({{ cartCount() }})</a>
      </nav>

      <div *ngIf="cartOpen()"
           (click)="cartOpen.set(false)"
           class="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex justify-end">
        <aside id="cart-drawer"
               tabindex="-1"
               aria-labelledby="cart-drawer-label"
               (click)="$event.stopPropagation()"
               class="w-full max-w-sm h-full bg-white p-6 flex flex-col shadow-2xl border-l border-slate-200">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span class="eyebrow">TU CANASTA</span>
              <h3 id="cart-drawer-label" class="text-xl font-bold text-[#011640]">Tu pedido ({{ cartCount() }})</h3>
            </div>
            <button type="button"
                    data-drawer-hide="cart-drawer"
                    aria-controls="cart-drawer"
                    (click)="cartOpen.set(false)"
                    class="text-slate-400 hover:bg-slate-100 hover:text-[#011640] rounded-lg text-sm w-8 h-8 inline-flex items-center justify-center">
              ✕
            </button>
          </div>

          <div class="flex-1 overflow-y-auto flex flex-col gap-3 py-4">
            <div *ngIf="cartItems().length === 0" class="text-center py-10 px-3 text-slate-500">
              <p class="font-semibold text-[#011640] mb-1">Tu carrito está vacío</p>
              <small>Agrega tus sabores favoritos para empezar tu pedido.</small>
            </div>

            <div *ngFor="let item of cartItems(); let idx = index"
                 class="flex items-center justify-between gap-2.5 p-3 rounded-2xl bg-[#f7f3e9] border border-slate-200/60">
              <div>
                <strong class="block text-sm text-[#011640]">{{ item.name || item.nombre }}</strong>
                <small class="text-slate-500 text-xs">
                  {{ item.size || item.tamano || 'Vaso 8 oz' }} · {{ item.qty || item.cantidad || item.quantity || 1 }} pza
                </small>
                <span *ngIf="item.toppings?.length" class="block text-[11px] font-semibold text-[#6da0bf] mt-0.5">
                  + {{ item.toppings.join(', ') }}
                </span>
              </div>
              <div class="text-right">
                <strong class="block text-sm text-[#011640]">
                  \${{ ((item.price || item.precio || 0) * (item.qty || item.cantidad || item.quantity || 1)).toFixed(2) }}
                </strong>
                <button type="button"
                        (click)="removeItem(idx)"
                        class="text-red-700 text-[11px] font-semibold hover:underline">
                  Quitar
                </button>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-4 flex flex-col gap-3">
            <div class="flex justify-between text-sm text-[#011640]">
              <span>Subtotal</span>
              <strong>\${{ cartTotal().toFixed(2) }} MXN</strong>
            </div>

            <button type="button"
                    (click)="goToCheckout()"
                    class="w-full text-white bg-[#011640] hover:bg-[#0b234a] focus:ring-4 focus:outline-none focus:ring-[#6da0bf]/40 font-semibold rounded-xl text-xs px-5 py-3 transition">
              {{ cartItems().length > 0 ? 'Ir a pagar mi pedido →' : 'Explorar sabores →' }}
            </button>
          </div>
        </aside>
      </div>

      <app-customer-auth-modal *ngIf="authModalOpen()" (close)="authModalOpen.set(false)" />
    </div>
  `
})
export class StorefrontLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  authModalOpen = signal(false);
  cartOpen = signal(false);

  firstName = computed(() => {
    const full = this.auth.currentUser()?.nombre || '';
    return full.split(' ')[0] || 'Cliente';
  });

  userInitial = computed(() => {
    const full = this.auth.currentUser()?.nombre || 'C';
    return full[0].toUpperCase();
  });

  private getStorageKey(): string {
    for (const key of ['floamy_cart', 'cart', 'floamy_pedido']) {
      if (localStorage.getItem(key) !== null) return key;
    }
    return 'floamy_cart';
  }

  cartItems(): any[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  cartCount(): number {
    return this.cartItems().reduce((sum, i) => sum + Number(i.qty || i.cantidad || i.quantity || 1), 0);
  }

  cartTotal(): number {
    return this.cartItems().reduce(
      (sum, i) => sum + Number(i.price || i.precio || 0) * Number(i.qty || i.cantidad || i.quantity || 1),
      0
    );
  }

  removeItem(index: number) {
    const updated = this.cartItems().filter((_, idx) => idx !== index);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
  }

  goToCheckout() {
    this.cartOpen.set(false);
    this.router.navigate([this.cartItems().length > 0 ? '/pedido' : '/sabores']);
  }
}