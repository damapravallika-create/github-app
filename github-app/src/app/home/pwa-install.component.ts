import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showBanner()) {
      <div class="install-banner">
        <div class="install-left">
          <div class="install-icon">🌿</div>
          <div>
            <div class="install-title">Install SmartFood App</div>
            <div class="install-sub">Add to home screen for quick access</div>
          </div>
        </div>
        <div class="install-actions">
          <button class="install-btn" (click)="install()">Install</button>
          <button class="dismiss-btn" (click)="dismiss()">✕</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .install-banner {
      display: flex; align-items: center; justify-content: space-between;
      background: linear-gradient(135deg, #1d3a1d, #2d4a2d);
      border: 1px solid #4caf50; border-radius: 12px;
      padding: .75rem 1rem; margin-bottom: 1rem; gap: .75rem;
    }
    .install-left { display: flex; align-items: center; gap: 10px; }
    .install-icon { font-size: 28px; }
    .install-title { font-size: 13px; font-weight: 600; color: #f0ead6; }
    .install-sub { font-size: 11px; color: #6a8f6a; margin-top: 2px; }
    .install-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .install-btn {
      background: #4caf50; border: none; color: #0f1a0f;
      font-family: inherit; font-size: 12px; font-weight: 700;
      padding: 6px 14px; border-radius: 8px; cursor: pointer;
      transition: background .2s; &:hover { background: #76c442; }
    }
    .dismiss-btn {
      background: transparent; border: 1px solid #2d4a2d; color: #6a8f6a;
      font-family: inherit; font-size: 12px; padding: 5px 8px;
      border-radius: 8px; cursor: pointer;
    }
  `]
})
export class PwaInstallComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  showBanner = signal(false);
  private deferredPrompt: any = null;

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if ((navigator as any).standalone) return;

    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showBanner.set(true);
    });
  }

  async install() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const result = await this.deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      this.showBanner.set(false);
    }
    this.deferredPrompt = null;
  }

  dismiss() {
    this.showBanner.set(false);
    this.deferredPrompt = null;
  }
}
