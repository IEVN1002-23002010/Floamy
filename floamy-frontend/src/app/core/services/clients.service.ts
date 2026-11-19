import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ClientsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/clients`;

  getClients() {
    return this.http.get<any[]>(`${this.baseUrl}/`);
  }

  createClient(data: any) {
    return this.http.post(`${this.baseUrl}/`, data);
  }

  deleteClient(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}