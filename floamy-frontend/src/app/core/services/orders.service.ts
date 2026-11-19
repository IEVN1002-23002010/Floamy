import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { OrderItem } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/orders`;

  getOrders() {
    return this.http.get<OrderItem[]>(`${this.baseUrl}/`);
  }

  createOrder(payload: any) {
    return this.http.post<{ folio: string; paymentFolio: string; total: number }>(`${this.baseUrl}/`, payload);
  }

  updateStage(dbId: number, stage: number) {
    return this.http.patch(`${this.baseUrl}/${dbId}/stage`, { stage });
  }
}