import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { inject } from '@angular/core';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <div class="card">
        <mat-icon class="check">check_circle</mat-icon>
        <h1>Vielen Dank für deine Bestellung!</h1>

        @if (orderId()) {
          <div class="order-id">
            <span class="label">Bestellnummer</span>
            <span class="number">#{{ orderId() }}</span>
          </div>
        }

        <p class="msg">
          Deine Bestellung wird bearbeitet. Du erhältst in Kürze eine
          Bestätigung per E-Mail.
        </p>

        <div class="actions">
          <a mat-raised-button color="primary" routerLink="/products">
            <mat-icon>shopping_bag</mat-icon> Weiter einkaufen
          </a>
          <a mat-stroked-button routerLink="/">
            <mat-icon>home</mat-icon> Zur Startseite
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { display: flex; align-items: center; justify-content: center;
      min-height: calc(100vh - 64px); background: #f5f5f5; padding: 24px; }
    .card { background: white; border-radius: 16px; padding: 48px 40px; text-align: center;
      max-width: 480px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .check { font-size: 80px; height: 80px; width: 80px; color: #43a047; }
    h1 { font-size: 1.6rem; margin: 16px 0; color: #222; }
    .order-id { display: inline-flex; flex-direction: column; background: #f5f5f5;
      border-radius: 8px; padding: 12px 24px; margin: 8px 0 20px; }
    .label { font-size: 0.75rem; color: #999; text-transform: uppercase; letter-spacing: 1px; }
    .number { font-size: 1.4rem; font-weight: 700; color: #1976d2; }
    .msg { color: #666; line-height: 1.6; margin-bottom: 32px; }
    .actions { display: flex; flex-direction: column; gap: 12px; }
  `]
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  orderId = signal<string | null>(null);

  ngOnInit(): void {
    this.orderId.set(this.route.snapshot.queryParamMap.get('orderId'));
  }
}
