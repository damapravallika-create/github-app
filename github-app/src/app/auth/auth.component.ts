import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  constructor(private router: Router) {}

  page = signal<'splash' | 'login' | 'signup' | 'forgot'>('splash');

  // Login
  loginEmail    = signal('');
  loginPassword = signal('');
  loginError    = signal('');
  loginLoading  = signal(false);
  showLoginPwd  = signal(false);

  // Signup
  signupName     = signal('');
  signupEmail    = signal('');
  signupPassword = signal('');
  signupConfirm  = signal('');
  signupError    = signal('');
  signupLoading  = signal(false);
  showSignupPwd  = signal(false);
  agreeTerms     = signal(false);

  // Forgot
  forgotEmail   = signal('');
  forgotSent    = signal(false);
  forgotLoading = signal(false);

  // ── Page nav ─────────────────────────────────────────────────────
  goToLogin()  { this.page.set('login');  }
  goToSignup() { this.page.set('signup'); }
  goToForgot() { this.page.set('forgot'); }

  // ── Toggles ──────────────────────────────────────────────────────
  toggleLoginPwd()  { this.showLoginPwd.set(!this.showLoginPwd()); }
  toggleSignupPwd() { this.showSignupPwd.set(!this.showSignupPwd()); }
  toggleTerms()     { this.agreeTerms.set(!this.agreeTerms()); }

  // ── Login ─────────────────────────────────────────────────────────
  login() {
    this.loginError.set('');
    const email = this.loginEmail().trim();
    const pwd   = this.loginPassword();
    if (!email || !pwd)            { this.loginError.set('Please enter your email and password.'); return; }
    if (!this.isValidEmail(email)) { this.loginError.set('Please enter a valid email address.'); return; }
    if (pwd.length < 6)            { this.loginError.set('Password must be at least 6 characters.'); return; }
    this.loginLoading.set(true);
    setTimeout(() => {
      this.loginLoading.set(false);
      localStorage.setItem('sfet_user', JSON.stringify({ name: email.split('@')[0], email }));
      this.router.navigate(['/']);
    }, 1500);
  }

  googleLogin() {
    this.loginLoading.set(true);
    setTimeout(() => {
      this.loginLoading.set(false);
      localStorage.setItem('sfet_user', JSON.stringify({ name: 'Google User', email: 'user@gmail.com' }));
      this.router.navigate(['/']);
    }, 1200);
  }

  // ── Signup ────────────────────────────────────────────────────────
  signup() {
    this.signupError.set('');
    const name  = this.signupName().trim();
    const email = this.signupEmail().trim();
    const pwd   = this.signupPassword();
    const conf  = this.signupConfirm();
    if (!name)                     { this.signupError.set('Please enter your full name.'); return; }
    if (!email)                    { this.signupError.set('Please enter your email address.'); return; }
    if (!this.isValidEmail(email)) { this.signupError.set('Please enter a valid email address.'); return; }
    if (pwd.length < 6)            { this.signupError.set('Password must be at least 6 characters.'); return; }
    if (pwd !== conf)              { this.signupError.set('Passwords do not match.'); return; }
    if (!this.agreeTerms())        { this.signupError.set('Please agree to Terms & Privacy Policy.'); return; }
    this.signupLoading.set(true);
    setTimeout(() => {
      this.signupLoading.set(false);
      localStorage.setItem('sfet_user', JSON.stringify({ name, email }));
      this.router.navigate(['/']);
    }, 1500);
  }

  googleSignup() { this.googleLogin(); }

  // ── Forgot ────────────────────────────────────────────────────────
  sendReset() {
    if (!this.forgotEmail().trim()) return;
    this.forgotLoading.set(true);
    setTimeout(() => { this.forgotLoading.set(false); this.forgotSent.set(true); }, 1500);
  }

  // ── Helpers ───────────────────────────────────────────────────────
  private isValidEmail(e: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  pwdStrength(pwd: string): { label: string; color: string; width: number } {
    if (!pwd) return { label: '', color: '#2d4a2d', width: 0 };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: 'Weak',   color: '#e74c3c', width: 25  },
      { label: 'Fair',   color: '#f5a623', width: 50  },
      { label: 'Good',   color: '#f5c842', width: 75  },
      { label: 'Strong', color: '#4caf50', width: 100 },
    ];
    return levels[Math.min(score, 3)];
  }
}
