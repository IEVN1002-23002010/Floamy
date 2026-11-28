export interface DashboardKpis {
  ventas: number;
  pedidos: number;
  ticket: number;
  recurrentes: number;
  unidades: number;
  resenas: number;
}

export interface MetaVentas {
  periodo: string;
  objetivo: number;
  actual: number;
  restante: number;
  porcentaje: number;
  porcentaje_real: number;
}

export interface PublicidadMetrics {
  inversion_total: number;
  ingresos_atribuidos: number;
  roi: number;
  roas: number;
  campanas: any[];
}

export interface ConversionMetrics {
  visitas: number;
  compras: number;
  tasa: number;
  visitas_pwa: number;
  visitas_sucursal: number;
}

export interface DemografiaItem {
  label: string;
  count: number;
  pct: number;
  color: string;
}

export interface DemografiaMetrics {
  total_clientes_perfilados: number;
  rangos_edad: DemografiaItem[];
  generos: DemografiaItem[];
}

export interface DashboardMarketing {
  meta_ventas: MetaVentas;
  publicidad: PublicidadMetrics;
  conversion: ConversionMetrics;
  demografia: DemografiaMetrics;
}

export interface EvolucionVentaPoint {
  dia: string;
  total: number;
}

export interface SaborChartItem {
  name: string;
  value: number;
  color: string;
}

export interface PresentacionChartItem {
  name: string;
  value: number;
  cantidad: number;
  color: string;
}

export interface EstadosPedidos {
  entregados: number;
  preparacion: number;
  listos: number;
  pendientes: number;
  total: number;
}

export interface AlertaInventario {
  id?: number;
  nombre: string;
  stock_actual: number;
  unidad: string;
  stock_minimo: number;
}

export interface DashboardSummary {
  kpis: DashboardKpis;
  marketing: DashboardMarketing;
  evolucion_ventas: EvolucionVentaPoint[];
  sabores: SaborChartItem[];
  presentaciones: PresentacionChartItem[];
  estados_pedidos: EstadosPedidos;
  alertas: AlertaInventario[];
}