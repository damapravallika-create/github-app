import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { filter } from 'rxjs/operators';
import { signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BottomNavComponent, CommonModule],
  template: `
    <router-outlet />
    @if (showNav()) {
      <app-bottom-nav />
    }
  `,
  styles: [`:host { display: block; min-height: 100vh; background: #0f1a0f; }`]
})
export class AppComponent {
  private router = inject(Router);
  showNav = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.showNav.set(!e.urlAfterRedirects.includes('/auth'));
    });
  }
}
