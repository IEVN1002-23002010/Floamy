import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { SuppliersService, SupplierItem } from '../../../core/services/suppliers.service';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent],
  template: `
    <app-page-title
      eyebrow="ABASTECIMIENTO"
      title="Gestión de proveedores"
      subtitle="Administra los proveedores de insumos para Floamy."
      button="+ Nuevo proveedor"
      (action)="openCreate()" />

    <div class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-6 py-3.5">Proveedor</th>
            <th scope="col" class="px-6 py-3.5">Persona de contacto</th>
            <th scope="col" class="px-6 py-3.5">Teléfono</th>
            <th scope="col" class="px-6 py-3.5">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngIf="suppliers().length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-slate-400">
              Aún no hay proveedores registrados. Haz clic en "+ Nuevo proveedor".
            </td>
          </tr>
          <tr *ngFor="let s of suppliers()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-6 py-4 font-semibold text-[#011640]">
              <div class="flex items-center gap-2.5">
                <span class="ingredient-icon">{{ s.nombre[0] }}</span>
                <span>{{ s.nombre }}</span>
              </div>
            </td>
            <td class="px-6 py-4">{{ s.contacto || '—' }}</td>
            <td class="px-6 py-4">{{ s.telefono || '—' }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <button type="button" (click)="openEdit(s)" class="px-3 py-1.5 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition">
                  Editar
                </button>
                <button type="button" (click)="remove(s)" class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-modal *ngIf="modalOpen()" [title]="editingId() ? 'Editar proveedor' : 'Nuevo proveedor'" (close)="modalOpen.set(false)">
      <form class="space-y-4" (ngSubmit)="save()">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Nombre de la empresa / proveedor</label>
          <input required name="nombre" [(ngModel)]="form.nombre" placeholder="Ej. Lácteos del Bajío"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Persona de contacto</label>
          <input name="contacto" [(ngModel)]="form.contacto" placeholder="Ej. Carlos Méndez"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Teléfono</label>
          <input name="telefono" [(ngModel)]="form.telefono" placeholder="Ej. 477 123 4567"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
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
export class SuppliersComponent implements OnInit {
  private suppliersService = inject(SuppliersService);
  suppliers = signal<SupplierItem[]>([]);
  modalOpen = signal(false);
  editingId = signal<number | null>(null);

  form: SupplierItem = { nombre: '', contacto: '', telefono: '' };

  ngOnInit() {
    this.load();
  }

  load() {
    this.suppliersService.getSuppliers().subscribe((list) => this.suppliers.set(list));
  }

  openCreate() {
    this.editingId.set(null);
    this.form = { nombre: '', contacto: '', telefono: '' };
    this.modalOpen.set(true);
  }

  openEdit(s: SupplierItem) {
    this.editingId.set(s.id || null);
    this.form = { nombre: s.nombre, contacto: s.contacto || '', telefono: s.telefono || '' };
    this.modalOpen.set(true);
  }

  save() {
    const id = this.editingId();
    const req$ = id
      ? this.suppliersService.updateSupplier(id, this.form)
      : this.suppliersService.createSupplier(this.form);

    req$.subscribe(() => {
      this.modalOpen.set(false);
      this.load();
    });
  }

  remove(s: SupplierItem) {
    if (!s.id) return;
    if (!confirm(`¿Eliminar al proveedor "${s.nombre}"?`)) return;
    this.suppliersService.deleteSupplier(s.id).subscribe(() => this.load());
  }
}