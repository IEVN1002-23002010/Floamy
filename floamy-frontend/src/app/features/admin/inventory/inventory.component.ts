import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { SuppliersService, SupplierItem } from '../../../core/services/suppliers.service';
import { IngredientItem } from '../../../core/models/inventory.model';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent, CurrencyMxnPipe],
  template: `
    <app-page-title eyebrow="PRODUCCIÓN" title="Inventario de ingredientes" subtitle="Control de insumos conectado a MySQL" button="+ Registrar insumo" (action)="openCreate()" />

    <div class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-5 py-3.5">Ingrediente</th>
            <th scope="col" class="px-5 py-3.5">Categoría</th>
            <th scope="col" class="px-5 py-3.5">Proveedor</th>
            <th scope="col" class="px-5 py-3.5">Stock actual</th>
            <th scope="col" class="px-5 py-3.5">Stock mínimo</th>
            <th scope="col" class="px-5 py-3.5">Costo unitario</th>
            <th scope="col" class="px-5 py-3.5">Estado</th>
            <th scope="col" class="px-5 py-3.5">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngFor="let r of rows()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-5 py-3.5 font-semibold text-[#011640] whitespace-nowrap">
              <div class="flex items-center gap-2.5">
                <span class="ingredient-icon">{{ r.name[0] }}</span>
                <span>{{ r.name }}</span>
              </div>
            </td>
            <td class="px-5 py-3.5">
              <span class="bg-[#dff0f7] text-[#011640] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {{ r.categoria || 'General' }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-xs font-medium text-slate-700">{{ getSupplierName(r) }}</td>
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-2">
                <button type="button" (click)="adjust(r, -1)" class="w-7 h-7 rounded-lg border border-slate-200 bg-[#f7f3e9] text-[#011640] font-bold hover:bg-slate-200 transition">−</button>
                <strong class="text-[#011640] min-w-[54px] text-center">{{ r.current }} {{ r.unit }}</strong>
                <button type="button" (click)="adjust(r, 1)" class="w-7 h-7 rounded-lg border border-slate-200 bg-[#f7f3e9] text-[#011640] font-bold hover:bg-slate-200 transition">+</button>
              </div>
            </td>
            <td class="px-5 py-3.5 text-xs">{{ r.minimum }} {{ r.unit }}</td>
            <td class="px-5 py-3.5 font-semibold text-[#011640]">{{ r.costoUnitario | currencyMxn }}</td>
            <td class="px-5 py-3.5">
              <span *ngIf="getStatus(r) === 'ok'" class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Óptimo</span>
              <span *ngIf="getStatus(r) === 'low'" class="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Stock bajo</span>
              <span *ngIf="getStatus(r) === 'critical'" class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Crítico</span>
            </td>
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-2">
                <button type="button" (click)="openEdit(r)" class="px-3 py-1.5 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition">
                  Editar
                </button>
                <button type="button" (click)="remove(r)" class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  Quitar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-modal *ngIf="modalOpen()" [title]="editingId() ? 'Editar ingrediente' : 'Nuevo ingrediente'" (close)="modalOpen.set(false)">
      <form class="space-y-4" (ngSubmit)="save()">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Ingrediente</label>
          <input required name="name" [(ngModel)]="formIng.name" placeholder="Ej. Leche entera"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Categoría</label>
            <input required name="categoria" list="categorias-list" [(ngModel)]="formIng.categoria" placeholder="Ej. Lácteos"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            <datalist id="categorias-list">
              <option value="Lácteos"></option>
              <option value="Secos"></option>
              <option value="Fruta Natural"></option>
              <option value="Esencias"></option>
              <option value="Toppings"></option>
            </datalist>
          </div>

          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Proveedor</label>
            <select name="proveedorId" [(ngModel)]="formIng.proveedorId"
                    class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5">
              <option [ngValue]="null">Sin proveedor asignado</option>
              <option *ngFor="let s of suppliers()" [ngValue]="s.id">{{ s.nombre }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Stock actual</label>
            <input required type="number" step="0.01" name="current" [(ngModel)]="formIng.current"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Stock mínimo</label>
            <input required type="number" step="0.01" name="minimum" [(ngModel)]="formIng.minimum"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Unidad (L, kg, pza)</label>
            <input required name="unit" [(ngModel)]="formIng.unit"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Costo unitario ($ MXN)</label>
            <input required type="number" step="0.01" min="0" name="costoUnitario" [(ngModel)]="formIng.costoUnitario"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" (click)="modalOpen.set(false)" class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2.5 text-xs font-semibold text-white bg-[#011640] rounded-xl hover:bg-[#0b234a] focus:ring-4 focus:ring-[#6da0bf]/40">
            Guardar ✓
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class InventoryComponent implements OnInit {
  private invService = inject(InventoryService);
  private suppliersService = inject(SuppliersService);

  rows = signal<any[]>([]);
  suppliers = signal<SupplierItem[]>([]);
  modalOpen = signal(false);
  editingId = signal<number | null>(null);

  formIng: any = {
    name: '',
    categoria: 'Lácteos',
    current: 10,
    minimum: 5,
    unit: 'L',
    costoUnitario: 0,
    proveedorId: null
  };

  ngOnInit() {
    this.load();
    this.suppliersService.getSuppliers().subscribe((list) => this.suppliers.set(list));
  }

  load() {
    this.invService.getIngredients().subscribe((list: any[]) => {
      const normalized = list.map((item) => ({
        ...item,
        categoria: item.categoria || 'General',
        current: Number(item.current),
        minimum: Number(item.minimum),
        costoUnitario: Number(item.costoUnitario ?? item.costo_unitario ?? 0),
        proveedorId: item.proveedorId ?? item.proveedor_id ?? null
      }));
      this.rows.set(normalized);
    });
  }

  getSupplierName(r: any): string {
    if (r.proveedor_nombre || r.supplierName) return r.proveedor_nombre || r.supplierName;
    const pid = r.proveedorId ?? r.proveedor_id;
    if (!pid) return '—';
    const found = this.suppliers().find((s) => Number(s.id) === Number(pid));
    return found ? found.nombre : '—';
  }

  getStatus(r: IngredientItem) {
    const current = Number(r.current);
    const minimum = Number(r.minimum);
    if (current <= minimum * 0.7) return 'critical';
    if (current < minimum) return 'low';
    return 'ok';
  }

  openCreate() {
    this.editingId.set(null);
    this.formIng = {
      name: '',
      categoria: 'Lácteos',
      current: 10,
      minimum: 5,
      unit: 'L',
      costoUnitario: 0,
      proveedorId: null
    };
    this.modalOpen.set(true);
  }

  openEdit(r: any) {
    this.editingId.set(r.id || null);
    this.formIng = {
      name: r.name,
      categoria: r.categoria || 'General',
      current: Number(r.current),
      minimum: Number(r.minimum),
      unit: r.unit,
      costoUnitario: Number(r.costoUnitario ?? r.costo_unitario ?? 0),
      proveedorId: r.proveedorId ?? r.proveedor_id ?? null
    };
    this.modalOpen.set(true);
  }

  adjust(r: IngredientItem, delta: number) {
    if (r.id) this.invService.adjustIngredient(r.id, delta).subscribe(() => this.load());
  }

  remove(r: IngredientItem) {
    if (!r.id) return;
    if (!confirm(`¿Seguro que deseas quitar "${r.name}" del inventario?`)) return;
    this.invService.deleteIngredient(r.id).subscribe(() => this.load());
  }

  save() {
    const payload = {
      ...this.formIng,
      costo_unitario: Number(this.formIng.costoUnitario || 0),
      proveedor_id: this.formIng.proveedorId
    };
    const id = this.editingId();
    const req$ = id
      ? this.invService.updateIngredient(id, payload)
      : this.invService.addIngredient(payload);

    req$.subscribe(() => {
      this.modalOpen.set(false);
      this.load();
    });
  }
}