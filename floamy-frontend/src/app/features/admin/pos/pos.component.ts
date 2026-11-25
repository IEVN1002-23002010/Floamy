import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ProductsService } from '../../../core/services/products.service';
import { CatalogOptionsService } from '../../../core/services/catalog-options.service';
import { OrdersService } from '../../../core/services/orders.service';
import { CartItem, ProductItem, ToppingOption } from '../../../core/models/product.model';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, CurrencyMxnPipe],
  template: `
    <app-page-title
      eyebrow="VENTA RÁPIDA"
      title="Punto de venta"
      [subtitle]="productsService.products().length + ' sabores · ' + optionsService.presentations().length + ' tamaños disponibles'" />

    <div class="pos-layout">
      <section class="space-y-4 min-w-0">
        <div class="filter-row">
          <input [(ngModel)]="query"
                 placeholder="Buscar sabor o producto..."
                 class="bg-white border border-slate-300 text-[#011640] text-xs rounded-full focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full px-4 py-2.5" />
        </div>

        <!-- Selector rápido de Toppings en mostrador -->
        <div *ngIf="optionsService.toppings().length > 0" class="p-3.5 bg-white border border-slate-200 rounded-2xl">
          <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Toppings opcionales para el siguiente helado
          </span>
          <div class="flex flex-wrap gap-1.5">
            <button *ngFor="let t of optionsService.toppings()"
                    type="button"
                    [disabled]="getAvailableToppingStock(t) <= 0"
                    (click)="toggleTopping(t)"
                    [class]="isToppingSelected(t.id)
                      ? 'px-3 py-1.5 text-xs font-semibold text-white bg-[#011640] rounded-full transition'
                      : 'px-3 py-1.5 text-xs font-medium text-[#0b234a] bg-[#f7f3e9] border border-slate-200 rounded-full hover:bg-slate-200 disabled:opacity-40 transition'">
              {{ t.nombre }} (+{{ t.precio | currencyMxn }})
            </button>
          </div>
        </div>

        <!-- Tarjetas por sabor con miniatura cuadrada fija -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div class="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-3 min-w-0"
               *ngFor="let p of filteredFlavors()">
            <div class="flex items-center gap-3 min-w-0">
              <div class="scoop !w-14 !h-14 !min-w-[3.5rem] rounded-2xl overflow-hidden shrink-0" [class]="p.tone">
                <img *ngIf="p.image" [src]="p.image" [alt]="p.name" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0 flex-1">
                <small class="block text-[10px] font-bold uppercase tracking-wider text-[#6da0bf] truncate">
                  {{ p.flavor }}
                </small>
                <h3 class="text-base font-bold text-[#011640] leading-snug break-words">
                  {{ p.name }}
                </h3>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5">
              <button *ngFor="let pr of p.presentations"
                      type="button"
                      (click)="selectPres(p.id!, pr.presentationId)"
                      [class]="getSelectedPres(p).presentationId === pr.presentationId
                        ? 'px-2.5 py-1 text-xs font-semibold text-white bg-[#011640] rounded-lg transition'
                        : 'px-2.5 py-1 text-xs font-medium text-[#0b234a] bg-slate-100 rounded-lg hover:bg-slate-200 transition'">
                {{ pr.name }}
              </button>
            </div>

            <div class="flex items-center justify-between pt-2.5 border-t border-slate-100">
              <div>
                <strong class="text-base text-[#011640]">{{ itemTotalPrice(p) | currencyMxn }}</strong>
                <span class="block text-[11px] text-slate-400">{{ getAvailableStock(p) }} disp.</span>
              </div>
              <button type="button"
                      class="pos-add-btn disabled:opacity-40 disabled:cursor-not-allowed"
                      [disabled]="getAvailableStock(p) <= 0"
                      (click)="addItem(p)">+</button>
            </div>
          </div>
        </div>
      </section>

      <aside class="cart-panel">
        <div class="cart-title">
          <div><h2>Pedido actual</h2><span>Venta de mostrador · {{ totalItems() }} arts.</span></div>
          <button type="button" (click)="cart.set([]); paidFolio.set(''); errorMsg.set('')">Limpiar</button>
        </div>
        <div class="cart-items">
          <div *ngIf="paidFolio()" role="alert" class="p-3 text-xs font-semibold text-emerald-800 rounded-xl bg-emerald-50 border border-emerald-200">
            Venta cobrada con folio {{ paidFolio() }}
          </div>
          <p *ngIf="cart().length === 0 && !paidFolio()" class="empty-pos-msg">
            Elige tamaño, toppings y sabor para armar el pedido.
          </p>
          <div class="cart-item" *ngFor="let c of cart(); let i = index">
            <div class="mini-scoop"></div>
            <div>
              <strong>{{ c.name }}</strong>
              <small>
                {{ c.size }}
                <span *ngIf="c.toppings?.length"> · + {{ c.toppings!.join(', ') }}</span>
                · {{ c.price | currencyMxn }} c/u
              </small>
              <div class="qty">
                <button type="button" (click)="updateQty(i, -1)">−</button>
                <span>{{ c.qty }}</span>
                <button type="button"
                        [disabled]="!canIncrementItem(c)"
                        class="disabled:opacity-35 disabled:cursor-not-allowed"
                        (click)="updateQty(i, 1)">+</button>
              </div>
            </div>
            <strong>{{ (c.qty * c.price) | currencyMxn }}</strong>
          </div>
        </div>

        <!-- Método de pago en mostrador -->
        <div class="mb-3">
          <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Método de pago
          </span>
          <div class="flex gap-1.5">
            <button *ngFor="let m of paymentMethods"
                    type="button"
                    (click)="selectedPayment.set(m)"
                    [class]="selectedPayment() === m
                      ? 'flex-auto py-2 px-2 text-[11px] text-center whitespace-nowrap font-semibold text-white bg-[#011640] rounded-xl transition'
                      : 'flex-auto py-2 px-2 text-[11px] text-center whitespace-nowrap font-medium text-[#0b234a] bg-[#f7f3e9] border border-slate-200 rounded-xl hover:bg-slate-200 transition'">
              {{ m }}
            </button>
          </div>
        </div>

        <div class="totals">
          <div><span>Subtotal</span><strong>{{ subtotal() | currencyMxn }}</strong></div>
          <div class="total"><span>Total</span><strong>{{ subtotal() | currencyMxn }}</strong></div>
        </div>
        <div *ngIf="errorMsg()" role="alert" class="p-3 mb-2 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
          {{ errorMsg() }}
        </div>
        <button type="button"
                [disabled]="cart().length === 0 || paying()"
                (click)="checkout()"
                class="w-full text-white bg-[#011640] hover:bg-[#0b234a] font-semibold rounded-xl text-xs px-5 py-3 disabled:opacity-45 transition">
          {{ paying() ? 'Cobrando...' : (paidFolio() ? 'Pago registrado · ' + paidFolio() : 'Cobrar pedido →') }}
        </button>
      </aside>
    </div>
  `
})
export class PosComponent {
  productsService = inject(ProductsService);
  optionsService = inject(CatalogOptionsService);
  private ordersService = inject(OrdersService);

  query = '';
  selectedPresMap = signal<Record<number, number>>({});
  selectedToppings = signal<ToppingOption[]>([]);
  paymentMethods = ['Efectivo', 'Tarjeta', 'Transferencia'];
  selectedPayment = signal('Efectivo');
  cart = signal<CartItem[]>([]);
  paidFolio = signal('');
  errorMsg = signal('');
  paying = signal(false);

  filteredFlavors = computed(() => {
    const q = this.query.trim().toLowerCase();
    return this.productsService.products().filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.flavor.toLowerCase().includes(q)
    );
  });

  selectPres(heladoId: number, presId: number) {
    this.selectedPresMap.update((m) => ({ ...m, [heladoId]: presId }));
  }

  getSelectedPres(p: ProductItem): any {
    const list = p.presentations || [];
    const chosenId = p.id ? this.selectedPresMap()[p.id] : undefined;
    return (
      list.find((x) => x.presentationId === chosenId) ||
      list[0] || {
        presentationId: 1,
        productId: p.cupProductId,
        name: 'Vaso 8 oz',
        price: 45,
        stock: p.stockCup,
      }
    );
  }

  toggleTopping(t: ToppingOption) {
    this.selectedToppings.update((list) =>
      list.some((x) => x.id === t.id) ? list.filter((x) => x.id !== t.id) : [...list, t]
    );
  }

  isToppingSelected(id?: number) {
    return this.selectedToppings().some((x) => x.id === id);
  }

  getAvailableToppingStock(t: ToppingOption): number {
    if (!t.id) return Number(t.stock ?? 0);
    const used = this.cart()
      .filter((item) => (item.toppingIds || []).includes(t.id!))
      .reduce((sum, item) => sum + item.qty, 0);
    return Math.max(0, Number(t.stock ?? 0) - used);
  }

  itemTotalPrice(p: ProductItem) {
    const base = this.getSelectedPres(p).price;
    const extra = this.selectedToppings().reduce((s, t) => s + Number(t.precio || 0), 0);
    return base + extra;
  }

  totalItems = () => this.cart().reduce((s, i) => s + i.qty, 0);
  subtotal = () => this.cart().reduce((s, i) => s + i.price * i.qty, 0);

  private findProductAndPres(productId?: number, fallbackName?: string, fallbackSize?: string): { prod?: any; pres?: any } {
    const all = this.productsService.products() as any[];
    if (productId != null) {
      for (const prod of all) {
        const pres = (prod.presentations || []).find((pr: any) => pr.productId === productId);
        if (pres) return { prod, pres };
      }
    }
    if (fallbackName) {
      const prod = all.find((p) => p.name === fallbackName);
      if (prod) {
        const pres = (prod.presentations || []).find((pr: any) => pr.name === fallbackSize) || prod.presentations?.[0];
        return { prod, pres };
      }
    }
    return {};
  }

  getRemainingUnits(prod: any, pres: any, toppingIds: number[] = []): number {
    if (!prod || !pres) return 0;

    const currentCart = this.cart();
    const baseStock = Number(pres.stock ?? 0);
    if (baseStock <= 0) return 0;

    // 1. Límite directo del producto (sabor + tamaño)
    const usedSameProduct = currentCart
      .filter((item) => item.productId === pres.productId)
      .reduce((sum, item) => sum + item.qty, 0);
    let remaining = Math.max(0, baseStock - usedSameProduct);

    // 2. Límite por litros totales disponibles de ese sabor
    const stockLitros = prod.stockLitros;
    const litrosPorUnidad = Number(pres.litrosConsumidos || 0);
    if (stockLitros != null && litrosPorUnidad > 0) {
      const usedLiters = currentCart.reduce((sum, item) => {
        const found = this.findProductAndPres(item.productId, item.name, item.size);
        if (found.prod?.id === prod.id) {
          return sum + item.qty * Number(found.pres?.litrosConsumidos || 0);
        }
        return sum;
      }, 0);
      const remLiters = Math.max(0, Number(stockLitros) - usedLiters);
      const remByLiters = Math.floor((remLiters + 1e-6) / litrosPorUnidad);
      remaining = Math.min(remaining, remByLiters);
    }

    // 3. Límite por empaques compartidos entre distintos sabores (ej. Cono o Vaso)
    const desechableId = pres.ingredienteDesechableId;
    const desechableStock = pres.desechableStock;
    if (desechableId != null && desechableStock != null) {
      const usedDisposables = currentCart.reduce((sum, item) => {
        const found = this.findProductAndPres(item.productId, item.name, item.size);
        if (Number(found.pres?.ingredienteDesechableId) === Number(desechableId)) {
          return sum + item.qty;
        }
        return sum;
      }, 0);
      const remByDisposable = Math.max(0, Number(desechableStock) - usedDisposables);
      remaining = Math.min(remaining, remByDisposable);
    }

    // 4. Límite por cucharas compartidas entre distintos tamaños y sabores
    const cucharaId = pres.cucharaIngredienteId;
    const cucharaStock = pres.cucharaStock;
    if (cucharaId != null && cucharaStock != null) {
      const usedSpoons = currentCart.reduce((sum, item) => {
        const found = this.findProductAndPres(item.productId, item.name, item.size);
        if (Number(found.pres?.cucharaIngredienteId) === Number(cucharaId)) {
          return sum + item.qty;
        }
        return sum;
      }, 0);
      const remBySpoon = Math.max(0, Number(cucharaStock) - usedSpoons);
      remaining = Math.min(remaining, remBySpoon);
    }

    // 5. Límite por stock de toppings seleccionados
    for (const tid of toppingIds) {
      const topObj = this.optionsService.toppings().find((t) => t.id === tid);
      if (topObj && topObj.stock != null) {
        const remTop = this.getAvailableToppingStock(topObj);
        remaining = Math.min(remaining, remTop);
      }
    }

    return Math.max(0, remaining);
  }

  getAvailableStock(p: ProductItem): number {
    const pr = this.getSelectedPres(p);
    const toppingIds = this.selectedToppings().map((t) => t.id!).filter(Boolean);
    return this.getRemainingUnits(p, pr, toppingIds);
  }

  canIncrementItem(item: CartItem): boolean {
    const { prod, pres } = this.findProductAndPres(item.productId, item.name, item.size);
    if (!prod || !pres) return false;
    return this.getRemainingUnits(prod, pres, item.toppingIds || []) > 0;
  }

  addItem(p: ProductItem) {
    const pr = this.getSelectedPres(p);
    const toppingIds = this.selectedToppings().map((t) => t.id!).filter(Boolean);
    if (!pr || this.getRemainingUnits(p, pr, toppingIds) <= 0) return;

    this.paidFolio.set('');
    this.errorMsg.set('');

    const toppings = this.selectedToppings().map((t) => t.nombre);
    const unitPrice = this.itemTotalPrice(p);
    const key = `${pr.productId}_${toppings.slice().sort().join(',')}`;

    this.cart.update((list) => {
      const idx = list.findIndex((x) => `${x.productId}_${(x.toppings || []).slice().sort().join(',')}` === key);
      if (idx >= 0) {
        return list.map((x, i) => (i === idx ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...list,
        {
          productId: pr.productId || undefined,
          name: p.name,
          size: pr.name,
          price: unitPrice,
          qty: 1,
          toppings,
          toppingIds,
        },
      ];
    });

    this.selectedToppings.set([]);
  }

  updateQty(index: number, delta: number) {
    const current = this.cart()[index];
    if (!current) return;
    if (delta > 0 && !this.canIncrementItem(current)) return;

    this.cart.update((list) =>
      list
        .map((item, i) => (i === index ? { ...item, qty: item.qty + delta } : item))
        .filter((i) => i.qty > 0)
    );
  }

  checkout() {
    if (this.cart().length === 0 || this.paying()) return;
    this.errorMsg.set('');
    this.paying.set(true);

    const sub = this.subtotal();
    this.ordersService.createOrder({
      customer: 'Venta de mostrador',
      customerName: 'Venta de mostrador',
      items: this.cart(),
      subtotal: sub,
      descuento: 0,
      total: sub,
      paymentMethod: this.selectedPayment(),
      canal: 'Sucursal'
    }).subscribe({
      next: (res) => {
        this.paying.set(false);
        this.paidFolio.set(res.folio);
        this.cart.set([]);
        this.productsService.loadProducts().subscribe();
        this.optionsService.loadToppings().subscribe();
      },
      error: (err) => {
        this.paying.set(false);
        this.errorMsg.set(err?.error?.error || 'No se pudo cobrar el pedido.');
      }
    });
  }
}