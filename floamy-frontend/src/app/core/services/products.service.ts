import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ProductItem } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/products`;

  products = signal<ProductItem[]>([]);

  constructor() {
    this.loadProducts().subscribe();
  }

  loadProducts() {
    return this.http.get<ProductItem[]>(`${this.baseUrl}/`).pipe(
      tap((list) => this.products.set(Array.isArray(list) ? list : [])),
      catchError((err) => {
        console.error('Error al cargar productos:', err);
        return of([]);
      })
    );
  }

  createProduct(item: ProductItem) {
    return this.http.post(`${this.baseUrl}/`, item).pipe(tap(() => this.loadProducts().subscribe()));
  }

  updateProduct(id: number, item: ProductItem) {
    return this.http.put(`${this.baseUrl}/${id}`, item).pipe(tap(() => this.loadProducts().subscribe()));
  }

  adjustStock(productId: number, delta: number) {
    return this.http.patch(`${this.baseUrl}/stock/${productId}`, { delta }).pipe(
      tap(() => this.loadProducts().subscribe())
    );
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`).pipe(tap(() => this.loadProducts().subscribe()));
  }
}