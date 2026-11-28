import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../core/services/auth.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

interface RecipeDraftLine {
  ingrediente_id: number;
  cantidad_por_litro: number;
}

@Component({
  selector: 'app-products',
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent],
  styles: [`
    :host ::ng-deep app-modal [class*="max-w-"],
    :host ::ng-deep app-modal .modal-card,
    :host ::ng-deep app-modal .modal-dialog,
    :host ::ng-deep app-modal .modal-panel {
      max-width: 44rem !important;
      width: 95vw !important;
    }
  `],
  template: `
    <app-page-title
      eyebrow="CATÁLOGO"
      title="Productos y sabores"
      subtitle="Administra los helados, su receta por litro y la producción disponible"
      button="+ Nuevo producto"
      (action)="openCreate()" />

    <div *ngIf="bannerMsg()" class="p-3.5 mb-4 text-xs font-semibold text-emerald-800 rounded-2xl bg-emerald-50 border border-emerald-200">
      {{ bannerMsg() }}
    </div>
    <div *ngIf="bannerError()" class="p-3.5 mb-4 text-xs font-semibold text-red-800 rounded-2xl bg-red-50 border border-red-200">
      {{ bannerError() }}
    </div>

    <!-- Tabla de sabores -->
    <div class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-5 py-3.5">Producto</th>
            <th scope="col" class="px-5 py-3.5">Tono visual</th>
            <th scope="col" class="px-5 py-3.5">Receta por litro</th>
            <th scope="col" class="px-5 py-3.5">Stock actual</th>
            <th scope="col" class="px-5 py-3.5">Estado</th>
            <th scope="col" class="px-5 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngIf="products().length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-xs text-slate-400">
              No hay productos registrados todavía.
            </td>
          </tr>
          <tr *ngFor="let p of products()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-5 py-4 align-top">
              <div class="flex items-center gap-3">
                <img *ngIf="p.imagen_url"
                     [src]="p.imagen_url"
                     [alt]="p.nombre_comercial"
                     class="w-11 h-11 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0" />
                <div *ngIf="!p.imagen_url"
                     class="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                     [class]="getToneBadgeClass(p.tono)">
                  {{ (p.nombre_comercial || 'H')[0] }}
                </div>
                <div>
                  <strong class="block text-[#011640]">{{ p.nombre_comercial }}</strong>
                  <small class="text-xs text-slate-500">Sabor: {{ p.sabor }}</small>
                </div>
              </div>
            </td>

            <td class="px-5 py-4 align-top">
              <span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                    [class]="getToneBadgeClass(p.tono)">
                <span class="w-2 h-2 rounded-full bg-current"></span>
                {{ getToneLabel(p.tono) }}
              </span>
            </td>

            <td class="px-5 py-4 align-top">
              <span *ngIf="!p.receta || p.receta.length === 0" class="text-xs italic text-slate-400">
                Sin insumos registrados
              </span>
              <ul *ngIf="p.receta && p.receta.length > 0" class="space-y-0.5 text-xs">
                <li *ngFor="let r of p.receta" class="text-slate-700">
                  <strong class="text-[#011640]">{{ r.cantidad_por_litro }} {{ r.unidad }}</strong>
                  de {{ r.ingrediente_nombre || r.nombre }}
                </li>
              </ul>
            </td>

            <td class="px-5 py-4 align-top">
              <strong class="text-base text-[#011640]">{{ p.stock_litros }} L</strong>
            </td>

            <td class="px-5 py-4 align-top">
              <span *ngIf="p.stock_litros > 0" class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                Disponible
              </span>
              <span *ngIf="p.stock_litros <= 0" class="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                Sin stock (0 L)
              </span>
            </td>

            <td class="px-5 py-4 align-top text-right">
              <div class="flex flex-wrap justify-end gap-2">
                <button type="button"
                        (click)="openProduce(p)"
                        class="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition whitespace-nowrap">
                  + Producir
                </button>
                <button type="button"
                        (click)="openEdit(p)"
                        class="px-3 py-1.5 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition">
                  Editar
                </button>
                <button type="button"
                        (click)="remove(p)"
                        class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  Quitar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Crear / Editar producto -->
    <app-modal *ngIf="modalOpen()" [title]="editingId() ? 'Editar producto' : 'Nuevo producto'" (close)="modalOpen.set(false)">
      <form class="space-y-4" (ngSubmit)="save()">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Nombre del producto</label>
          <input required
                 name="nombre_comercial"
                 [(ngModel)]="form.nombre_comercial"
                 placeholder="Ej. Fresa Nevada"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Sabor</label>
            <input required
                   name="sabor"
                   [(ngModel)]="form.sabor"
                   placeholder="Ej. Fresa"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>

          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">
              Tono visual
              <span class="font-normal text-slate-400">(color de tarjeta)</span>
            </label>
            <select name="tono"
                    [(ngModel)]="form.tono"
                    class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full py-2.5 pl-3 pr-8">
              <option *ngFor="let t of toneOptions" [value]="t.value">{{ t.label }}</option>
            </select>
          </div>
        </div>

        <div *ngIf="!editingId()">
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">
            Stock inicial (litros)
          </label>
          <input required
                 type="number"
                 step="0.1"
                 min="0"
                 name="stock_litros"
                 [(ngModel)]="form.stock_litros"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>

        <!-- Receta por litro -->
        <div class="pt-2 border-t border-slate-100 space-y-2.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-[#0b234a]">Receta por litro</label>
            <button type="button"
                    (click)="addRecipeLine()"
                    class="text-xs font-semibold text-[#0284c7] hover:text-[#0369a1] transition">
              + Agregar insumo
            </button>
          </div>

          <p *ngIf="form.receta.length === 0" class="text-xs italic text-slate-400">
            Sin insumos agregados.
          </p>

          <div *ngFor="let line of form.receta; let idx = index"
               class="grid grid-cols-12 gap-2.5 items-center">
            <div class="col-span-7">
              <select [name]="'rec_ing_' + idx"
                      [(ngModel)]="line.ingrediente_id"
                      class="bg-white border border-slate-300 text-[#011640] text-xs font-medium rounded-xl block w-full py-2.5 pl-3 pr-8">
                <option *ngFor="let ing of ingredients()" [ngValue]="ing.id">
                  {{ ing.name || ing.nombre }} ({{ ing.unit || ing.unidad }})
                </option>
              </select>
            </div>

            <div class="col-span-3">
              <input type="number"
                     step="0.001"
                     min="0.001"
                     [name]="'rec_qty_' + idx"
                     [(ngModel)]="line.cantidad_por_litro"
                     placeholder="0.25"
                     class="bg-white border border-slate-300 text-[#011640] text-xs font-semibold rounded-xl block w-full py-2.5 px-3" />
            </div>

            <div class="col-span-2 text-right">
              <button type="button"
                      (click)="removeRecipeLine(idx)"
                      class="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1">
                Quitar
              </button>
            </div>
          </div>
        </div>

        <!-- Imagen (Archivo / URL) -->
        <div class="pt-2 border-t border-slate-100 space-y-2.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-[#0b234a]">Imagen</label>
            <div class="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button type="button"
                      (click)="imageMode.set('file')"
                      [class]="imageMode() === 'file' ? 'bg-white text-[#011640] shadow-sm px-3 py-1 rounded-lg' : 'text-slate-500 px-3 py-1'">
                Archivo
              </button>
              <button type="button"
                      (click)="imageMode.set('url')"
                      [class]="imageMode() === 'url' ? 'bg-white text-[#011640] shadow-sm px-3 py-1 rounded-lg' : 'text-slate-500 px-3 py-1'">
                URL
              </button>
            </div>
          </div>

          <div *ngIf="imageMode() === 'file'">
            <input type="file"
                   accept="image/*"
                   (change)="onFileSelected($event)"
                   class="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#dff0f7] file:text-[#011640] hover:file:bg-[#cde6f2]" />
            <small *ngIf="uploadingImage()" class="text-[11px] text-slate-400">Subiendo imagen...</small>
          </div>

          <div *ngIf="imageMode() === 'url'">
            <input name="imagen_url"
                   [(ngModel)]="form.imagen_url"
                   placeholder="https://..."
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-xs rounded-xl block w-full p-2.5" />
          </div>

          <div *ngIf="form.imagen_url" class="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200">
            <img [src]="form.imagen_url" alt="Vista previa" class="w-12 h-12 rounded-lg object-cover" />
            <span class="text-[11px] text-slate-500 truncate">{{ form.imagen_url }}</span>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button"
                  (click)="modalOpen.set(false)"
                  class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit"
                  [disabled]="saving() || uploadingImage()"
                  class="px-5 py-2.5 text-xs font-semibold text-white bg-[#011640] rounded-xl hover:bg-[#0b234a] disabled:opacity-50">
            {{ saving() ? 'Guardando...' : 'Guardar ✓' }}
          </button>
        </div>
      </form>
    </app-modal>

    <!-- Modal: Producir lote -->
    <app-modal *ngIf="producingProduct()" title="Producir lote de helado" (close)="producingProduct.set(null)">
      <form *ngIf="producingProduct() as prod" class="space-y-4" (ngSubmit)="confirmProduce()">
        <p class="text-xs text-slate-600">
          Se descontarán del inventario los insumos de la receta de <strong>{{ prod.nombre_comercial }}</strong> y aumentará su stock en litros.
        </p>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-semibold text-[#0b234a]">Litros a producir</label>
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  [class]="maxProducableLitros() > 0 ? 'bg-[#dff0f7] text-[#011640]' : 'bg-red-100 text-red-700'">
              Máximo posible: {{ maxProducableLitros() }} L
            </span>
          </div>

          <input required
                 type="number"
                 step="0.5"
                 min="0"
                 [max]="maxProducableLitros()"
                 [disabled]="maxProducableLitros() <= 0"
                 name="produceLitros"
                 [ngModel]="produceLitros()"
                 (ngModelChange)="onProduceLitrosChange($event)"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm font-semibold rounded-xl block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed" />

          <p *ngIf="maxProducableLitros() <= 0" class="mt-1.5 text-xs font-semibold text-red-700">
            No hay suficiente inventario para producir ni 0.5 L de este sabor. Surte insumos en compras o inventario.
          </p>
          <p *ngIf="maxProducableLitros() > 0 && produceLitros() >= maxProducableLitros()" class="mt-1.5 text-[11px] font-semibold text-amber-700">
            Alcanzaste el límite máximo permitido por el inventario actual.
          </p>
        </div>

        <div *ngIf="prod.receta?.length" class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <div class="flex items-center justify-between text-[11px] font-bold text-[#011640]">
            <span>Insumos de receta</span>
            <span>Requerido / Disponible</span>
          </div>

          <div *ngFor="let r of prod.receta" class="flex items-center justify-between gap-2 py-1 border-t border-slate-200/70">
            <span class="text-slate-700 font-medium truncate">
              {{ r.ingrediente_nombre || r.nombre }}
            </span>
            <div class="text-right shrink-0">
              <strong [class]="hasEnoughIngredient(r) ? 'text-[#011640]' : 'text-red-700'">
                {{ (Number(r.cantidad_por_litro || 0) * produceLitros()).toFixed(2) }} {{ r.unidad }}
              </strong>
              <span class="block text-[11px]"
                    [class]="hasEnoughIngredient(r) ? 'text-emerald-700' : 'text-red-600 font-semibold'">
                Disp: {{ getIngredientStock(r) }} {{ r.unidad }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button"
                  (click)="producingProduct.set(null)"
                  class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl">
            Cancelar
          </button>
          <button type="submit"
                  [disabled]="saving() || !canConfirmProduce()"
                  class="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 disabled:opacity-45 disabled:cursor-not-allowed">
            Producir {{ produceLitros() }} L ✓
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class ProductsComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private invService = inject(InventoryService);
  protected Number = Number;

  products = signal<any[]>([]);
  ingredients = signal<any[]>([]);

  modalOpen = signal(false);
  editingId = signal<number | null>(null);
  producingProduct = signal<any | null>(null);
  produceLitros = signal(5);

  imageMode = signal<'file' | 'url'>('file');
  uploadingImage = signal(false);
  saving = signal(false);
  bannerMsg = signal('');
  bannerError = signal('');

  toneOptions = [
    { value: 'strawberry', label: 'Rosa' },
    { value: 'mango', label: 'Ámbar' },
    { value: 'lemon', label: 'Menta' },
    { value: 'sky', label: 'Cielo' },
    { value: 'chocolate', label: 'Mora' },
  ];

  form: {
    nombre_comercial: string;
    sabor: string;
    tono: string;
    stock_litros: number;
    imagen_url: string;
    receta: RecipeDraftLine[];
  } = {
    nombre_comercial: '',
    sabor: '',
    tono: 'strawberry',
    stock_litros: 0,
    imagen_url: '',
    receta: [],
  };

  maxProducableLitros = computed(() => {
    const prod = this.producingProduct();
    if (!prod || !Array.isArray(prod.receta) || prod.receta.length === 0) {
      return 0;
    }

    let maxLitros = Infinity;
    for (const r of prod.receta) {
      const perLiter = Number(r.cantidad_por_litro ?? 0);
      if (perLiter <= 0) continue;
      const available = this.getIngredientStock(r);
      const possibleForIngredient = available / perLiter;
      if (possibleForIngredient < maxLitros) {
        maxLitros = possibleForIngredient;
      }
    }

    if (!Number.isFinite(maxLitros) || maxLitros <= 0) {
      return 0;
    }

    return Math.floor(maxLitros * 2) / 2;
  });

  canConfirmProduce = computed(() => {
    const maxL = this.maxProducableLitros();
    const qty = Number(this.produceLitros());
    return maxL > 0 && qty > 0 && qty <= maxL;
  });

  ngOnInit() {
    this.loadProducts();
    this.invService.getIngredients().subscribe((list: any[]) => this.ingredients.set(list));
  }

  loadProducts() {
    this.http.get<any[]>(`${environment.apiUrl}/products/`).subscribe((list) => {
      this.products.set(list || []);
    });
  }

  getIngredientStock(recipeLine: any): number {
    const id = Number(recipeLine?.ingrediente_id ?? recipeLine?.id);
    const found = this.ingredients().find((i) => Number(i.id) === id);
    if (found) {
      return Number(found.current ?? found.stock ?? found.cantidad ?? 0);
    }
    return Number(recipeLine?.stock_disponible ?? recipeLine?.stock ?? 0);
  }

  hasEnoughIngredient(recipeLine: any): boolean {
    const perLiter = Number(recipeLine?.cantidad_por_litro ?? 0);
    const required = perLiter * Number(this.produceLitros() || 0);
    return this.getIngredientStock(recipeLine) + 1e-9 >= required;
  }

  onProduceLitrosChange(val: number | string) {
    const parsed = Number(val);
    const maxL = this.maxProducableLitros();
    if (!Number.isFinite(parsed) || parsed < 0) {
      this.produceLitros.set(0);
      return;
    }
    if (parsed > maxL) {
      this.produceLitros.set(maxL);
      return;
    }
    this.produceLitros.set(parsed);
  }

  normalizeTone(rawTone: string): string {
    const map: Record<string, string> = {
      rosa: 'strawberry',
      strawberry: 'strawberry',
      ambar: 'mango',
      ámbar: 'mango',
      mango: 'mango',
      vanilla: 'mango',
      menta: 'lemon',
      lemon: 'lemon',
      cielo: 'sky',
      sky: 'sky',
      mora: 'chocolate',
      chocolate: 'chocolate',
    };
    return map[(rawTone || '').toLowerCase()] || 'strawberry';
  }

  getToneLabel(rawTone: string): string {
    const norm = this.normalizeTone(rawTone);
    return this.toneOptions.find((t) => t.value === norm)?.label || 'Rosa';
  }

  getToneBadgeClass(rawTone: string): string {
    const norm = this.normalizeTone(rawTone);
    switch (norm) {
      case 'strawberry':
        return 'bg-pink-100 text-pink-800';
      case 'mango':
        return 'bg-amber-100 text-amber-800';
      case 'lemon':
        return 'bg-emerald-100 text-emerald-800';
      case 'sky':
        return 'bg-sky-100 text-sky-800';
      case 'chocolate':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-pink-100 text-pink-800';
    }
  }

  openCreate() {
    this.bannerMsg.set('');
    this.bannerError.set('');
    this.editingId.set(null);
    this.imageMode.set('file');
    this.form = {
      nombre_comercial: '',
      sabor: '',
      tono: 'strawberry',
      stock_litros: 0,
      imagen_url: '',
      receta: [],
    };
    this.modalOpen.set(true);
  }

  openEdit(p: any) {
    this.bannerMsg.set('');
    this.bannerError.set('');
    this.editingId.set(p.id);
    this.imageMode.set(p.imagen_url ? 'url' : 'file');
    this.form = {
      nombre_comercial: p.nombre_comercial || p.name || '',
      sabor: p.sabor || p.flavor || '',
      tono: this.normalizeTone(p.tono || p.tone),
      stock_litros: Number(p.stock_litros ?? 0),
      imagen_url: p.imagen_url || '',
      receta: (p.receta || []).map((r: any) => ({
        ingrediente_id: Number(r.ingrediente_id),
        cantidad_por_litro: Number(r.cantidad_por_litro),
      })),
    };
    this.modalOpen.set(true);
  }

  addRecipeLine() {
    const pool = this.ingredients();
    const next = pool.find((i) => !this.form.receta.some((l) => Number(l.ingrediente_id) === Number(i.id))) || pool[0];
    if (!next) return;
    this.form.receta.push({
      ingrediente_id: Number(next.id),
      cantidad_por_litro: 0.25,
    });
  }

  removeRecipeLine(idx: number) {
    this.form.receta.splice(idx, 1);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    this.uploadingImage.set(true);

    this.http.post<{ url: string }>(`${environment.apiUrl}/products/upload`, formData).subscribe({
      next: (res) => {
        this.form.imagen_url = res.url;
        this.uploadingImage.set(false);
      },
      error: (err) => {
        this.uploadingImage.set(false);
        this.bannerError.set(err?.error?.error || 'No se pudo subir la imagen.');
      },
    });
  }

  save() {
    if (this.saving()) return;
    this.saving.set(true);
    this.bannerError.set('');

    const payload = {
      nombre_comercial: this.form.nombre_comercial,
      sabor: this.form.sabor,
      tono: this.form.tono,
      stock_litros: Number(this.form.stock_litros ?? 0),
      imagen_url: this.form.imagen_url,
      receta: this.form.receta.map((r) => ({
        ingrediente_id: Number(r.ingrediente_id),
        cantidad_por_litro: Number(r.cantidad_por_litro),
      })),
    };

    const id = this.editingId();
    const req$ = id
      ? this.http.put<any>(`${environment.apiUrl}/products/${id}`, payload)
      : this.http.post<any>(`${environment.apiUrl}/products/`, payload);

    req$.subscribe({
      next: (res) => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.bannerMsg.set(res?.message || 'Producto guardado.');
        this.loadProducts();
      },
      error: (err) => {
        this.saving.set(false);
        this.bannerError.set(err?.error?.error || 'No se pudo guardar el producto.');
      },
    });
  }

  openProduce(p: any) {
    this.bannerMsg.set('');
    this.bannerError.set('');
    this.producingProduct.set(p);
    const maxL = this.maxProducableLitros();
    this.produceLitros.set(maxL > 0 ? Math.min(5, maxL) : 0);
  }

  confirmProduce() {
    const prod = this.producingProduct();
    if (!prod || this.saving() || !this.canConfirmProduce()) return;
    this.saving.set(true);

    this.http
      .post<any>(`${environment.apiUrl}/products/${prod.id}/produce`, {
        litros: Number(this.produceLitros()),
        usuario_id: this.auth.currentUser()?.id || null,
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.producingProduct.set(null);
          this.bannerMsg.set(res?.message || 'Lote producido.');
          this.loadProducts();
          this.invService.getIngredients().subscribe((list: any[]) => this.ingredients.set(list));
        },
        error: (err) => {
          this.saving.set(false);
          this.producingProduct.set(null);
          this.bannerError.set(err?.error?.error || 'No se pudo producir el lote.');
        },
      });
  }

  remove(p: any) {
    if (!confirm(`¿Seguro que deseas quitar "${p.nombre_comercial}" del catálogo?`)) return;
    this.http.delete<any>(`${environment.apiUrl}/products/${p.id}`).subscribe({
      next: () => {
        this.bannerMsg.set('Producto eliminado.');
        this.loadProducts();
      },
      error: (err) => {
        this.bannerError.set(err?.error?.error || 'No se pudo eliminar el producto.');
      },
    });
  }
}