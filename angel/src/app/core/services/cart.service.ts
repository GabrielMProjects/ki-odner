import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Cart } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>([]);

  cartItems = this.items.asReadonly();

  itemCount = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0)
  );

  total = computed(() =>
    this.items().reduce((sum, i) => sum + i.total, 0)
  );

  addToCart(product: Product, quantity = 1): void {
    const current = this.items();
    const existing = current.find(i => i.product.id === product.id);
    const price = parseFloat(product.prices?.final?.price ?? '0');
    const image = product.base_image?.medium_image_url ?? 'assets/no-image.png';

    if (existing) {
      this.items.set(current.map(i =>
        i.product.id === product.id
          ? { ...i, quantity: i.quantity + quantity, total: (i.quantity + quantity) * i.product.price }
          : i
      ));
    } else {
      this.items.set([...current, {
        id: Date.now(),
        product: { id: product.id, name: product.name, price, image, sku: product.sku },
        quantity,
        total: price * quantity
      }]);
    }
  }

  removeFromCart(productId: number): void {
    this.items.set(this.items().filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) { this.removeFromCart(productId); return; }
    this.items.set(this.items().map(i =>
      i.product.id === productId
        ? { ...i, quantity, total: quantity * i.product.price }
        : i
    ));
  }

  clearCart(): void {
    this.items.set([]);
  }
}
