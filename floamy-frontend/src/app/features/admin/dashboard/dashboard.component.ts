import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, CurrencyMxnPipe],
  styles: [`
    .sales-chart-wrap {
      display: grid;
      grid-template-columns: 42px 1fr;
      gap: 8px;
      align-items: stretch;
    }
    .y-axis {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-size: 11px;
      color: var(--muted);
      padding: 6px 0 24px;
      text-align: right;
    }
    .svg-box svg {
      width: 100%;
      height: 195px;
      display: block;
      overflow: visible;
    }
    .x-axis {
      display: flex;
      justify-content: space-between;
      padding: 6px 6px 0;
      font-size: 11px;
      color: var(--muted);
    }
  `],
  template: `
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <span class="eyebrow">RESUMEN EJECUTIVO</span>
        <h1 class="text-2xl sm:text-3xl font-bold text-[#011640] mt-0.5">Todo fluye, Andrea</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Métricas conectadas en tiempo real con MySQL.</p>
      </div>
      <span class="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        Sincronizado en vivo
      </span>
    </div>

    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
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

    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
      <div class="lg:col-span-7 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
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
          <div class="svg-box relative">
            <div *ngIf="hoveredPoint() as hp"
                 [style.left.%]="(hp.x / 600) * 100"
                 [style.top.px]="hp.y < 38 ? hp.y + 12 : hp.y - 34"
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
                    x1="8" [attr.y1]="gy" x2="592" [attr.y2]="gy"
                    stroke="#e6edf3" stroke-dasharray="3 3" stroke-width="1" />

              <path [attr.d]="salesChart().areaPath" fill="url(#floamySalesGrad)" />
              <path [attr.d]="salesChart().linePath" fill="none" stroke="#6DA0BF" stroke-width="3" stroke-linecap="round" />

              <g *ngFor="let pt of salesChart().points"
                 (mouseenter)="hoveredPoint.set(pt)"
                 (mouseleave)="hoveredPoint.set(null)"
                 style="cursor: pointer;">
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="12" fill="transparent" />
                <circle [attr.cx]="pt.x"
                        [attr.cy]="pt.y"
                        [attr.r]="hoveredPoint()?.dia === pt.dia || salesChart().lastPoint?.dia === pt.dia ? 5.5 : 4.5"
                        [attr.fill]="hoveredPoint()?.dia === pt.dia || salesChart().lastPoint?.dia === pt.dia ? '#011640' : '#ffffff'"
                        [attr.stroke]="hoveredPoint()?.dia === pt.dia || salesChart().lastPoint?.dia === pt.dia ? '#ffffff' : '#011640'"
                        stroke-width="2.2">
                  <title>{{ pt.dia }}: {{ pt.total | currencyMxn }}</title>
                </circle>
              </g>
            </svg>

            <div class="x-axis">
              <span *ngFor="let pt of salesChart().points">{{ pt.dia }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-base font-bold text-[#011640]">Ventas por sabor</h2>
            <p class="text-xs text-slate-500 mt-0.5">Participación del periodo</p>
          </div>
        </div>
        <div class="donut-row">
          <div class="donut" [style.background]="donutGradient()">
            <div><strong>{{ summary()?.kpis?.pedidos || 0 }}</strong><span>pedidos</span></div>
          </div>
          <div class="legend">
            <div *ngFor="let f of flavors()">
              <i [style.background]="f.color"></i>
              <span>{{ f.name }}</span>
              <strong>{{ f.value }}%</strong>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
      <div class="lg:col-span-7 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div class="flex items-start justify-between mb-5">
          <div>
            <h2 class="text-base font-bold text-[#011640]">Ventas por presentación</h2>
            <p class="text-xs text-slate-500 mt-0.5">Participación por tamaño</p>
          </div>
        </div>

        <div class="flex flex-col gap-4 py-2">
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

      <div class="lg:col-span-5 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
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

        <div class="flex flex-col gap-3.5">
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

    <section class="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm">
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
  summary = signal<any>(null);
  hoveredPoint = signal<any>(null);

  private defaultFlavors = [
    { name: 'Vainilla', value: 31, color: '#6DA0BF' },
    { name: 'Chocolate', value: 24, color: '#011640' },
    { name: 'Fresa', value: 19, color: '#AAC8E0' },
    { name: 'Mango', value: 15, color: '#E6B85C' },
    { name: 'Limón', value: 11, color: '#BFD79B' }
  ];

  flavors = computed(() => {
    const list = this.summary()?.sabores;
    return Array.isArray(list) && list.length > 0 ? list : this.defaultFlavors;
  });

  donutGradient = computed(() => {
    const list = this.flavors();
    let acc = 0;
    const stops = list.map((f: any) => {
      const start = acc;
      acc += Number(f.value || 0);
      return `${f.color} ${start}% ${Math.min(100, acc)}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  presentationsList = computed(() => {
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
    const raw: Array<{ dia: string; total: number }> = this.summary()?.evolucion_ventas || [
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

    const left = 10;
    const right = 590;
    const top = 14;
    const bottom = 186;
    const gridYs = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(top + t * (bottom - top)));

    const points = raw.map((d, i) => {
      const val = Number(d.total || 0);
      const x = left + (i * (right - left)) / Math.max(1, raw.length - 1);
      const y = bottom - (val / yMax) * (bottom - top);
      return { dia: d.dia, total: val, x, y };
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
    this.dashService.getSummary().subscribe((data) => this.summary.set(data));
  }
}