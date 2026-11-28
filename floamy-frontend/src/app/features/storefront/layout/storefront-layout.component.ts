import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ProductsService } from '../../../core/services/products.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { CustomerAuthModalComponent } from '../../auth/customer-auth-modal/customer-auth-modal.component';

@Component({
  selector: 'app-storefront-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf, LogoComponent, CustomerAuthModalComponent],
  template: `
    <div class="customer-app">
      <header class="customer-header !px-3.5 sm:!px-6 gap-2 relative">
        <!-- Logo -->
        <a routerLink="/" (click)="mobileMenuOpen.set(false)" class="shrink-0" style="text-decoration:none;">
          <app-logo />
        </a>

        <!-- Navegación escritorio -->
        <nav class="hidden md:flex items-center gap-6">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" style="text-decoration:none;">Inicio</a>
          <a routerLink="/sabores" routerLinkActive="active" style="text-decoration:none;">Sabores</a>
          <a routerLink="/pedido" routerLinkActive="active" style="text-decoration:none;">Mi pedido</a>
        </nav>

        <!-- Acciones derechas -->
        <div class="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <!-- Carrito -->
          <button type="button"
                  data-drawer-target="cart-drawer"
                  aria-controls="cart-drawer"
                  (click)="mobileMenuOpen.set(false); cartOpen.set(true)"
                  class="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-full hover:bg-[#dff0f7] transition cursor-pointer">
            <span>🛒</span>
            <span class="bg-[#011640] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {{ cartCount() }}
            </span>
          </button>

          <!-- Mis pedidos (Escritorio / Tablet) -->
          <a *ngIf="auth.currentUser()"
             routerLink="/pedido"
             fragment="historial-pedidos"
             style="text-decoration:none;"
             class="hidden md:inline-flex px-3.5 py-2 text-xs font-bold text-[#011640] bg-white border border-slate-200 rounded-full hover:bg-[#dff0f7] transition">
            Mis pedidos
          </a>

          <!-- Botón Ingresar (Sin sesión) -->
          <button *ngIf="!auth.currentUser()"
                  type="button"
                  (click)="mobileMenuOpen.set(false); authModalOpen.set(true)"
                  class="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-full transition cursor-pointer whitespace-nowrap">
            <span class="sm:hidden">Ingresar</span>
            <span class="hidden sm:inline">Ingresar / Registrarme</span>
          </button>

          <!-- Chip de usuario (Escritorio / Tablet) -->
          <div *ngIf="auth.currentUser()"
               class="hidden sm:inline-flex items-center gap-2 bg-[#dff0f7] text-[#011640] py-1 px-3 pl-1.5 rounded-full text-xs font-semibold">
            <span class="w-6 h-6 rounded-full bg-[#011640] text-white grid place-items-center text-[11px] font-bold">
              {{ userInitial() }}
            </span>
            <span>Hola, {{ firstName() }}</span>
            <button type="button" (click)="auth.logout()" class="text-red-700 text-[11px] font-bold pl-1 hover:underline cursor-pointer">
              Salir
            </button>
          </div>

          <!-- Acceso equipo (Escritorio / Tablet) -->
          <a routerLink="/login"
             style="font-size:12px; color:var(--muted); text-decoration:none; font-weight:600;"
             class="hidden md:inline-block whitespace-nowrap">
            Acceso equipo
          </a>

          <!-- Botón compacto de cuenta/opciones (Solo móvil) -->
          <button type="button"
                  (click)="mobileMenuOpen.set(!mobileMenuOpen())"
                  [attr.aria-expanded]="mobileMenuOpen()"
                  aria-label="Opciones de cuenta"
                  class="md:hidden inline-flex items-center gap-1.5 p-1 pr-2.5 rounded-full border border-slate-200 bg-white text-[#011640] text-xs font-bold hover:bg-[#dff0f7] transition cursor-pointer">
            <span class="w-7 h-7 rounded-full bg-[#011640] text-white grid place-items-center text-[11px] font-extrabold">
              {{ auth.currentUser() ? userInitial() : '☰' }}
            </span>
            <span class="text-[11px]">{{ auth.currentUser() ? firstName() : 'Más' }}</span>
          </button>
        </div>

        <!-- Panel desplegable para móvil -->
        <div *ngIf="mobileMenuOpen()"
             class="md:hidden absolute top-full right-3.5 left-3.5 mt-2 z-40 rounded-2xl bg-white border border-[#AAC8E0]/70 shadow-xl p-4 space-y-3">
          <div *ngIf="auth.currentUser() as user"
               class="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-9 h-9 rounded-full bg-[#011640] text-white grid place-items-center text-xs font-extrabold shrink-0">
                {{ userInitial() }}
              </span>
              <div class="min-w-0">
                <p class="text-xs font-extrabold text-[#011640] truncate">Hola, {{ user.nombre }}</p>
                <p class="text-[11px] text-slate-500 truncate">{{ user.correo }}</p>
              </div>
            </div>
            <button type="button"
                    (click)="auth.logout(); mobileMenuOpen.set(false)"
                    class="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold shrink-0 cursor-pointer">
              Salir
            </button>
          </div>

          <div class="grid grid-cols-1 gap-1.5 text-xs font-bold text-[#011640]">
            <a *ngIf="auth.currentUser()"
               routerLink="/pedido"
               fragment="historial-pedidos"
               (click)="mobileMenuOpen.set(false)"
               style="text-decoration:none;"
               class="px-3.5 py-2.5 rounded-xl bg-[#F7F3E9] hover:bg-[#DFF0F7] transition flex items-center justify-between">
              <span>Mis pedidos</span>
              <span>→</span>
            </a>

            <a routerLink="/login"
               (click)="mobileMenuOpen.set(false)"
               style="text-decoration:none;"
               class="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-[#DFF0F7] text-slate-600 transition flex items-center justify-between">
              <span>Acceso equipo</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </header>

      <router-outlet />

      <!-- Barra inferior en móvil -->
      <nav class="mobile-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="mobileMenuOpen.set(false)" style="text-decoration:none;">Inicio</a>
        <a routerLink="/sabores" routerLinkActive="active" (click)="mobileMenuOpen.set(false)" style="text-decoration:none;">Sabores</a>
        <a routerLink="/pedido" routerLinkActive="active" (click)="mobileMenuOpen.set(false)" style="text-decoration:none;">Pedido ({{ cartCount() }})</a>
        <a *ngIf="auth.currentUser()" routerLink="/pedido" fragment="historial-pedidos" (click)="mobileMenuOpen.set(false)" style="text-decoration:none;">Historial</a>
      </nav>

      <!-- Drawer del carrito -->
      <div *ngIf="cartOpen()"
           (click)="cartOpen.set(false)"
           class="fixed inset-0 z-50 bg-[#011640]/55 backdrop-blur-xs flex justify-end">
        <aside id="cart-drawer"
               tabindex="-1"
               aria-labelledby="cart-drawer-label"
               (click)="$event.stopPropagation()"
               class="relative w-full max-w-sm h-full bg-gradient-to-b from-[#AAC8E0]/60 via-[#DFF0F7] to-[#F7F3E9] flex flex-col shadow-2xl overflow-hidden">

          <!-- Trama de puntos decorativa -->
          <div class="absolute inset-0 opacity-[0.28] pointer-events-none"
               style="background-image: radial-gradient(#6DA0BF 1.3px, transparent 1.3px); background-size: 22px 22px;">
          </div>

          <!-- Esferas difuminadas -->
          <div class="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#6DA0BF]/30 blur-3xl pointer-events-none"></div>
          <div class="absolute bottom-36 -left-16 w-52 h-52 rounded-full bg-[#6DA0BF]/25 blur-3xl pointer-events-none"></div>

          <!-- Ilustraciones lineales de helados -->
          <svg class="absolute top-20 right-3 w-28 h-28 text-[#011640]/10 pointer-events-none rotate-12" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M60 18c-3-7 3-12 9-10" />
            <circle cx="60" cy="24" r="6" />
            <path d="M36 52a24 24 0 0 1 48 0" />
            <path d="M32 68a18 18 0 0 1 28-14 18 18 0 0 1 28 14" />
            <path d="M26 70h68l-8 26a12 12 0 0 1-11 8H45a12 12 0 0 1-11-8l-8-26Z" />
            <path d="M48 104h24l4 8H44l4-8Z" />
          </svg>

          <svg class="absolute top-1/2 -translate-y-1/2 left-3 w-24 h-24 text-[#011640]/10 pointer-events-none -rotate-12" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M38 54a22 22 0 0 1 44 0" />
            <path d="M32 64c0-8 8-12 15-9 6-5 20-5 26 0 7-3 15 1 15 9" />
            <path d="M36 66l24 44 24-44Z" />
            <path d="M47 78l16 16M67 74l-18 18" />
          </svg>

          <svg class="absolute bottom-44 right-4 w-24 h-24 text-[#011640]/10 pointer-events-none rotate-[16deg]" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M42 24a18 18 0 0 1 36 0v44a6 6 0 0 1-6 6H48a6 6 0 0 1-6-6V24Z" />
            <path d="M52 30v26M68 30v26" />
            <path d="M55 74v26a5 5 0 0 0 10 0V74" />
          </svg>

          <!-- Encabezado -->
          <div class="relative z-10 px-4 sm:px-5 pt-5 pb-4 border-b border-[#AAC8E0]/50 bg-white/45 backdrop-blur-md flex items-center justify-between">
            <div>
              <span class="inline-block px-2.5 py-0.5 rounded-full bg-[#011640] text-[#F7F3E9] text-[10px] font-bold tracking-widest uppercase">
                TU CANASTA
              </span>
              <h3 id="cart-drawer-label" class="text-lg font-extrabold text-[#011640] mt-1">
                Tu pedido ({{ cartCount() }})
              </h3>
            </div>
            <button type="button"
                    data-drawer-hide="cart-drawer"
                    aria-controls="cart-drawer"
                    (click)="cartOpen.set(false)"
                    class="w-8 h-8 rounded-xl bg-white/90 text-[#011640] hover:bg-[#011640] hover:text-white text-xs font-bold inline-flex items-center justify-center transition shadow-xs cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Lista de productos o estado vacío -->
          <div class="relative z-10 flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-3">
            <div *ngIf="cartItems().length === 0"
                 class="my-auto mx-auto w-full p-6 rounded-3xl bg-white/85 backdrop-blur-md text-center shadow-sm space-y-2.5">
              <div class="w-12 h-12 rounded-2xl bg-[#DFF0F7] text-[#011640] flex items-center justify-center mx-auto">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 11a5 5 0 0 1 10 0" />
                  <path d="M6 13c0-1.5 1.5-2.5 3-2 1.2-1 4.8-1 6 0 1.5-.5 3 .5 3 2" />
                  <path d="M7 13l5 9 5-9Z" />
                </svg>
              </div>
              <p class="font-extrabold text-sm text-[#011640]">Tu carrito está vacío</p>
              <small class="block text-xs text-[#011640]/70 leading-relaxed">
                Arma tu helado con fruta natural y toppings artesanales para recoger sin filas.
              </small>
            </div>

            <div *ngFor="let item of cartItems(); let idx = index"
                 class="p-3.5 rounded-2xl bg-white/92 backdrop-blur-md shadow-xs space-y-2.5">
              <div class="flex items-center justify-between gap-2.5">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="scoop shrink-0 !w-11 !h-11 rounded-2xl overflow-hidden bg-[#DFF0F7] ring-2 ring-[#F7F3E9] shadow-xs flex items-center justify-center"
                       [class]="getItemTone(item)">
                    <img *ngIf="getItemImage(item)"
                         [src]="getItemImage(item)"
                         [alt]="item.name || item.nombre"
                         class="w-full h-full object-cover" />
                    <svg *ngIf="!getItemImage(item)"
                         class="w-6 h-6 text-[#011640]"
                         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M7 11a5 5 0 0 1 10 0" />
                      <path d="M6 13c0-1.5 1.5-2.5 3-2 1.2-1 4.8-1 6 0 1.5-.5 3 .5 3 2" />
                      <path d="M7 13l5 9 5-9Z" />
                    </svg>
                  </div>

                  <div class="min-w-0">
                    <strong class="block text-sm font-extrabold text-[#011640] truncate">
                      {{ item.name || item.nombre }}
                    </strong>
                    <span class="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#F7F3E9] text-[11px] font-bold text-[#011640]/80">
                      {{ item.size || item.tamano || 'Vaso 8 oz' }}
                    </span>
                  </div>
                </div>

                <strong class="text-sm font-extrabold text-[#011640] shrink-0">
                  \${{ ((item.price || item.precio || 0) * (item.qty || item.cantidad || item.quantity || 1)).toFixed(2) }}
                </strong>
              </div>

              <div *ngIf="item.toppings?.length" class="flex flex-wrap gap-1">
                <span *ngFor="let top of item.toppings"
                      class="px-2 py-0.5 rounded-full bg-[#DFF0F7] text-[#011640] text-[10px] font-bold">
                  + {{ top }}
                </span>
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div class="inline-flex items-center gap-1.5 bg-[#F7F3E9] rounded-xl px-1.5 py-1">
                  <button type="button"
                          (click)="updateQty(idx, -1)"
                          class="w-6 h-6 rounded-lg bg-white text-[#011640] font-bold text-xs hover:bg-[#DFF0F7] transition cursor-pointer">
                    −
                  </button>
                  <strong class="w-4 text-center text-xs font-extrabold text-[#011640]">
                    {{ item.qty || item.cantidad || item.quantity || 1 }}
                  </strong>
                  <button type="button"
                          (click)="updateQty(idx, 1)"
                          class="w-6 h-6 rounded-lg bg-white text-[#011640] font-bold text-xs hover:bg-[#DFF0F7] transition cursor-pointer">
                    +
                  </button>
                </div>

                <button type="button"
                        (click)="removeItem(idx)"
                        class="text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer">
                  Quitar
                </button>
              </div>
            </div>
          </div>

          <!-- Pie en azul marino -->
          <div class="relative z-10 p-4 sm:p-5 bg-gradient-to-b from-[#011640] via-[#072152] to-[#0b2859] text-[#F7F3E9] space-y-3 shadow-2xl">
            <div class="flex items-center justify-between text-xs text-[#AAC8E0]">
              <span>{{ cartCount() }} {{ cartCount() === 1 ? 'helado en canasta' : 'helados en canasta' }}</span>
              <span class="px-2.5 py-0.5 rounded-full bg-white/10 text-[#DFF0F7] font-bold">
                Listo en 15 min
              </span>
            </div>

            <div class="flex justify-between items-baseline">
              <span class="text-sm font-bold text-[#DFF0F7]">Subtotal</span>
              <strong class="text-xl font-extrabold text-white">
                \${{ cartTotal().toFixed(2) }} <small class="text-xs font-normal text-[#AAC8E0]">MXN</small>
              </strong>
            </div>

            <button type="button"
                    (click)="goToCheckout()"
                    class="w-full text-[#011640] bg-[#F7F3E9] hover:bg-[#DFF0F7] focus:ring-4 focus:outline-none focus:ring-[#6DA0BF]/40 font-extrabold rounded-xl text-xs px-5 py-3 transition shadow-lg cursor-pointer">
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
  productsService = inject(ProductsService);
  private router = inject(Router);

  authModalOpen = signal(false);
  cartOpen = signal(false);
  mobileMenuOpen = signal(false);

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

  private findMatchingProduct(item: any) {
    const itemName = String(item?.name || item?.nombre || '').trim().toLowerCase();
    if (!itemName) return undefined;
    return this.productsService.products().find(
      (p) => String(p.name || '').trim().toLowerCase() === itemName
    );
  }

  getItemImage(item: any): string {
    return item?.image || this.findMatchingProduct(item)?.image || '';
  }

  getItemTone(item: any): string {
    return item?.tone || this.findMatchingProduct(item)?.tone || '';
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

  updateQty(index: number, delta: number) {
    const updated = this.cartItems()
      .map((item, idx) => {
        if (idx !== index) return item;
        const currentQty = Number(item.qty || item.cantidad || item.quantity || 1);
        const nextQty = currentQty + delta;
        if (nextQty <= 0) return null;
        return { ...item, qty: nextQty };
      })
      .filter(Boolean);
    localStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
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