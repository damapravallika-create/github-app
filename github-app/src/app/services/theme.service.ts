import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  isDark = signal(true);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('sfet_theme');
      this.isDark.set(saved ? saved === 'dark' : true);
      this.apply();
    }
  }

  toggle() {
    this.isDark.update(v => !v);
    this.apply();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('sfet_theme', this.isDark() ? 'dark' : 'light');
    }
  }

  private apply() {
    if (!isPlatformBrowser(this.platformId)) return;
    document.documentElement.setAttribute('data-theme', this.isDark() ? 'dark' : 'light');
  }
}
