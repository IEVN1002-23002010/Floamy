import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ProductItem } from '../models/product.model';

export interface ProductPayload extends ProductItem {
  imageFile?: File | null;
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/products`;

  products = signal<ProductItem[]>([]);

  constructor() {
    this.loadProducts().subscribe();
  }

  private buildProductFormData(item: ProductPayload): FormData {
    const fd = new FormData();
    fd.append('name', item.name);
    fd.append('flavor', item.flavor);
    fd.append('tone', item.tone || 'vanilla');
    fd.append('stockCup', String(item.stockCup ?? 10));
    fd.append('stockLiter', String(item.stockLiter ?? 5));

    if (item.presentations) {
      fd.append('presentations', JSON.stringify(item.presentations));
    }

    if (item.imageFile) {
      fd.append('image_file', item.imageFile);
    } else {
      fd.append('image', item.image || '');
    }

    return fd;
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

  createProduct(item: ProductPayload) {
    const body = this.buildProductFormData(item);
    return this.http.post(`${this.baseUrl}/`, body).pipe(tap(() => this.loadProducts().subscribe()));
  }

  updateProduct(id: number, item: ProductPayload) {
    const body = this.buildProductFormData(item);
    return this.http.put(`${this.baseUrl}/${id}`, body).pipe(tap(() => this.loadProducts().subscribe()));
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