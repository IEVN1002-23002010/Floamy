import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { PresentationOption, ToppingOption } from '../models/product.model';

export interface PresentationPayload {
  nombre: string;
  precio: number;
  stockInicial?: number;
  imagen_url?: string | null;
  imagen_file?: File | null;
}

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

  private buildPresentationFormData(payload: PresentationPayload): FormData {
    const fd = new FormData();
    fd.append('nombre', payload.nombre);
    fd.append('precio', String(payload.precio));
    if (payload.stockInicial !== undefined) {
      fd.append('stockInicial', String(payload.stockInicial));
    }
    if (payload.imagen_file) {
      fd.append('imagen_file', payload.imagen_file);
    } else {
      fd.append('imagen_url', payload.imagen_url || '');
    }
    return fd;
  }

  loadPresentations() {
    return this.http.get<PresentationOption[]>(`${this.presUrl}/`).pipe(
      tap((list) => this.presentations.set(list))
    );
  }

  createPresentation(payload: PresentationPayload) {
    const body = this.buildPresentationFormData(payload);
    return this.http.post(`${this.presUrl}/`, body).pipe(
      tap(() => this.loadPresentations().subscribe())
    );
  }

  updatePresentation(id: number, payload: PresentationPayload) {
    const body = this.buildPresentationFormData(payload);
    return this.http.put(`${this.presUrl}/${id}`, body).pipe(
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