import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatPaginatorModule, MatSnackBarModule],
  template: `
    <div class="container">
      <h1>Alle Produkte</h1>
      @if (loading()) {
        <div class="center"><mat-spinner></mat-spinner></div>
      } @else if (products().length === 0) {
        <div class="empty">
          <mat-icon>inventory_2</mat-icon>
          <p>Keine Produkte gefunden</p>
        </div>
      } @else {
        <div class="products-grid">
          @for (product of products(); track product.id) {
            <mat-card class="product-card">
              <img mat-card-image [src]="getImage(product)" [alt]="product.name" (error)="onImgError($event)">
              <mat-card-content>
                <h3>{{ product.name }}</h3>
                <p class="sku">SKU: {{ product.sku }}</p>
                <div class="price">
                  @if (product.on_sale) {
                    <span class="old-price">{{ getRegularPrice(product) }}</span>
                    <span class="sale-price">{{ getPrice(product) }}</span>
                  } @else {
                    <span class="price-main">{{ getPrice(product) }}</span>
                  }
                </div>
                <span class="stock" [class.out]="!product.is_saleable">
                  {{ product.is_saleable ? 'Auf Lager' : 'Ausverkauft' }}
                </span>
              </mat-card-content>
              <mat-card-actions>
                <a mat-button color="primary" [routerLink]="['/products', product.id]">Details</a>
                <button mat-raised-button color="primary" (click)="addToCart(product)" [disabled]="!product.is_saleable">
                  <mat-icon>add_shopping_cart</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
        <mat-paginator
          [length]="total()"
          [pageSize]="12"
          [pageSizeOptions]="[12, 24, 48]"
          (page)="onPageChange($event)">
        </mat-paginator>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
    h1 { font-size: 2rem; margin-bottom: 32px; color: #333; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; margin-bottom: 32px; }
    .product-card { transition: transform 0.2s, box-shadow 0.2s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .product-card img { height: 200px; object-fit: cover; }
    h3 { font-size: 1rem; margin: 8px 0 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sku { font-size: 0.75rem; color: #999; margin: 0 0 8px; }
    .price-main { font-size: 1.1rem; font-weight: 600; color: #1976d2; }
    .old-price { text-decoration: line-through; color: #999; font-size: 0.85rem; margin-right: 6px; }
    .sale-price { font-size: 1.1rem; font-weight: 600; color: #e53935; }
    .stock { font-size: 0.75rem; padding: 2px 8px; border-radius: 12px; background: #e8f5e9; color: #2e7d32; }
    .stock.out { background: #ffebee; color: #c62828; }
    .center { display: flex; justify-content: center; padding: 64px; }
    .empty { text-align: center; padding: 64px; color: #999; }
    .empty mat-icon { font-size: 64px; height: 64px; width: 64px; }
    mat-card-actions { display: flex; justify-content: space-between; align-items: center; }
  `]
})
export class ProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  products = signal<Product[]>([]);
  loading = signal(true);
  total = signal(0);

  ngOnInit(): void { this.load(1); }

  load(page: number): void {
    this.loading.set(true);
    this.productService.getProducts(page).subscribe({
      next: res => { this.products.set(res.data ?? []); this.total.set(res.meta?.total ?? 0); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onPageChange(e: PageEvent): void { this.load(e.pageIndex + 1); }

  getImage(product: Product): string { return product.base_image?.medium_image_url ?? 'assets/no-image.png'; }
  getPrice(product: Product): string { return product.prices?.final?.formatted_price ?? product.min_price ?? '–'; }
  getRegularPrice(product: Product): string { return product.prices?.regular?.formatted_price ?? '–'; }

  onImgError(event: Event): void { (event.target as HTMLImageElement).src = 'assets/no-image.png'; }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.snackBar.open(`${product.name} hinzugefügt`, 'OK', { duration: 2000 });
  }
}
