import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

export interface SupplierItem {
  id?: number;
  nombre: string;
  contacto: string;
  telefono: string;
}

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/suppliers`;

  getSuppliers() {
    return this.http.get<SupplierItem[]>(`${this.url}/`);
  }

  createSupplier(data: SupplierItem) {
    return this.http.post(`${this.url}/`, data);
  }

  updateSupplier(id: number, data: SupplierItem) {
    return this.http.put(`${this.url}/${id}`, data);
  }

  deleteSupplier(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}