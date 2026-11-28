import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';
import {
  DashboardSummary,
  SaborChartItem,
  PresentacionChartItem,
  EvolucionVentaPoint
} from '../../../core/models/dashboard.model';

interface ChartPoint extends EvolucionVentaPoint {
  x: number;
  y: number;
  xPct: number;
  yPct: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, CurrencyMxnPipe],
  styles: [`
    .sales-chart-wrap {
      display: grid;
      grid-template-columns: 44px 1fr;
      gap: 10px;
      align-items: stretch;
    }
    .y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 11px;
      color: var(--muted);
      height: 190px;
      text-align: right;
    }
    .svg-box svg {
      width: 100%;
      height: 190px;
      display: block;
    }
    .x-axis {
      display: flex;
      justify-content: space-between;
      padding: 8px 4px 0;
      font-size: 11px;
      color: var(--muted);
    }
  `],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <span class="eyebrow">RESUMEN EJECUTIVO</span>
        <h1 class="text-2xl sm:text-3xl font-bold text-[#011640] mt-0.5">Todo fluye, Andrea</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Métricas operativas y comerciales conectadas en tiempo real con MySQL.</p>
      </div>
      <div class="flex items-center gap-2.5">
        <a routerLink="/admin/marketing"
           class="px-3.5 py-1.5 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition"
           style="text-decoration:none;">
          Campañas y ROI ({{ publicidad().roi }}%) →
        </a>
        <span class="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Sincronizado en vivo
        </span>
      </div>
    </div>

    <!-- Fila 1: 6 KPIs principales -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-5">
      <div class="p-5 rounded-2xl bg-[#011640] text-white border border-[#011640] shadow-sm flex flex-col justify-between gap-2">
        <div class="flex items-center justify-between">
          <span class="bg-white/15 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">↗ Activo</span>
        </div>
        <span class="text-[11px] font-bold tracking-wider text-[#aac8e0] uppercase mt-1">Ventas totales</span>
        <strong class="text-2xl font-bold tracking-tight">{{ summary()?.kpis?.ventas | currencyMxn }}</strong>
        <small class="text-xs text-slate-300">Ingresos acumulados</small>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-2">
        <div class="flex items-center justify-between">
          <span class="bg-[#dff0f7] text-[#011640] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">↗ Total</span>
        </div>
        <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-1">Pedidos</span>
        <strong class="text-2xl font-bold text-[#011640]">{{ summary()?.kpis?.pedidos || 0 }}</strong>
        <small class="text-xs text-slate-500">Registrados en sistema</small>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-2">
        <div class="flex items-center justify-between">
          <span class="bg-[#dff0f7] text-[#011640] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Meta $100</span>
        </div>
        <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-1">Ticket promedio</span>
        <strong class="text-2xl font-bold text-[#011640]">{{ summary()?.kpis?.ticket | currencyMxn }}</strong>
        <small class="text-xs text-slate-500">Por pedido</small>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-2">
        <div class="flex items-center justify-between">
          <span class="bg-[#dff0f7] text-[#011640] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">2+ compras</span>
        </div>
        <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-1">Recurrentes</span>
        <strong class="text-2xl font-bold text-[#011640]">{{ summary()?.kpis?.recurrentes || 0 }}</strong>
        <small class="text-xs text-slate-500">Clientes frecuentes</small>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-2">
        <div class="flex items-center justify-between">
          <span class="bg-[#dff0f7] text-[#011640] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">Unidades</span>
        </div>
        <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-1">Productos vendidos</span>
        <strong class="text-2xl font-bold text-[#011640]">{{ summary()?.kpis?.unidades || 0 }}</strong>
        <small class="text-xs text-slate-500">Unidades desplazadas</small>
      </div>

      <div class="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between gap-2">
        <div class="flex items-center justify-between">
          <span class="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">★★★★★</span>
        </div>
        <span class="text-[11px] font-bold tracking-wider text-slate-400 uppercase mt-1">Reseñas</span>
        <strong class="text-2xl font-bold text-[#011640]">{{ summary()?.kpis?.resenas || 0 }}</strong>
        <small class="text-xs text-slate-500">Satisfacción cliente</small>
      </div>
    </section>

    <!-- Fila 2: Meta comercial + Tasa de conversión -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-stretch">
      <div class="lg:col-span-7 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span class="eyebrow">META COMERCIAL • {{ metaVentas().periodo }}</span>
            <h2 class="text-base font-bold text-[#011640] mt-0.5">Avance contra meta de ventas</h2>
            <p class="text-xs text-slate-500 mt-0.5">Comparativa en tiempo real entre ingresos acumulados y objetivo mensual.</p>
          </div>
          <a routerLink="/admin/marketing"
             class="px-3 py-1.5 text-xs font-semibold text-[#011640] bg-[#e8f2f8] hover:bg-[#d7e8f3] rounded-xl transition"
             style="text-decoration:none;">
            Configurar meta →
          </a>
        </div>

        <div>
          <div class="flex items-end justify-between mb-2">
            <div>
              <strong class="text-2xl font-extrabold text-[#011640]">{{ metaVentas().actual | currencyMxn }}</strong>
              <span class="text-xs text-slate-500 ml-1.5">de {{ metaVentas().objetivo | currencyMxn }}</span>
            </div>
            <span class="text-xs font-extrabold px-2.5 py-1 rounded-full"
                  [class]="metaVentas().porcentaje_real >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-[#dff0f7] text-[#011640]'">
              {{ metaVentas().porcentaje_real }}% completado
            </span>
          </div>

          <div class="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/70">
            <div class="h-full rounded-full transition-all duration-700"
                 [style.width.%]="metaVentas().porcentaje"
                 [style.background]="metaVentas().porcentaje_real >= 100 ? '#10b981' : 'linear-gradient(90deg, #011640 0%, #6DA0BF 100%)'"></div>
          </div>

          <div class="flex justify-between text-xs text-slate-500 mt-2">
            <span>Inicio: $0.00</span>
            <span *ngIf="metaVentas().restante > 0">Faltan <strong class="text-[#011640]">{{ metaVentas().restante | currencyMxn }}</strong> para alcanzar la meta</span>
            <span *ngIf="metaVentas().restante <= 0" class="text-emerald-700 font-bold">¡Meta comercial superada!</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
        <div class="flex items-start justify-between">
          <div>
            <span class="eyebrow">EMBUDO DIGITAL</span>
            <h2 class="text-base font-bold text-[#011640] mt-0.5">Tasa de conversión</h2>
            <p class="text-xs text-slate-500 mt-0.5">De visitas en tienda a pedidos concretados.</p>
          </div>
          <span class="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
            {{ conversion().tasa }}%
          </span>
        </div>

        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="font-semibold text-slate-600">1. Visitas totales a tienda</span>
              <strong class="text-[#011640]">{{ conversion().visitas }} visitas</strong>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div class="h-2.5 rounded-full bg-[#6DA0BF]" style="width: 100%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="font-semibold text-slate-600">2. Pedidos confirmados</span>
              <strong class="text-[#011640]">{{ conversion().compras }} compras ({{ conversion().tasa }}%)</strong>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div class="h-2.5 rounded-full bg-[#011640] transition-all duration-500"
                   [style.width.%]="Math.min(100, conversion().tasa)"></div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div class="p-2.5 rounded-xl bg-slate-50">
            <span class="text-slate-400 block text-[11px]">Tráfico PWA Web</span>
            <strong class="text-[#011640] font-bold">{{ conversion().visitas_pwa }} sesiones</strong>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50">
            <span class="text-slate-400 block text-[11px]">Tráfico Sucursal / QR</span>
            <strong class="text-[#011640] font-bold">{{ conversion().visitas_sucursal }} sesiones</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Fila 3: Evolución de ventas + Ventas por sabor -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-stretch">
      <div class="lg:col-span-7 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-[#011640]">Evolución de ventas</h2>
            <p class="text-xs text-slate-500 mt-0.5">Ingresos diarios en MXN</p>
          </div>
          <a routerLink="/admin/pedidos"
             class="text-xs font-bold text-[#011640] hover:text-[#6da0bf] hover:underline transition">
            Ver reporte →
          </a>
        </div>

        <div class="sales-chart-wrap">
          <div class="y-axis">
            <span *ngFor="let label of salesChart().yLabels">{{ label }}</span>
          </div>
          <div class="svg-box">
            <div class="relative h-[190px] w-full">
              <div *ngIf="hoveredPoint() as hp"
                   [style.left.%]="hp.xPct"
                   [style.top.%]="hp.yPct < 22 ? hp.yPct + 8 : hp.yPct - 18"
                   class="pointer-events-none absolute -translate-x-1/2 z-10 px-2.5 py-1 text-xs font-bold text-white bg-[#011640] rounded-lg shadow-md whitespace-nowrap">
                {{ hp.dia }}: {{ hp.total | currencyMxn }}
              </div>

              <svg viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="floamySalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#6DA0BF" stop-opacity="0.32" />
                    <stop offset="100%" stop-color="#6DA0BF" stop-opacity="0.01" />
                  </linearGradient>
                </defs>

                <line *ngFor="let gy of salesChart().gridYs"
                      x1="0" [attr.y1]="gy" x2="600" [attr.y2]="gy"
                      stroke="#e6edf3" stroke-dasharray="3 3" stroke-width="1"
                      vector-effect="non-scaling-stroke" />

                <path [attr.d]="salesChart().areaPath" fill="url(#floamySalesGrad)" />
                <path [attr.d]="salesChart().linePath" fill="none" stroke="#6DA0BF" stroke-width="2.8"
                      stroke-linecap="round" vector-effect="non-scaling-stroke" />
              </svg>

              <button *ngFor="let pt of salesChart().points"
                      type="button"
                      (mouseenter)="hoveredPoint.set(pt)"
                      (mouseleave)="hoveredPoint.set(null)"
                      [style.left.%]="pt.xPct"
                      [style.top.%]="pt.yPct"
                      [class]="hoveredPoint()?.dia === pt.dia || salesChart().lastPoint?.dia === pt.dia
                        ? 'absolute -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#011640] border-2 border-white shadow-sm cursor-pointer transition-transform scale-110'
                        : 'absolute -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#011640] cursor-pointer hover:scale-125 transition-transform'">
              </button>
            </div>

            <div class="x-axis">
              <span *ngFor="let pt of salesChart().points">{{ pt.dia }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-[#011640]">Ventas por sabor</h2>
            <p class="text-xs text-slate-500 mt-0.5">Participación del periodo</p>
          </div>
        </div>

        <div class="flex-1 flex items-center justify-between gap-5 my-auto">
          <div class="donut shrink-0" [style.background]="donutGradient()">
            <div><strong>{{ summary()?.kpis?.pedidos || 0 }}</strong><span>pedidos</span></div>
          </div>
          <div class="legend flex-1 min-w-0">
            <div *ngFor="let f of flavors()">
              <i [style.background]="f.color"></i>
              <span class="truncate">{{ f.name }}</span>
              <strong>{{ f.value }}%</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Fila 4: Ventas por presentación + Estado de pedidos -->
    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-stretch">
      <div class="lg:col-span-7 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
        <div class="flex items-start justify-between mb-5">
          <div>
            <h2 class="text-base font-bold text-[#011640]">Ventas por presentación</h2>
            <p class="text-xs text-slate-500 mt-0.5">Participación por tamaño</p>
          </div>
        </div>

        <div class="flex flex-col gap-4 my-auto">
          <div *ngFor="let item of presentationsList()"
               class="grid grid-cols-[110px_1fr_46px] items-center gap-3.5">
            <span class="text-xs font-bold text-[#011640] truncate">{{ item.name }}</span>
            <div class="w-full bg-[#e8f2f8] rounded-full h-3 overflow-hidden">
              <div class="h-3 rounded-full transition-all duration-500"
                   [style.width.%]="item.value"
                   [style.background]="item.color"></div>
            </div>
            <span class="text-xs font-extrabold text-[#011640] text-right">{{ item.value }}%</span>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-[#011640]">Estado de pedidos</h2>
            <p class="text-xs text-slate-500 mt-0.5">Operación en tiempo real</p>
          </div>
          <a routerLink="/admin/pedidos"
             class="text-xs font-bold text-[#011640] hover:text-[#6da0bf] hover:underline transition">
            Ver todos →
          </a>
        </div>

        <div class="flex flex-col gap-3.5 my-auto">
          <div *ngFor="let st of orderStatusBars()">
            <div class="flex justify-between text-xs mb-1.5">
              <span class="font-semibold text-slate-500">{{ st.label }}</span>
              <strong class="font-extrabold text-[#011640]">{{ st.count }}</strong>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div class="h-2 rounded-full transition-all duration-500"
                   [style.width.%]="st.pct"
                   [style.background]="st.color"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Fila 5: Demografía de clientes -->
    <section class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm mb-5">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div>
          <span class="eyebrow">SEGMENTACIÓN DE CLIENTES</span>
          <h2 class="text-base font-bold text-[#011640] mt-0.5">Perfil demográfico</h2>
          <p class="text-xs text-slate-500 mt-0.5">Distribución por rango de edad y género de clientes registrados.</p>
        </div>
        <span class="bg-[#dff0f7] text-[#011640] text-xs font-bold px-3 py-1 rounded-full">
          {{ demografia().total_clientes_perfilados }} clientes perfilados
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        <div class="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-[#011640] mb-4">Por rango de edad</h3>
          <div class="space-y-3.5">
            <div *ngFor="let item of demografia().rangos_edad">
              <div class="flex justify-between text-xs mb-1">
                <span class="font-semibold text-slate-600">{{ item.label }}</span>
                <strong class="text-[#011640]">{{ item.count }} ({{ item.pct }}%)</strong>
              </div>
              <div class="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden">
                <div class="h-2.5 rounded-full transition-all duration-500"
                     [style.width.%]="item.pct"
                     [style.background]="item.color"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between">
          <h3 class="text-xs font-bold uppercase tracking-wider text-[#011640] mb-4">Por género</h3>
          <div class="space-y-3.5 my-auto">
            <div *ngFor="let item of demografia().generos">
              <div class="flex justify-between text-xs mb-1">
                <span class="font-semibold text-slate-600">{{ item.label }}</span>
                <strong class="text-[#011640]">{{ item.count }} ({{ item.pct }}%)</strong>
              </div>
              <div class="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden">
                <div class="h-2.5 rounded-full transition-all duration-500"
                     [style.width.%]="item.pct"
                     [style.background]="item.color"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Fila 6: Alertas de inventario -->
    <section class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div class="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 class="text-base font-bold text-[#011640]">Alertas de inventario</h2>
          <p class="text-xs text-slate-500 mt-0.5">{{ summary()?.alertas?.length || 0 }} insumos bajo mínimo</p>
        </div>
        <a routerLink="/admin/inventario"
           class="px-3.5 py-2 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
           style="text-decoration:none;">
          Gestionar →
        </a>
      </div>

      <div *ngIf="!summary()?.alertas?.length"
           role="alert"
           class="flex items-center gap-3 p-4 text-xs font-semibold text-emerald-800 rounded-xl bg-emerald-50 border border-emerald-200">
        Todos los insumos tienen stock suficiente por encima del mínimo.
      </div>

      <div class="flex flex-col gap-2.5">
        <div *ngFor="let a of summary()?.alertas"
             role="alert"
             class="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-red-50/80 border border-red-200">
          <div>
            <strong class="block text-sm font-bold text-[#011640]">{{ a.nombre }}</strong>
            <small class="text-xs text-slate-600">{{ a.stock_actual }} {{ a.unidad }} restantes (mín: {{ a.stock_minimo }})</small>
          </div>
          <span class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Atención
          </span>
        </div>
      </div>
    </section>
  `
})
export class DashboardComponent implements OnInit {
  private dashService = inject(DashboardService);
  protected Math = Math;

  summary = signal<DashboardSummary | null>(null);
  hoveredPoint = signal<ChartPoint | null>(null);

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

  conversion = computed(() => {
    return (
      this.summary()?.marketing?.conversion || {
        visitas: 0,
        compras: 0,
        tasa: 0,
        visitas_pwa: 0,
        visitas_sucursal: 0
      }
    );
  });

  demografia = computed(() => {
    return (
      this.summary()?.marketing?.demografia || {
        total_clientes_perfilados: 0,
        rangos_edad: [],
        generos: []
      }
    );
  });

  private defaultFlavors: SaborChartItem[] = [
    { name: 'Vainilla', value: 31, color: '#6DA0BF' },
    { name: 'Chocolate', value: 24, color: '#011640' },
    { name: 'Fresa', value: 19, color: '#AAC8E0' },
    { name: 'Mango', value: 15, color: '#E6B85C' },
    { name: 'Limón', value: 11, color: '#BFD79B' }
  ];

  flavors = computed<SaborChartItem[]>(() => {
    const list = this.summary()?.sabores;
    return Array.isArray(list) && list.length > 0 ? list : this.defaultFlavors;
  });

  donutGradient = computed(() => {
    const list = this.flavors();
    let acc = 0;
    const stops = list.map((f) => {
      const start = acc;
      acc += Number(f.value || 0);
      return `${f.color} ${start}% ${Math.min(100, acc)}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  presentationsList = computed<PresentacionChartItem[]>(() => {
    const list = this.summary()?.presentaciones;
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
    return [
      { name: 'Vaso 8 oz', value: 0, cantidad: 0, color: '#6DA0BF' },
      { name: 'Litro', value: 0, cantidad: 0, color: '#011640' },
      { name: 'Cono', value: 0, cantidad: 0, color: '#AAC8E0' }
    ];
  });

  orderStatusBars = computed(() => {
    const est = this.summary()?.estados_pedidos || { entregados: 0, preparacion: 0, listos: 0, pendientes: 0, total: 0 };
    const total = Number(est.total || 0);
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

    return [
      { label: 'Entregados', count: est.entregados || 0, pct: pct(est.entregados || 0), color: '#011640' },
      { label: 'En preparación', count: est.preparacion || 0, pct: pct(est.preparacion || 0), color: '#6DA0BF' },
      { label: 'Listos', count: est.listos || 0, pct: pct(est.listos || 0), color: '#AAC8E0' },
      { label: 'Pendientes', count: est.pendientes || 0, pct: pct(est.pendientes || 0), color: '#E6B85C' }
    ];
  });

  salesChart = computed(() => {
    const raw: EvolucionVentaPoint[] = this.summary()?.evolucion_ventas || [
      { dia: 'Lun', total: 0 },
      { dia: 'Mar', total: 0 },
      { dia: 'Mié', total: 0 },
      { dia: 'Jue', total: 0 },
      { dia: 'Vie', total: 0 },
      { dia: 'Sáb', total: 0 },
      { dia: 'Dom', total: 0 }
    ];

    const maxRaw = Math.max(...raw.map((d) => Number(d.total || 0)), 0);
    const yMax = maxRaw <= 0 ? 4000 : maxRaw <= 1000 ? 1000 : Math.ceil(maxRaw / 1000) * 1000;

    const fmtK = (v: number) => {
      if (v === 0) return '$0';
      if (v >= 1000) return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
      return `$${Math.round(v)}`;
    };

    const yLabels = [
      fmtK(yMax),
      fmtK(yMax * 0.75),
      fmtK(yMax * 0.5),
      fmtK(yMax * 0.25),
      '$0'
    ];

    const left = 12;
    const right = 588;
    const top = 16;
    const bottom = 184;
    const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(top + t * (bottom - top)));

    const points: ChartPoint[] = raw.map((d, i) => {
      const val = Number(d.total || 0);
      const x = left + (i * (right - left)) / Math.max(1, raw.length - 1);
      const y = bottom - (val / yMax) * (bottom - top);
      return {
        dia: d.dia,
        total: val,
        x,
        y,
        xPct: (x / 600) * 100,
        yPct: (y / 200) * 100
      };
    });

    let linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = Math.max(top, Math.min(bottom, p1.y + (p2.y - p0.y) / 6));
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = Math.max(top, Math.min(bottom, p2.y - (p3.y - p1.y) / 6));

      linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const lastIdx = points.length - 1;
    const areaPath = `${linePath} L ${points[lastIdx].x.toFixed(1)} ${bottom} L ${points[0].x.toFixed(1)} ${bottom} Z`;
    const lastActive = [...points].reverse().find((p) => p.total > 0) || points[lastIdx];

    return { yLabels, gridYs, points, linePath, areaPath, lastPoint: lastActive };
  });

  ngOnInit() {
    this.dashService.getSummary().subscribe((data: DashboardSummary) => this.summary.set(data));
  }
}