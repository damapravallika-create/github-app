import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router     = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR (Node.js), localStorage doesn't exist — allow through
  if (!isPlatformBrowser(platformId)) return true;

  const user = localStorage.getItem('sfet_user');
  if (user) return true;
  router.navigate(['/auth']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const router     = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR, allow through
  if (!isPlatformBrowser(platformId)) return true;

  const user = localStorage.getItem('sfet_user');
  if (!user) return true;
  router.navigate(['/']);
  return false;
};
