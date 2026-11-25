import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryService } from '../../../core/services/inventory.service';
import { SuppliersService, SupplierItem } from '../../../core/services/suppliers.service';
import { IngredientItem } from '../../../core/models/inventory.model';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, RouterLink, PageTitleComponent, ModalComponent, CurrencyMxnPipe],
  template: `
    <app-page-title eyebrow="PRODUCCIÓN" title="Inventario de ingredientes" subtitle="El stock sube al pagar órdenes a proveedores y baja con ventas o producción" button="+ Registrar insumo" (action)="openCreate()" />

    <!-- Barra de filtros, orden y acceso a compras -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
      <div class="flex flex-wrap items-center gap-2.5">
        <input type="text"
               [ngModel]="searchQuery()"
               (ngModelChange)="searchQuery.set($event)"
               placeholder="Buscar ingrediente..."
               class="bg-white border border-slate-200 text-[#011640] text-xs rounded-xl px-3.5 py-2 focus:ring-[#6da0bf] focus:border-[#6da0bf] w-48 sm:w-56" />

        <select [ngModel]="selectedSupplierFilter()"
                (ngModelChange)="selectedSupplierFilter.set($event)"
                class="bg-white border border-slate-200 text-[#011640] text-xs font-medium rounded-xl py-2 pl-3 pr-8 focus:ring-[#6da0bf] focus:border-[#6da0bf]">
          <option value="all">Todas las empresas</option>
          <option *ngFor="let s of suppliers()" [value]="'' + s.id">{{ s.nombre }}</option>
          <option value="none">Sin proveedor asignado</option>
        </select>

        <select [ngModel]="sortBy()"
                (ngModelChange)="sortBy.set($event)"
                class="bg-white border border-slate-200 text-[#011640] text-xs font-medium rounded-xl py-2 pl-3 pr-8 focus:ring-[#6da0bf] focus:border-[#6da0bf]">
          <option value="default">Ordenar: Predeterminado</option>
          <option value="alpha-asc">Alfabético (A → Z)</option>
          <option value="alpha-desc">Alfabético (Z → A)</option>
          <option value="stock-asc">Menor existencia primero</option>
          <option value="stock-desc">Mayor existencia primero</option>
          <option value="supplier-asc">Por empresa (A → Z)</option>
        </select>

        <button *ngIf="hasActiveFilters()"
                type="button"
                (click)="resetFilters()"
                class="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition">
          Limpiar
        </button>
      </div>

      <a routerLink="/admin/compras"
         style="text-decoration:none;"
         class="px-4 py-2 text-xs font-semibold text-[#011640] bg-[#dff0f7] border border-[#6da0bf]/40 rounded-xl hover:bg-[#cde6f2] transition self-start lg:self-auto whitespace-nowrap">
        Surtir mediante orden al proveedor →
      </a>
    </div>

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
          <tr *ngIf="filteredRows().length === 0">
            <td colspan="8" class="px-6 py-10 text-center text-xs text-slate-400">
              No hay ingredientes que coincidan con el filtro seleccionado.
            </td>
          </tr>
          <tr *ngFor="let r of filteredRows()" class="bg-white hover:bg-slate-50/80 transition">
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
              <strong class="text-[#011640]">{{ r.current }} {{ r.unit }}</strong>
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
            <select required name="categoria" [(ngModel)]="formIng.categoria"
                    class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5 pr-8 truncate">
              <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
            </select>
          </div>

          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Proveedor</label>
            <select name="proveedorId" [(ngModel)]="formIng.proveedorId"
                    class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5 pr-8 truncate">
              <option [ngValue]="null">Sin proveedor asignado</option>
              <option *ngFor="let s of suppliers()" [ngValue]="s.id">{{ s.nombre }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">
              {{ editingId() ? 'Stock actual' : 'Stock inicial' }}
            </label>
            <input type="number"
                   name="current"
                   [ngModel]="editingId() ? formIng.current : 0"
                   readonly
                   disabled
                   class="bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-sm rounded-xl block w-full p-2.5 cursor-not-allowed select-none" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Stock mínimo</label>
            <input required type="number" step="0.01" min="0" name="minimum" [(ngModel)]="formIng.minimum"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Unidad de medida</label>
            <select required name="unit" [(ngModel)]="formIng.unit"
                    class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5 pr-8 truncate">
              <option *ngFor="let u of units" [value]="u.value">{{ u.label }}</option>
            </select>
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

  categories = [
    'Lácteos',
    'Secos',
    'Fruta Natural',
    'Esencias',
    'Toppings',
    'Desechables',
    'General'
  ];

  units = [
    { value: 'L', label: 'L — Litros' },
    { value: 'kg', label: 'kg — Kilogramos' },
    { value: 'pza', label: 'pza — Piezas' }
  ];

  rows = signal<any[]>([]);
  suppliers = signal<SupplierItem[]>([]);
  modalOpen = signal(false);
  editingId = signal<number | null>(null);

  searchQuery = signal('');
  selectedSupplierFilter = signal('all');
  sortBy = signal('default');

  hasActiveFilters = computed(() =>
    this.searchQuery().trim() !== '' ||
    this.selectedSupplierFilter() !== 'all' ||
    this.sortBy() !== 'default'
  );

  filteredRows = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const supplierFilter = this.selectedSupplierFilter();
    const sort = this.sortBy();

    let list = this.rows().filter((r) => {
      const pid = r.proveedorId ?? r.proveedor_id;
      if (supplierFilter === 'none' && pid) return false;
      if (supplierFilter !== 'all' && supplierFilter !== 'none' && String(pid) !== supplierFilter) {
        return false;
      }

      if (query) {
        const matchName = (r.name || '').toLowerCase().includes(query);
        const matchCat = (r.categoria || '').toLowerCase().includes(query);
        if (!matchName && !matchCat) return false;
      }

      return true;
    });

    list = [...list];
    switch (sort) {
      case 'alpha-asc':
        list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' }));
        break;
      case 'alpha-desc':
        list.sort((a, b) => (b.name || '').localeCompare(a.name || '', 'es', { sensitivity: 'base' }));
        break;
      case 'stock-asc':
        list.sort((a, b) => Number(a.current) - Number(b.current));
        break;
      case 'stock-desc':
        list.sort((a, b) => Number(b.current) - Number(a.current));
        break;
      case 'supplier-asc':
        list.sort((a, b) =>
          this.getSupplierName(a).localeCompare(this.getSupplierName(b), 'es', { sensitivity: 'base' })
        );
        break;
    }

    return list;
  });

  formIng: any = {
    name: '',
    categoria: 'Lácteos',
    current: 0,
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

  resetFilters() {
    this.searchQuery.set('');
    this.selectedSupplierFilter.set('all');
    this.sortBy.set('default');
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
      current: 0,
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
      categoria: this.categories.includes(r.categoria) ? r.categoria : 'General',
      current: Number(r.current),
      minimum: Number(r.minimum),
      unit: r.unit || 'L',
      costoUnitario: Number(r.costoUnitario ?? r.costo_unitario ?? 0),
      proveedorId: r.proveedorId ?? r.proveedor_id ?? null
    };
    this.modalOpen.set(true);
  }

  remove(r: IngredientItem) {
    if (!r.id) return;
    if (!confirm(`¿Seguro que deseas quitar "${r.name}" del inventario?`)) return;
    this.invService.deleteIngredient(r.id).subscribe(() => this.load());
  }

  save() {
    const id = this.editingId();
    const payload = {
      ...this.formIng,
      current: id ? Number(this.formIng.current) : 0,
      costo_unitario: Number(this.formIng.costoUnitario || 0),
      proveedor_id: this.formIng.proveedorId
    };
    const req$ = id
      ? this.invService.updateIngredient(id, payload)
      : this.invService.addIngredient(payload);

    req$.subscribe(() => {
      this.modalOpen.set(false);
      this.load();
    });
  }
}