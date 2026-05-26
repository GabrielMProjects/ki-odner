import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductsResponse } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProducts(page = 1, perPage = 12): Observable<ProductsResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', perPage);
    return this.http.get<ProductsResponse>(`${this.api}/products`, { params });
  }

  getProduct(id: number): Observable<{ data: Product }> {
    return this.http.get<{ data: Product }>(`${this.api}/products/${id}`);
  }

  getFeaturedProducts(): Observable<ProductsResponse> {
    return this.http.get<ProductsResponse>(`${this.api}/products?featured=1&limit=8`);
  }
}
