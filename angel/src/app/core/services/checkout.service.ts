import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const opts = { withCredentials: true };

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Adds a single product to the Bagisto backend cart */
  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.api}/checkout/cart`, { product_id: productId, quantity }, opts);
  }

  /** Clears the entire backend cart */
  clearBackendCart(): Observable<any> {
    return this.http.delete(`${this.api}/checkout/cart`, opts);
  }

  /** Saves billing+shipping address → returns available shipping methods */
  saveAddress(data: any): Observable<any> {
    return this.http.post(`${this.api}/checkout/onepage/addresses`, data, opts);
  }

  /** Selects a shipping method */
  saveShippingMethod(method: string): Observable<any> {
    return this.http.post(`${this.api}/checkout/onepage/shipping-methods`, { shipping_method: method }, opts);
  }

  /** Selects a payment method */
  savePaymentMethod(method: string): Observable<any> {
    return this.http.post(`${this.api}/checkout/onepage/payment-methods`, { payment: { method } }, opts);
  }

  /** Places the order and returns the created order */
  placeOrder(): Observable<any> {
    return this.http.post(`${this.api}/checkout/onepage/orders`, {}, opts);
  }

  getCart(): Observable<any> {
    return this.http.get(`${this.api}/checkout/cart`, opts);
  }
}
