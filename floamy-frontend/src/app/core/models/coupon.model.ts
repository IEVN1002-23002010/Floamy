export interface CouponOffer {
  codigo: string;
  tipo: 'porcentaje' | 'pesos';
  valor: number;
}

export interface Coupon extends CouponOffer {
  id?: number;
  nombre: string;
  limite: number;
  usados: number;
  activo: boolean;
}
