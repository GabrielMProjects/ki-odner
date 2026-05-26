import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule, MatInputModule],
  template: `
    <div class="container">
      <a mat-button routerLink="/products"><mat-icon>arrow_back</mat-icon> Zurück</a>
      @if (loading()) {
        <div class="center"><mat-spinner></mat-spinner></div>
      } @else if (!product()) {
        <div class="not-found">
          <mat-icon>search_off</mat-icon>
          <h2>Produkt nicht gefunden</h2>
          <p>Dieses Produkt existiert nicht oder wurde entfernt.</p>
          <a mat-raised-button color="primary" routerLink="/products">Alle Produkte</a>
        </div>
      } @else if (product()) {
        <div class="product-detail">
          <div class="images">
            <img [src]="selectedImage()" [alt]="product()!.name" (error)="onImgError($event)" class="main-img">
            @if (product()!.images.length > 1) {
              <div class="thumbnails">
                @for (img of product()!.images; track img.small_image_url) {
                  <img [src]="img.small_image_url" (click)="selectedImage.set(img.large_image_url)"
                    [class.active]="selectedImage() === img.large_image_url" (error)="onImgError($event)">
                }
              </div>
            }
          </div>
          <div class="info">
            <h1>{{ product()!.name }}</h1>
            <p class="sku">SKU: {{ product()!.sku }}</p>
            <div class="price">
              @if (product()!.on_sale) {
                <span class="old-price">{{ product()!.prices?.regular?.formatted_price }}</span>
                <span class="sale-price">{{ product()!.prices?.final?.formatted_price }}</span>
              } @else {
                <span class="price-main">{{ product()!.prices?.final?.formatted_price ?? product()!.min_price }}</span>
              }
            </div>
            <span class="stock" [class.out]="!product()!.is_saleable">
              <mat-icon>{{ product()!.is_saleable ? 'check_circle' : 'cancel' }}</mat-icon>
              {{ product()!.is_saleable ? 'Auf Lager' : 'Ausverkauft' }}
            </span>
            <div class="description" [innerHTML]="product()!.description"></div>
            <div class="qty-row">
              <label>Menge:</label>
              <div class="qty-control">
                <button mat-icon-button (click)="qty > 1 ? qty = qty - 1 : null"><mat-icon>remove</mat-icon></button>
                <span>{{ qty }}</span>
                <button mat-icon-button (click)="qty = qty + 1"><mat-icon>add</mat-icon></button>
              </div>
            </div>
            <div class="actions">
              <button mat-raised-button color="primary" [disabled]="!product()!.is_saleable" (click)="addToCart()">
                <mat-icon>add_shopping_cart</mat-icon> In den Warenkorb
              </button>
              <a mat-stroked-button color="accent" routerLink="/cart">Warenkorb ansehen</a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1100px; margin: 0 auto; padding: 24px; }
    .center { display: flex; justify-content: center; padding: 64px; }
    .not-found { text-align: center; padding: 64px 24px; color: #999; }
    .not-found mat-icon { font-size: 64px; height: 64px; width: 64px; display: block; margin: 0 auto 16px; }
    .not-found h2 { font-size: 1.4rem; color: #555; margin-bottom: 8px; }
    .not-found p { margin-bottom: 24px; }
    .product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 24px; }
    @media (max-width: 768px) { .product-detail { grid-template-columns: 1fr; } }
    .main-img { width: 100%; height: 400px; object-fit: cover; border-radius: 8px; }
    .thumbnails { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
    .thumbnails img { width: 70px; height: 70px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 2px solid transparent; }
    .thumbnails img.active { border-color: #1976d2; }
    h1 { font-size: 1.8rem; margin-bottom: 8px; }
    .sku { color: #999; font-size: 0.85rem; margin-bottom: 16px; }
    .price { margin-bottom: 16px; }
    .price-main { font-size: 2rem; font-weight: 700; color: #1976d2; }
    .old-price { font-size: 1.2rem; text-decoration: line-through; color: #999; margin-right: 12px; }
    .sale-price { font-size: 2rem; font-weight: 700; color: #e53935; }
    .stock { display: flex; align-items: center; gap: 4px; font-size: 0.9rem; color: #2e7d32; margin-bottom: 24px; }
    .stock.out { color: #c62828; }
    .description { color: #555; line-height: 1.6; margin-bottom: 24px; }
    .qty-row { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .qty-control { display: flex; align-items: center; gap: 12px; background: #f5f5f5; border-radius: 24px; padding: 4px 8px; }
    .qty-control span { font-size: 1.1rem; font-weight: 600; min-width: 24px; text-align: center; }
    .actions { display: flex; gap: 16px; flex-wrap: wrap; }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  product = signal<Product | null>(null);
  loading = signal(true);
  selectedImage = signal('assets/no-image.png');
  qty = 1;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getProduct(id).subscribe({
      next: res => {
        this.product.set(res.data);
        this.selectedImage.set(res.data.base_image?.large_image_url ?? 'assets/no-image.png');
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onImgError(event: Event): void { (event.target as HTMLImageElement).src = 'assets/no-image.png'; }

  addToCart(): void {
    if (!this.product()) return;
    this.cartService.addToCart(this.product()!, this.qty);
    this.snackBar.open(`${this.product()!.name} zum Warenkorb hinzugefügt`, 'Zum Warenkorb', { duration: 3000 });
  }
}
