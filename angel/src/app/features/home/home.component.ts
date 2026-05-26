import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1>Willkommen bei LaraShop</h1>
        <p>Entdecke unsere exklusive Produktauswahl</p>
        <a mat-raised-button color="accent" routerLink="/products">Jetzt einkaufen</a>
      </div>
    </section>

    <section class="featured-section">
      <div class="container">
        <h2>Featured Produkte</h2>
        @if (loading()) {
          <div class="center"><mat-spinner></mat-spinner></div>
        } @else if (loadError()) {
          <div class="empty-state">
            <mat-icon>wifi_off</mat-icon>
            <p>Produkte konnten nicht geladen werden. Ist der Server erreichbar?</p>
          </div>
        } @else if (products().length === 0) {
          <div class="empty-state">
            <mat-icon>inventory_2</mat-icon>
            <p>Keine Produkte gefunden.</p>
            <a mat-stroked-button color="primary" routerLink="/products">Alle Produkte</a>
          </div>
      } @else {
          <div class="products-grid">
            @for (product of products(); track product.id) {
              <mat-card class="product-card">
                <img mat-card-image [src]="getImage(product)" [alt]="product.name" (error)="onImgError($event)">
                <mat-card-content>
                  <h3>{{ product.name }}</h3>
                  <div class="price">
                    @if (product.on_sale) {
                      <span class="old-price">{{ getRegularPrice(product) }}</span>
                      <span class="sale-price">{{ getPrice(product) }}</span>
                    } @else {
                      <span class="price-main">{{ getPrice(product) }}</span>
                    }
                  </div>
                </mat-card-content>
                <mat-card-actions>
                  <a mat-button color="primary" [routerLink]="['/products', product.id]">Details</a>
                  <button mat-raised-button color="primary" (click)="addToCart(product)">
                    <mat-icon>add_shopping_cart</mat-icon> In den Warenkorb
                  </button>
                </mat-card-actions>
              </mat-card>
            }
          </div>
        }
        <div class="center mt-2">
          <a mat-stroked-button color="primary" routerLink="/products">Alle Produkte ansehen</a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero { background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%); color: white; padding: 80px 24px; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; }
    .hero p { font-size: 1.2rem; margin-bottom: 32px; opacity: 0.9; }
    .featured-section { padding: 48px 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    h2 { font-size: 1.8rem; margin-bottom: 32px; color: #333; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 24px; }
    .product-card { cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .product-card img { height: 220px; object-fit: cover; }
    h3 { font-size: 1rem; margin: 8px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .price { margin-top: 8px; }
    .price-main { font-size: 1.2rem; font-weight: 600; color: #1976d2; }
    .old-price { text-decoration: line-through; color: #999; margin-right: 8px; }
    .sale-price { font-size: 1.2rem; font-weight: 600; color: #e53935; }
    .empty-state { text-align: center; padding: 48px 0; color: #999; }
    .empty-state mat-icon { font-size: 56px; height: 56px; width: 56px; display: block; margin: 0 auto 12px; }
    .center { display: flex; justify-content: center; align-items: center; padding: 32px 0; }
    .mt-2 { margin-top: 16px; }
    mat-card-actions { display: flex; gap: 8px; padding: 8px 16px; flex-wrap: wrap; }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  products = signal<Product[]>([]);
  loading  = signal(true);
  loadError = signal(false);

  ngOnInit(): void {
    this.productService.getFeaturedProducts().subscribe({
      next: res => { this.products.set(res.data ?? []); this.loading.set(false); },
      error: () => { this.loading.set(false); this.loadError.set(true); }
    });
  }

  getImage(product: Product): string {
    return product.base_image?.medium_image_url ?? 'assets/no-image.png';
  }

  getPrice(product: Product): string {
    return product.prices?.final?.formatted_price ?? product.min_price ?? '–';
  }

  getRegularPrice(product: Product): string {
    return product.prices?.regular?.formatted_price ?? '–';
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/no-image.png';
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    this.snackBar.open(`${product.name} zum Warenkorb hinzugefügt`, 'OK', { duration: 2000 });
  }
}
