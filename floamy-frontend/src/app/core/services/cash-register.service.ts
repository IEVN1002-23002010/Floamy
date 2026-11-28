import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

export interface CashDaySummary {
  fecha: string;
  pedidos_count: number;
  ventas_efectivo: number;
  ventas_tarjeta: number;
  ventas_transferencia: number;
  total_ventas: number;
  egresos_proveedores: number;
  egresos_efectivo: number;
  saldo_disponible: number;
  cortes_hoy: number;
}

export interface CashClosureItem {
  id: number;
  fecha: string;
  responsable: string;
  fondo_inicial: number;
  ventas_efectivo: number;
  ventas_tarjeta: number;
  ventas_transferencia: number;
  total_ventas: number;
  pedidos_count: number;
  efectivo_esperado: number;
  efectivo_contado: number;
  diferencia: number;
  observaciones?: string;
}

@Injectable({ providedIn: 'root' })
export class CashRegisterService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/cash-register`;

  getSummary(fecha?: string) {
    const query = fecha ? `?fecha=${fecha}` : '';
    return this.http.get<CashDaySummary>(`${this.url}/summary${query}`);
  }

  getHistory() {
    return this.http.get<CashClosureItem[]>(`${this.url}/`);
  }

  createClosure(payload: {
    fecha: string;
    fondo_inicial: number;
    efectivo_contado: number;
    observaciones: string;
    responsable: string;
    usuario_id?: number;
  }) {
    return this.http.post(`${this.url}/`, payload);
  }

  deleteClosure(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}