import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private dashUrl = `${environment.apiUrl}/dashboard`;
  private revUrl = `${environment.apiUrl}/reviews`;

  getSummary() {
    return this.http.get<any>(`${this.dashUrl}/summary`);
  }

  updateSalesGoal(objetivo: number, periodo = 'Noviembre 2026') {
    return this.http.put(`${this.dashUrl}/goal`, { objetivo, periodo });
  }

  createAdCampaign(data: {
    campana: string;
    canal: string;
    monto_invertido: number;
    ingresos_generados: number;
  }) {
    return this.http.post(`${this.dashUrl}/ads`, data);
  }

  deleteAdCampaign(id: number) {
    return this.http.delete(`${this.dashUrl}/ads/${id}`);
  }

  getReviews() {
    return this.http.get<any[]>(`${this.revUrl}/`);
  }

  createReview(data: { cliente_nombre: string; calificacion: number; comentario: string }) {
    return this.http.post(`${this.revUrl}/`, data);
  }

  replyReview(id: number, respuesta: string) {
    return this.http.patch(`${this.revUrl}/${id}/reply`, { respuesta });
  }

  deleteReview(id: number) {
    return this.http.delete(`${this.revUrl}/${id}`);
  }
}