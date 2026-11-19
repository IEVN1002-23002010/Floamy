import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { PresentationOption, ToppingOption } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CatalogOptionsService {
  private http = inject(HttpClient);
  private presUrl = `${environment.apiUrl}/presentations`;
  private topUrl = `${environment.apiUrl}/toppings`;

  presentations = signal<PresentationOption[]>([]);
  toppings = signal<ToppingOption[]>([]);

  constructor() {
    this.loadPresentations().subscribe();
    this.loadToppings().subscribe();
  }

  loadPresentations() {
    return this.http.get<PresentationOption[]>(`${this.presUrl}/`).pipe(
      tap((list) => this.presentations.set(list))
    );
  }

  createPresentation(payload: { nombre: string; precio: number; stockInicial?: number }) {
    return this.http.post(`${this.presUrl}/`, payload).pipe(
      tap(() => this.loadPresentations().subscribe())
    );
  }

  updatePresentation(id: number, payload: { nombre: string; precio: number }) {
    return this.http.put(`${this.presUrl}/${id}`, payload).pipe(
      tap(() => this.loadPresentations().subscribe())
    );
  }

  deletePresentation(id: number) {
    return this.http.delete(`${this.presUrl}/${id}`).pipe(
      tap(() => this.loadPresentations().subscribe())
    );
  }

  loadToppings() {
    return this.http.get<ToppingOption[]>(`${this.topUrl}/`).pipe(
      tap((list) => this.toppings.set(list))
    );
  }

  createTopping(payload: Partial<ToppingOption>) {
    return this.http.post(`${this.topUrl}/`, payload).pipe(
      tap(() => this.loadToppings().subscribe())
    );
  }

  updateTopping(id: number, payload: Partial<ToppingOption>) {
    return this.http.put(`${this.topUrl}/${id}`, payload).pipe(
      tap(() => this.loadToppings().subscribe())
    );
  }

  adjustToppingStock(id: number, delta: number) {
    return this.http.patch(`${this.topUrl}/${id}/stock`, { delta }).pipe(
      tap(() => this.loadToppings().subscribe())
    );
  }

  deleteTopping(id: number) {
    return this.http.delete(`${this.topUrl}/${id}`).pipe(
      tap(() => this.loadToppings().subscribe())
    );
  }
}