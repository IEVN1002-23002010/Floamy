import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import {
  CashClosureItem,
  CashDaySummary,
  CashRegisterService,
} from '../../../core/services/cash-register.service';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

@Component({
  selector: 'app-cash-register',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, CurrencyMxnPipe],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <app-page-title
        eyebrow="ARQUEO DE TURNO"
        title="Cierre de caja"
        subtitle="Compara el efectivo físico contra las ventas cobradas y compras pagadas en efectivo." />

      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold text-[#0b234a]">Fecha:</label>
        <input type="date"
               [(ngModel)]="selectedDate"
               (change)="loadSummary(true)"
               class="bg-white border border-slate-300 text-[#011640] text-xs font-semibold rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] px-3 py-2" />
        <button type="button"
                (click)="loadSummary(true)"
                class="px-3.5 py-2 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl transition">
          Actualizar ↻
        </button>
      </div>
    </div>

    <!-- Resumen de ventas del día por método de pago -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span class="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          Ventas en efectivo
        </span>
        <strong class="block text-2xl font-bold text-[#011640] mt-3">
          {{ summary()?.ventas_efectivo || 0 | currencyMxn }}
        </strong>
        <small class="text-xs text-slate-500">
          Compras efec.: −{{ summary()?.egresos_efectivo || 0 | currencyMxn }}
        </small>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span class="bg-[#dff0f7] text-[#011640] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          Tarjeta
        </span>
        <strong class="block text-2xl font-bold text-[#011640] mt-3">
          {{ summary()?.ventas_tarjeta || 0 | currencyMxn }}
        </strong>
        <small class="text-xs text-slate-500">Vouchers / terminal</small>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <span class="bg-[#dff0f7] text-[#011640] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          Transferencia SPEI
        </span>
        <strong class="block text-2xl font-bold text-[#011640] mt-3">
          {{ summary()?.ventas_transferencia || 0 | currencyMxn }}
        </strong>
        <small class="text-xs text-slate-500">Depósitos verificados</small>
      </div>

      <div class="p-5 rounded-2xl bg-[#011640] text-white border border-[#011640] shadow-sm">
        <span class="bg-white/15 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
          {{ summary()?.pedidos_count || 0 }} pedidos
        </span>
        <strong class="block text-2xl font-bold mt-3">
          {{ summary()?.total_ventas || 0 | currencyMxn }}
        </strong>
        <small class="text-xs text-[#aac8e0]">Venta total del día</small>
      </div>
    </section>

    <!-- Formulario de Arqueo y Cuadre -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      <div class="lg:col-span-7 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-bold text-[#011640]">Conteo físico de efectivo</h2>
            <p class="text-xs text-slate-500 mt-0.5">Ingresa el fondo inicial y los billetes/monedas contados al cerrar.</p>
          </div>
          <span *ngIf="(summary()?.cortes_hoy || 0) > 0"
                class="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
            {{ summary()?.cortes_hoy }} cierre(s) hoy
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">
              1. Fondo inicial de caja (MXN)
            </label>
            <input type="number"
                   step="0.5"
                   min="0"
                   [ngModel]="fondoInicial()"
                   (ngModelChange)="fondoInicial.set(+$event || 0)"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm font-bold rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            <small class="text-[11px] text-slate-400">Cambio con el que abrió el turno.</small>
          </div>

          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">
              2. Efectivo físico contado (MXN)
            </label>
            <input type="number"
                   step="0.5"
                   [ngModel]="efectivoContado()"
                   (ngModelChange)="efectivoContado.set(+$event || 0)"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm font-bold rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            <small class="text-[11px] text-slate-400">Total de billetes y monedas en cajón.</small>
          </div>
        </div>

        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">
            Observaciones del turno (opcional)
          </label>
          <input [(ngModel)]="observaciones"
                 placeholder="Ej. Se retiran ganancias y quedan $500 de fondo para mañana."
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>

        <div *ngIf="successMsg()" role="alert" class="p-3 text-xs font-semibold text-emerald-800 rounded-xl bg-emerald-50 border border-emerald-200">
          {{ successMsg() }}
        </div>
        <div *ngIf="errorMsg()" role="alert" class="p-3 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
          {{ errorMsg() }}
        </div>

        <div class="flex justify-end pt-1">
          <button type="button"
                  [disabled]="saving()"
                  (click)="saveClosure()"
                  class="px-5 py-3 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl disabled:opacity-50 transition">
            {{ saving() ? 'Guardando cierre...' : 'Registrar cierre de caja ✓' }}
          </button>
        </div>
      </div>

      <!-- Tarjeta de Resultado / Cuadre en tiempo real -->
      <div class="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
        <div>
          <span class="eyebrow">RESULTADO DEL ARQUEO</span>
          <h3 class="text-lg font-bold text-[#011640] mt-0.5">Cuadre de efectivo</h3>

          <div class="mt-4 p-4 rounded-2xl bg-[#f7f3e9] space-y-2.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-600">Fondo inicial:</span>
              <strong class="text-[#011640]">{{ fondoInicial() | currencyMxn }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">+ Ventas en efectivo:</span>
              <strong class="text-emerald-700">+{{ summary()?.ventas_efectivo || 0 | currencyMxn }}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">− Compras pagadas en efectivo:</span>
              <strong class="text-rose-700">−{{ summary()?.egresos_efectivo || 0 | currencyMxn }}</strong>
            </div>
            <div class="pt-2 border-t border-slate-300/70 flex justify-between text-sm">
              <span class="font-bold text-[#011640]">Debe haber en caja:</span>
              <strong class="text-[#011640]">{{ efectivoEsperado() | currencyMxn }}</strong>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-600">Contado en físico:</span>
              <strong class="text-[#011640]">{{ efectivoContado() | currencyMxn }}</strong>
            </div>
          </div>
        </div>

        <!-- Banner de diferencia -->
        <div *ngIf="diferencia() === 0"
             class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
          <strong class="block text-sm font-bold">✓ Caja cuadrada exacto</strong>
          <span class="text-xs">No hay faltantes ni sobrantes ($0.00).</span>
        </div>

        <div *ngIf="diferencia() > 0"
             class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
          <strong class="block text-sm font-bold">+ Sobrante de {{ absDiff() | currencyMxn }}</strong>
          <span class="text-xs">Hay más efectivo físico del que marca el sistema.</span>
        </div>

        <div *ngIf="diferencia() < 0"
             class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900">
          <strong class="block text-sm font-bold">− Faltante de {{ absDiff() | currencyMxn }}</strong>
          <span class="text-xs">Falta dinero respecto al total esperado en caja.</span>
        </div>
      </div>
    </section>

    <!-- Historial de cortes realizados -->
    <section class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <div class="p-5 border-b border-slate-100">
        <h2 class="text-base font-bold text-[#011640]">Historial de cierres de caja</h2>
        <p class="text-xs text-slate-500 mt-0.5">Bitácora de cortes guardados en MySQL.</p>
      </div>

      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-5 py-3.5">Fecha y hora</th>
            <th scope="col" class="px-5 py-3.5">Responsable</th>
            <th scope="col" class="px-5 py-3.5">Fondo</th>
            <th scope="col" class="px-5 py-3.5">Ventas Efec.</th>
            <th scope="col" class="px-5 py-3.5">Digital</th>
            <th scope="col" class="px-5 py-3.5">Esperado</th>
            <th scope="col" class="px-5 py-3.5">Contado</th>
            <th scope="col" class="px-5 py-3.5">Diferencia</th>
            <th scope="col" class="px-5 py-3.5 text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngIf="history().length === 0">
            <td colspan="9" class="px-6 py-8 text-center text-slate-400">
              Aún no se ha registrado ningún cierre de caja.
            </td>
          </tr>
          <tr *ngFor="let c of history()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-5 py-4 font-semibold text-[#011640] whitespace-nowrap">{{ c.fecha }}</td>
            <td class="px-5 py-4 text-xs">
              <strong class="block text-[#011640]">{{ c.responsable }}</strong>
              <span *ngIf="c.observaciones" class="text-slate-400">{{ c.observaciones }}</span>
            </td>
            <td class="px-5 py-4 text-xs">{{ c.fondo_inicial | currencyMxn }}</td>
            <td class="px-5 py-4 text-xs font-semibold text-[#011640]">{{ c.ventas_efectivo | currencyMxn }}</td>
            <td class="px-5 py-4 text-xs">{{ (c.ventas_tarjeta + c.ventas_transferencia) | currencyMxn }}</td>
            <td class="px-5 py-4 text-xs font-semibold">{{ c.efectivo_esperado | currencyMxn }}</td>
            <td class="px-5 py-4 text-xs font-bold text-[#011640]">{{ c.efectivo_contado | currencyMxn }}</td>
            <td class="px-5 py-4">
              <span *ngIf="c.diferencia === 0"
                    class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Cuadrado
              </span>
              <span *ngIf="c.diferencia > 0"
                    class="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                +{{ c.diferencia | currencyMxn }}
              </span>
              <span *ngIf="c.diferencia < 0"
                    class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                −{{ Math.abs(c.diferencia) | currencyMxn }}
              </span>
            </td>
            <td class="px-5 py-4 text-right">
              <button type="button"
                      (click)="remove(c)"
                      class="px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  `
})
export class CashRegisterComponent implements OnInit {
  private cashService = inject(CashRegisterService);
  private auth = inject(AuthService);
  protected Math = Math;

  private getTodayLocal(): string {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
  }

  selectedDate = this.getTodayLocal();
  summary = signal<CashDaySummary | null>(null);
  history = signal<CashClosureItem[]>([]);

  fondoInicial = signal<number>(500);
  efectivoContado = signal<number>(500);
  observaciones = '';

  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  efectivoEsperado = computed(() => {
    const ventasEfec = Number(this.summary()?.ventas_efectivo || 0);
    const egresosEfec = Number(this.summary()?.egresos_efectivo || 0);
    return Math.round((Number(this.fondoInicial() || 0) + ventasEfec - egresosEfec) * 100) / 100;
  });

  diferencia = computed(() => {
    return Math.round((Number(this.efectivoContado() || 0) - this.efectivoEsperado()) * 100) / 100;
  });

  absDiff = computed(() => Math.abs(this.diferencia()));

  ngOnInit() {
    this.loadSummary(true);
    this.loadHistory();
  }

  loadSummary(autoFillCounted = false) {
    this.cashService.getSummary(this.selectedDate).subscribe((res) => {
      this.summary.set(res);
      if (autoFillCounted) {
        const esperado =
          Number(this.fondoInicial() || 0) +
          Number(res.ventas_efectivo || 0) -
          Number(res.egresos_efectivo || 0);
        this.efectivoContado.set(Math.round(esperado * 100) / 100);
      }
    });
  }

  loadHistory() {
    this.cashService.getHistory().subscribe((list) => this.history.set(list));
  }

  saveClosure() {
    if (this.saving()) return;
    this.successMsg.set('');
    this.errorMsg.set('');
    this.saving.set(true);

    const user = this.auth.currentUser();
    this.cashService.createClosure({
      fecha: this.selectedDate,
      fondo_inicial: Number(this.fondoInicial() || 0),
      efectivo_contado: Number(this.efectivoContado() || 0),
      observaciones: this.observaciones,
      responsable: user?.nombre || 'Administrador',
      usuario_id: user?.id,
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.observaciones = '';
        this.successMsg.set('Cierre de caja guardado correctamente.');
        this.loadSummary(false);
        this.loadHistory();
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.error || 'No se pudo guardar el cierre de caja.');
      },
    });
  }

  remove(item: CashClosureItem) {
    if (!confirm(`¿Eliminar el cierre del ${item.fecha}?`)) return;
    this.cashService.deleteClosure(item.id).subscribe(() => {
      this.loadSummary(false);
      this.loadHistory();
    });
  }
}