import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { CatalogOptionsService } from '../../../core/services/catalog-options.service';
import { ToppingOption } from '../../../core/models/product.model';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

@Component({
  selector: 'app-toppings',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent, CurrencyMxnPipe],
  template: `
    <app-page-title
      eyebrow="EXTRAS Y COMPLEMENTOS"
      title="Toppings"
      [subtitle]="optionsService.toppings().length + ' toppings sincronizados con inventario'"
      button="+ Nuevo topping"
      (action)="openNew()" />

    <div class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-6 py-3.5">Topping</th>
            <th scope="col" class="px-6 py-3.5">Proveedor</th>
            <th scope="col" class="px-6 py-3.5">Precio extra</th>
            <th scope="col" class="px-6 py-3.5">Disponibilidad</th>
            <th scope="col" class="px-6 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngIf="optionsService.toppings().length === 0">
            <td colspan="5" class="px-6 py-8 text-center text-slate-400">
              Aún no hay toppings registrados. Agrega chispas, galleta, fruta o jarabes.
            </td>
          </tr>
          <tr *ngFor="let t of asAnyList(optionsService.toppings())" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-6 py-4">
              <div class="font-bold text-[#011640]">{{ t.nombre }}</div>
              <small *ngIf="t.ingrediente_nombre" class="block text-[11px] text-slate-400 mt-0.5">
                Insumo: {{ t.ingrediente_nombre }} ({{ t.cantidad_por_porcion }} {{ t.ingrediente_unidad }}/porción)
              </small>
            </td>
            <td class="px-6 py-4 text-xs">{{ t.proveedor_nombre || 'Sin proveedor' }}</td>
            <td class="px-6 py-4 font-semibold text-[#011640]">+{{ t.precio | currencyMxn }}</td>
            <td class="px-6 py-4">
              <span [class]="t.stock <= 5
                ? 'bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full'
                : 'bg-[#dff0f7] text-[#011640] text-xs font-semibold px-3 py-1 rounded-full'">
                {{ t.stock }} porciones
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button type="button"
                        (click)="openEdit(t)"
                        class="px-3 py-1.5 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition">
                  Editar
                </button>
                <button type="button"
                        (click)="remove(t)"
                        class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-modal *ngIf="modalOpen()" [title]="editingId() ? 'Editar topping' : 'Nuevo topping'" (close)="modalOpen.set(false)">
      <form class="space-y-4" (ngSubmit)="save()">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Nombre del topping</label>
          <input required name="nombre" [(ngModel)]="form.nombre" placeholder="Ej. Galleta Oreo triturada"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>

        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Insumo vinculado en inventario</label>
          <select name="ingrediente_id"
                  [(ngModel)]="form.ingrediente_id"
                  (ngModelChange)="onIngredientChange($event)"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5">
            <option [ngValue]="null">Sin vincular (stock manual)</option>
            <option *ngFor="let ing of ingredients()" [ngValue]="ing.id">
              {{ ing.name || ing.nombre }} ({{ ing.current ?? ing.stock_actual ?? ing.stock ?? 0 }} {{ ing.unit || ing.unidad || '' }} disp.)
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Precio extra (MXN)</label>
            <input required type="number" step="0.5" min="0" name="precio" [(ngModel)]="form.precio"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>

          <div *ngIf="form.ingrediente_id; else manualStockTpl">
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">
              Consumo por porción ({{ selectedIngredientUnit() }})
            </label>
            <input required type="number" step="0.005" min="0.001" name="cantidad_por_porcion" [(ngModel)]="form.cantidad_por_porcion"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            <small class="block text-[11px] text-[#6da0bf] font-semibold mt-1">
              ≈ {{ previewPortions() }} porciones disponibles
            </small>
          </div>

          <ng-template #manualStockTpl>
            <div>
              <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Stock manual (porciones)</label>
              <input required type="number" min="0" name="stock" [(ngModel)]="form.stock"
                     class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            </div>
          </ng-template>
        </div>

        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Proveedor</label>
          <select name="proveedor_id" [(ngModel)]="form.proveedor_id"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5">
            <option [ngValue]="null">Sin proveedor asignado</option>
            <option *ngFor="let prov of suppliers()" [ngValue]="prov.id">{{ prov.nombre }}</option>
          </select>
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
export class ToppingsComponent implements OnInit {
  optionsService = inject(CatalogOptionsService);
  private http = inject(HttpClient);

  suppliers = signal<any[]>([]);
  ingredients = signal<any[]>([]);
  modalOpen = signal(false);
  editingId = signal<number | null>(null);
  form: any = {
    nombre: '',
    precio: 10,
    stock: 25,
    proveedor_id: null,
    ingrediente_id: null,
    cantidad_por_porcion: 0.04,
  };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/suppliers/`).subscribe((list) => this.suppliers.set(list));
    this.loadIngredients();
    this.optionsService.loadToppings().subscribe();
  }

  loadIngredients() {
    this.http.get<any[]>(`${environment.apiUrl}/inventory/`).subscribe((list) => this.ingredients.set(list));
  }

  asAnyList(list: ToppingOption[]): any[] {
    return list as any[];
  }

  openNew() {
    this.loadIngredients();
    this.editingId.set(null);
    this.form = {
      nombre: '',
      precio: 10,
      stock: 25,
      proveedor_id: null,
      ingrediente_id: null,
      cantidad_por_porcion: 0.04,
    };
    this.modalOpen.set(true);
  }

  openEdit(t: any) {
    this.loadIngredients();
    this.editingId.set(t.id || null);
    this.form = {
      ...t,
      proveedor_id: t.proveedor_id ?? null,
      ingrediente_id: t.ingrediente_id ?? null,
      cantidad_por_porcion: t.cantidad_por_porcion ?? 0.04,
    };
    this.modalOpen.set(true);
  }

  onIngredientChange(ingId: number | null) {
    if (!ingId) {
      this.form.proveedor_id = null;
      return;
    }
    const ing = this.ingredients().find((x) => Number(x.id) === Number(ingId));
    if (ing) {
      this.form.proveedor_id = ing.proveedor_id ?? ing.proveedorId ?? null;
    }
  }

  selectedIngredientUnit(): string {
    const ing = this.ingredients().find((x) => Number(x.id) === Number(this.form.ingrediente_id));
    return ing?.unit || ing?.unidad || 'kg';
  }

  previewPortions(): number {
    const ing = this.ingredients().find((x) => Number(x.id) === Number(this.form.ingrediente_id));
    const stock = Number(ing?.current ?? ing?.stock_actual ?? ing?.stock ?? 0);
    const portion = Number(this.form.cantidad_por_porcion || 0);
    if (!ing || portion <= 0) return 0;
    return Math.max(0, Math.floor((stock + 1e-9) / portion));
  }

  save() {
    const id = this.editingId();
    const req$ = id
      ? this.optionsService.updateTopping(id, this.form)
      : this.optionsService.createTopping(this.form);

    req$.subscribe(() => {
      this.modalOpen.set(false);
      this.optionsService.loadToppings().subscribe();
    });
  }

  remove(t: ToppingOption) {
    if (!t.id) return;
    if (!confirm(`¿Eliminar el topping "${t.nombre}"?`)) return;
    this.optionsService.deleteTopping(t.id).subscribe();
  }
}