import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { OrdersService } from '../../../core/services/orders.service';
import { OrderItem } from '../../../core/models/order.model';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

interface OrderGroup {
  key: string;
  label: string;
  count: number;
  total: number;
  orders: OrderItem[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, CurrencyMxnPipe],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <app-page-title
        eyebrow="OPERACIÓN EN VIVO"
        title="Seguimiento de pedidos"
        subtitle="Filtra por fecha, cliente, método de pago o agrupa por día y mes." />

      <button type="button"
              (click)="load()"
              class="px-4 py-2 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl transition">
        Actualizar ↻
      </button>
    </div>

    <!-- Tarjetas de resumen según filtros activos -->
    <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pedidos mostrados</span>
        <strong class="block text-2xl font-bold text-[#011640] mt-1">{{ filteredOrders().length }}</strong>
        <small class="text-xs text-slate-500">De {{ orders().length }} en total</small>
      </div>

      <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monto filtrado</span>
        <strong class="block text-2xl font-bold text-[#011640] mt-1">{{ filteredTotal() | currencyMxn }}</strong>
        <small class="text-xs text-slate-500">Suma de pedidos visibles</small>
      </div>

      <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600">En curso</span>
        <strong class="block text-2xl font-bold text-[#011640] mt-1">{{ activeCount() }}</strong>
        <small class="text-xs text-slate-500">Pendientes o preparando</small>
      </div>

      <div class="p-4 rounded-2xl bg-[#011640] text-white border border-[#011640] shadow-sm">
        <span class="text-[11px] font-bold uppercase tracking-wider text-[#aac8e0]">Entregados</span>
        <strong class="block text-2xl font-bold mt-1">{{ deliveredCount() }}</strong>
        <small class="text-xs text-[#aac8e0]">Completados en el filtro</small>
      </div>
    </section>

    <!-- Barra de filtros y agrupación -->
    <section class="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <!-- Buscador -->
        <div class="lg:col-span-2">
          <label class="block mb-1 text-[11px] font-semibold text-[#0b234a]">Buscar folio o producto</label>
          <input type="text"
                 [ngModel]="searchQuery()"
                 (ngModelChange)="searchQuery.set($event)"
                 placeholder="Ej. #FL-3008, Fresa, Andrea..."
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-xs rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full px-3 py-2" />
        </div>

        <!-- Cliente / Usuario -->
        <div>
          <label class="block mb-1 text-[11px] font-semibold text-[#0b234a]">Cliente / Usuario</label>
          <select [ngModel]="selectedCustomer()"
                  (ngModelChange)="selectedCustomer.set($event)"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-xs rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full px-3 py-2">
            <option value="">Todos los clientes</option>
            <option *ngFor="let c of uniqueCustomers()" [value]="c">{{ c }}</option>
          </select>
        </div>

        <!-- Etapa -->
        <div>
          <label class="block mb-1 text-[11px] font-semibold text-[#0b234a]">Etapa</label>
          <select [ngModel]="selectedStage()"
                  (ngModelChange)="selectedStage.set($event)"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-xs rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full px-3 py-2">
            <option value="all">Todas las etapas</option>
            <option value="0">1. Pendiente</option>
            <option value="1">2. En preparación</option>
            <option value="2">3. Listo para recolección</option>
            <option value="3">4. Entregado</option>
          </select>
        </div>

        <!-- Método de pago -->
        <div>
          <label class="block mb-1 text-[11px] font-semibold text-[#0b234a]">Método de pago</label>
          <select [ngModel]="selectedPayment()"
                  (ngModelChange)="selectedPayment.set($event)"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-xs rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full px-3 py-2">
            <option value="all">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="transferencia">Transferencia SPEI</option>
          </select>
        </div>

        <!-- Periodo de fecha -->
        <div>
          <label class="block mb-1 text-[11px] font-semibold text-[#0b234a]">Filtrar fecha</label>
          <select [ngModel]="dateMode()"
                  (ngModelChange)="onDateModeChange($event)"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-xs rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full px-3 py-2">
            <option value="all">Todas las fechas</option>
            <option value="day">Por día específico</option>
            <option value="month">Por mes</option>
          </select>
        </div>
      </div>

      <!-- Fila secundaria: selector de día/mes + modo de agrupación -->
      <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <ng-container *ngIf="dateMode() === 'day'">
            <span class="text-xs font-semibold text-[#0b234a]">Día:</span>
            <input type="date"
                   [ngModel]="selectedDay()"
                   (ngModelChange)="selectedDay.set($event)"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-xs font-semibold rounded-xl px-3 py-1.5" />
            <button type="button"
                    (click)="setToday()"
                    class="px-2.5 py-1.5 text-xs font-semibold text-[#011640] bg-[#dff0f7] hover:bg-[#cde6f1] rounded-xl transition">
              Hoy
            </button>
          </ng-container>

          <ng-container *ngIf="dateMode() === 'month'">
            <span class="text-xs font-semibold text-[#0b234a]">Mes:</span>
            <input type="month"
                   [ngModel]="selectedMonth()"
                   (ngModelChange)="selectedMonth.set($event)"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-xs font-semibold rounded-xl px-3 py-1.5" />
          </ng-container>

          <button *ngIf="hasActiveFilters()"
                  type="button"
                  (click)="resetFilters()"
                  class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition">
            Limpiar filtros ✕
          </button>
        </div>

        <!-- Botones de acomodo / agrupación -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-semibold text-slate-500 mr-1">Acomodar:</span>
          <button type="button"
                  (click)="groupBy.set('day')"
                  [class]="groupBy() === 'day'
                    ? 'px-3 py-1.5 text-xs font-semibold text-white bg-[#011640] rounded-xl transition'
                    : 'px-3 py-1.5 text-xs font-medium text-[#0b234a] bg-[#f7f3e9] hover:bg-slate-200 rounded-xl transition'">
            Por día
          </button>
          <button type="button"
                  (click)="groupBy.set('month')"
                  [class]="groupBy() === 'month'
                    ? 'px-3 py-1.5 text-xs font-semibold text-white bg-[#011640] rounded-xl transition'
                    : 'px-3 py-1.5 text-xs font-medium text-[#0b234a] bg-[#f7f3e9] hover:bg-slate-200 rounded-xl transition'">
            Por mes
          </button>
          <button type="button"
                  (click)="groupBy.set('none')"
                  [class]="groupBy() === 'none'
                    ? 'px-3 py-1.5 text-xs font-semibold text-white bg-[#011640] rounded-xl transition'
                    : 'px-3 py-1.5 text-xs font-medium text-[#0b234a] bg-[#f7f3e9] hover:bg-slate-200 rounded-xl transition'">
            Lista corrida
          </button>
        </div>
      </div>
    </section>

    <!-- Layout Maestro-Detalle -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Columna izquierda: Lista agrupada de pedidos -->
      <section class="lg:col-span-7 space-y-5">
        <div *ngIf="groupedOrders().length === 0"
             class="p-10 bg-white border border-slate-200 rounded-2xl text-center text-slate-400 text-sm">
          No hay pedidos que coincidan con los filtros seleccionados.
        </div>

        <div *ngFor="let grp of groupedOrders()"
             class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <!-- Encabezado del grupo (Día / Mes / Todos) -->
          <div class="px-5 py-3.5 bg-[#f7f3e9] border-b border-slate-200/80 flex items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-bold text-[#011640]">{{ grp.label }}</h2>
              <span class="text-[11px] text-slate-500">{{ grp.count }} pedido(s)</span>
            </div>
            <strong class="text-sm font-bold text-[#011640]">{{ grp.total | currencyMxn }}</strong>
          </div>

          <!-- Filas de pedidos dentro del grupo -->
          <div class="divide-y divide-slate-100">
            <button *ngFor="let order of grp.orders"
                    type="button"
                    (click)="selectedOrder.set(order)"
                    [class]="order.dbId === activeOrder()?.dbId
                      ? 'w-full text-left px-5 py-3.5 bg-[#dff0f7]/55 border-l-4 border-[#011640] flex items-center justify-between gap-3 transition'
                      : 'w-full text-left px-5 py-3.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition'">
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <strong class="text-xs font-bold text-[#011640]">{{ order.id }}</strong>
                  <span class="text-xs font-semibold text-slate-700 truncate">{{ order.customer }}</span>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {{ order.canal || 'PWA' }}
                  </span>
                </div>
                <small class="block text-[11px] text-slate-400 mt-0.5 truncate">
                  {{ order.time }} · {{ order.payment }} · {{ order.items.length }} art(s).
                </small>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <span [class]="stageBadgeClass(order.stage)">{{ stages[order.stage] }}</span>
                <strong class="text-xs font-bold text-[#011640] w-20 text-right">{{ order.total | currencyMxn }}</strong>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- Columna derecha: Detalle fijo del pedido seleccionado -->
      <aside class="lg:col-span-5 lg:sticky lg:top-20">
        <div *ngIf="activeOrder() as current; else emptySelection"
             class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-5">
          <div class="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span [class]="stageBadgeClass(current.stage)">{{ stages[current.stage] }}</span>
                <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#f7f3e9] text-[#011640]">
                  {{ current.canal || 'PWA' }}
                </span>
              </div>
              <h2 class="text-xl font-bold text-[#011640] mt-2">Pedido {{ current.id }}</h2>
              <p class="text-xs text-slate-500 mt-0.5">{{ current.customer }} · {{ current.time }}</p>
            </div>
            <strong class="text-xl font-bold text-[#011640]">{{ current.total | currencyMxn }}</strong>
          </div>

          <!-- Selector de etapa (2x2) -->
          <div>
            <span class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Actualizar etapa del pedido
            </span>
            <div class="grid grid-cols-2 gap-2">
              <button *ngFor="let s of stages; let i = index"
                      type="button"
                      (click)="setStage(current, i)"
                      [class]="i === current.stage
                        ? 'p-3 rounded-xl border-2 border-[#011640] bg-[#dff0f7]/60 text-left transition'
                        : (i < current.stage
                          ? 'p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 text-left transition'
                          : 'p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition')">
                <span class="block text-[11px] font-bold text-[#6da0bf]">
                  {{ i < current.stage ? '✓ Completado' : 'Paso ' + (i + 1) }}
                </span>
                <strong class="block text-xs font-bold text-[#011640] mt-0.5">{{ s }}</strong>
              </button>
            </div>
          </div>

          <!-- Desglose de productos -->
          <div class="p-4 rounded-2xl bg-[#f7f3e9] space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-[#011640]">Detalle del pedido</h3>
            <p *ngIf="current.items.length === 0" class="text-xs text-slate-500">Sin partidas registradas.</p>
            <div *ngFor="let line of current.items" class="text-xs text-[#0b234a] font-medium">
              • {{ line }}
            </div>
          </div>

          <!-- Datos de pago -->
          <div class="p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span class="block text-slate-400">Método de pago</span>
              <strong class="text-[#011640] text-sm">{{ current.payment }}</strong>
            </div>
            <div class="text-right">
              <span class="block text-slate-400">Folio de pago</span>
              <strong class="text-[#011640]">{{ current.folio }}</strong>
            </div>
          </div>
        </div>

        <ng-template #emptySelection>
          <div class="p-8 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-400">
            Selecciona un pedido de la lista para ver su detalle y cambiar su etapa.
          </div>
        </ng-template>
      </aside>
    </div>
  `
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);
  stages = ['Pendiente', 'En preparación', 'Listo para recolección', 'Entregado'];

  orders = signal<OrderItem[]>([]);
  selectedOrder = signal<OrderItem | null>(null);

  // Filtros
  searchQuery = signal('');
  selectedCustomer = signal('');
  selectedStage = signal('all');
  selectedPayment = signal('all');
  dateMode = signal<'all' | 'day' | 'month'>('all');
  selectedDay = signal(this.getTodayLocal());
  selectedMonth = signal(this.getTodayLocal().slice(0, 7));
  groupBy = signal<'day' | 'month' | 'none'>('day');

  private getTodayLocal(): string {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
  }

  uniqueCustomers = computed(() => {
    const set = new Set<string>();
    for (const o of this.orders()) {
      if (o.customer) set.add(o.customer);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  });

  filteredOrders = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cust = this.selectedCustomer();
    const stage = this.selectedStage();
    const pay = this.selectedPayment();
    const dMode = this.dateMode();
    const day = this.selectedDay();
    const month = this.selectedMonth();

    return this.orders().filter((o) => {
      if (cust && o.customer !== cust) return false;
      if (stage !== 'all' && o.stage !== Number(stage)) return false;

      if (pay !== 'all') {
        const pLower = (o.payment || '').toLowerCase();
        if (pay === 'tarjeta' && !pLower.includes('tarj')) return false;
        if (pay === 'transferencia' && !pLower.includes('trans') && !pLower.includes('spei')) return false;
        if (pay === 'efectivo' && (pLower.includes('tarj') || pLower.includes('trans') || pLower.includes('spei'))) return false;
      }

      if (dMode === 'day' && day && o.isoDate && o.isoDate !== day) return false;
      if (dMode === 'month' && month && o.isoMonth && o.isoMonth !== month) return false;

      if (q) {
        const haystack = `${o.id} ${o.customer} ${o.folio} ${o.items.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  });

  groupedOrders = computed<OrderGroup[]>(() => {
    const list = this.filteredOrders();
    const mode = this.groupBy();

    if (mode === 'none') {
      if (list.length === 0) return [];
      const total = list.reduce((s, o) => s + Number(o.total || 0), 0);
      return [{ key: 'all', label: 'Todos los pedidos filtrados', count: list.length, total, orders: list }];
    }

    const map = new Map<string, OrderGroup>();
    for (const o of list) {
      const key = mode === 'day' ? (o.isoDate || o.dayLabel || 'sin-fecha') : (o.isoMonth || o.monthLabel || 'sin-mes');
      const label = mode === 'day' ? (o.dayLabel || o.isoDate || 'Sin fecha') : (o.monthLabel || o.isoMonth || 'Sin mes');

      let group = map.get(key);
      if (!group) {
        group = { key, label, count: 0, total: 0, orders: [] };
        map.set(key, group);
      }
      group.orders.push(o);
      group.count += 1;
      group.total = Math.round((group.total + Number(o.total || 0)) * 100) / 100;
    }

    return Array.from(map.values());
  });

  filteredTotal = computed(() =>
    this.filteredOrders().reduce((sum, o) => sum + Number(o.total || 0), 0)
  );

  activeCount = computed(() =>
    this.filteredOrders().filter((o) => o.stage < 3).length
  );

  deliveredCount = computed(() =>
    this.filteredOrders().filter((o) => o.stage >= 3).length
  );

  activeOrder = computed(() => {
    const list = this.filteredOrders();
    if (list.length === 0) return null;
    const current = this.selectedOrder();
    if (current) {
      const match = list.find((o) => o.dbId === current.dbId && o.id === current.id);
      if (match) return match;
    }
    return list[0];
  });

  hasActiveFilters = computed(() =>
    !!this.searchQuery().trim() ||
    !!this.selectedCustomer() ||
    this.selectedStage() !== 'all' ||
    this.selectedPayment() !== 'all' ||
    this.dateMode() !== 'all'
  );

  ngOnInit() {
    this.load();
  }

  onDateModeChange(mode: 'all' | 'day' | 'month') {
    this.dateMode.set(mode);
    if (mode === 'day') this.groupBy.set('day');
    if (mode === 'month') this.groupBy.set('month');
  }

  setToday() {
    this.selectedDay.set(this.getTodayLocal());
  }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedCustomer.set('');
    this.selectedStage.set('all');
    this.selectedPayment.set('all');
    this.dateMode.set('all');
  }

  stageBadgeClass(stage: number): string {
    if (stage >= 3) return 'bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full';
    if (stage === 2) return 'bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded-full';
    if (stage === 1) return 'bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full';
    return 'bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full';
  }

  load() {
    this.ordersService.getOrders().subscribe((list) => {
      this.orders.set(list);
      if (list.length > 0 && !this.selectedOrder()) {
        this.selectedOrder.set(list[0]);
      }
    });
  }

  setStage(order: OrderItem, stage: number) {
    if (!order.dbId) return;
    this.ordersService.updateStage(order.dbId, stage).subscribe(() => {
      const updated: OrderItem = { ...order, stage };
      this.selectedOrder.set(updated);
      this.orders.update((list) =>
        list.map((o) => (o.dbId === order.dbId ? updated : o))
      );
    });
  }
}