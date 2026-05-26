import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="page">
      <mat-icon class="icon">search_off</mat-icon>
      <h1>404</h1>
      <p>Diese Seite existiert nicht.</p>
      <a mat-raised-button color="primary" routerLink="/">Zur Startseite</a>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: calc(100vh - 64px); gap: 16px; text-align: center; color: #555; }
    .icon { font-size: 80px; height: 80px; width: 80px; color: #bdbdbd; }
    h1 { font-size: 5rem; margin: 0; color: #bdbdbd; font-weight: 900; line-height: 1; }
    p { font-size: 1.2rem; margin: 0; }
  `]
})
export class NotFoundComponent {}
