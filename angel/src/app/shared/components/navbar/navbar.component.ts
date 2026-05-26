import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatToolbarModule,
    MatButtonModule, MatIconModule, MatBadgeModule, MatMenuModule, MatDividerModule],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <a routerLink="/" class="brand">
        <mat-icon>store</mat-icon>
        <span>LaraShop</span>
      </a>

      <span class="spacer"></span>

      <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <mat-icon>home</mat-icon> Home
      </a>
      <a mat-button routerLink="/products" routerLinkActive="active">
        <mat-icon>inventory_2</mat-icon> Produkte
      </a>

      <!-- Warenkorb -->
      <a mat-button routerLink="/cart">
        <mat-icon [matBadge]="cartService.itemCount()" matBadgeColor="accent"
          [matBadgeHidden]="cartService.itemCount() === 0">shopping_cart</mat-icon>
        Warenkorb
      </a>

      <!-- Eingeloggt: Benutzermenü -->
      @if (auth.isLoggedIn()) {
        <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
          <mat-icon>account_circle</mat-icon>
          {{ auth.currentUser()?.first_name }}
          <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <div class="menu-header">
            <strong>{{ auth.currentUser()?.first_name }} {{ auth.currentUser()?.last_name }}</strong>
            <small>{{ auth.currentUser()?.email }}</small>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/cart">
            <mat-icon>shopping_cart</mat-icon> Warenkorb
          </button>
          <button mat-menu-item routerLink="/checkout">
            <mat-icon>payment</mat-icon> Zur Kasse
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="auth.logout()" class="logout-item">
            <mat-icon>logout</mat-icon> Abmelden
          </button>
        </mat-menu>
      }

      <!-- Nicht eingeloggt -->
      @if (!auth.isLoggedIn()) {
        <a mat-button routerLink="/login" routerLinkActive="active">
          <mat-icon>login</mat-icon> Anmelden
        </a>
        <a mat-raised-button routerLink="/register" class="register-btn">
          <mat-icon>person_add</mat-icon> Registrieren
        </a>
      }
    </mat-toolbar>
  `,
  styles: [`
    .navbar { position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .brand { display: flex; align-items: center; gap: 8px; color: white; text-decoration: none; font-size: 1.2rem; font-weight: 700; margin-right: 8px; }
    .spacer { flex: 1; }
    .active { background: rgba(255,255,255,0.15) !important; border-radius: 4px; }
    a, button.mat-button { color: white !important; }
    .user-btn { display: flex; align-items: center; gap: 4px; color: white !important; }
    .register-btn { background: white !important; color: #1976d2 !important; margin-left: 8px; font-weight: 600; }
    .menu-header { padding: 12px 16px; display: flex; flex-direction: column; gap: 2px; }
    .menu-header strong { font-size: 0.95rem; }
    .menu-header small { color: #999; font-size: 0.8rem; }
    .logout-item { color: #e53935 !important; }
    mat-divider { margin: 4px 0; }
  `]
})
export class NavbarComponent {
  cartService = inject(CartService);
  auth = inject(AuthService);
}
