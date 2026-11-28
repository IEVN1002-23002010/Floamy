import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, CurrencyMxnPipe],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <app-page-title
        eyebrow="MERCADOTECNIA Y CRECIMIENTO"
        title="Campañas y meta comercial"
        subtitle="Configura el objetivo mensual de ventas y mide el retorno de inversión (ROI) por campaña." />
    </div>

    <!-- Fila superior: Meta de ventas + Resumen ROI -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 items-stretch">
      <!-- Configurar meta comercial -->
      <div class="lg:col-span-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
        <div>
          <span class="eyebrow">OBJETIVO MENSUAL</span>
          <h2 class="text-base font-bold text-[#011640] mt-0.5">Meta comercial de ventas</h2>
          <p class="text-xs text-slate-500 mt-0.5">Define el periodo y el monto objetivo que se refleja en el Resumen.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Periodo</label>
            <input type="text"
                   [(ngModel)]="goalPeriodo"
                   placeholder="Ej. Noviembre 2026"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm font-semibold rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full px-3 py-2.5" />
          </div>
          <div>
            <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Meta de ventas (MXN)</label>
            <input type="number"
                   min="100"
                   step="500"
                   [(ngModel)]="goalAmount"
                   placeholder="18000"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm font-bold rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full px-3 py-2.5" />
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-[#f7f3e9] space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-600">Avance actual ({{ metaVentas().periodo }}):</span>
            <strong class="text-[#011640]">{{ metaVentas().actual | currencyMxn }} / {{ metaVentas().objetivo | currencyMxn }} ({{ metaVentas().porcentaje_real }}%)</strong>
          </div>
          <div class="w-full bg-white rounded-full h-3 overflow-hidden border border-slate-200">
            <div class="h-full rounded-full transition-all duration-500"
                 [style.width.%]="metaVentas().porcentaje"
                 [style.background]="metaVentas().porcentaje_real >= 100 ? '#10b981' : 'linear-gradient(90deg, #011640 0%, #6DA0BF 100%)'"></div>
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <span *ngIf="goalMsg()" class="text-xs font-semibold text-emerald-700">{{ goalMsg() }}</span>
          <span *ngIf="!goalMsg()"></span>
          <button type="button"
                  [disabled]="savingGoal()"
                  (click)="saveGoal()"
                  class="px-4 py-2.5 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl disabled:opacity-50 transition">
            {{ savingGoal() ? 'Guardando...' : 'Actualizar meta ✓' }}
          </button>
        </div>
      </div>

      <!-- Resumen consolidado de publicidad -->
      <div class="lg:col-span-6 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
        <div>
          <span class="eyebrow">BALANCE PUBLICITARIO</span>
          <h2 class="text-base font-bold text-[#011640] mt-0.5">Rendimiento global de campañas</h2>
          <p class="text-xs text-slate-500 mt-0.5">Fórmula aplicada: ROI = ((Ingresos atribuidos − Inversión) / Inversión) × 100</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Inversión total</span>
            <strong class="text-lg font-extrabold text-rose-700 mt-1 block">{{ publicidad().inversion_total | currencyMxn }}</strong>
            <small class="text-[11px] text-slate-500">Gasto en anuncios</small>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Ingresos atribuidos</span>
            <strong class="text-lg font-extrabold text-[#011640] mt-1 block">{{ publicidad().ingresos_atribuidos | currencyMxn }}</strong>
            <small class="text-[11px] text-slate-500">Ventas por campaña</small>
          </div>

          <div class="p-4 rounded-2xl border"
               [class]="publicidad().roi >= 0 ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' : 'bg-red-50/80 border-red-200 text-red-900'">
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-75 block">ROI / ROAS</span>
            <strong class="text-lg font-extrabold mt-1 block">{{ publicidad().roi }}%</strong>
            <small class="text-[11px] opacity-80">Retorno {{ publicidad().roas }}x</small>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-[#dff0f7]/60 border border-[#6da0bf]/25 text-xs text-[#011640]">
          <strong>Nota contable:</strong> Los ingresos atribuidos identifican qué parte de tus pedidos provienen de promociones, sin duplicar las ventas totales ni alterar el corte de caja físico.
        </div>
      </div>
    </section>

    <!-- Alta de campaña publicitaria -->
    <section class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm mb-6">
      <h2 class="text-base font-bold text-[#011640] mb-1">Registrar nueva campaña</h2>
      <p class="text-xs text-slate-500 mb-4">Captura el presupuesto invertido y las ventas generadas para calcular su rentabilidad.</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <div class="lg:col-span-4">
          <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Nombre de la campaña</label>
          <input [(ngModel)]="newAd.campana"
                 placeholder="Ej. Promo 2x1 Conos Jueves"
                 class="bg-slate-50 border border-slate-300 text-xs text-[#011640] rounded-xl px-3 py-2.5 w-full" />
        </div>

        <div class="lg:col-span-3">
          <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Canal de difusión</label>
          <select [(ngModel)]="newAd.canal"
                  class="bg-slate-50 border border-slate-300 text-xs text-[#011640] rounded-xl px-3 py-2.5 w-full">
            <option value="Instagram Ads">Instagram Ads</option>
            <option value="Facebook Ads">Facebook Ads</option>
            <option value="TikTok Ads">TikTok Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Impreso / Local">Impreso / Local</option>
          </select>
        </div>

        <div class="lg:col-span-2">
          <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Inversión (MXN)</label>
          <input type="number"
                 min="1"
                 [(ngModel)]="newAd.monto_invertido"
                 placeholder="500"
                 class="bg-slate-50 border border-slate-300 text-xs font-bold text-[#011640] rounded-xl px-3 py-2.5 w-full" />
        </div>

        <div class="lg:col-span-2">
          <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Ingresos (MXN)</label>
          <input type="number"
                 min="0"
                 [(ngModel)]="newAd.ingresos_generados"
                 placeholder="1800"
                 class="bg-slate-50 border border-slate-300 text-xs font-bold text-[#011640] rounded-xl px-3 py-2.5 w-full" />
        </div>

        <div class="lg:col-span-1">
          <button type="button"
                  [disabled]="savingAd()"
                  (click)="addCampaign()"
                  class="w-full px-3 py-2.5 text-xs font-semibold text-white bg-[#011640] hover:bg-[#0b234a] rounded-xl disabled:opacity-50 transition">
            + Crear
          </button>
        </div>
      </div>

      <div *ngIf="adError()" class="mt-3 p-2.5 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-xl">
        {{ adError() }}
      </div>
    </section>

    <!-- Tabla de campañas activas -->
    <section class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <div class="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-[#011640]">Historial de campañas publicitarias</h2>
          <p class="text-xs text-slate-500 mt-0.5">{{ publicidad().campanas.length }} campañas registradas en MySQL.</p>
        </div>
      </div>

      <table class="w-full text-xs text-left text-slate-600">
        <thead class="text-[11px] text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-5 py-3.5">Campaña</th>
            <th class="px-5 py-3.5">Canal</th>
            <th class="px-5 py-3.5">Fecha</th>
            <th class="px-5 py-3.5">Inversión</th>
            <th class="px-5 py-3.5">Ingresos generados</th>
            <th class="px-5 py-3.5">ROI (%)</th>
            <th class="px-5 py-3.5 text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngIf="publicidad().campanas.length === 0">
            <td colspan="7" class="px-6 py-8 text-center text-slate-400">
              Aún no hay campañas publicitarias registradas.
            </td>
          </tr>
          <tr *ngFor="let c of publicidad().campanas" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-5 py-4 font-bold text-[#011640]">{{ c.campana }}</td>
            <td class="px-5 py-4">
              <span class="bg-[#dff0f7] text-[#011640] font-semibold px-2.5 py-0.5 rounded-full">{{ c.canal }}</span>
            </td>
            <td class="px-5 py-4 text-slate-500 whitespace-nowrap">{{ c.fecha_inicio }}</td>
            <td class="px-5 py-4 font-semibold text-rose-700">{{ c.monto_invertido | currencyMxn }}</td>
            <td class="px-5 py-4 font-semibold text-[#011640]">{{ c.ingresos_generados | currencyMxn }}</td>
            <td class="px-5 py-4">
              <span class="font-extrabold px-2.5 py-0.5 rounded-full"
                    [class]="c.roi >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'">
                {{ c.roi >= 0 ? '+' : '' }}{{ c.roi }}%
              </span>
            </td>
            <td class="px-5 py-4 text-right">
              <button type="button"
                      (click)="removeCampaign(c.id)"
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
export class MarketingComponent implements OnInit {
  private dashService = inject(DashboardService);

  summary = signal<any>(null);
  goalPeriodo = 'Noviembre 2026';
  goalAmount = 18000;
  savingGoal = signal(false);
  goalMsg = signal('');

  savingAd = signal(false);
  adError = signal('');
  newAd = {
    campana: '',
    canal: 'Instagram Ads',
    monto_invertido: null as number | null,
    ingresos_generados: null as number | null
  };

  metaVentas = computed(() => {
    return (
      this.summary()?.marketing?.meta_ventas || {
        periodo: 'Noviembre 2026',
        objetivo: 18000,
        actual: 0,
        restante: 18000,
        porcentaje: 0,
        porcentaje_real: 0
      }
    );
  });

  publicidad = computed(() => {
    return (
      this.summary()?.marketing?.publicidad || {
        inversion_total: 0,
        ingresos_atribuidos: 0,
        roi: 0,
        roas: 0,
        campanas: []
      }
    );
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.dashService.getSummary().subscribe((data) => {
      this.summary.set(data);
      const meta = data?.marketing?.meta_ventas;
      if (meta) {
        this.goalPeriodo = meta.periodo || 'Noviembre 2026';
        this.goalAmount = Number(meta.objetivo || 18000);
      }
    });
  }

  saveGoal() {
    if (!this.goalAmount || this.goalAmount <= 0 || this.savingGoal()) return;
    this.savingGoal.set(true);
    this.goalMsg.set('');

    this.dashService.updateSalesGoal(Number(this.goalAmount), this.goalPeriodo.trim() || 'Noviembre 2026').subscribe({
      next: () => {
        this.savingGoal.set(false);
        this.goalMsg.set('Meta actualizada correctamente.');
        this.loadData();
      },
      error: () => {
        this.savingGoal.set(false);
      }
    });
  }

  addCampaign() {
    this.adError.set('');
    if (!this.newAd.campana.trim() || !this.newAd.monto_invertido || Number(this.newAd.monto_invertido) <= 0) {
      this.adError.set('Ingresa el nombre de la campaña y una inversión mayor a $0.');
      return;
    }

    this.savingAd.set(true);
    this.dashService.createAdCampaign({
      campana: this.newAd.campana.trim(),
      canal: this.newAd.canal,
      monto_invertido: Number(this.newAd.monto_invertido),
      ingresos_generados: Number(this.newAd.ingresos_generados || 0)
    }).subscribe({
      next: () => {
        this.savingAd.set(false);
        this.newAd = { campana: '', canal: 'Instagram Ads', monto_invertido: null, ingresos_generados: null };
        this.loadData();
      },
      error: (err) => {
        this.savingAd.set(false);
        this.adError.set(err?.error?.error || 'No se pudo guardar la campaña.');
      }
    });
  }

  removeCampaign(id: number) {
    if (!confirm('¿Eliminar esta campaña publicitaria?')) return;
    this.dashService.deleteAdCampaign(id).subscribe(() => this.loadData());
  }
}