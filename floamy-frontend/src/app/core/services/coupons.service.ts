import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Coupon, CouponOffer } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponsService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/coupons/';
  list() { return this.http.get<Coupon[]>(this.url); }
  save(item: Coupon) {
    return item.id ? this.http.put(this.url + item.id, item) : this.http.post(this.url, item);
  }
  remove(id: number) { return this.http.delete(this.url + id); }
  validate(codigo: string) { return this.http.post<CouponOffer>(this.url + 'validar', { codigo }); }
}
