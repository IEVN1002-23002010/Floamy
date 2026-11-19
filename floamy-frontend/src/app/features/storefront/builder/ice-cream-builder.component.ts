import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ProductsService } from '../../../core/services/products.service';
import { CatalogOptionsService } from '../../../core/services/catalog-options.service';
import { CartItem, PresentationOption, ProductItem, ToppingOption } from '../../../core/models/product.model';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

@Component({
  selector: 'app-ice-cream-builder',
  standalone: true,
  imports: [NgFor, NgIf, CurrencyMxnPipe],
  template: `
    <section class="px-[6vw] py-8 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Configurador por pasos -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Paso 1: Tamaño -->
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span class="eyebrow">PASO 1</span>
            <h3 class="text-xl font-bold text-[#011640] mt-0.5 mb-3">Elige el tamaño</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <button *ngFor="let pres of optionsService.presentations()"
                      type="button"
                      (click)="selectPresentation(pres)"
                      [class]="selectedPres()?.id === pres.id
                        ? 'p-4 text-left rounded-2xl border-2 border-[#011640] bg-[#dff0f7]/50 transition'
                        : 'p-4 text-left rounded-2xl border border-slate-200 bg-white hover:border-[#6da0bf] transition'">
                <strong class="block text-base text-[#011640]">{{ pres.nombre }}</strong>
                <span class="text-xs font-semibold text-[#6da0bf]">{{ pres.precio | currencyMxn }}</span>
              </button>
            </div>
          </div>

          <!-- Paso 2: Sabor -->
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span class="eyebrow">PASO 2</span>
            <h3 class="text-xl font-bold text-[#011640] mt-0.5 mb-3">Elige tu sabor</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <button *ngFor="let p of productsService.products()"
                      type="button"
                      [disabled]="getStockForFlavor(p) === 0"
                      (click)="selectFlavor(p)"
                      [class]="selectedFlavor()?.id === p.id
                        ? 'p-3.5 text-left rounded-2xl border-2 border-[#011640] bg-[#dff0f7]/50 flex items-center gap-3 transition'
                        : 'p-3.5 text-left rounded-2xl border border-slate-200 bg-white hover:border-[#6da0bf] disabled:opacity-45 flex items-center gap-3 transition'">
                <div class="scoop shrink-0 !w-12 !h-12" [class]="p.tone">
                  <img *ngIf="p.image" [src]="p.image" [alt]="p.name" class="w-full h-full object-cover" />
                </div>
                <div>
                  <small class="text-[10px] font-bold uppercase text-[#6da0bf]">{{ p.flavor }}</small>
                  <strong class="block text-sm text-[#011640]">{{ p.name }}</strong>
                  <span class="text-[11px] text-slate-400">
                    {{ getStockForFlavor(p) > 0 ? getStockForFlavor(p) + ' disp.' : 'Agotado' }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <!-- Paso 3: Toppings -->
          <div class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <div>
                <span class="eyebrow">PASO 3 (OPCIONAL)</span>
                <h3 class="text-xl font-bold text-[#011640] mt-0.5">Agrega tus toppings</h3>
              </div>
              <span *ngIf="selectedToppings().length > 0" class="bg-[#dff0f7] text-[#011640] text-xs font-semibold px-3 py-1 rounded-full">
                {{ selectedToppings().length }} elegidos
              </span>
            </div>

            <p *ngIf="optionsService.toppings().length === 0" class="text-xs text-slate-400">
              Por el momento no hay toppings extras registrados.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              <button *ngFor="let t of optionsService.toppings()"
                      type="button"
                      [disabled]="t.stock === 0"
                      (click)="toggleTopping(t)"
                      [class]="isToppingSelected(t.id)
                        ? 'p-3 text-left rounded-xl border-2 border-[#011640] bg-[#dff0f7]/50 flex items-center justify-between transition'
                        : 'p-3 text-left rounded-xl border border-slate-200 bg-white hover:border-[#6da0bf] disabled:opacity-45 flex items-center justify-between transition'">
                <span class="text-xs font-bold text-[#011640]">{{ t.nombre }}</span>
                <span class="text-xs font-semibold text-[#6da0bf]">+{{ t.precio | currencyMxn }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Resumen sticky -->
        <aside class="lg:col-span-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4 lg:sticky lg:top-24">
          <div>
            <span class="eyebrow">TU CREACIÓN</span>
            <h3 class="text-xl font-bold text-[#011640] mt-0.5">Resumen del helado</h3>
          </div>

          <div class="p-4 rounded-2xl bg-[#f7f3e9] space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Tamaño:</span>
              <strong class="text-[#011640]">{{ activePres()?.nombre || 'Selecciona tamaño' }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Sabor:</span>
              <strong class="text-[#011640]">{{ activeFlavor()?.name || 'Selecciona sabor' }}</strong>
            </div>
            <div>
              <span class="text-slate-500 block mb-1">Toppings:</span>
              <strong class="text-[#011640]" *ngIf="selectedToppings().length === 0">Sin toppings extra</strong>
              <div class="flex flex-wrap gap-1" *ngIf="selectedToppings().length > 0">
                <span *ngFor="let t of selectedToppings()"
                      class="bg-white text-[#011640] border border-slate-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                  {{ t.nombre }}
                </span>
              </div>
            </div>
          </div>

          <!-- Paso 4: Cantidad de helados iguales -->
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-[#011640]">¿Cuántos helados así quieres?</span>
            <div class="inline-flex items-center gap-2">
              <button type="button"
                      [disabled]="quantity() <= 1"
                      (click)="quantity.set(quantity() - 1)"
                      class="w-8 h-8 rounded-xl border border-slate-200 bg-[#f7f3e9] text-[#011640] font-bold hover:bg-slate-200 disabled:opacity-40 transition">−</button>
              <strong class="w-6 text-center text-sm text-[#011640]">{{ quantity() }}</strong>
              <button type="button"
                      [disabled]="quantity() >= maxAvailable()"
                      (click)="quantity.set(quantity() + 1)"
                      class="w-8 h-8 rounded-xl border border-slate-200 bg-[#f7f3e9] text-[#011640] font-bold hover:bg-slate-200 disabled:opacity-40 transition">+</button>
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 space-y-1.5">
            <div class="flex justify-between text-xs text-slate-500">
              <span>Precio por helado</span>
              <strong>{{ unitPrice() | currencyMxn }}</strong>
            </div>
            <div class="flex justify-between text-base font-bold text-[#011640]">
              <span>Total</span>
              <span>{{ (unitPrice() * quantity()) | currencyMxn }} MXN</span>
            </div>
          </div>

          <button type="button"
                  [disabled]="!canAdd()"
                  (click)="addToCart()"
                  class="w-full text-white bg-[#011640] hover:bg-[#0b234a] focus:ring-4 focus:outline-none focus:ring-[#6da0bf]/40 font-semibold rounded-xl text-xs px-5 py-3.5 disabled:opacity-45 transition">
            Agregar al carrito →
          </button>
        </aside>
      </div>
    </section>

    <!-- Modal: ¿Quieres armar otro helado? -->
    <div *ngIf="askAnotherOpen()"
         tabindex="-1"
         role="dialog"
         aria-modal="true"
         class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 text-center space-y-4">
        <span class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 text-xl font-bold mx-auto">
          ✓
        </span>
        <div>
          <h3 class="text-xl font-bold text-[#011640]">¡Helado agregado al carrito!</h3>
          <p class="text-xs text-slate-500 mt-1">
            ¿Quieres armar otro helado diferente o prefieres finalizar tu pedido?
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button type="button"
                  (click)="buildAnother()"
                  class="flex-1 px-4 py-3 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
            + Sí, armar otro helado
          </button>
          <button type="button"
                  (click)="goToCheckout()"
                  class="flex-1 px-4 py-3 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl transition">
            Ir a mi pedido →
          </button>
        </div>
      </div>
    </div>
  `
})
export class IceCreamBuilderComponent {
  productsService = inject(ProductsService);
  optionsService = inject(CatalogOptionsService);
  private router = inject(Router);

  selectedPres = signal<PresentationOption | null>(null);
  selectedFlavor = signal<ProductItem | null>(null);
  selectedToppings = signal<ToppingOption[]>([]);
  quantity = signal(1);
  askAnotherOpen = signal(false);

  activePres = computed(() => this.selectedPres() || this.optionsService.presentations()[0] || null);
  activeFlavor = computed(() => this.selectedFlavor() || this.productsService.products()[0] || null);

  selectPresentation(pres: PresentationOption) {
    this.selectedPres.set(pres);
    this.quantity.set(1);
  }

  selectFlavor(p: ProductItem) {
    this.selectedFlavor.set(p);
    this.quantity.set(1);
  }

  toggleTopping(t: ToppingOption) {
    this.selectedToppings.update((list) =>
      list.some((x) => x.id === t.id) ? list.filter((x) => x.id !== t.id) : [...list, t]
    );
  }

  isToppingSelected(id?: number): boolean {
    return this.selectedToppings().some((x) => x.id === id);
  }

  getStockForFlavor(p: ProductItem): number {
    const pres = this.activePres();
    if (!pres) return 0;
    const match = (p.presentations || []).find((x) => x.presentationId === pres.id);
    return match ? match.stock : 0;
  }

  maxAvailable = computed(() => {
    const flavor = this.activeFlavor();
    if (!flavor) return 1;
    return Math.max(1, this.getStockForFlavor(flavor));
  });

  unitPrice = computed(() => {
    const base = Number(this.activePres()?.precio || 0);
    const extra = this.selectedToppings().reduce((sum, t) => sum + Number(t.precio || 0), 0);
    return base + extra;
  });

  canAdd = computed(() => {
    const pres = this.activePres();
    const flavor = this.activeFlavor();
    return Boolean(pres && flavor && this.getStockForFlavor(flavor) > 0 && this.quantity() >= 1);
  });

  addToCart() {
    const pres = this.activePres();
    const flavor = this.activeFlavor();
    if (!pres || !flavor) return;

    const match = (flavor.presentations || []).find((x) => x.presentationId === pres.id);
    const toppings = this.selectedToppings().map((t) => t.nombre);
    const toppingIds = this.selectedToppings().map((t) => t.id!).filter(Boolean);

    const raw = localStorage.getItem('floamy_cart');
    const cart: CartItem[] = raw ? JSON.parse(raw) : [];

    const key = `${match?.productId}_${toppings.slice().sort().join(',')}`;
    const existing = cart.find(
      (i) => `${i.productId}_${(i.toppings || []).slice().sort().join(',')}` === key
    );

    if (existing) {
      existing.qty += this.quantity();
    } else {
      cart.push({
        productId: match?.productId || undefined,
        name: flavor.name,
        size: pres.nombre,
        price: this.unitPrice(),
        qty: this.quantity(),
        toppings,
        toppingIds
      });
    }

    localStorage.setItem('floamy_cart', JSON.stringify(cart));
    this.askAnotherOpen.set(true);
  }

  buildAnother() {
    this.selectedToppings.set([]);
    this.quantity.set(1);
    this.askAnotherOpen.set(false);
  }

  goToCheckout() {
    this.askAnotherOpen.set(false);
    this.router.navigate(['/pedido']);
  }
}