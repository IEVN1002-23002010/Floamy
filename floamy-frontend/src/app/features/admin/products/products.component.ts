import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ProductsService } from '../../../core/services/products.service';
import { CatalogOptionsService } from '../../../core/services/catalog-options.service';
import { ProductItem, ProductPresentationStock } from '../../../core/models/product.model';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent],
  template: `
    <app-page-title
      eyebrow="CATÁLOGO REAL"
      title="Sabores y disponibilidad"
      [subtitle]="productsService.products().length + ' sabores · ' + optionsService.presentations().length + ' tamaños'"
      [button]="canCreate() ? '+ Nuevo sabor' : undefined"
      (action)="openNew()" />

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-3.5 min-w-0"
           *ngFor="let p of productsService.products()">
        <div class="flex items-center justify-between gap-2">
          <span class="bg-[#dff0f7] text-[#011640] text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">
            {{ totalUnits(p) }} uds
          </span>
          <div class="flex items-center gap-1.5 shrink-0" *ngIf="canCreate()">
            <button type="button" (click)="openEdit(p)"
                    class="px-2.5 py-1 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition">
              Editar
            </button>
            <button type="button" (click)="remove(p)"
                    class="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
              Eliminar
            </button>
          </div>
        </div>

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

        <div class="pt-2.5 border-t border-slate-100 space-y-2.5">
          <div class="flex items-center justify-between gap-2" *ngFor="let pr of p.presentations">
            <div class="min-w-0">
              <span class="block text-xs text-slate-500 truncate">{{ pr.name }} · \${{ pr.price }}</span>
              <strong class="block text-sm text-[#011640]">{{ pr.stock }} disp.</strong>
            </div>
            <div *ngIf="canEditStock() && pr.productId" class="inline-flex items-center gap-1.5 shrink-0">
              <button type="button" [disabled]="pr.stock === 0" (click)="adjust(pr.productId, -1)"
                      class="w-7 h-7 rounded-lg border border-slate-200 bg-[#f7f3e9] text-[#011640] font-bold hover:bg-slate-200 disabled:opacity-40 transition">−</button>
              <button type="button" (click)="adjust(pr.productId, 1)"
                      class="w-7 h-7 rounded-lg border border-slate-200 bg-[#f7f3e9] text-[#011640] font-bold hover:bg-slate-200 transition">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-modal *ngIf="modalOpen()" [title]="editingId ? 'Editar sabor' : 'Agregar sabor'" (close)="modalOpen.set(false)">
      <form class="space-y-4" (ngSubmit)="save()">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Nombre comercial</label>
          <input required name="name" [(ngModel)]="form.name"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Sabor</label>
            <input required name="flavor" [(ngModel)]="form.flavor"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Tono visual</label>
            <select name="tone" [(ngModel)]="form.tone"
                    class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5">
              <option value="vanilla">Vainilla (Crema)</option>
              <option value="chocolate">Chocolate (Oscuro)</option>
              <option value="strawberry">Fresa (Rosa)</option>
              <option value="mango">Mango (Amarillo)</option>
              <option value="lemon">Limón (Verde)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div *ngFor="let pr of formPresentations; let i = index">
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Stock {{ pr.name }}</label>
            <input required type="number" min="0" [name]="'stock_' + i" [(ngModel)]="pr.stock"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
        </div>

        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">URL de Imagen</label>
          <input type="url" name="image" [(ngModel)]="form.image" placeholder="https://..."
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" (click)="modalOpen.set(false)" class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2.5 text-xs font-semibold text-white bg-[#011640] rounded-xl hover:bg-[#0b234a]">
            Guardar ✓
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class ProductsComponent {
  auth = inject(AuthService);
  productsService = inject(ProductsService);
  optionsService = inject(CatalogOptionsService);

  modalOpen = signal(false);
  editingId: number | null = null;
  form: ProductItem = { name: '', flavor: '', tone: 'vanilla', stockCup: 15, stockLiter: 6, image: '' };
  formPresentations: ProductPresentationStock[] = [];

  canCreate = () => (this.auth.currentUser()?.rol || '').toLowerCase() === 'administrador';
  canEditStock = () => (this.auth.currentUser()?.rol || '').toLowerCase() !== 'empleado';

  totalUnits(p: ProductItem): number {
    if (p.presentations?.length) {
      return p.presentations.reduce((s, pr) => s + Number(pr.stock || 0), 0);
    }
    return (p.stockCup || 0) + (p.stockLiter || 0);
  }

  adjust(productId: number | undefined | null, delta: number) {
    if (productId) this.productsService.adjustStock(productId, delta).subscribe();
  }

  openNew() {
    this.editingId = null;
    this.form = { name: '', flavor: '', tone: 'vanilla', stockCup: 15, stockLiter: 6, image: '' };
    this.formPresentations = this.optionsService.presentations().map((pr) => ({
      presentationId: pr.id!,
      name: pr.nombre,
      price: pr.precio,
      stock: 10
    }));
    this.modalOpen.set(true);
  }

  openEdit(p: ProductItem) {
    this.editingId = p.id || null;
    this.form = { ...p };
    this.formPresentations = (p.presentations || []).map((pr) => ({ ...pr }));
    this.modalOpen.set(true);
  }

  save() {
    const payload = { ...this.form, presentations: this.formPresentations };
    const obs = this.editingId
      ? this.productsService.updateProduct(this.editingId, payload)
      : this.productsService.createProduct(payload);
    obs.subscribe(() => this.modalOpen.set(false));
  }

  remove(p: ProductItem) {
    if (p.id && confirm(`¿Eliminar "${p.name}" del catálogo?`)) {
      this.productsService.deleteProduct(p.id).subscribe({
        error: (err) => alert(err?.error?.message || 'No se pudo eliminar el producto.')
      });
    }
  }
}