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
    <section class="w-full">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- Panel izquierdo unificado con los 3 pasos -->
        <div class="lg:col-span-8 bg-white/95 backdrop-blur-md border border-[#AAC8E0]/80 rounded-[1.75rem] shadow-lg shadow-[#011640]/5 divide-y divide-[#AAC8E0]/40 overflow-hidden">
          
          <!-- PASO 1: Tamaño -->
          <div class="p-5 sm:p-6">
            <div class="flex items-center justify-between mb-3.5">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-full bg-[#011640] text-[#F7F3E9] text-xs font-extrabold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h3 class="text-base sm:text-lg font-extrabold text-[#011640] leading-tight">Elige el tamaño</h3>
                  <span class="text-xs text-[#011640]/60">Selecciona la presentación de tu helado</span>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <button *ngFor="let pres of optionsService.presentations()"
                      type="button"
                      (click)="selectPresentation(pres)"
                      [class]="activePres()?.id === pres.id
                        ? 'group relative overflow-hidden text-left rounded-2xl border-2 border-[#011640] bg-[#DFF0F7]/50 shadow-sm shadow-[#011640]/10 transition cursor-pointer'
                        : 'group relative overflow-hidden text-left rounded-2xl border border-[#AAC8E0]/60 bg-[#F7F3E9]/40 hover:bg-white hover:border-[#6DA0BF] transition cursor-pointer'">
                <div class="w-full h-28 sm:h-32 bg-[#F7F3E9] overflow-hidden relative">
                  <img *ngIf="pres.imagen_url"
                       [src]="pres.imagen_url"
                       [alt]="pres.nombre"
                       class="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <div *ngIf="!pres.imagen_url"
                       class="w-full h-full flex items-center justify-center text-xs font-bold text-[#6DA0BF] bg-gradient-to-br from-[#F7F3E9] to-[#DFF0F7]/50">
                    {{ pres.nombre }}
                  </div>
                  <span *ngIf="activePres()?.id === pres.id"
                        class="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#011640] text-[#F7F3E9] text-xs flex items-center justify-center font-bold shadow">
                    ✓
                  </span>
                </div>
                <div class="px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <strong class="text-sm font-extrabold text-[#011640] truncate">{{ pres.nombre }}</strong>
                  <span class="px-2.5 py-0.5 rounded-lg bg-white border border-[#AAC8E0]/60 text-xs font-extrabold text-[#011640] shrink-0">
                    {{ pres.precio | currencyMxn }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <!-- PASO 2: Sabor -->
          <div class="p-5 sm:p-6">
            <div class="flex items-center gap-3 mb-3.5">
              <span class="w-7 h-7 rounded-full bg-[#011640] text-[#F7F3E9] text-xs font-extrabold flex items-center justify-center shrink-0">2</span>
              <div>
                <h3 class="text-base sm:text-lg font-extrabold text-[#011640] leading-tight">Elige tu sabor</h3>
                <span class="text-xs text-[#011640]/60">Preparados al momento con fruta natural</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div *ngFor="let p of productsService.products()" class="relative min-w-0">
                <button type="button"
                        class="w-full pr-9"
                        [disabled]="getStockForFlavor(p) === 0"
                        (click)="selectFlavor(p)"
                        [class]="activeFlavor()?.id === p.id
                          ? 'relative w-full p-3 pr-9 text-left rounded-2xl border-2 border-[#011640] bg-[#DFF0F7]/60 flex items-center gap-3 shadow-xs transition cursor-pointer'
                          : 'relative w-full p-3 pr-9 text-left rounded-2xl border border-[#AAC8E0]/60 bg-[#F7F3E9]/35 hover:bg-white hover:border-[#6DA0BF] disabled:opacity-45 disabled:cursor-not-allowed flex items-center gap-3 transition cursor-pointer'">
                  <div class="scoop shrink-0 !w-11 !h-11 rounded-full overflow-hidden ring-2 ring-white shadow-xs" [class]="p.tone">
                    <img *ngIf="p.image" [src]="p.image" [alt]="p.name" class="w-full h-full object-cover" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-1">
                      <strong class="block text-xs sm:text-sm font-extrabold text-[#011640] leading-tight truncate">{{ p.name }}</strong>
                      <span *ngIf="activeFlavor()?.id === p.id"
                            class="w-4 h-4 rounded-full bg-[#011640] text-[#F7F3E9] text-[10px] flex items-center justify-center font-bold shrink-0">✓</span>
                    </div>
                    <div class="flex items-center justify-between mt-1">
                      <span class="text-[10px] font-bold uppercase tracking-wider text-[#6DA0BF] truncate">{{ p.flavor }}</span>
                      <span class="text-[10px] font-semibold shrink-0 pr-1"
                            [class]="getStockForFlavor(p) > 0 ? 'text-[#011640]/60' : 'text-rose-500'">
                        {{ getStockForFlavor(p) > 0 ? getStockForFlavor(p) + ' disp.' : 'Agotado' }}
                      </span>
                    </div>
                  </div>
                </button>
                <button type="button"
                        class="absolute right-2 bottom-2 z-10 w-6 h-6 rounded-full border border-[#AAC8E0] bg-white text-[#011640] text-xs font-extrabold hover:bg-[#DFF0F7] transition"
                        [attr.aria-label]="'Ver ingredientes de ' + p.name"
                        title="Ver ingredientes"
                        (click)="showFlavorIngredients(p)">
                  i
                </button>
              </div>
            </div>
          </div>

          <!-- PASO 3: Toppings estilo píldoras -->
          <div class="p-5 sm:p-6">
            <div class="flex items-center justify-between mb-3.5">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 rounded-full bg-[#DFF0F7] border border-[#AAC8E0] text-[#011640] text-xs font-extrabold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h3 class="text-base sm:text-lg font-extrabold text-[#011640] leading-tight">Agrega tus toppings</h3>
                  <span class="text-xs text-[#011640]/60">Opcional · Dale un toque extra</span>
                </div>
              </div>
              <span *ngIf="selectedToppings().length > 0"
                    class="bg-[#011640] text-[#F7F3E9] text-[11px] font-bold px-3 py-1 rounded-full">
                {{ selectedToppings().length }} elegidos
              </span>
            </div>

            <p *ngIf="optionsService.toppings().length === 0" class="text-xs text-[#011640]/60">
              Por el momento no hay toppings extras registrados.
            </p>

            <div class="flex flex-wrap gap-2">
              <div *ngFor="let t of optionsService.toppings()" class="inline-flex items-center gap-1.5">
                <button type="button"
                        [disabled]="t.stock === 0"
                        (click)="toggleTopping(t)"
                        [class]="isToppingSelected(t.id)
                          ? 'px-3.5 py-2 rounded-full border-2 border-[#011640] bg-[#011640] text-[#F7F3E9] text-xs font-bold inline-flex items-center gap-2 shadow-xs transition cursor-pointer'
                          : 'px-3.5 py-2 rounded-full border border-[#AAC8E0] bg-[#F7F3E9]/50 hover:bg-[#DFF0F7]/60 text-[#011640] disabled:opacity-45 disabled:cursor-not-allowed text-xs font-bold inline-flex items-center gap-2 transition cursor-pointer'">
                  <span>{{ isToppingSelected(t.id) ? '✓' : '+' }} {{ t.nombre }}</span>
                  <span [class]="isToppingSelected(t.id) ? 'text-[#AAC8E0]' : 'text-[#6DA0BF]'">+{{ t.precio | currencyMxn }}</span>
                </button>
                <button type="button"
                        class="w-6 h-6 rounded-full border border-[#AAC8E0] bg-white text-[#011640] text-xs font-extrabold hover:bg-[#DFF0F7] transition"
                        [attr.aria-label]="'Ver ingrediente de ' + t.nombre"
                        title="Ver ingrediente"
                        (click)="showToppingIngredients(t)">
                  i
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Resumen sticky oscuro -->
        <aside class="lg:col-span-4 p-5 sm:p-6 bg-gradient-to-b from-[#011640] via-[#072152] to-[#0b2859] text-[#F7F3E9] border border-[#6DA0BF]/40 rounded-[1.75rem] shadow-xl shadow-[#011640]/20 space-y-4 lg:sticky lg:top-24">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold tracking-widest uppercase text-[#AAC8E0]">TU CREACIÓN</span>
              <h3 class="text-xl font-extrabold text-white mt-0.5">Resumen del helado</h3>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-white/10 text-[11px] font-bold text-[#DFF0F7]">
              15 min
            </span>
          </div>

          <!-- Vista previa del helado activo -->
          <div class="p-3.5 rounded-2xl bg-white/10 border border-[#AAC8E0]/25 space-y-3 text-xs">
            <div *ngIf="activeFlavor()" class="flex items-center gap-3 pb-2.5 border-b border-white/15">
              <div class="scoop shrink-0 !w-11 !h-11 rounded-full overflow-hidden ring-2 ring-white/30" [class]="activeFlavor()!.tone">
                <img *ngIf="activeFlavor()!.image" [src]="activeFlavor()!.image" [alt]="activeFlavor()!.name" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0 flex-1">
                <strong class="block text-sm font-extrabold text-white truncate">{{ activeFlavor()!.name }}</strong>
                <span class="text-[11px] text-[#AAC8E0]">{{ activePres()?.nombre || 'Selecciona tamaño' }}</span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-[#DFF0F7]/75">Tamaño:</span>
              <strong class="text-white font-bold">{{ activePres()?.nombre || 'Selecciona tamaño' }}</strong>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-[#DFF0F7]/75">Sabor:</span>
              <strong class="text-white font-bold">{{ activeFlavor()?.name || 'Selecciona sabor' }}</strong>
            </div>
            <div class="pt-2 border-t border-white/15">
              <span class="text-[#DFF0F7]/75 block mb-1.5">Toppings:</span>
              <strong class="text-[#AAC8E0]" *ngIf="selectedToppings().length === 0">Sin toppings extra</strong>
              <div class="flex flex-wrap gap-1.5" *ngIf="selectedToppings().length > 0">
                <span *ngFor="let t of selectedToppings()"
                      class="bg-[#DFF0F7] text-[#011640] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                  {{ t.nombre }}
                </span>
              </div>
            </div>
          </div>

          <!-- Cantidad -->
          <div class="flex items-center justify-between bg-white/5 border border-white/15 rounded-2xl px-4 py-2.5">
            <span class="text-xs font-semibold text-[#DFF0F7]">Cantidad</span>
            <div class="inline-flex items-center gap-3">
              <button type="button"
                      [disabled]="quantity() <= 1"
                      (click)="quantity.set(quantity() - 1)"
                      class="w-8 h-8 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 disabled:opacity-35 transition cursor-pointer">−</button>
              <strong class="w-5 text-center text-sm font-extrabold text-white">{{ quantity() }}</strong>
              <button type="button"
                      [disabled]="quantity() >= maxAvailable()"
                      (click)="quantity.set(quantity() + 1)"
                      class="w-8 h-8 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 disabled:opacity-35 transition cursor-pointer">+</button>
            </div>
          </div>

          <div class="pt-2 border-t border-white/15 space-y-1">
            <div class="flex justify-between text-xs text-[#AAC8E0]">
              <span>Precio por helado</span>
              <strong class="text-white">{{ unitPrice() | currencyMxn }}</strong>
            </div>
            <div class="flex justify-between items-baseline pt-1">
              <span class="text-sm font-bold text-[#DFF0F7]">Total</span>
              <span class="text-2xl font-extrabold text-white">{{ (unitPrice() * quantity()) | currencyMxn }} <small class="text-xs font-normal text-[#AAC8E0]">MXN</small></span>
            </div>
          </div>

          <button type="button"
                  [disabled]="!canAdd()"
                  (click)="addToCart()"
                  class="w-full text-[#011640] bg-[#F7F3E9] hover:bg-[#DFF0F7] focus:ring-4 focus:outline-none focus:ring-[#6DA0BF]/40 font-extrabold rounded-xl text-xs px-5 py-3.5 disabled:opacity-45 transition shadow-lg cursor-pointer">
            Agregar al carrito →
          </button>
        </aside>
      </div>
    </section>

    <!-- Modal: ingredientes de sabor o topping -->
    <div *ngIf="ingredientInfo() as info"
         class="fixed inset-0 z-[60] flex items-center justify-center bg-[#011640]/60 backdrop-blur-sm p-4"
         role="dialog" aria-modal="true" aria-labelledby="ingredient-info-title"
         (click)="ingredientInfo.set(null)">
      <article class="w-full max-w-md rounded-3xl border border-[#AAC8E0] bg-[#F7F3E9] p-6 shadow-2xl"
               (click)="$event.stopPropagation()">
        <div class="flex items-start justify-between gap-4">
          <div>
            <span class="text-[10px] font-extrabold tracking-widest uppercase text-[#6DA0BF]">INFORMACIÓN DEL PRODUCTO</span>
            <h3 id="ingredient-info-title" class="mt-1 text-xl font-extrabold text-[#011640]">{{ info.title }}</h3>
          </div>
          <button type="button" (click)="ingredientInfo.set(null)"
                  class="w-8 h-8 rounded-xl border border-[#AAC8E0] bg-white text-[#011640] font-bold hover:bg-[#DFF0F7]"
                  aria-label="Cerrar">×</button>
        </div>

        <div class="mt-5 rounded-2xl border border-[#AAC8E0]/70 bg-white p-4">
          <h4 class="text-sm font-extrabold text-[#011640]">Ingredientes registrados en la receta</h4>
          <ul *ngIf="info.ingredients.length > 0; else noIngredients" class="mt-3 space-y-2">
            <li *ngFor="let ingredient of info.ingredients" class="flex items-start gap-2 text-sm text-[#011640]/80">
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6DA0BF]"></span>
              <span>{{ ingredient }}</span>
            </li>
          </ul>
          <ng-template #noIngredients>
            <p class="mt-2 text-xs leading-relaxed text-[#011640]/65">Aún no hay ingredientes vinculados en la receta de este producto.</p>
          </ng-template>
        </div>

        <p class="mt-4 rounded-xl border border-[#AAC8E0]/60 bg-[#DFF0F7]/70 p-3 text-[11px] leading-relaxed text-[#011640]/75">
          La base de datos registra ingredientes, pero no contiene una declaración completa de alérgenos o trazas. Si tienes una alergia, confirma la información con el personal antes de pedir.
        </p>
      </article>
    </div>

    <!-- Modal: ¿Quieres armar otro helado? -->
    <div *ngIf="askAnotherOpen()"
         tabindex="-1"
         role="dialog"
         aria-modal="true"
         class="fixed inset-0 z-50 flex items-center justify-center bg-[#011640]/60 backdrop-blur-xs p-4">
      <div class="w-full max-w-md bg-[#F7F3E9] rounded-3xl shadow-2xl border border-[#AAC8E0] p-7 text-center space-y-4">
        <span class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#011640] text-[#DFF0F7] text-xl font-bold mx-auto shadow-md">
          ✓
        </span>
        <div>
          <h3 class="text-xl font-extrabold text-[#011640]">¡Helado agregado al carrito!</h3>
          <p class="text-xs text-[#011640]/75 mt-1">
            ¿Quieres armar otro helado diferente o prefieres finalizar tu pedido?
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button type="button"
                  (click)="buildAnother()"
                  class="flex-1 px-4 py-3 text-xs font-bold text-[#011640] bg-white border border-[#AAC8E0] rounded-xl hover:bg-[#DFF0F7]/60 transition cursor-pointer">
            + Sí, armar otro helado
          </button>
          <button type="button"
                  (click)="goToCheckout()"
                  class="flex-1 px-4 py-3 text-xs font-bold text-white bg-gradient-to-r from-[#011640] to-[#0b2859] hover:opacity-95 rounded-xl transition shadow-sm cursor-pointer">
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
  ingredientInfo = signal<{ title: string; ingredients: string[] } | null>(null);

  activePres = computed(() => this.selectedPres() || this.optionsService.presentations()[0] || null);
  activeFlavor = computed(() => this.selectedFlavor() || this.productsService.products()[0] || null);

  showFlavorIngredients(product: ProductItem) {
    const recipe = product.receta || product.recipe || [];
    const ingredients = recipe
      .map((item) => item.ingrediente_nombre || item.nombre || '')
      .map((name) => name.trim())
      .filter((name, index, list) => Boolean(name) && list.indexOf(name) === index);

    this.ingredientInfo.set({ title: `Ingredientes de ${product.name}`, ingredients });
  }

  showToppingIngredients(topping: ToppingOption) {
    const name = (topping.ingrediente_nombre || '').trim();
    this.ingredientInfo.set({
      title: `Ingrediente de ${topping.nombre}`,
      ingredients: name ? [name] : []
    });
  }

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
    if (this.quantity() > this.maxAvailable()) {
      this.quantity.set(this.maxAvailable());
    }
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
    let max = this.getStockForFlavor(flavor);
    for (const t of this.selectedToppings()) {
      if (typeof t.stock === 'number' && t.stock > 0) {
        max = Math.min(max, t.stock);
      }
    }
    return Math.max(1, max);
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