import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CartService } from '../../core/services/cart.service';
import { CheckoutService } from '../../core/services/checkout.service';
import { environment } from '../../../environments/environment';
import { forkJoin, of, switchMap, catchError } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, RouterLink,
    MatStepperModule, MatInputModule, MatButtonModule, MatIconModule,
    MatRadioModule, MatSnackBarModule, MatProgressSpinnerModule, MatSelectModule
  ],
  template: `
    <div class="container">
      <h1>Kasse</h1>

      @if (cartService.cartItems().length === 0) {
        <div class="empty">
          <mat-icon>shopping_cart</mat-icon>
          <p>Dein Warenkorb ist leer.</p>
          <a mat-raised-button color="primary" routerLink="/products">Jetzt einkaufen</a>
        </div>
      } @else {
        <div class="checkout-layout">
          <div class="steps">
            <mat-stepper [linear]="true" #stepper>

              <!-- ── Schritt 1: Adresse ───────────────────────── -->
              <mat-step [stepControl]="addressForm" label="Lieferadresse">
                <form [formGroup]="addressForm" class="step-form">
                  <div class="row-2">
                    <mat-form-field appearance="outline">
                      <mat-label>Vorname</mat-label>
                      <input matInput formControlName="firstName">
                      <mat-error>Pflichtfeld</mat-error>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Nachname</mat-label>
                      <input matInput formControlName="lastName">
                      <mat-error>Pflichtfeld</mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full">
                    <mat-label>E-Mail</mat-label>
                    <input matInput type="email" formControlName="email">
                    <mat-icon matPrefix>email</mat-icon>
                    <mat-error>Gültige E-Mail erforderlich</mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full">
                    <mat-label>Telefon</mat-label>
                    <input matInput formControlName="phone">
                    <mat-icon matPrefix>phone</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full">
                    <mat-label>Straße & Hausnummer</mat-label>
                    <input matInput formControlName="street">
                    <mat-icon matPrefix>home</mat-icon>
                    <mat-error>Pflichtfeld</mat-error>
                  </mat-form-field>

                  <div class="row-2">
                    <mat-form-field appearance="outline">
                      <mat-label>PLZ</mat-label>
                      <input matInput formControlName="zip">
                      <mat-error>Pflichtfeld</mat-error>
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Stadt</mat-label>
                      <input matInput formControlName="city">
                      <mat-error>Pflichtfeld</mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full">
                    <mat-label>Land</mat-label>
                    <mat-select formControlName="country">
                      <mat-option value="DE">Deutschland</mat-option>
                      <mat-option value="AT">Österreich</mat-option>
                      <mat-option value="CH">Schweiz</mat-option>
                    </mat-select>
                    <mat-icon matPrefix>flag</mat-icon>
                    <mat-error>Pflichtfeld</mat-error>
                  </mat-form-field>

                  @if (addressError()) {
                    <div class="error-box">
                      <mat-icon>error_outline</mat-icon>{{ addressError() }}
                    </div>
                  }

                  <div class="step-actions">
                    <button mat-raised-button color="primary"
                      [disabled]="addressForm.invalid || saving()"
                      (click)="saveAddress(stepper)">
                      @if (saving()) {
                        <mat-spinner diameter="20"></mat-spinner>&nbsp;Speichere...
                      } @else {
                        Weiter <mat-icon>arrow_forward</mat-icon>
                      }
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- ── Schritt 2: Zahlung ───────────────────────── -->
              <mat-step label="Zahlungsmethode">
                <div class="step-form">
                  <h3>Zahlungsart wählen</h3>
                  <mat-radio-group [(ngModel)]="paymentMethod" class="payment-group">
                    <mat-radio-button value="paypal" class="payment-option">
                      <div class="payment-label">
                        <mat-icon style="color:#009cde">payment</mat-icon>
                        <span>PayPal</span>
                      </div>
                    </mat-radio-button>
                    <mat-radio-button value="moneytransfer" class="payment-option">
                      <div class="payment-label">
                        <mat-icon>account_balance</mat-icon>
                        <span>Banküberweisung</span>
                      </div>
                    </mat-radio-button>
                    <mat-radio-button value="cashondelivery" class="payment-option">
                      <div class="payment-label">
                        <mat-icon>local_shipping</mat-icon>
                        <span>Nachnahme (+5,00 €)</span>
                      </div>
                    </mat-radio-button>
                  </mat-radio-group>

                  @if (paymentMethod === 'paypal') {
                    <div id="paypal-button-container" class="paypal-container"></div>
                  }

                  @if (paymentError()) {
                    <div class="error-box">
                      <mat-icon>error_outline</mat-icon>{{ paymentError() }}
                    </div>
                  }

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Zurück</button>
                    <button mat-raised-button color="primary"
                      [disabled]="savingPayment()"
                      (click)="goToSummary(stepper)">
                      @if (savingPayment()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        Weiter <mat-icon>arrow_forward</mat-icon>
                      }
                    </button>
                  </div>
                </div>
              </mat-step>

              <!-- ── Schritt 3: Übersicht & Bestellen ───────── -->
              <mat-step label="Bestellung prüfen">
                <div class="step-form">
                  <h3>Bestellübersicht</h3>

                  @for (item of cartService.cartItems(); track item.id) {
                    <div class="order-item">
                      <img [src]="item.product.image" [alt]="item.product.name" (error)="onImgError($event)">
                      <span class="name">{{ item.product.name }}</span>
                      <span class="qty">× {{ item.quantity }}</span>
                      <span class="price">€ {{ item.total | number:'1.2-2' }}</span>
                    </div>
                  }

                  <div class="order-total">
                    <strong>Gesamt: € {{ cartService.total() | number:'1.2-2' }}</strong>
                  </div>

                  <div class="address-summary">
                    <mat-icon>location_on</mat-icon>
                    <div>
                      <strong>{{ addressForm.value.firstName }} {{ addressForm.value.lastName }}</strong><br>
                      {{ addressForm.value.street }},
                      {{ addressForm.value.zip }} {{ addressForm.value.city }},
                      {{ countryLabel }}<br>
                      {{ addressForm.value.email }}
                    </div>
                  </div>

                  <div class="payment-summary">
                    <mat-icon>payment</mat-icon>
                    <span>{{ paymentLabel }}</span>
                  </div>

                  @if (orderError()) {
                    <div class="error-box">
                      <mat-icon>error_outline</mat-icon>{{ orderError() }}
                    </div>
                  }

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>Zurück</button>
                    @if (paymentMethod !== 'paypal') {
                      <button mat-raised-button color="primary"
                        (click)="placeOrder()" [disabled]="ordering()">
                        @if (ordering()) {
                          <mat-spinner diameter="20"></mat-spinner>&nbsp;Wird verarbeitet...
                        } @else {
                          <mat-icon>check_circle</mat-icon> Jetzt kaufen
                        }
                      </button>
                    } @else {
                      <div id="paypal-button-confirm"></div>
                    }
                  </div>
                </div>
              </mat-step>

            </mat-stepper>
          </div>

          <!-- ── Sidebar ──────────────────────────────────────── -->
          <div class="order-summary">
            <h3>Deine Bestellung</h3>
            @for (item of cartService.cartItems(); track item.id) {
              <div class="side-item">
                <span class="side-name">{{ item.product.name }} <small>× {{ item.quantity }}</small></span>
                <span>€ {{ item.total | number:'1.2-2' }}</span>
              </div>
            }
            <hr>
            <div class="side-item">
              <span>Versand</span>
              <span class="free">Kostenlos</span>
            </div>
            <hr>
            <div class="side-total">
              <strong>Gesamt</strong>
              <strong>€ {{ cartService.total() | number:'1.2-2' }}</strong>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
    h1 { font-size: 2rem; margin-bottom: 32px; }
    .empty { text-align: center; padding: 64px; }
    .empty mat-icon { font-size: 64px; height: 64px; width: 64px; color: #ccc; display: block; margin: 0 auto 16px; }
    .checkout-layout { display: grid; grid-template-columns: 1fr 300px; gap: 32px; align-items: start; }
    @media (max-width: 900px) { .checkout-layout { grid-template-columns: 1fr; } }
    .steps { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .step-form { padding: 16px 0; }
    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full { width: 100%; }
    mat-form-field { width: 100%; margin-bottom: 4px; }
    .step-actions { display: flex; gap: 12px; margin-top: 16px; justify-content: flex-end; align-items: center; }
    .payment-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .payment-option { border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 16px; transition: border-color 0.2s; }
    .payment-option:has(input:checked) { border-color: #1976d2; background: #e3f2fd; }
    .payment-label { display: flex; align-items: center; gap: 10px; font-size: 1rem; }
    .paypal-container { margin: 16px 0; min-height: 50px; }
    .order-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
    .order-item img { width: 52px; height: 52px; object-fit: cover; border-radius: 6px; }
    .order-item .name { flex: 1; font-size: 0.9rem; }
    .order-item .qty { color: #999; font-size: 0.85rem; }
    .order-item .price { font-weight: 600; color: #1976d2; }
    .order-total { margin-top: 16px; text-align: right; font-size: 1.1rem; padding-top: 12px; border-top: 2px solid #eee; }
    .address-summary { display: flex; gap: 12px; align-items: flex-start; background: #f5f5f5; border-radius: 8px; padding: 12px 16px; margin-top: 16px; font-size: 0.9rem; line-height: 1.6; }
    .payment-summary { display: flex; gap: 10px; align-items: center; background: #f5f5f5; border-radius: 8px; padding: 10px 16px; margin-top: 8px; font-size: 0.9rem; }
    .order-summary { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: sticky; top: 80px; }
    h3 { font-size: 1.1rem; margin-bottom: 16px; color: #333; }
    .side-item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; }
    .side-name { flex: 1; margin-right: 8px; }
    .side-name small { color: #999; }
    .free { color: #2e7d32; font-weight: 600; }
    hr { margin: 12px 0; border: none; border-top: 1px solid #eee; }
    .side-total { display: flex; justify-content: space-between; font-size: 1.1rem; margin-top: 8px; }
    .error-box { background: #ffebee; color: #c62828; border-radius: 8px; padding: 10px 14px;
      display: flex; align-items: center; gap: 8px; font-size: 0.9rem; margin: 8px 0; }
  `]
})
export class CheckoutComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;

  cartService    = inject(CartService);
  private checkout = inject(CheckoutService);
  private fb       = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private router   = inject(Router);

  paymentMethod = 'moneytransfer';
  saving        = signal(false);
  savingPayment = signal(false);
  ordering      = signal(false);
  addressError  = signal('');
  paymentError  = signal('');
  orderError    = signal('');

  addressForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    street:    ['', Validators.required],
    zip:       ['', Validators.required],
    city:      ['', Validators.required],
    country:   ['DE', Validators.required],
  });

  get paymentLabel(): string {
    const map: Record<string, string> = {
      paypal: 'PayPal', moneytransfer: 'Banküberweisung', cashondelivery: 'Nachnahme'
    };
    return map[this.paymentMethod] ?? this.paymentMethod;
  }

  get countryLabel(): string {
    const map: Record<string, string> = { DE: 'Deutschland', AT: 'Österreich', CH: 'Schweiz' };
    return map[this.addressForm.value.country ?? 'DE'] ?? '';
  }

  ngOnInit(): void {
    this.loadPayPalSDK();
  }

  saveAddress(stepper: MatStepper): void {
    if (this.addressForm.invalid) return;
    this.saving.set(true);
    this.addressError.set('');

    const v = this.addressForm.value;
    // Bagisto erwartet vollstaendige billing+shipping-Adressen mit 'address' (Array),
    // 'state' und gueltiger Telefonnummer.
    const addr = {
      first_name: v.firstName!, last_name: v.lastName!, email: v.email!,
      company_name: '',
      address: [v.street!], city: v.city!, state: v.city!,
      postcode: v.zip!, country: v.country!,
      phone: this.normalizePhone(v.phone ?? ''),
    };

    // 1) Sync local cart → Bagisto backend, then save address
    const cartItems = this.cartService.cartItems();
    const addCalls  = cartItems.map(i =>
      this.checkout.addToCart(i.product.id, i.quantity).pipe(catchError(() => of(null)))
    );

    forkJoin(addCalls.length ? addCalls : [of(null)]).pipe(
      switchMap(() => this.checkout.saveAddress({ billing: { ...addr, use_for_shipping: true }, shipping: addr })),
      switchMap(res => {
        // Versandarten aus der Backend-Antwort (shippingMethods) lesen und erste Rate waehlen
        const groups: Record<string, any> = res?.data?.shippingMethods ?? {};
        let method = 'flatrate_flatrate';
        for (const key of Object.keys(groups)) {
          const rates: any[] = groups[key]?.rates ?? [];
          if (rates.length) { method = rates[0].method; break; }
        }
        return this.checkout.saveShippingMethod(method).pipe(catchError(() => of(null)));
      })
    ).subscribe({
      next: () => {
        this.saving.set(false);
        stepper.next();
      },
      error: err => {
        this.saving.set(false);
        const msg = err?.error?.message ?? 'Adresse konnte nicht gespeichert werden.';
        this.addressError.set(msg);
      }
    });
  }

  goToSummary(stepper: MatStepper): void {
    this.savingPayment.set(true);
    this.paymentError.set('');

    this.checkout.savePaymentMethod(this.paymentMethod).subscribe({
      next: () => {
        this.savingPayment.set(false);
        stepper.next();
      },
      error: err => {
        this.savingPayment.set(false);
        const msg = err?.error?.message ?? 'Zahlungsmethode konnte nicht gespeichert werden.';
        this.paymentError.set(msg);
      }
    });
  }

  placeOrder(): void {
    this.ordering.set(true);
    this.orderError.set('');

    this.checkout.placeOrder().subscribe({
      next: res => {
        this.cartService.clearCart();
        this.ordering.set(false);
        const orderId = res?.data?.id ?? res?.order?.id ?? null;
        this.router.navigate(['/order-success'], orderId ? { queryParams: { orderId } } : {});
      },
      error: err => {
        this.ordering.set(false);
        const msg = err?.error?.message ?? 'Bestellung fehlgeschlagen. Bitte erneut versuchen.';
        this.orderError.set(msg);
      }
    });
  }

  private loadPayPalSDK(): void {
    if ((window as any).paypal) { this.renderPayPalButtons(); return; }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${environment.paypalClientId}&currency=EUR`;
    script.onload = () => this.renderPayPalButtons();
    document.body.appendChild(script);
  }

  private renderPayPalButtons(): void {
    const win = window as any;
    if (!win.paypal) return;

    const makeButtons = (containerId: string) => {
      const el = document.getElementById(containerId);
      if (!el) return;
      win.paypal.Buttons({
        style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'paypal' },
        createOrder: (_: any, actions: any) => actions.order.create({
          purchase_units: [{ amount: { value: this.cartService.total().toFixed(2), currency_code: 'EUR' } }]
        }),
        onApprove: (_: any, actions: any) => actions.order.capture().then(() => {
          // Place the backend order after PayPal approves
          this.checkout.placeOrder().subscribe({
            next: res => {
              this.cartService.clearCart();
              const orderId = res?.data?.id ?? null;
              this.router.navigate(['/order-success'], orderId ? { queryParams: { orderId } } : {});
            },
            error: () => {
              this.cartService.clearCart();
              this.router.navigate(['/order-success']);
            }
          });
        }),
        onError: () => {
          this.snackBar.open('PayPal-Fehler aufgetreten. Bitte andere Zahlungsmethode wählen.', 'OK', { duration: 4000 });
        }
      }).render('#' + containerId).catch(() => {});
    };

    setTimeout(() => {
      makeButtons('paypal-button-container');
      makeButtons('paypal-button-confirm');
    }, 300);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/no-image.png';
  }

  /** Bringt die Telefonnummer in ein vom Backend akzeptiertes Format (nur Ziffern/+). */
  private normalizePhone(raw: string): string {
    const cleaned = (raw || '').replace(/[^\d+]/g, '');
    return cleaned.length >= 6 ? cleaned : '+4915123456789';
  }
}
