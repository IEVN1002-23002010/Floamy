import { CouponsService } from '../../../core/services/coupons.service';
import { CouponOffer } from '../../../core/models/coupon.model';
import { Component, OnDestroy, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProductsService } from '../../../core/services/products.service';
import { OrdersService } from '../../../core/services/orders.service';
import { CustomerAuthModalComponent } from '../../auth/customer-auth-modal/customer-auth-modal.component';
import { printFloamyTicket, TicketData } from '../../../shared/utils/ticket-printer';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, RouterLink, CustomerAuthModalComponent],
  template: `
    <main class="relative min-h-screen bg-gradient-to-b from-[#AAC8E0]/45 via-[#DFF0F7]/95 to-[#F7F3E9] text-[#011640] pt-8 pb-16 overflow-x-clip">

      <!-- Trama de puntos decorativa -->
      <div class="absolute inset-0 opacity-[0.28] pointer-events-none"
           style="background-image: radial-gradient(#6DA0BF 1.4px, transparent 1.4px); background-size: 24px 24px;">
      </div>

      <!-- Esferas difuminadas -->
      <div class="absolute -top-24 -left-24 w-[32rem] h-[32rem] rounded-full bg-[#6DA0BF]/25 blur-3xl pointer-events-none"></div>
      <div class="absolute top-1/3 -right-28 w-[36rem] h-[36rem] rounded-full bg-[#6DA0BF]/20 blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-24 left-1/4 w-[28rem] h-[28rem] rounded-full bg-[#011640]/8 blur-3xl pointer-events-none"></div>

      <!-- Ilustraciones lineales decorativas -->
      <svg class="hidden md:block absolute top-12 left-6 xl:left-12 w-36 h-36 text-[#011640]/10 pointer-events-none -rotate-12" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M38 54a22 22 0 0 1 44 0" />
        <path d="M32 64c0-8 8-12 15-9 6-5 20-5 26 0 7-3 15 1 15 9" />
        <path d="M36 66l24 44 24-44Z" />
        <path d="M47 78l16 16M67 74l-18 18" />
      </svg>

      <svg class="hidden lg:block absolute top-1/4 right-8 w-32 h-32 text-[#011640]/10 pointer-events-none rotate-12" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M60 18c-3-7 3-12 9-10" />
        <circle cx="60" cy="24" r="6" />
        <path d="M36 52a24 24 0 0 1 48 0" />
        <path d="M32 68a18 18 0 0 1 28-14 18 18 0 0 1 28 14" />
        <path d="M26 70h68l-8 26a12 12 0 0 1-11 8H45a12 12 0 0 1-11-8l-8-26Z" />
        <path d="M48 104h24l4 8H44l4-8Z" />
      </svg>

      <svg class="hidden xl:block absolute top-1/2 -translate-y-1/2 left-8 w-28 h-28 text-[#011640]/10 pointer-events-none rotate-[18deg]" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M42 24a18 18 0 0 1 36 0v44a6 6 0 0 1-6 6H48a6 6 0 0 1-6-6V24Z" />
        <path d="M52 30v26M68 30v26" />
        <path d="M55 74v26a5 5 0 0 0 10 0V74" />
      </svg>

      <svg class="hidden lg:block absolute bottom-24 left-10 w-36 h-36 text-[#011640]/10 pointer-events-none rotate-6" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M74 18l14-8M74 18l-10 34" />
        <path d="M36 52c4-12 16-18 24-14 10-4 22 2 24 14" />
        <path d="M30 54h60l-7 42a8 8 0 0 1-8 7H45a8 8 0 0 1-8-7l-7-42Z" />
        <path d="M34 72c10 5 18-5 26 0s16 5 26 0" />
      </svg>

      <!-- Contenido de la página -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">

        <!-- BLOQUE SUPERIOR: CANASTA + RESUMEN -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

          <!-- Columna izquierda: Canasta -->
          <div class="lg:col-span-7 space-y-5">
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span class="inline-block px-3 py-1 rounded-full bg-[#DFF0F7] border border-[#AAC8E0]/70 text-[#011640] text-[10px] font-bold tracking-widest uppercase">
                  TU CANASTA
                </span>
                <h1 class="text-3xl sm:text-4xl font-extrabold text-[#011640] mt-2 tracking-tight">
                  Revisa tu pedido
                </h1>
              </div>

              <a *ngIf="items().length > 0"
                 routerLink="/sabores"
                 style="text-decoration:none;"
                 class="px-4 py-2 rounded-xl bg-white border border-[#AAC8E0] text-xs font-bold text-[#011640] hover:bg-[#DFF0F7]/60 transition cursor-pointer">
                + Agregar otro helado
              </a>
            </div>

            <!-- Estado vacío -->
            <div *ngIf="items().length === 0"
                 class="bg-white/95 border border-[#AAC8E0]/80 rounded-[1.75rem] p-8 sm:p-10 text-center shadow-sm space-y-3">
              <div class="w-12 h-12 rounded-2xl bg-[#DFF0F7] text-[#011640] font-extrabold text-lg flex items-center justify-center mx-auto shadow-md shadow-[#011640]/5">
                🍦
              </div>
              <h2 class="text-lg font-extrabold text-[#011640]">No tienes productos en tu carrito</h2>
              <p class="text-xs sm:text-sm text-[#011640]/70 max-w-sm mx-auto">
                Elige tus helados favoritos, personaliza tus toppings y regresa aquí para confirmar tu orden.
              </p>
              <div class="pt-2">
                <a routerLink="/sabores"
                   class="inline-flex items-center px-6 py-3 text-xs font-bold text-[#F7F3E9] bg-[#011640] hover:bg-[#0b2859] rounded-xl transition shadow-md shadow-[#011640]/15"
                   style="text-decoration:none;">
                  Explorar sabores →
                </a>
              </div>
            </div>

            <!-- Lista de productos en el carrito -->
            <div *ngIf="items().length > 0" class="space-y-3.5">
              <article *ngFor="let item of items(); let i = index"
                       class="bg-white/95 border border-[#AAC8E0]/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3.5 min-w-0">
                  <div class="scoop shrink-0 !w-14 !h-14 rounded-2xl overflow-hidden bg-[#DFF0F7] ring-2 ring-[#F7F3E9] shadow-xs flex items-center justify-center"
                       [class]="getItemTone(item)">
                    <img *ngIf="getItemImage(item)"
                         [src]="getItemImage(item)"
                         [alt]="item.name || item.nombre"
                         class="w-full h-full object-cover" />
                    <span *ngIf="!getItemImage(item)" class="text-sm font-extrabold text-[#011640]">
                      {{ (item.name || item.nombre || 'H')[0].toUpperCase() }}
                    </span>
                  </div>

                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <strong class="text-sm sm:text-base font-extrabold text-[#011640] truncate">
                        {{ item.name || item.nombre }}
                      </strong>
                      <span class="px-2.5 py-0.5 rounded-full bg-[#F7F3E9] border border-[#AAC8E0]/70 text-[11px] font-bold text-[#011640]">
                        {{ item.size || item.tamano || 'Vaso 8 oz' }}
                      </span>
                    </div>

                    <p class="text-xs text-[#011640]/65 mt-1">
                      \${{ Number(item.price || item.precio || 0).toFixed(2) }} c/u
                    </p>

                    <div *ngIf="item.toppings?.length" class="flex flex-wrap gap-1.5 mt-2">
                      <span *ngFor="let top of item.toppings"
                            class="px-2.5 py-0.5 rounded-full bg-[#DFF0F7]/80 text-[#011640] text-[11px] font-semibold">
                        + {{ top }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <div class="inline-flex items-center gap-2 bg-white border border-slate-300 rounded-full px-2.5 py-1 shadow-2xs">
                    <button type="button"
                            (click)="updateQty(i, -1)"
                            class="w-6 h-6 rounded-full text-[#011640] font-bold text-sm hover:bg-[#DFF0F7] transition flex items-center justify-center cursor-pointer">
                      −
                    </button>
                    <strong class="w-5 text-center text-xs font-extrabold text-[#011640]">
                      {{ item.qty || item.cantidad || item.quantity || 1 }}
                    </strong>
                    <button type="button"
                            (click)="updateQty(i, 1)"
                            class="w-6 h-6 rounded-full text-[#011640] font-bold text-sm hover:bg-[#DFF0F7] transition flex items-center justify-center cursor-pointer">
                      +
                    </button>
                  </div>

                  <button type="button"
                          (click)="removeItem(i)"
                          class="px-4 py-1.5 rounded-full bg-[#E63946] hover:bg-[#cf2c39] text-white text-xs font-bold transition shadow-xs cursor-pointer">
                    Quitar
                  </button>

                  <strong class="text-base font-extrabold text-[#011640] min-w-[74px] text-right">
                    \${{ ((item.price || item.precio || 0) * (item.qty || item.cantidad || item.quantity || 1)).toFixed(2) }}
                  </strong>
                </div>
              </article>
            </div>
          </div>

          <!-- Columna derecha: Resumen oscuro -->
          <aside class="lg:col-span-5 p-6 sm:p-7 bg-gradient-to-b from-[#011640] via-[#072152] to-[#0b2859] text-[#F7F3E9] border border-[#6DA0BF]/40 rounded-[1.75rem] shadow-xl shadow-[#011640]/15 space-y-5 lg:sticky lg:top-24">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold tracking-widest uppercase text-[#AAC8E0]">PAGO Y RECOLECCIÓN</span>
                <h2 class="text-xl font-extrabold text-white mt-0.5">Resumen</h2>
              </div>
              <span class="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-bold text-[#DFF0F7]">
                Listo en 15 min
              </span>
            </div>

            <!-- Aviso si no hay sesión iniciada -->
            <div *ngIf="!auth.currentUser()" class="p-4 rounded-2xl bg-white/10 border border-[#AAC8E0]/30 space-y-2.5">
              <strong class="block text-xs font-bold text-white">Inicia sesión para completar tu compra</strong>
              <p class="text-[11px] text-[#DFF0F7]/80 leading-relaxed">
                Necesitas una cuenta registrada para confirmar tu pedido y darle seguimiento en vivo.
              </p>
              <div class="flex gap-2">
                <button type="button"
                        (click)="openAuth('login')"
                        class="flex-1 py-2.5 px-3 text-xs font-bold text-[#011640] bg-[#F7F3E9] hover:bg-[#DFF0F7] rounded-xl transition cursor-pointer">
                  Iniciar sesión
                </button>
                <button type="button"
                        (click)="openAuth('register')"
                        class="flex-1 py-2.5 px-3 text-xs font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 rounded-xl transition cursor-pointer">
                  Crear cuenta
                </button>
              </div>
            </div>

            <!-- Nombre del cliente -->
            <div *ngIf="auth.currentUser()">
              <label class="block mb-1.5 text-xs font-semibold text-[#DFF0F7]">¿A nombre de quién?</label>
              <input [(ngModel)]="customerName"
                     placeholder="Tu nombre"
                     class="w-full px-3.5 py-2.5 text-sm font-semibold bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-[#AAC8E0]/60 focus:outline-none focus:border-[#AAC8E0]" />
            </div>

            <!-- Métodos de pago -->
            <div class="space-y-2">
              <span class="block text-xs font-semibold text-[#DFF0F7]">Método de pago</span>
              <button type="button"
                      *ngFor="let m of methods"
                      (click)="selectedMethod.set(m.value)"
                      [class]="selectedMethod() === m.value
                        ? 'w-full px-4 py-3 rounded-xl border-2 border-[#DFF0F7] bg-[#DFF0F7] text-[#011640] text-left flex items-center justify-between transition cursor-pointer'
                        : 'w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-[#F7F3E9] text-left flex items-center justify-between transition cursor-pointer'">
                <div>
                  <strong class="block text-xs font-extrabold">{{ m.label }}</strong>
                  <span class="text-[11px]" [class]="selectedMethod() === m.value ? 'text-[#011640]/70' : 'text-[#AAC8E0]'">
                    {{ m.hint }}
                  </span>
                </div>
                <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold"
                      [class]="selectedMethod() === m.value ? 'bg-[#011640] text-[#F7F3E9]' : 'border border-white/30 text-transparent'">
                  ✓
                </span>
              </button>
            </div>

            <!-- Cupón -->
            <div class="space-y-1.5">
              <div class="flex gap-2">
                <input [ngModel]="couponInput" (ngModelChange)="changeCode($event)"
                       (keyup.enter)="applyCoupon()"
                       placeholder="Código promocional"
                       class="flex-1 px-3.5 py-2.5 text-xs font-mono uppercase bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-[#AAC8E0]/60 focus:outline-none focus:border-[#AAC8E0]" />
                <button type="button"
                        (click)="applyCoupon()"
                        class="px-4 py-2.5 text-xs font-bold text-[#011640] bg-[#DFF0F7] hover:bg-white rounded-xl transition cursor-pointer">
                  Aplicar
                </button>
              </div>
              <div *ngIf="couponMsg() as msg"
                   class="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg"
                   [class]="msg.type === 'ok' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'">
                <span>{{ msg.text }}</span>
                <button *ngIf="offer()" type="button" (click)="removeCoupon()" class="underline font-bold ml-2 cursor-pointer">
                  Quitar
                </button>
              </div>
            </div>

            <!-- Totales -->
            <div class="pt-3 border-t border-white/15 space-y-2 text-xs">
              <div class="flex justify-between text-[#AAC8E0]">
                <span>Subtotal ({{ totalItemsCount() }} {{ totalItemsCount() === 1 ? 'helado' : 'helados' }})</span>
                <strong class="text-white">\${{ subtotal().toFixed(2) }}</strong>
              </div>
              <div class="flex justify-between text-emerald-300" *ngIf="offer()">
                <span>Descuento · {{ offer()?.codigo }}</span>
                <strong>-\${{ discountAmount().toFixed(2) }}</strong>
              </div>
              <div class="flex justify-between items-baseline pt-2 border-t border-white/10">
                <span class="text-sm font-bold text-[#DFF0F7]">Total a pagar</span>
                <strong class="text-2xl font-extrabold text-white">
                  \${{ total().toFixed(2) }} <small class="text-xs font-normal text-[#AAC8E0]">MXN</small>
                </strong>
              </div>
            </div>

            <div *ngIf="orderError()" role="alert" class="p-3 text-xs font-semibold text-rose-100 rounded-xl bg-rose-500/25 border border-rose-400/40">
              {{ orderError() }}
            </div>

            <button *ngIf="auth.currentUser(); else loginToOrderBtn"
                    type="button"
                    [disabled]="items().length === 0 || submitting()"
                    (click)="placeOrder()"
                    class="w-full text-[#011640] bg-[#F7F3E9] hover:bg-[#DFF0F7] focus:ring-4 focus:outline-none focus:ring-[#6DA0BF]/40 font-extrabold rounded-xl text-xs px-5 py-3.5 disabled:opacity-45 disabled:cursor-not-allowed transition shadow-lg cursor-pointer">
              {{ submitting() ? 'Enviando pedido...' : 'Confirmar pedido →' }}
            </button>

            <ng-template #loginToOrderBtn>
              <button type="button"
                      [disabled]="items().length === 0"
                      (click)="openAuth('login')"
                      class="w-full text-[#011640] bg-[#F7F3E9] hover:bg-[#DFF0F7] focus:ring-4 focus:outline-none focus:ring-[#6DA0BF]/40 font-extrabold rounded-xl text-xs px-5 py-3.5 disabled:opacity-45 disabled:cursor-not-allowed transition shadow-lg cursor-pointer">
                Inicia sesión para pedir →
              </button>
            </ng-template>
          </aside>
        </section>

        <!-- BANNER DE COMPROBANTE RECIENTE -->
        <div *ngIf="lastReceipt() as rec"
             class="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div>
            <span class="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">¡Pedido confirmado!</span>
            <h3 class="text-lg font-extrabold text-[#011640]">Folio {{ rec.folio }} · Total \${{ rec.total.toFixed(2) }} MXN</h3>
            <p class="text-xs text-slate-600">Tu orden ya entró a preparación en barra.</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button"
                    (click)="downloadReceipt()"
                    class="px-4 py-2.5 text-xs font-bold text-white bg-[#011640] hover:bg-[#0b2859] rounded-xl transition cursor-pointer">
              🖨️ Imprimir / Guardar comprobante
            </button>
            <button type="button"
                    (click)="lastReceipt.set(null)"
                    class="w-8 h-8 rounded-xl bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">
              ✕
            </button>
          </div>
        </div>

        <!-- BLOQUE INFERIOR: SEGUIMIENTO EN VIVO -->
        <section id="historial-pedidos" class="pt-8 border-t border-[#011640]/15 space-y-6">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span class="inline-block px-3 py-1 rounded-full bg-[#DFF0F7] border border-[#AAC8E0]/70 text-[#011640] text-[10px] font-bold tracking-widest uppercase">
                SEGUIMIENTO EN VIVO
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[#011640] mt-2">
                {{ auth.currentUser() ? 'Mis pedidos' : 'Rastrea tu pedido' }}
              </h2>
              <p class="text-xs text-[#011640]/70 mt-1">
                <ng-container *ngIf="auth.currentUser() as user; else guestHint">
                  Historial de <strong>{{ user.nombre }}</strong> ordenado del más reciente al más antiguo.
                </ng-container>
                <ng-template #guestHint>
                  Inicia sesión para ver tu historial o busca un pedido por su folio.
                </ng-template>
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <input [(ngModel)]="searchFolio"
                     placeholder="Buscar folio (ej. #FL-8232)"
                     (keyup.enter)="findByFolio()"
                     class="bg-white border border-[#AAC8E0] text-[#011640] text-xs rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] px-4 py-2.5 min-w-[210px]" />
              <button type="button"
                      (click)="findByFolio()"
                      class="px-4 py-2.5 text-xs font-bold text-[#011640] bg-white border border-[#AAC8E0] rounded-xl hover:bg-[#DFF0F7]/60 transition cursor-pointer">
                Buscar
              </button>
              <button *ngIf="auth.currentUser()"
                      type="button"
                      (click)="loadMyOrders()"
                      [disabled]="loadingTrack()"
                      class="px-4 py-2.5 text-xs font-bold text-[#F7F3E9] bg-[#011640] hover:bg-[#0b2859] rounded-xl transition cursor-pointer">
                {{ loadingTrack() ? 'Actualizando...' : 'Actualizar ↻' }}
              </button>
            </div>
          </div>

          <div *ngIf="trackMsg()" role="alert" class="p-3.5 text-xs font-semibold text-rose-800 rounded-2xl bg-[#F7F3E9]/80 border border-rose-200 backdrop-blur-xs">
            {{ trackMsg() }}
          </div>

          <!-- Resultado de búsqueda puntual por folio -->
          <article *ngIf="searchedOrder() as found" class="p-6 bg-white/95 border-2 border-[#6da0bf] rounded-3xl shadow-sm space-y-5">
            <div class="flex justify-between items-start gap-3 flex-wrap">
              <div>
                <span class="bg-[#DFF0F7] text-[#011640] text-xs font-bold px-3 py-1 rounded-full">
                  Resultado de búsqueda · {{ stageLabel(orderStage(found)) }}
                </span>
                <h3 class="text-xl font-extrabold text-[#011640] mt-2">Pedido {{ found.orderFolio || found.id }}</h3>
                <p class="text-xs text-[#011640]/70 mt-0.5">
                  A nombre de <strong>{{ found.customer || found.cliente || 'Cliente Floamy' }}</strong>
                  <span *ngIf="found.date || found.fecha"> · {{ found.date || found.fecha }}</span>
                  <span *ngIf="found.payment || found.paymentMethod"> · {{ found.payment || found.paymentMethod }}</span>
                </p>
                <p class="text-xs font-medium text-[#011640]/85 mt-2" *ngIf="formatItems(found)">
                  {{ formatItems(found) }}
                </p>
              </div>
              <div class="flex items-start gap-3">
                <div class="text-right">
                  <small class="block text-[11px] text-[#011640]/55">Total pagado</small>
                  <strong class="text-2xl font-extrabold text-[#011640]">\${{ Number(found.total || 0).toFixed(2) }}</strong>
                </div>
                <button type="button" (click)="searchedOrder.set(null)" class="w-8 h-8 rounded-xl bg-slate-100 text-xs font-bold text-[#011640] hover:bg-slate-200 cursor-pointer">✕</button>
              </div>
            </div>

            <!-- Barra de etapas -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div *ngFor="let s of stages"
                   [class]="orderStage(found) >= s.step
                     ? 'p-3 rounded-2xl bg-[#011640] text-[#F7F3E9] border border-[#011640]'
                     : 'p-3 rounded-2xl bg-white/60 text-[#011640]/50 border border-[#AAC8E0]/40'">
                <span class="block text-[10px] font-bold uppercase tracking-wider opacity-75">Paso {{ s.step }}</span>
                <strong class="block text-xs font-extrabold mt-0.5">{{ s.label }}</strong>
              </div>
            </div>
          </article>

          <!-- Estado sin sesión -->
          <div *ngIf="!auth.currentUser() && !searchedOrder()"
               class="bg-white/90 border border-[#AAC8E0]/80 rounded-3xl p-8 text-center space-y-2.5 shadow-xs">
            <strong class="block text-base font-extrabold text-[#011640]">Inicia sesión para consultar tus pedidos</strong>
            <p class="text-xs text-[#011640]/70 max-w-md mx-auto">
              Cada cuenta muestra únicamente sus propias compras y el avance de preparación en barra.
            </p>
            <div class="pt-1">
              <button type="button"
                      (click)="openAuth('login')"
                      class="inline-flex items-center px-5 py-2.5 text-xs font-bold text-[#F7F3E9] bg-[#011640] hover:bg-[#0b2859] rounded-xl transition cursor-pointer">
                Iniciar sesión →
              </button>
            </div>
          </div>

          <!-- Estado vacío con sesión -->
          <div *ngIf="auth.currentUser() && myOrders().length === 0 && !loadingTrack()"
               class="bg-white/90 border border-dashed border-[#AAC8E0] rounded-3xl p-8 text-center space-y-1.5">
            <strong class="block text-base font-extrabold text-[#011640]">Aún no tienes pedidos registrados en esta cuenta</strong>
            <p class="text-xs text-[#011640]/70">Cuando confirmes un pedido aparecerá aquí con su avance en tiempo real.</p>
          </div>

          <!-- Listado de pedidos del usuario -->
          <div class="space-y-4" *ngIf="auth.currentUser() && myOrders().length > 0">
            <article *ngFor="let order of myOrders()"
                     class="p-5 sm:p-6 bg-white/95 border border-[#AAC8E0]/80 rounded-3xl shadow-xs space-y-4">
              <div class="flex justify-between items-start gap-3 flex-wrap">
                <div>
                  <span [class]="orderStage(order) >= 4
                    ? 'bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full'
                    : 'bg-[#DFF0F7] text-[#011640] text-xs font-bold px-3 py-1 rounded-full'">
                    {{ stageLabel(orderStage(order)) }}
                  </span>
                  <h3 class="text-xl font-extrabold text-[#011640] mt-2">Pedido {{ order.orderFolio || order.id }}</h3>
                  <p class="text-xs text-[#011640]/70 mt-0.5">
                    A nombre de <strong>{{ order.customer || order.cliente || 'Cliente Floamy' }}</strong>
                    <span *ngIf="order.date || order.fecha"> · {{ order.date || order.fecha }}</span>
                    <span *ngIf="order.payment || order.paymentMethod"> · {{ order.payment || order.paymentMethod }}</span>
                    <span *ngIf="order.folio && order.folio !== (order.orderFolio || order.id)"> · Folio pago: {{ order.folio }}</span>
                  </p>
                  <p class="text-xs font-medium text-[#011640]/85 mt-2" *ngIf="formatItems(order)">
                    {{ formatItems(order) }}
                  </p>
                </div>

                <div class="text-right">
                  <small class="block text-[11px] text-[#011640]/55">Total pagado</small>
                  <strong class="text-2xl font-extrabold text-[#011640]">
                    \${{ Number(order.total || 0).toFixed(2) }}
                  </strong>
                </div>
              </div>

              <!-- Barra de 4 etapas -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div *ngFor="let s of stages"
                     [class]="orderStage(order) >= s.step
                       ? 'p-3 rounded-2xl bg-[#011640] text-[#F7F3E9] border border-[#011640] transition'
                       : 'p-3 rounded-2xl bg-[#F7F3E9]/50 text-[#011640]/45 border border-[#AAC8E0]/40 transition'">
                  <div class="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span>Paso {{ s.step }}</span>
                    <span *ngIf="orderStage(order) >= s.step">✓</span>
                  </div>
                  <strong class="block text-xs font-extrabold mt-0.5">{{ s.label }}</strong>
                </div>
              </div>
            </article>
          </div>
        </section>

      </div>
    </main>

    <app-customer-auth-modal *ngIf="authModalOpen()"
                             [initialMode]="authModalMode()"
                             (close)="authModalOpen.set(false)" />
  `
})
export class CheckoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private productsService = inject(ProductsService);
  private ordersService = inject(OrdersService);
  protected Number = Number;
  private pollTimer: any;

  items = signal<any[]>([]);
  myOrders = signal<any[]>([]);
  searchedOrder = signal<any | null>(null);
  lastReceipt = signal<TicketData | null>(null);
  selectedMethod = signal('Efectivo');
  private coupons = inject(CouponsService);
  offer = signal<CouponOffer | null>(null);
  private validationId = 0;
  couponMsg = signal<{ type: 'ok' | 'err'; text: string } | null>(null);
  submitting = signal(false);
  loadingTrack = signal(false);
  orderError = signal('');
  trackMsg = signal('');

  authModalOpen = signal(false);
  authModalMode = signal<'login' | 'register'>('login');

  customerName = '';
  couponInput = '';
  searchFolio = '';

  methods = [
    { label: 'Pago al recoger en sucursal', hint: 'Efectivo o terminal en barra', value: 'Efectivo' },
    { label: 'Tarjeta en línea', hint: 'Débito o crédito', value: 'Tarjeta' },
    { label: 'Transferencia SPEI', hint: 'Confirmación inmediata', value: 'Transferencia' }
  ];

  stages = [
    { step: 1, label: 'Pendiente' },
    { step: 2, label: 'En preparación' },
    { step: 3, label: 'Listo para recoger' },
    { step: 4, label: 'Entregado' }
  ];

  totalItemsCount = computed(() =>
    this.items().reduce((sum, i) => sum + Number(i.qty || i.cantidad || i.quantity || 1), 0)
  );

  subtotal = computed(() =>
    this.items().reduce(
      (sum, i) => sum + Number(i.price || i.precio || 0) * Number(i.qty || i.cantidad || i.quantity || 1),
      0
    )
  );

  discountAmount = computed(() => {
    const offer = this.offer();
    if (!offer) return 0;
    const cents = Math.round(this.subtotal() * 100);
    const value = Math.round(offer.valor * 100);
    return Math.min(cents, offer.tipo === 'pesos' ? value : Math.round(cents * value / 10000)) / 100;
  });
  total = computed(() => Math.max(0, this.subtotal() - this.discountAmount()));

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      if (user) {
        this.customerName = user.nombre;
        this.orderError.set('');
        this.loadMyOrders(true);
      } else {
        this.customerName = '';
        this.myOrders.set([]);
      }
    });
  }

  ngOnInit() {
    localStorage.removeItem('floamy_my_folios');
    localStorage.removeItem('floamy_last_folio');

    this.loadCart();

    this.pollTimer = setInterval(() => {
      if (this.auth.currentUser()) {
        this.loadMyOrders(false);
      }
    }, 3000);
  }

  ngOnDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  downloadReceipt() {
    const rec = this.lastReceipt();
    if (rec) {
      printFloamyTicket(rec);
    }
  }

  openAuth(mode: 'login' | 'register') {
    this.authModalMode.set(mode);
    this.authModalOpen.set(true);
  }

  private getCartKey(): string {
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

  loadCart() {
    try {
      const raw = localStorage.getItem(this.getCartKey());
      const parsed = raw ? JSON.parse(raw) : [];
      this.items.set(Array.isArray(parsed) ? parsed : []);
    } catch {
      this.items.set([]);
    }
  }

  updateQty(index: number, delta: number) {
    const updated = this.items()
      .map((item, idx) => {
        if (idx !== index) return item;
        const currentQty = Number(item.qty || item.cantidad || item.quantity || 1);
        const nextQty = currentQty + delta;
        if (nextQty <= 0) return null;
        return { ...item, qty: nextQty };
      })
      .filter(Boolean);
    this.items.set(updated);
    localStorage.setItem(this.getCartKey(), JSON.stringify(updated));
  }

  removeItem(index: number) {
    const updated = this.items().filter((_, idx) => idx !== index);
    this.items.set(updated);
    localStorage.setItem(this.getCartKey(), JSON.stringify(updated));
  }

  changeCode(value: string) {
    this.validationId++;
    this.couponInput = value;
    this.offer.set(null);
    this.couponMsg.set(null);
  }

  applyCoupon() {
    const id = ++this.validationId;
    this.offer.set(null);
    this.coupons.validate(this.couponInput.trim()).subscribe({
      next: offer => {
        if (id !== this.validationId) return;
        this.offer.set(offer);
        this.couponMsg.set({ type: 'ok', text: 'Cupón aplicado: ' + offer.codigo });
      },
      error: err => {
        if (id === this.validationId) this.couponMsg.set({ type: 'err', text: err.error?.error || 'No se pudo validar el cupón.' });
      }
    });
  }

  removeCoupon() { this.changeCode(''); }

  orderStage(order: any): number {
    const statusText = String(order?.status || order?.estado || '').toLowerCase();
    if (statusText.includes('entregado')) return 4;
    if (statusText.includes('listo')) return 3;
    if (statusText.includes('preparaci')) return 2;
    if (statusText.includes('pendiente')) return 1;

    const raw = order?.stage ?? order?.etapa;
    if (raw !== undefined && raw !== null) {
      const num = Number(raw);
      return num >= 0 && num <= 3 ? num + 1 : num;
    }
    return 1;
  }

  stageLabel(step: number): string {
    return this.stages.find((s) => s.step === step)?.label || 'Pendiente';
  }

  formatItems(order: any): string {
    if (typeof order?.detalle === 'string' && order.detalle.trim()) {
      return order.detalle;
    }
    if (Array.isArray(order?.items) && order.items.length > 0) {
      return order.items
        .map((i: any) => {
          if (typeof i === 'string') return i;
          const qty = i.qty || i.cantidad || 1;
          const name = i.name || i.nombre || i.producto || 'Helado';
          const size = i.size || i.tamano || '';
          return `${qty} × ${name}${size ? ` · ${size}` : ''}`;
        })
        .join(' · ');
    }
    return '';
  }

  private sortNewestFirst(list: any[]): any[] {
    return [...list].sort((a, b) => {
      const idA = Number(a.dbId ?? 0);
      const idB = Number(b.dbId ?? 0);
      if (idA !== idB) return idB - idA;
      return String(b.fecha || b.date || '').localeCompare(String(a.fecha || a.date || ''));
    });
  }

  loadMyOrders(showSpinner = true) {
    const user = this.auth.currentUser();
    if (!user) {
      this.myOrders.set([]);
      return;
    }

    const userName = (user.nombre || '').trim().toLowerCase();
    const userEmail = (user.correo || '').trim().toLowerCase();

    if (showSpinner) this.loadingTrack.set(true);
    this.ordersService.getOrders().subscribe({
      next: (list: any[]) => {
        if (showSpinner) this.loadingTrack.set(false);
        const filtered = list.filter((o) => {
          const uid = Number(o.usuario_id ?? 0);
          const email = String(o.correo || o.email || '').trim().toLowerCase();
          const customer = String(o.customer || o.cliente || '').trim().toLowerCase();

          const matchId = uid > 0 && uid === user.id;
          const matchEmail = Boolean(userEmail && email && !email.endsWith('@floamy.local') && email === userEmail);
          const matchName = Boolean(userName && customer === userName);

          return matchId || matchEmail || matchName;
        });

        this.myOrders.set(this.sortNewestFirst(filtered));
      },
      error: () => {
        if (showSpinner) this.loadingTrack.set(false);
      }
    });
  }

  findByFolio() {
    this.trackMsg.set('');
    const query = this.searchFolio.trim().toUpperCase();
    if (!query) return;

    this.loadingTrack.set(true);
    this.ordersService.getOrders().subscribe({
      next: (list: any[]) => {
        this.loadingTrack.set(false);
        const found = list.find((o) => {
          const of = String(o.orderFolio || o.id || '').toUpperCase();
          const pf = String(o.folio || '').toUpperCase();
          return of === query || of === `#${query}` || pf === query;
        });

        if (!found) {
          this.searchedOrder.set(null);
          this.trackMsg.set('No encontramos ningún pedido con ese folio.');
          return;
        }

        this.searchedOrder.set(found);
        this.searchFolio = '';
      },
      error: () => {
        this.loadingTrack.set(false);
        this.trackMsg.set('No se pudo consultar el pedido.');
      }
    });
  }

  placeOrder() {
    if (this.items().length === 0) return;

    const user = this.auth.currentUser();
    if (!user) {
      this.openAuth('login');
      return;
    }

    this.orderError.set('');
    this.submitting.set(true);

    const custName = this.customerName.trim() || user.nombre;
    const payMethod = this.selectedMethod();
    const subVal = this.subtotal();
    const discVal = this.discountAmount();
    const totalVal = this.total();
    const orderedItems = this.items().map((i) => ({
      name: i.name || i.nombre,
      size: i.size || i.tamano || 'Vaso 8 oz',
      qty: Number(i.qty || i.cantidad || i.quantity || 1),
      price: Number(i.price || i.precio || 0),
      toppings: i.toppings || []
    }));

    const payload = {
      codigo_cupon: this.offer()?.codigo,
      customer: custName,
      usuario_id: user.id,
      correo: user.correo,
      paymentMethod: payMethod,
      total: totalVal,
      items: this.items().map((i) => ({
        id: i.id,
        productId: i.productId || i.producto_id || i.id,
        name: i.name || i.nombre,
        size: i.size || i.tamano || 'Vaso 8 oz',
        qty: Number(i.qty || i.cantidad || i.quantity || 1),
        price: Number(i.price || i.precio || 0),
        toppings: i.toppings || [],
        toppingIds: i.toppingIds || []
      }))
    };

    this.ordersService.createOrder(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.lastReceipt.set({
          folio: res.folio,
          paymentFolio: res.paymentFolio,
          customer: custName,
          date: new Date().toLocaleString('es-MX'),
          paymentMethod: payMethod,
          canal: 'PWA Web',
          items: orderedItems,
          subtotal: subVal,
          discount: discVal,
          total: res.total ?? totalVal
        });
        this.removeCoupon();
        this.items.set([]);
        localStorage.removeItem(this.getCartKey());
        this.loadMyOrders(true);

        setTimeout(() => {
          document.getElementById('historial-pedidos')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      },
      error: (err) => {
        this.submitting.set(false);
        this.orderError.set(err?.error?.error || 'No se pudo registrar el pedido.');
      }
    });
  }
}