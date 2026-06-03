import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PwaInstallComponent } from './pwa-install.component';
import { FoodTrackerService } from '../services/food-tracker.service';
import { CATEGORIES, FoodCategory } from '../models/food-item.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PwaInstallComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly svc = inject(FoodTrackerService);
  readonly categories = CATEGORIES;

  activeFilter = signal('all');
  activeCat    = signal('all');
  searchQuery  = signal('');
  showForm     = signal(false);
  toastMsg     = signal('');
  toastType    = signal('');
  toastVisible = signal(false);

  // form fields
  formName   = signal('');
  formCat    = signal<FoodCategory>('dairy');
  formExpiry = signal(this.svc.defaultExpiry());
  formQty    = signal(1);
  formUnit   = signal('');
  formNote   = signal('');
  formError  = signal('');

  readonly displayItems = computed(() =>
    this.svc.filtered(this.activeFilter(), this.activeCat(), this.searchQuery())
  );

  setFilter(f: string) { this.activeFilter.set(f); }
  setCat(c: string)    { this.activeCat.set(c); }
  setSearch(v: string) { this.searchQuery.set(v); }

  toggleForm() { this.showForm.update(v => !v); this.formError.set(''); }

  submitForm() {
    const name = this.formName().trim();
    if (!name || !this.formExpiry()) { this.formError.set('Food name and expiry date are required.'); return; }
    this.svc.addItem({
      name, cat: this.formCat(), qty: this.formQty() || 1,
      unit: this.formUnit().trim() || 'pcs',
      expiry: this.formExpiry(), note: this.formNote().trim(), addedVia: 'manual'
    });
    this.formName.set(''); this.formExpiry.set(this.svc.defaultExpiry());
    this.formQty.set(1); this.formUnit.set(''); this.formNote.set('');
    this.formCat.set('dairy'); this.formError.set('');
    this.showForm.set(false);
    this.toast('✅ Item added!', 'success');
  }

  deleteItem(id: number, name: string) {
    this.svc.deleteItem(id);
    this.toast(`🗑 "${name}" removed`, 'danger');
  }

  statusIcon(s: string) {
    return s === 'expired' ? 'ti-alert-circle' : s === 'expires-soon' ? 'ti-clock' : 'ti-circle-check';
  }

  foodCats() { return CATEGORIES.filter(c => c.id !== 'all'); }

  private toastTimer: any;
  toast(msg: string, type = '') {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg.set(msg); this.toastType.set(type); this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 2800);
  }
}
