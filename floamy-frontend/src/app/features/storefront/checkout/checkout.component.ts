import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrdersService } from '../../../core/services/orders.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, RouterLink],
  styles: [`
    .my-orders-section { padding: 12px 6vw 56px; }
    .orders-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .orders-stack { display: flex; flex-direction: column; gap: 16px; }
    .customer-order-card .customer-timeline { margin: 14px 0 0; }
  `],
  template: `
    <section class="checkout">
      <div>
        <span class="eyebrow">TU CANASTA</span>
        <h1>Revisa tu pedido</h1>

        <div class="empty-cart" *ngIf="items().length === 0">
          <strong>No tienes productos en tu carrito</strong>
          <p>Elige tus helados favoritos antes de finalizar tu compra.</p>
          <a routerLink="/sabores"
             class="mt-3.5 inline-flex items-center px-5 py-3 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl transition"
             style="text-decoration:none;">
            Explorar sabores →
          </a>
        </div>

        <div class="checkout-item" *ngFor="let item of items(); let i = index">
          <span class="mini-scoop"></span>
          <div>
            <strong>{{ item.name || item.nombre }}</strong>
            <span>{{ item.size || item.tamano || 'Vaso 8 oz' }} · Cantidad: {{ item.qty || item.cantidad || item.quantity || 1 }}</span>
            <span *ngIf="item.toppings?.length" style="display:block; font-size:11px; color:var(--sky-dark); font-weight:600; margin-top:2px;">
              + {{ item.toppings.join(', ') }}
            </span>
          </div>
          <strong>\${{ ((item.price || item.precio || 0) * (item.qty || item.cantidad || item.quantity || 1)).toFixed(2) }}</strong>
          <button type="button" (click)="removeItem(i)">✕</button>
        </div>
      </div>

      <aside class="space-y-3">
        <div>
          <span class="eyebrow">PAGO Y RECOLECCIÓN</span>
          <h2 class="text-xl font-bold text-[#011640] mt-1">Resumen</h2>
        </div>

        <div>
          <label class="block mb-1 text-xs font-semibold text-[#0b234a]">¿A nombre de quién?</label>
          <input [(ngModel)]="customerName" placeholder="Tu nombre"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>

        <div class="pay-methods">
          <button type="button" *ngFor="let m of methods"
                  [class.active]="selectedMethod() === m.value"
                  (click)="selectedMethod.set(m.value)">
            {{ m.label }}
          </button>
        </div>

        <div class="flex gap-1.5">
          <input [(ngModel)]="couponInput" placeholder="Código (HOLAFLOAMY)"
                 class="flex-1 bg-slate-50 border border-slate-300 text-[#011640] text-xs rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] px-3 py-2" />
          <button type="button" (click)="applyCoupon()"
                  class="px-3.5 py-2 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition">
            Aplicar
          </button>
        </div>

        <div class="totals">
          <div><span>Subtotal</span><strong>\${{ subtotal().toFixed(2) }}</strong></div>
          <div class="discount" *ngIf="discountRate() > 0">
            <span>Descuento (10%)</span><strong>-\${{ discountAmount().toFixed(2) }}</strong>
          </div>
          <div class="total"><span>Total a pagar</span><strong>\${{ total().toFixed(2) }} MXN</strong></div>
        </div>

        <div *ngIf="orderError()" role="alert" class="p-3 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
          {{ orderError() }}
        </div>

        <button type="button"
                [disabled]="items().length === 0 || submitting()"
                (click)="placeOrder()"
                class="w-full text-white bg-[#011640] hover:bg-[#0b234a] focus:ring-4 focus:outline-none focus:ring-[#6da0bf]/40 font-semibold rounded-xl text-xs px-5 py-3 disabled:opacity-45 transition">
          {{ submitting() ? 'Enviando pedido...' : 'Confirmar pedido →' }}
        </button>
      </aside>
    </section>

    <section class="my-orders-section" id="historial-pedidos">
      <div class="orders-header-bar">
        <div>
          <span class="eyebrow">SEGUIMIENTO EN VIVO</span>
          <h2 class="text-2xl font-bold text-[#011640] my-1">
            {{ auth.currentUser() ? 'Mis pedidos' : 'Rastrea tu pedido' }}
          </h2>
          <p class="text-xs text-slate-500">
            <ng-container *ngIf="auth.currentUser() as user; else guestHint">
              Historial de <strong>{{ user.nombre }}</strong> ordenado del más reciente al más antiguo.
            </ng-container>
            <ng-template #guestHint>
              Inicia sesión para ver tu historial completo o busca un pedido por su folio.
            </ng-template>
          </p>
        </div>

        <div class="flex gap-2 flex-wrap items-center">
          <input [(ngModel)]="searchFolio"
                 placeholder="Buscar folio (ej. #FL-8232 o FP-9238214)"
                 (keyup.enter)="findByFolio()"
                 class="bg-white border border-slate-300 text-[#011640] text-xs rounded-full focus:ring-[#6da0bf] focus:border-[#6da0bf] px-4 py-2.5 min-w-[200px]" />
          <button type="button" (click)="findByFolio()"
                  class="px-4 py-2 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition">
            Buscar
          </button>
          <button type="button" (click)="loadMyOrders()" [disabled]="loadingTrack()"
                  class="px-4 py-2 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl transition">
            {{ loadingTrack() ? 'Actualizando...' : 'Actualizar ↻' }}
          </button>
        </div>
      </div>

      <div *ngIf="trackMsg()" role="alert" class="p-3 mb-3 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
        {{ trackMsg() }}
      </div>

      <div class="empty-cart" *ngIf="myOrders().length === 0 && !loadingTrack()">
        <strong>Aún no tienes pedidos registrados aquí</strong>
        <p>Cuando confirmes un pedido aparecerá en esta lista con su avance en tiempo real.</p>
      </div>

      <div class="orders-stack">
        <article class="customer-order-card p-6 bg-white border border-slate-200 rounded-2xl shadow-sm" *ngFor="let order of myOrders()">
          <div class="flex justify-between items-start gap-3 flex-wrap mb-3.5">
            <div>
              <span [class]="orderStage(order) >= 4
                ? 'bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full'
                : 'bg-[#dff0f7] text-[#011640] text-xs font-semibold px-3 py-1 rounded-full'">
                {{ stageLabel(orderStage(order)) }}
              </span>
              <h3 class="text-xl font-bold text-[#011640] mt-2 mb-0.5">Pedido {{ order.orderFolio || order.id }}</h3>
              <p class="text-xs text-slate-500">
                A nombre de <strong>{{ order.customer || order.cliente || 'Cliente Floamy' }}</strong>
                <span *ngIf="order.date || order.fecha"> · {{ order.date || order.fecha }}</span>
                <span *ngIf="order.payment || order.paymentMethod"> · {{ order.payment || order.paymentMethod }}</span>
                <span *ngIf="order.folio && order.folio !== (order.orderFolio || order.id)"> · Folio pago: {{ order.folio }}</span>
              </p>
              <p class="text-xs text-slate-500 mt-1.5" *ngIf="formatItems(order)">
                {{ formatItems(order) }}
              </p>
            </div>

            <div class="text-right">
              <small class="block text-[11px] text-slate-400">Total pagado</small>
              <strong class="text-2xl font-bold text-[#011640]">
                \${{ Number(order.total || 0).toFixed(2) }}
              </strong>
            </div>
          </div>

          <div class="customer-timeline">
            <div *ngFor="let s of stages" [class.active]="orderStage(order) >= s.step">
              <span>Paso {{ s.step }}</span>
              <strong>{{ s.label }}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  `
})
export class CheckoutComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private ordersService = inject(OrdersService);
  protected Number = Number;
  private pollTimer: any;

  items = signal<any[]>([]);
  myOrders = signal<any[]>([]);
  selectedMethod = signal('Efectivo');
  discountRate = signal(0);
  submitting = signal(false);
  loadingTrack = signal(false);
  orderError = signal('');
  trackMsg = signal('');

  customerName = '';
  couponInput = '';
  searchFolio = '';

  methods = [
    { label: 'Pago al recoger en sucursal', value: 'Efectivo' },
    { label: 'Tarjeta en línea', value: 'Tarjeta' },
    { label: 'Transferencia SPEI', value: 'Transferencia' }
  ];

  stages = [
    { step: 1, label: 'Pendiente' },
    { step: 2, label: 'En preparación' },
    { step: 3, label: 'Listo para recolección' },
    { step: 4, label: 'Entregado' }
  ];

  subtotal = computed(() =>
    this.items().reduce(
      (sum, i) => sum + Number(i.price || i.precio || 0) * Number(i.qty || i.cantidad || i.quantity || 1),
      0
    )
  );

  discountAmount = computed(() => this.subtotal() * this.discountRate());
  total = computed(() => Math.max(0, this.subtotal() - this.discountAmount()));

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user?.nombre) {
      this.customerName = user.nombre;
    }
    this.loadCart();
    this.loadMyOrders(true);

    this.pollTimer = setInterval(() => {
      this.loadMyOrders(false);
    }, 3000);
  }

  ngOnDestroy() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
  }

  private getCartKey(): string {
    for (const key of ['floamy_cart', 'cart', 'floamy_pedido']) {
      if (localStorage.getItem(key) !== null) return key;
    }
    return 'floamy_cart';
  }

  private getSavedFolios(): string[] {
    try {
      const raw = localStorage.getItem('floamy_my_folios');
      const list = raw ? JSON.parse(raw) : [];
      const legacy = localStorage.getItem('floamy_last_folio');
      if (legacy && !list.includes(legacy)) list.unshift(legacy);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  private saveFolioLocally(folio: string) {
    if (!folio) return;
    const current = this.getSavedFolios();
    const updated = [folio, ...current.filter((f) => f.toUpperCase() !== folio.toUpperCase())];
    localStorage.setItem('floamy_my_folios', JSON.stringify(updated));
    localStorage.setItem('floamy_last_folio', folio);
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

  removeItem(index: number) {
    const updated = this.items().filter((_, idx) => idx !== index);
    this.items.set(updated);
    localStorage.setItem(this.getCartKey(), JSON.stringify(updated));
  }

  applyCoupon() {
    if (this.couponInput.trim().toUpperCase() === 'HOLAFLOAMY') {
      this.discountRate.set(0.1);
    }
  }

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
    const userName = (user?.nombre || '').trim().toLowerCase();
    const userEmail = (user?.correo || '').trim().toLowerCase();
    const savedFolios = this.getSavedFolios().map((f) => f.toUpperCase());

    if (!user && savedFolios.length === 0) {
      this.myOrders.set([]);
      return;
    }

    if (showSpinner) this.loadingTrack.set(true);
    this.ordersService.getOrders().subscribe({
      next: (list: any[]) => {
        if (showSpinner) this.loadingTrack.set(false);
        const filtered = list.filter((o) => {
          const orderFolio = String(o.orderFolio || o.id || '').toUpperCase();
          const payFolio = String(o.folio || '').toUpperCase();
          const customer = String(o.customer || o.cliente || '').trim().toLowerCase();
          const email = String(o.correo || o.email || '').trim().toLowerCase();
          const uid = Number(o.usuario_id ?? o.cliente_id ?? 0);

          if (user && uid > 0 && uid === user.id) return true;
          if (userName && customer === userName) return true;
          if (userEmail && email && email === userEmail) return true;
          if (savedFolios.includes(orderFolio) || savedFolios.includes(payFolio)) return true;
          return false;
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
          this.trackMsg.set('No encontramos ningún pedido con ese folio.');
          return;
        }

        this.saveFolioLocally(found.orderFolio || found.id);
        this.searchFolio = '';
        this.loadMyOrders(true);
      },
      error: () => {
        this.loadingTrack.set(false);
        this.trackMsg.set('No se pudo consultar el pedido.');
      }
    });
  }

  placeOrder() {
    if (this.items().length === 0) return;
    this.orderError.set('');
    this.submitting.set(true);

    const payload = {
      customer: this.customerName.trim() || this.auth.currentUser()?.nombre || 'Cliente Web',
      usuario_id: this.auth.currentUser()?.id || null,
      paymentMethod: this.selectedMethod(),
      total: this.total(),
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
        this.items.set([]);
        localStorage.removeItem(this.getCartKey());
        this.saveFolioLocally(res.folio);
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