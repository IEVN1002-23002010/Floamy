import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { InventoryService } from '../../../core/services/inventory.service';
import { AuthService } from '../../../core/services/auth.service';
import { IngredientItem } from '../../../core/models/inventory.model';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent],
  template: `
    <app-page-title
      eyebrow="BITÁCORA"
      title="Movimientos de inventario"
      subtitle="Entradas, producción y mermas."
      button="+ Nuevo movimiento"
      (action)="openCreate()" />

    <div class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-6 py-3.5">Fecha</th>
            <th scope="col" class="px-6 py-3.5">Tipo</th>
            <th scope="col" class="px-6 py-3.5">Ingrediente</th>
            <th scope="col" class="px-6 py-3.5">Cantidad</th>
            <th scope="col" class="px-6 py-3.5">Responsable</th>
            <th scope="col" class="px-6 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngIf="movements().length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-slate-400">
              Aún no hay movimientos registrados.
            </td>
          </tr>
          <tr *ngFor="let m of movements()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-6 py-4 font-semibold text-[#011640]">{{ m.date }}</td>
            <td class="px-6 py-4">
              <span *ngIf="m.type === 'Entrada'" class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{{ m.type }}</span>
              <span *ngIf="m.type === 'Producción'" class="bg-[#dff0f7] text-[#011640] text-xs font-semibold px-2.5 py-0.5 rounded-full">{{ m.type }}</span>
              <span *ngIf="m.type !== 'Entrada' && m.type !== 'Producción'" class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">{{ m.type }}</span>
            </td>
            <td class="px-6 py-4">{{ m.ingredient }}</td>
            <td class="px-6 py-4 font-bold text-[#011640]">{{ m.amount }}</td>
            <td class="px-6 py-4 text-xs">{{ m.responsible }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button type="button"
                        (click)="openEdit(m)"
                        class="px-3 py-1.5 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition">
                  Editar
                </button>
                <button type="button"
                        (click)="remove(m)"
                        class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  Quitar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-modal *ngIf="adding()" [title]="editingId() ? 'Editar movimiento' : 'Registrar movimiento'" (close)="adding.set(false)">
      <form class="space-y-4" (ngSubmit)="save()">
        <div *ngIf="saveError()" role="alert" class="p-3 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
          {{ saveError() }}
        </div>

        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Ingrediente</label>
          <select name="ing" [(ngModel)]="form.ingredienteId" required
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5">
            <option *ngFor="let ing of ingredients()" [ngValue]="ing.id">{{ ing.name }} ({{ ing.unit }})</option>
          </select>
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Tipo</label>
          <select name="tipo" [(ngModel)]="form.tipo"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5">
            <option value="Entrada">Entrada</option>
            <option value="Producción">Producción</option>
            <option value="Merma">Merma</option>
          </select>
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Cantidad</label>
          <input type="number" step="0.01" min="0.01" required name="cant" [(ngModel)]="form.cantidad"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" (click)="adding.set(false)" class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" [disabled]="saving()" class="px-5 py-2.5 text-xs font-semibold text-white bg-[#011640] rounded-xl hover:bg-[#0b234a] focus:ring-4 focus:ring-[#6da0bf]/40 disabled:opacity-50">
            {{ saving() ? 'Guardando...' : (editingId() ? 'Actualizar ✓' : 'Registrar ✓') }}
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class MovementsComponent implements OnInit {
  private invService = inject(InventoryService);
  private auth = inject(AuthService);

  movements = signal<any[]>([]);
  ingredients = signal<IngredientItem[]>([]);
  adding = signal(false);
  saving = signal(false);
  saveError = signal('');
  editingId = signal<number | null>(null);
  form = { ingredienteId: 1, tipo: 'Entrada', cantidad: 1 };

  ngOnInit() {
    this.load();
    this.invService.getIngredients().subscribe((list) => {
      this.ingredients.set(list);
      if (list[0]?.id) this.form.ingredienteId = list[0].id;
    });
  }

  load() {
    this.invService.getMovements().subscribe((list) => this.movements.set(list));
  }

  openCreate() {
    this.saveError.set('');
    this.editingId.set(null);
    this.form = {
      ingredienteId: this.ingredients()[0]?.id || 1,
      tipo: 'Entrada',
      cantidad: 1
    };
    this.adding.set(true);
  }

  openEdit(m: any) {
    this.saveError.set('');
    this.editingId.set(m.id || null);
    const matchedIng = this.ingredients().find(
      (i) => i.name.trim().toLowerCase() === String(m.ingredient || '').trim().toLowerCase()
    );
    const ingId = m.ingrediente_id ?? m.ingredienteId ?? matchedIng?.id ?? this.ingredients()[0]?.id ?? 1;
    const rawCant = m.cantidad !== undefined ? Number(m.cantidad) : parseFloat(String(m.amount || '1'));

    this.form = {
      ingredienteId: Number(ingId),
      tipo: m.type || 'Entrada',
      cantidad: Math.abs(rawCant) || 1
    };
    this.adding.set(true);
  }

  save() {
    this.saveError.set('');
    this.saving.set(true);
    const payload = { ...this.form, usuarioId: this.auth.currentUser()?.id };
    const id = this.editingId();
    const req$ = id
      ? this.invService.updateMovement(id, payload)
      : this.invService.registerMovement(payload);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.adding.set(false);
        this.editingId.set(null);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(err?.error?.error || `Error ${err?.status || ''} al guardar el movimiento.`);
      }
    });
  }

  remove(m: any) {
    if (!m.id) return;
    if (!confirm(`¿Eliminar el movimiento de "${m.ingredient}" (${m.amount})?`)) return;
    this.invService.deleteMovement(m.id).subscribe(() => this.load());
  }
}