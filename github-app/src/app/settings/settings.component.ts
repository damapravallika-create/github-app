import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page">
  <div class="page-head">
    <div class="page-title"><i class="ti ti-settings"></i> Settings</div>
    <div class="page-sub">Customise your Smart Food Expiry Tracker</div>
  </div>

  <!-- Alerts -->
  <div class="settings-section">
    <div class="sec-title"><i class="ti ti-bell"></i> Expiry Alerts</div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Alert 3 days before</div>
        <div class="setting-desc">Get notified 3 days before expiry</div>
      </div>
      <div class="toggle" [class.on]="alert3()" (click)="toggle3()"><div class="toggle-thumb"></div></div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Alert 1 day before</div>
        <div class="setting-desc">Final reminder 1 day before expiry</div>
      </div>
      <div class="toggle" [class.on]="alert1()" (click)="toggle1()"><div class="toggle-thumb"></div></div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Expired item alerts</div>
        <div class="setting-desc">Notify when items have already expired</div>
      </div>
      <div class="toggle" [class.on]="alertExp()" (click)="toggleExp()"><div class="toggle-thumb"></div></div>
    </div>
  </div>

  <!-- Recipes -->
  <div class="settings-section">
    <div class="sec-title"><i class="ti ti-tools-kitchen-2"></i> Recipe Suggestions</div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">AI Recipe Engine</div>
        <div class="setting-desc">Smart suggestions based on expiring items</div>
      </div>
      <div class="toggle" [class.on]="aiRecipes()" (click)="toggleAi()"><div class="toggle-thumb"></div></div>
    </div>
    <div class="setting-row">
      <div class="setting-info">
        <div class="setting-name">Meal suggestions</div>
        <div class="setting-desc">Get daily meal plan ideas</div>
      </div>
      <div class="toggle" [class.on]="mealPlan()" (click)="toggleMeal()"><div class="toggle-thumb"></div></div>
    </div>
  </div>

  <!-- Plan -->
  <div class="settings-section">
    <div class="sec-title"><i class="ti ti-crown"></i> Plan</div>

    <div class="plan-card free">
      <div class="plan-badge">✅ Current: Free</div>
      <div class="plan-price">₹0 <span>/ forever</span></div>
      <div class="plan-features">
        <div class="plan-feat"><i class="ti ti-check"></i> Basic food tracking</div>
        <div class="plan-feat"><i class="ti ti-check"></i> Manual item entry</div>
        <div class="plan-feat"><i class="ti ti-check"></i> Expiry alerts</div>
        <div class="plan-feat"><i class="ti ti-check"></i> AI Recipe suggestions</div>
        <div class="plan-feat muted"><i class="ti ti-lock"></i> AI Meal Planner</div>
        <div class="plan-feat muted"><i class="ti ti-lock"></i> Cloud Sync</div>
        <div class="plan-feat muted"><i class="ti ti-lock"></i> GS1 QR Codes</div>
        <div class="plan-feat muted"><i class="ti ti-lock"></i> Retailer Deals</div>
      </div>
    </div>

    <div class="plan-card premium">
      <div class="plan-badge">✨ Premium</div>
      <div class="plan-price">₹199 <span>/ month</span></div>
      <div class="plan-yearly">or ₹1,499 / year <span class="save-tag">Save 37%</span></div>
      <div class="plan-features">
        <div class="plan-feat"><i class="ti ti-check"></i> Everything in Free</div>
        <div class="plan-feat"><i class="ti ti-check"></i> AI Meal Planner</div>
        <div class="plan-feat"><i class="ti ti-check"></i> Cloud Sync across devices</div>
        <div class="plan-feat"><i class="ti ti-check"></i> GS1 QR Code scanning</div>
        <div class="plan-feat"><i class="ti ti-check"></i> Retailer Deals & Offers</div>
        <div class="plan-feat"><i class="ti ti-check"></i> Priority support</div>
      </div>
      <button class="btn-upgrade" (click)="openUpgrade()">
        <i class="ti ti-crown"></i> Upgrade to Premium — ₹199/mo
      </button>
    </div>
  </div>

  <!-- About -->
  <div class="settings-section">
    <div class="sec-title"><i class="ti ti-info-circle"></i> About</div>
    <div class="about-row"><span>App Name</span><span>Smart Food Expiry Tracker</span></div>
    <div class="about-row"><span>Version</span><span>1.0.0</span></div>
    <div class="about-row"><span>Tech Stack</span><span>Angular 17 + Firebase</span></div>
    <div class="about-row"><span>Data Source</span><span>Open Food Facts API</span></div>
    <div class="about-row"><span>Built with</span><span>❤️ for smart kitchens</span></div>
  </div>

  <!-- Logout -->
  <div class="settings-section">
    <button class="btn-logout" (click)="logout()">
      <i class="ti ti-logout"></i> Sign Out
    </button>
  </div>
</div>

<!-- Upgrade modal -->
@if (showUpgradeModal()) {
  <div class="modal-overlay" (click)="closeUpgrade()">
    <div class="modal" (click)="$event.stopPropagation()">
      <button class="modal-close" (click)="closeUpgrade()"><i class="ti ti-x"></i></button>

      <div class="modal-header">
        <div class="modal-emoji">✨</div>
        <div class="modal-title">Upgrade to Premium</div>
        <div class="modal-sub">Choose your plan</div>
      </div>

      <!-- Plan toggle -->
      <div class="plan-toggle">
        <button class="ptoggle-btn" [class.active]="billingCycle()==='monthly'" (click)="billingCycle.set('monthly')">Monthly</button>
        <button class="ptoggle-btn" [class.active]="billingCycle()==='yearly'" (click)="billingCycle.set('yearly')">
          Yearly <span class="save-badge">Save 37%</span>
        </button>
      </div>

      <div class="modal-price">
        @if (billingCycle() === 'monthly') {
          <span class="price-big">₹199</span><span class="price-per"> / month</span>
        } @else {
          <span class="price-big">₹1,499</span><span class="price-per"> / year</span>
          <div class="price-note">Just ₹125/month — save ₹889!</div>
        }
      </div>

      <div class="modal-features">
        <div class="mf"><i class="ti ti-check"></i> AI Meal Planner</div>
        <div class="mf"><i class="ti ti-check"></i> Cloud Sync across all devices</div>
        <div class="mf"><i class="ti ti-check"></i> GS1 QR Code scanning</div>
        <div class="mf"><i class="ti ti-check"></i> Exclusive Retailer Deals</div>
        <div class="mf"><i class="ti ti-check"></i> Priority customer support</div>
        <div class="mf"><i class="ti ti-check"></i> Cancel anytime</div>
      </div>

      <button class="btn-pay" (click)="proceedPayment()">
        <i class="ti ti-shield-check"></i>
        Proceed to Payment — {{ billingCycle()==='monthly' ? '₹199/mo' : '₹1,499/yr' }}
      </button>

      <div class="modal-note">
        <i class="ti ti-lock"></i> Secure payment · Cancel anytime · 7-day free trial
      </div>

      <!-- Payment options -->
      <div class="payment-methods">
        <div class="pm-label">Accepted payments</div>
        <div class="pm-icons">
          <span class="pm-badge">UPI</span>
          <span class="pm-badge">GPay</span>
          <span class="pm-badge">PhonePe</span>
          <span class="pm-badge">Paytm</span>
          <span class="pm-badge">Card</span>
          <span class="pm-badge">Net Banking</span>
        </div>
      </div>
    </div>
  </div>
}

<!-- Payment processing modal -->
@if (showPaymentModal()) {
  <div class="modal-overlay">
    <div class="modal pay-modal">
      <div class="pay-icon"><i class="ti ti-shield-check"></i></div>
      <div class="modal-title">Complete Payment</div>
      <div class="pay-amount">{{ billingCycle()==='monthly' ? '₹199' : '₹1,499' }}</div>

      <div class="pay-methods">
        <button class="pay-method-btn" [class.selected]="payMethod()==='upi'" (click)="payMethod.set('upi')">
          <i class="ti ti-device-mobile"></i> UPI / GPay
        </button>
        <button class="pay-method-btn" [class.selected]="payMethod()==='card'" (click)="payMethod.set('card')">
          <i class="ti ti-credit-card"></i> Card
        </button>
      </div>

      @if (payMethod() === 'upi') {
        <div class="upi-section">
          <div class="form-label">Enter UPI ID</div>
          <input class="pay-input" placeholder="yourname@upi" [ngModel]="upiId()" (ngModelChange)="upiId.set($event.toString())" />
        </div>
      }
      @if (payMethod() === 'card') {
        <div class="card-section">
          <input class="pay-input" placeholder="Card number" [ngModel]="cardNum()" (ngModelChange)="cardNum.set($event.toString())" />
          <div class="card-row">
            <input class="pay-input" placeholder="MM/YY" [ngModel]="cardExp()" (ngModelChange)="cardExp.set($event.toString())" />
            <input class="pay-input" placeholder="CVV" [ngModel]="cardCvv()" (ngModelChange)="cardCvv.set($event.toString())" />
          </div>
        </div>
      }

      <button class="btn-pay" (click)="simulatePayment()" [disabled]="paying()">
        @if (paying()) { <i class="ti ti-loader-2 spin"></i> Processing… }
        @else { <i class="ti ti-lock"></i> Pay Now }
      </button>
      <button class="btn-cancel-pay" (click)="showPaymentModal.set(false)">Cancel</button>
    </div>
  </div>
}

<!-- Success modal -->
@if (showSuccess()) {
  <div class="modal-overlay">
    <div class="modal success-modal">
      <div class="success-icon">🎉</div>
      <div class="modal-title">Welcome to Premium!</div>
      <div class="modal-sub">Your 7-day free trial has started. Enjoy all premium features!</div>
      <button class="btn-pay" (click)="showSuccess.set(false)">Start Exploring</button>
    </div>
  </div>
}
  `,
  styles: [`
    :host{display:block}
    .page{padding:0 1rem 80px;max-width:700px;margin:0 auto}
    .page-head{padding:1.25rem 0 1rem;border-bottom:1px solid #2d4a2d;margin-bottom:1.25rem}
    .page-title{font-family:'DM Serif Display',serif;font-size:22px;color:#f0ead6;display:flex;align-items:center;gap:8px}
    .page-title i{font-size:20px;color:#4caf50}
    .page-sub{font-size:12px;color:#6a8f6a;margin-top:4px}
    .settings-section{background:#162416;border:1px solid #2d4a2d;border-radius:12px;padding:1rem 1.25rem;margin-bottom:1rem}
    .sec-title{font-size:13px;font-weight:700;color:#e8f0e8;margin-bottom:.75rem;display:flex;align-items:center;gap:6px}
    .sec-title i{color:#4caf50;font-size:15px}
    .setting-row{display:flex;align-items:center;justify-content:space-between;padding:.6rem 0;border-bottom:1px solid #1a2e1a}
    .setting-row:last-child{border-bottom:none}
    .setting-name{font-size:13px;color:#e8f0e8;font-weight:500}
    .setting-desc{font-size:11px;color:#6a8f6a;margin-top:2px}
    .toggle{width:40px;height:22px;background:#2d4a2d;border-radius:11px;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
    .toggle.on{background:#4caf50}
    .toggle-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;background:#f0ead6;border-radius:50%;transition:transform .2s}
    .toggle.on .toggle-thumb{transform:translateX(18px)}

    .plan-card{background:#0f1a0f;border:1px solid #2d4a2d;border-radius:12px;padding:1rem;margin-bottom:.75rem}
    .plan-card.premium{border-color:#f5a623;background:#1a1708}
    .plan-badge{font-size:11px;font-weight:700;color:#76c442;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
    .plan-card.premium .plan-badge{color:#f5a623}
    .plan-price{font-size:28px;font-weight:800;color:#f0ead6;margin-bottom:2px}
    .plan-price span{font-size:14px;font-weight:400;color:#6a8f6a}
    .plan-yearly{font-size:12px;color:#8aab8a;margin-bottom:.75rem}
    .save-tag{background:#2d4a2d;color:#76c442;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700;margin-left:4px}
    .plan-features{display:flex;flex-direction:column;gap:5px;margin-bottom:.75rem}
    .plan-feat{font-size:12px;color:#a0bfa0;display:flex;align-items:center;gap:6px}
    .plan-feat i{font-size:13px;color:#76c442}
    .plan-feat.muted{color:#4a6a4a} .plan-feat.muted i{color:#4a6a4a}
    .btn-upgrade{width:100%;background:linear-gradient(90deg,#f5a623,#e67e22);border:none;color:#0f1a0f;font-family:inherit;font-size:14px;font-weight:700;padding:12px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:opacity .2s}
    .btn-upgrade:hover{opacity:.9}

    .about-row{display:flex;justify-content:space-between;font-size:13px;padding:.5rem 0;border-bottom:1px solid #1a2e1a;color:#8aab8a}
    .about-row:last-child{border-bottom:none} .about-row span:last-child{color:#e8f0e8}

    /* Modal */
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:300;display:flex;align-items:flex-end;justify-content:center;padding:0}
    .modal{background:#162416;border:1px solid #2d4a2d;border-radius:20px 20px 0 0;padding:1.5rem;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;position:relative}
    .modal-close{position:absolute;top:1rem;right:1rem;background:#1a2e1a;border:1px solid #2d4a2d;color:#6a8f6a;border-radius:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px}
    .modal-header{text-align:center;margin-bottom:1.25rem}
    .modal-emoji{font-size:40px;margin-bottom:.5rem}
    .modal-title{font-family:'DM Serif Display',serif;font-size:22px;color:#f0ead6}
    .modal-sub{font-size:13px;color:#6a8f6a;margin-top:4px}

    .plan-toggle{display:flex;gap:6px;background:#0f1a0f;border-radius:10px;padding:4px;margin-bottom:1.25rem}
    .ptoggle-btn{flex:1;background:transparent;border:none;color:#6a8f6a;font-family:inherit;font-size:13px;padding:8px;border-radius:8px;cursor:pointer;font-weight:500;transition:all .2s}
    .ptoggle-btn.active{background:#2d4a2d;color:#f0ead6;font-weight:700}
    .save-badge{background:#4caf50;color:#0f1a0f;font-size:9px;font-weight:700;padding:2px 5px;border-radius:6px;margin-left:4px}

    .modal-price{text-align:center;margin-bottom:1rem}
    .price-big{font-size:40px;font-weight:800;color:#f0ead6}
    .price-per{font-size:16px;color:#6a8f6a}
    .price-note{font-size:12px;color:#76c442;margin-top:4px}

    .modal-features{display:flex;flex-direction:column;gap:8px;margin-bottom:1.25rem;background:#0f1a0f;border-radius:10px;padding:1rem}
    .mf{font-size:13px;color:#a0bfa0;display:flex;align-items:center;gap:8px}
    .mf i{color:#4caf50;font-size:14px}

    .btn-pay{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;background:linear-gradient(90deg,#f5a623,#e67e22);border:none;color:#0f1a0f;font-family:inherit;font-size:15px;font-weight:700;padding:14px;border-radius:12px;cursor:pointer;margin-bottom:.75rem;transition:opacity .2s}
    .btn-pay:hover:not(:disabled){opacity:.9} .btn-pay:disabled{opacity:.6;cursor:default}

    .modal-note{text-align:center;font-size:11px;color:#6a8f6a;display:flex;align-items:center;justify-content:center;gap:4px;margin-bottom:1rem}
    .modal-note i{font-size:13px}

    .payment-methods{text-align:center}
    .pm-label{font-size:10px;color:#6a8f6a;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
    .pm-icons{display:flex;flex-wrap:wrap;justify-content:center;gap:6px}
    .pm-badge{background:#1a2e1a;border:1px solid #2d4a2d;color:#76c442;font-size:11px;font-weight:600;padding:3px 10px;border-radius:6px}

    /* Payment modal */
    .pay-modal{border-radius:20px;margin:auto}
    .pay-icon{text-align:center;font-size:36px;color:#4caf50;margin-bottom:.5rem}
    .pay-amount{text-align:center;font-size:32px;font-weight:800;color:#f0ead6;margin:.5rem 0 1rem}
    .pay-methods{display:flex;gap:8px;margin-bottom:1rem}
    .pay-method-btn{flex:1;background:#0f1a0f;border:1px solid #2d4a2d;color:#6a8f6a;font-family:inherit;font-size:13px;padding:10px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s}
    .pay-method-btn.selected{border-color:#4caf50;color:#76c442;background:#1d3a1d}
    .upi-section,.card-section{margin-bottom:1rem;display:flex;flex-direction:column;gap:8px}
    .card-row{display:flex;gap:8px}
    .pay-input{background:#0f1a0f;border:1px solid #2d4a2d;color:#e8f0e8;border-radius:8px;padding:10px 12px;font-family:inherit;font-size:14px;outline:none;width:100%;transition:border-color .2s}
    .pay-input:focus{border-color:#4caf50} .pay-input::placeholder{color:#6a8f6a}
    .btn-cancel-pay{width:100%;background:transparent;border:1px solid #2d4a2d;color:#6a8f6a;font-family:inherit;font-size:14px;padding:12px;border-radius:12px;cursor:pointer}

    /* Success */
    .success-modal{border-radius:20px;margin:auto;text-align:center}
    .success-icon{font-size:56px;margin-bottom:.75rem}

    .spin{animation:spin 1s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}
    .btn-logout{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:#3d1a1a;border:1px solid #e74c3c;color:#e87070;font-family:inherit;font-size:14px;font-weight:600;padding:12px;border-radius:10px;cursor:pointer;transition:all .2s}
    .btn-logout:hover{background:#4d2a2a;color:#ff8080}

    @media(max-width:500px){.modal-overlay{align-items:flex-end}}
  `]
})
export class SettingsComponent {
  alert3    = signal(true);
  alert1    = signal(true);
  alertExp  = signal(true);
  aiRecipes = signal(true);
  mealPlan  = signal(false);

  showUpgradeModal  = signal(false);
  showPaymentModal  = signal(false);
  showSuccess       = signal(false);
  billingCycle      = signal<'monthly'|'yearly'>('monthly');
  payMethod         = signal<'upi'|'card'>('upi');
  upiId             = signal('');
  cardNum           = signal('');
  cardExp           = signal('');
  cardCvv           = signal('');
  paying            = signal(false);

  toggle3()    { this.alert3.set(!this.alert3()); }
  toggle1()    { this.alert1.set(!this.alert1()); }
  toggleExp()  { this.alertExp.set(!this.alertExp()); }
  toggleAi()   { this.aiRecipes.set(!this.aiRecipes()); }
  toggleMeal() { this.mealPlan.set(!this.mealPlan()); }
  private router = inject(Router);
  logout() { localStorage.removeItem('sfet_user'); this.router.navigate(['/auth']); }

  openUpgrade()  { this.showUpgradeModal.set(true); }
  closeUpgrade() { this.showUpgradeModal.set(false); }

  proceedPayment() {
    this.showUpgradeModal.set(false);
    this.showPaymentModal.set(true);
    this.payMethod.set('upi');
    this.upiId.set(''); this.cardNum.set(''); this.cardExp.set(''); this.cardCvv.set('');
  }

  simulatePayment() {
    this.paying.set(true);
    setTimeout(() => {
      this.paying.set(false);
      this.showPaymentModal.set(false);
      this.showSuccess.set(true);
    }, 2000);
  }
}
