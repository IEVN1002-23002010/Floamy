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
      [subtitle]="optionsService.toppings().length + ' toppings registrados con proveedor'"
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
          <tr *ngFor="let t of optionsService.toppings()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-6 py-4 font-bold text-[#011640]">{{ t.nombre }}</td>
            <td class="px-6 py-4 text-xs">{{ t.proveedor_nombre || 'Sin proveedor' }}</td>
            <td class="px-6 py-4 font-semibold text-[#011640]">+{{ t.precio | currencyMxn }}</td>
            <td class="px-6 py-4">
              <div class="inline-flex items-center gap-2">
                <button type="button"
                        [disabled]="t.stock === 0"
                        (click)="adjustStock(t, -1)"
                        class="w-7 h-7 rounded-lg border border-slate-200 bg-[#f7f3e9] text-[#011640] font-bold hover:bg-slate-200 disabled:opacity-40 transition">−</button>
                <span [class]="t.stock <= 5
                  ? 'bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full'
                  : 'bg-[#dff0f7] text-[#011640] text-xs font-semibold px-2.5 py-0.5 rounded-full'">
                  {{ t.stock }} porciones
                </span>
                <button type="button"
                        (click)="adjustStock(t, 1)"
                        class="w-7 h-7 rounded-lg border border-slate-200 bg-[#f7f3e9] text-[#011640] font-bold hover:bg-slate-200 transition">+</button>
              </div>
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
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Precio extra (MXN)</label>
            <input required type="number" step="0.5" min="0" name="precio" [(ngModel)]="form.precio"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Stock (porciones)</label>
            <input required type="number" min="0" name="stock" [(ngModel)]="form.stock"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
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
  modalOpen = signal(false);
  editingId = signal<number | null>(null);
  form: Partial<ToppingOption> = { nombre: '', precio: 10, stock: 25, proveedor_id: null };

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/suppliers/`).subscribe((list) => this.suppliers.set(list));
  }

  openNew() {
    this.editingId.set(null);
    this.form = { nombre: '', precio: 10, stock: 25, proveedor_id: this.suppliers()[0]?.id ?? null };
    this.modalOpen.set(true);
  }

  openEdit(t: ToppingOption) {
    this.editingId.set(t.id || null);
    this.form = { ...t };
    this.modalOpen.set(true);
  }

  adjustStock(t: ToppingOption, delta: number) {
    if (t.id) this.optionsService.adjustToppingStock(t.id, delta).subscribe();
  }

  save() {
    const id = this.editingId();
    const req$ = id
      ? this.optionsService.updateTopping(id, this.form)
      : this.optionsService.createTopping(this.form);

    req$.subscribe(() => this.modalOpen.set(false));
  }

  remove(t: ToppingOption) {
    if (!t.id) return;
    if (!confirm(`¿Eliminar el topping "${t.nombre}"?`)) return;
    this.optionsService.deleteTopping(t.id).subscribe();
  }
}