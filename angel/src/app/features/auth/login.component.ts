import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="auth-page">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon>login</mat-icon>
            Anmelden
          </mat-card-title>
          <mat-card-subtitle>Willkommen zurück bei LaraShop</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="auth-form">

            <mat-form-field appearance="outline" class="full">
              <mat-label>E-Mail</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email">
              <mat-icon matPrefix>email</mat-icon>
              <mat-error>Gültige E-Mail erforderlich</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Passwort</mat-label>
              <input matInput [type]="showPw() ? 'text' : 'password'" formControlName="password" autocomplete="current-password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="showPw.set(!showPw())">
                <mat-icon>{{ showPw() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error>Passwort erforderlich</mat-error>
            </mat-form-field>

            @if (error()) {
              <div class="error-box">
                <mat-icon>error_outline</mat-icon>
                {{ error() }}
              </div>
            }

            <button mat-raised-button color="primary" class="full submit-btn"
              type="submit" [disabled]="form.invalid || loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>&nbsp;Anmelden...
              } @else {
                <mat-icon>login</mat-icon> Anmelden
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="switch-link">
            Noch kein Konto?
            <a routerLink="/register">Jetzt registrieren</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-page { min-height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; background: #f5f5f5; padding: 24px; }
    .auth-card { width: 100%; max-width: 420px; border-radius: 12px !important; }
    mat-card-header { padding: 24px 24px 0 !important; }
    mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 1.5rem !important; }
    mat-card-subtitle { margin-top: 4px !important; }
    mat-card-content { padding: 24px !important; }
    mat-card-actions { padding: 0 24px 24px !important; }
    .auth-form { display: flex; flex-direction: column; gap: 4px; }
    .full { width: 100%; }
    .submit-btn { height: 48px; font-size: 1rem; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .error-box { background: #ffebee; color: #c62828; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; margin-bottom: 8px; }
    .switch-link { text-align: center; color: #666; font-size: 0.9rem; margin: 0; }
    .switch-link a { color: #1976d2; font-weight: 600; text-decoration: none; }
    .switch-link a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loading = signal(false);
  error = signal('');
  showPw = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.snackBar.open('Erfolgreich angemeldet!', 'OK', { duration: 3000 });
        this.router.navigate(['/']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'E-Mail oder Passwort falsch.');
      }
    });
  }
}
