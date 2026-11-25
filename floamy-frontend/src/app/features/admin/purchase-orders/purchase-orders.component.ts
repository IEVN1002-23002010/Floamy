import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../core/services/auth.service';
import { SuppliersService, SupplierItem } from '../../../core/services/suppliers.service';
import { InventoryService } from '../../../core/services/inventory.service';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

interface OrderDraftLine {
  ingrediente_id: number;
  cantidad: number;
  costo_unitario: number;
}

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent, CurrencyMxnPipe],
  styles: [`
    :host ::ng-deep app-modal [class*="max-w-"],
    :host ::ng-deep app-modal .modal-card,
    :host ::ng-deep app-modal .modal-dialog,
    :host ::ng-deep app-modal .modal-panel {
      max-width: 48rem !important;
      width: 95vw !important;
    }
  `],
  template: `
    <app-page-title
      eyebrow="ABASTECIMIENTO Y FINANZAS"
      title="Compras a proveedores"
      subtitle="Solicita insumos a tus proveedores y paga desde el dinero disponible en caja"
      button="+ Nueva orden de compra"
      (action)="openNewOrder()" />

    <!-- Tarjetas de manejo de dinero -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Dinero disponible en caja
        </span>
        <strong class="block text-2xl font-extrabold text-emerald-700 mt-1">
          {{ summary().dinero_disponible | currencyMxn }}
        </strong>
        <small class="text-[11px] text-slate-400">
          Ingresos por ventas ({{ summary().ingresos_totales | currencyMxn }}) − compras pagadas
        </small>
      </div>

      <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Órdenes por pagar
        </span>
        <strong class="block text-2xl font-extrabold text-amber-600 mt-1">
          {{ summary().ordenes_pendientes | currencyMxn }}
        </strong>
        <small class="text-[11px] text-slate-400">
          Pedidos enviados pendientes de liquidar
        </small>
      </div>

      <div class="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Total pagado a proveedores
        </span>
        <strong class="block text-2xl font-extrabold text-[#011640] mt-1">
          {{ summary().egresos_pagados | currencyMxn }}
        </strong>
        <small class="text-[11px] text-slate-400">
          Egresos descontados de caja e ingresados al almacén
        </small>
      </div>
    </div>

    <div *ngIf="bannerMsg()" class="p-3.5 mb-4 text-xs font-semibold text-emerald-800 rounded-2xl bg-emerald-50 border border-emerald-200">
      {{ bannerMsg() }}
    </div>
    <div *ngIf="bannerError()" class="p-3.5 mb-4 text-xs font-semibold text-red-800 rounded-2xl bg-red-50 border border-red-200">
      {{ bannerError() }}
    </div>

    <!-- Tabla de órdenes -->
    <div class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-5 py-3.5">Folio</th>
            <th scope="col" class="px-5 py-3.5">Proveedor y contacto</th>
            <th scope="col" class="px-5 py-3.5">Insumos solicitados</th>
            <th scope="col" class="px-5 py-3.5">Total</th>
            <th scope="col" class="px-5 py-3.5">Estado</th>
            <th scope="col" class="px-5 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngIf="orders().length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-slate-400">
              Aún no hay órdenes de compra registradas. Crea una orden para surtir tu inventario.
            </td>
          </tr>
          <tr *ngFor="let o of orders()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-5 py-4 align-top">
              <strong class="block text-[#011640]">{{ o.folio }}</strong>
              <small class="text-[11px] text-slate-400">{{ o.fecha_orden }}</small>
            </td>

            <td class="px-5 py-4 align-top">
              <strong class="block text-[#011640]">{{ o.proveedor_nombre }}</strong>
              <small *ngIf="o.proveedor_contacto" class="block text-[11px] text-slate-500">
                Contacto: {{ o.proveedor_contacto }}
              </small>
              <small *ngIf="o.proveedor_telefono" class="block text-[11px] text-[#6da0bf] font-semibold">
                Tel. {{ o.proveedor_telefono }}
              </small>
            </td>

            <td class="px-5 py-4 align-top">
              <ul class="space-y-1 text-xs">
                <li *ngFor="let it of o.items" class="text-slate-700">
                  <strong class="text-[#011640]">{{ it.cantidad }} {{ it.unidad }}</strong>
                  de {{ it.ingrediente_nombre }}
                  <span class="text-slate-400">({{ it.costo_unitario | currencyMxn }} c/u)</span>
                </li>
              </ul>
              <p *ngIf="o.notas" class="text-[11px] text-slate-400 italic mt-1">Nota: {{ o.notas }}</p>
            </td>

            <td class="px-5 py-4 align-top">
              <strong class="block text-base text-[#011640]">{{ o.total | currencyMxn }}</strong>
              <small class="text-[11px] text-slate-400">{{ o.metodo_pago }}</small>
            </td>

            <td class="px-5 py-4 align-top">
              <span *ngIf="o.estado === 'Pendiente'" class="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                Pendiente de pago
              </span>
              <span *ngIf="o.estado === 'Pagada'" class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                Pagada · Surtida
              </span>
              <span *ngIf="o.estado === 'Cancelada'" class="bg-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                Cancelada
              </span>
              <small *ngIf="o.fecha_pago" class="block text-[10px] text-slate-400 mt-1">
                Pagada: {{ o.fecha_pago }}
              </small>
            </td>

            <td class="px-5 py-4 align-top text-right">
              <div *ngIf="o.estado === 'Pendiente'" class="flex flex-col sm:flex-row justify-end gap-2">
                <button type="button"
                        (click)="openPayModal(o)"
                        class="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition whitespace-nowrap">
                  Pagar y surtir ✓
                </button>
                <button type="button"
                        (click)="cancelOrder(o)"
                        class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition whitespace-nowrap">
                  Cancelar
                </button>
              </div>
              <span *ngIf="o.estado !== 'Pendiente'" class="text-xs text-slate-400">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal: Nueva orden al proveedor -->
    <app-modal *ngIf="newModalOpen()" title="Nueva orden al proveedor" (close)="newModalOpen.set(false)">
      <form class="space-y-4" (ngSubmit)="submitNewOrder()">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Proveedor</label>
          <select required
                  name="proveedor_id"
                  [(ngModel)]="selectedSupplierId"
                  (ngModelChange)="onSupplierChange($event)"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full py-2.5 pl-3.5 pr-9">
            <option *ngFor="let s of suppliers()" [ngValue]="s.id">{{ s.nombre }}</option>
          </select>

          <div *ngIf="selectedSupplier()" class="mt-2.5 px-3.5 py-2.5 rounded-xl bg-[#f7f3e9] border border-slate-200 text-xs flex flex-wrap justify-between gap-3">
            <span><strong>Contacto:</strong> {{ selectedSupplier()?.contacto || 'No registrado' }}</span>
            <span><strong>Teléfono:</strong> {{ selectedSupplier()?.telefono || 'Sin teléfono' }}</span>
          </div>
        </div>

        <!-- Líneas de insumos -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-[#0b234a]">Insumos a solicitar</label>
            <button type="button"
                    (click)="addLine()"
                    class="text-xs font-semibold text-[#011640] bg-[#dff0f7] px-3 py-1.5 rounded-lg hover:bg-[#cde6f2] transition whitespace-nowrap">
              + Agregar insumo
            </button>
          </div>

          <div class="hidden sm:grid sm:grid-cols-12 gap-3 px-3 text-[11px] font-semibold text-slate-500">
            <span class="col-span-5">Insumo</span>
            <span class="col-span-3">Cantidad</span>
            <span class="col-span-2 text-right">Costo c/u</span>
            <span class="col-span-2 text-right">Subtotal</span>
          </div>

          <div class="max-h-60 overflow-y-auto space-y-2.5 pr-1">
            <div *ngFor="let line of draftLines; let idx = index"
                 class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="sm:col-span-5">
                <select [name]="'ing_' + idx"
                        [(ngModel)]="line.ingrediente_id"
                        (ngModelChange)="onLineIngredientChange(line, $event)"
                        class="bg-white border border-slate-300 text-[#011640] text-xs font-medium rounded-xl block w-full py-2.5 pl-3 pr-8 truncate">
                  <option *ngFor="let ing of availableIngredientsForSupplier()" [ngValue]="ing.id">
                    {{ ing.name }} ({{ ing.current }} {{ ing.unit }})
                  </option>
                </select>
              </div>

              <div class="sm:col-span-3 flex items-center gap-1.5">
                <input type="number"
                       step="0.1"
                       min="0.1"
                       [name]="'qty_' + idx"
                       [(ngModel)]="line.cantidad"
                       placeholder="Cant."
                       class="bg-white border border-slate-300 text-[#011640] text-xs font-semibold rounded-xl block w-full py-2 px-3" />
                <span class="text-[11px] font-semibold text-slate-500 shrink-0">
                  {{ getIngredientUnit(line.ingrediente_id) }}
                </span>
              </div>

              <div class="sm:col-span-2 flex sm:justify-end justify-between items-center">
                <span class="sm:hidden text-[11px] text-slate-500">Costo c/u:</span>
                <span class="inline-block px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-200/70 rounded-lg whitespace-nowrap">
                  {{ line.costo_unitario | currencyMxn }}
                </span>
              </div>

              <div class="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                <span class="sm:hidden text-[11px] text-slate-500">Subtotal:</span>
                <strong class="text-xs font-bold text-[#011640] whitespace-nowrap">
                  {{ (line.cantidad * line.costo_unitario) | currencyMxn }}
                </strong>
                <button type="button"
                        *ngIf="draftLines.length > 1"
                        (click)="removeLine(idx)"
                        title="Quitar insumo"
                        class="text-xs font-bold text-red-600 hover:bg-red-100 rounded-lg px-2 py-1 transition">
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Método de pago</label>
            <select name="metodo_pago" [(ngModel)]="metodoPago"
                    class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl block w-full py-2.5 pl-3.5 pr-9">
              <option value="Efectivo">Efectivo (Caja)</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Notas para proveedor</label>
            <input name="notas" [(ngModel)]="notas" placeholder="Ej. Entrega matutina"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl block w-full py-2.5 px-3.5" />
          </div>
        </div>

        <label class="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 cursor-pointer">
          <input type="checkbox" name="pagarAhora" [(ngModel)]="pagarAhora" class="w-4 h-4 rounded text-emerald-700 shrink-0" />
          <span>
            <strong>Pagar y recibir mercancía ahora</strong> (descuenta {{ draftTotal() | currencyMxn }} de caja y suma al inventario al instante)
          </span>
        </label>

        <div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div class="text-xs">
            <span class="text-slate-500">Total de la orden: </span>
            <strong class="text-lg text-[#011640]">{{ draftTotal() | currencyMxn }}</strong>
            <span class="block text-[11px] text-slate-400">
              Disponible en caja: {{ summary().dinero_disponible | currencyMxn }}
            </span>
          </div>

          <div class="flex items-center gap-2.5 ml-auto">
            <button type="button"
                    (click)="newModalOpen.set(false)"
                    class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 whitespace-nowrap">
              Cancelar
            </button>
            <button type="submit"
                    [disabled]="saving()"
                    class="px-5 py-2.5 text-xs font-semibold text-white bg-[#011640] rounded-xl hover:bg-[#0b234a] disabled:opacity-50 whitespace-nowrap">
              {{ saving() ? 'Guardando...' : (pagarAhora ? 'Pagar y surtir ✓' : 'Enviar orden →') }}
            </button>
          </div>
        </div>
      </form>
    </app-modal>

    <!-- Modal: Confirmar pago de orden pendiente -->
    <app-modal *ngIf="payingOrder()" title="Confirmar pago al proveedor" (close)="payingOrder.set(null)">
      <div *ngIf="payingOrder() as ord" class="space-y-4">
        <p class="text-xs text-slate-600 leading-relaxed">
          Al confirmar el pago de la orden <strong>{{ ord.folio }}</strong> a <strong>{{ ord.proveedor_nombre }}</strong>,
          se descontarán <strong>{{ ord.total | currencyMxn }}</strong> del dinero disponible en caja y los insumos entrarán automáticamente al inventario.
        </p>

        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Método de pago</label>
          <select [(ngModel)]="payModalMethod"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl block w-full py-2.5 pl-3.5 pr-9">
            <option value="Efectivo">Efectivo (Caja)</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </div>

        <div class="p-3.5 rounded-xl bg-[#f7f3e9] text-xs flex justify-between">
          <span>Saldo actual en caja:</span>
          <strong>{{ summary().dinero_disponible | currencyMxn }}</strong>
        </div>

        <div class="flex justify-end gap-2.5 pt-2">
          <button type="button"
                  (click)="payingOrder.set(null)"
                  class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl whitespace-nowrap">
            Cancelar
          </button>
          <button type="button"
                  (click)="confirmPayOrder()"
                  class="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 whitespace-nowrap">
            Confirmar pago ({{ ord.total | currencyMxn }})
          </button>
        </div>
      </div>
    </app-modal>
  `
})
export class PurchaseOrdersComponent implements OnInit {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private suppliersService = inject(SuppliersService);
  private invService = inject(InventoryService);

  orders = signal<any[]>([]);
  summary = signal({
    ingresos_totales: 0,
    egresos_pagados: 0,
    ordenes_pendientes: 0,
    dinero_disponible: 0,
  });
  suppliers = signal<SupplierItem[]>([]);
  ingredients = signal<any[]>([]);

  newModalOpen = signal(false);
  payingOrder = signal<any | null>(null);
  payModalMethod = 'Efectivo';
  saving = signal(false);
  bannerMsg = signal('');
  bannerError = signal('');

  selectedSupplierId: number | null = null;
  draftLines: OrderDraftLine[] = [];
  metodoPago = 'Efectivo';
  notas = '';
  pagarAhora = true;

  ngOnInit() {
    this.loadOrders();
    this.suppliersService.getSuppliers().subscribe((list) => {
      this.suppliers.set(list);
      if (list.length > 0 && !this.selectedSupplierId) {
        this.selectedSupplierId = list[0].id ?? null;
      }
    });
    this.invService.getIngredients().subscribe((list: any[]) => this.ingredients.set(list));
  }

  loadOrders() {
    this.http.get<any>(`${environment.apiUrl}/purchase-orders/`).subscribe((res) => {
      this.summary.set(res.summary || this.summary());
      this.orders.set(res.orders || []);
    });
  }

  selectedSupplier(): SupplierItem | undefined {
    return this.suppliers().find((s) => Number(s.id) === Number(this.selectedSupplierId));
  }

  availableIngredientsForSupplier(): any[] {
    const all = this.ingredients();
    if (!this.selectedSupplierId) return all;
    const assigned = all.filter((i) => Number(i.proveedor_id) === Number(this.selectedSupplierId));
    return assigned.length > 0 ? assigned : all;
  }

  getIngredientUnit(ingId: number): string {
    const found = this.ingredients().find((i) => Number(i.id) === Number(ingId));
    return found?.unit || '';
  }

  openNewOrder() {
    this.bannerMsg.set('');
    this.bannerError.set('');
    if (!this.selectedSupplierId && this.suppliers().length > 0) {
      this.selectedSupplierId = this.suppliers()[0].id ?? null;
    }
    this.resetDraftLines();
    this.metodoPago = 'Efectivo';
    this.notas = '';
    this.pagarAhora = true;
    this.newModalOpen.set(true);
  }

  onSupplierChange(supId: number) {
    this.selectedSupplierId = supId;
    this.resetDraftLines();
  }

  private resetDraftLines() {
    const pool = this.availableIngredientsForSupplier();
    const first = pool[0];
    this.draftLines = first
      ? [{
          ingrediente_id: first.id,
          cantidad: 10,
          costo_unitario: Number(first.costo_unitario ?? first.costoUnitario ?? 0)
        }]
      : [];
  }

  addLine() {
    const pool = this.availableIngredientsForSupplier();
    const next = pool.find((i) => !this.draftLines.some((l) => l.ingrediente_id === i.id)) || pool[0];
    if (!next) return;
    this.draftLines.push({
      ingrediente_id: next.id,
      cantidad: 5,
      costo_unitario: Number(next.costo_unitario ?? next.costoUnitario ?? 0),
    });
  }

  removeLine(idx: number) {
    this.draftLines.splice(idx, 1);
  }

  onLineIngredientChange(line: OrderDraftLine, ingId: number) {
    const found = this.ingredients().find((i) => Number(i.id) === Number(ingId));
    if (found) {
      line.costo_unitario = Number(found.costo_unitario ?? found.costoUnitario ?? 0);
    }
  }

  draftTotal(): number {
    return this.draftLines.reduce(
      (sum, l) => sum + Number(l.cantidad || 0) * Number(l.costo_unitario || 0),
      0
    );
  }

  submitNewOrder() {
    if (!this.selectedSupplierId || this.draftLines.length === 0 || this.saving()) return;
    this.saving.set(true);
    this.bannerError.set('');

    this.http
      .post<any>(`${environment.apiUrl}/purchase-orders/`, {
        proveedor_id: this.selectedSupplierId,
        usuario_id: this.auth.currentUser()?.id || null,
        metodo_pago: this.metodoPago,
        notas: this.notas,
        pagar_ahora: this.pagarAhora,
        items: this.draftLines.map((l) => ({
          ingrediente_id: l.ingrediente_id,
          cantidad: l.cantidad,
        })),
      })
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.newModalOpen.set(false);
          this.bannerMsg.set(res.message || 'Orden registrada.');
          this.loadOrders();
          this.invService.getIngredients().subscribe((list: any[]) => this.ingredients.set(list));
        },
        error: (err) => {
          this.saving.set(false);
          this.bannerError.set(err?.error?.error || 'No se pudo crear la orden.');
        },
      });
  }

  openPayModal(order: any) {
    this.bannerMsg.set('');
    this.bannerError.set('');
    this.payModalMethod = order.metodo_pago || 'Efectivo';
    this.payingOrder.set(order);
  }

  confirmPayOrder() {
    const ord = this.payingOrder();
    if (!ord) return;

    this.http
      .patch<any>(`${environment.apiUrl}/purchase-orders/${ord.id}/pay`, {
        metodo_pago: this.payModalMethod,
        usuario_id: this.auth.currentUser()?.id || null,
      })
      .subscribe({
        next: (res) => {
          this.payingOrder.set(null);
          this.bannerMsg.set(res.message || 'Pago realizado.');
          this.loadOrders();
          this.invService.getIngredients().subscribe((list: any[]) => this.ingredients.set(list));
        },
        error: (err) => {
          this.payingOrder.set(null);
          this.bannerError.set(err?.error?.error || 'No se pudo pagar la orden.');
        },
      });
  }

  cancelOrder(order: any) {
    if (!confirm(`¿Cancelar la orden ${order.folio}?`)) return;
    this.http.patch<any>(`${environment.apiUrl}/purchase-orders/${order.id}/cancel`, {}).subscribe({
      next: () => {
        this.bannerMsg.set(`Orden ${order.folio} cancelada.`);
        this.loadOrders();
      },
      error: (err) => {
        this.bannerError.set(err?.error?.error || 'No se pudo cancelar.');
      },
    });
  }
}