import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { IngredientItem, MovementItem } from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private http = inject(HttpClient);
  private invUrl = `${environment.apiUrl}/inventory`;
  private movUrl = `${environment.apiUrl}/movements`;

  getIngredients() {
    return this.http.get<IngredientItem[]>(`${this.invUrl}/`);
  }

  addIngredient(item: any) {
    return this.http.post(`${this.invUrl}/`, item);
  }

  updateIngredient(id: number, item: any) {
    return this.http.put(`${this.invUrl}/${id}`, item);
  }

  adjustIngredient(id: number, delta: number) {
    return this.http.patch(`${this.invUrl}/${id}/adjust`, { delta });
  }

  deleteIngredient(id: number) {
    return this.http.delete(`${this.invUrl}/${id}`);
  }

  getMovements() {
    return this.http.get<MovementItem[]>(`${this.movUrl}/`);
  }

  registerMovement(payload: { ingredienteId: number; tipo: string; cantidad: number; usuarioId?: number }) {
    return this.http.post(`${this.movUrl}/`, payload);
  }

  updateMovement(id: number, data: any) {
    return this.http.put(`${this.movUrl}/${id}`, data);
  }

  deleteMovement(id: number) {
    return this.http.delete(`${this.movUrl}/${id}`);
  }
}