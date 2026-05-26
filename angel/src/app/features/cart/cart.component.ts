import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="container">
      <h1>Warenkorb</h1>
      @if (cartService.cartItems().length === 0) {
        <div class="empty">
          <mat-icon>shopping_cart</mat-icon>
          <p>Dein Warenkorb ist leer</p>
          <a mat-raised-button color="primary" routerLink="/products">Jetzt einkaufen</a>
        </div>
      } @else {
        <div class="cart-layout">
          <div class="cart-items">
            @for (item of cartService.cartItems(); track item.id) {
              <div class="cart-item">
                <img [src]="item.product.image" [alt]="item.product.name" (error)="onImgError($event)">
                <div class="item-info">
                  <h3>{{ item.product.name }}</h3>
                  <p class="sku">SKU: {{ item.product.sku }}</p>
                  <p class="unit-price">€{{ item.product.price | number:'1.2-2' }} / Stück</p>
                </div>
                <div class="qty-control">
                  <button mat-icon-button (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)">
                    <mat-icon>remove</mat-icon>
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button mat-icon-button (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)">
                    <mat-icon>add</mat-icon>
                  </button>
                </div>
                <div class="item-total">€{{ item.total | number:'1.2-2' }}</div>
                <button mat-icon-button color="warn" (click)="cartService.removeFromCart(item.product.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </div>
          <div class="cart-summary">
            <h2>Zusammenfassung</h2>
            <div class="summary-row">
              <span>Artikel ({{ cartService.itemCount() }})</span>
              <span>€{{ cartService.total() | number:'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Versand</span>
              <span class="free">Kostenlos</span>
            </div>
            <hr>
            <div class="summary-row total">
              <span>Gesamt</span>
              <span>€{{ cartService.total() | number:'1.2-2' }}</span>
            </div>
            <a mat-raised-button color="primary" routerLink="/checkout" class="checkout-btn">
              Zur Kasse <mat-icon>arrow_forward</mat-icon>
            </a>
            <a mat-stroked-button routerLink="/products" class="continue-btn">Weiter einkaufen</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
    h1 { font-size: 2rem; margin-bottom: 32px; }
    .empty { text-align: center; padding: 64px; color: #999; }
    .empty mat-icon { font-size: 80px; height: 80px; width: 80px; margin-bottom: 16px; }
    .empty p { font-size: 1.2rem; margin-bottom: 24px; }
    .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start; }
    @media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } }
    .cart-item { display: flex; align-items: center; gap: 16px; background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .cart-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; }
    .item-info { flex: 1; }
    .item-info h3 { margin: 0 0 4px; font-size: 1rem; }
    .sku, .unit-price { margin: 0; font-size: 0.8rem; color: #999; }
    .qty-control { display: flex; align-items: center; gap: 8px; background: #f5f5f5; border-radius: 20px; padding: 4px 8px; }
    .qty-control span { min-width: 24px; text-align: center; font-weight: 600; }
    .item-total { font-size: 1.1rem; font-weight: 600; color: #1976d2; min-width: 80px; text-align: right; }
    .cart-summary { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    h2 { font-size: 1.2rem; margin-bottom: 20px; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .free { color: #2e7d32; font-weight: 600; }
    hr { margin: 16px 0; border: none; border-top: 1px solid #eee; }
    .total { font-size: 1.2rem; font-weight: 700; }
    .checkout-btn, .continue-btn { display: flex; align-items: center; justify-content: center; width: 100%; margin-top: 16px; }
  `]
})
export class CartComponent {
  cartService = inject(CartService);
  onImgError(event: Event): void { (event.target as HTMLImageElement).src = 'assets/no-image.png'; }
}
