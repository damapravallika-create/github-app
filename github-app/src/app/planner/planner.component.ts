import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodTrackerService } from '../services/food-tracker.service';

interface GroceryItem { id: number; name: string; qty: string; checked: boolean; cat: string; }

@Component({
  selector: 'app-planner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planner.component.html',
  styleUrl: './planner.component.scss',
})
export class PlannerComponent {
  svc = inject(FoodTrackerService);
  activeTab = signal<'grocery'|'meal'>('grocery');
  groceryItems = signal<GroceryItem[]>([]);
  newItem = signal('');
  newQty  = signal('');
  nextId  = signal(1);
  toastMsg = signal('');
  toastVisible = signal(false);

  readonly suggestedGrocery = computed(() => {
    const expiring = this.svc.items()
      .filter(i => this.svc.daysUntil(i.expiry) <= 3)
      .map(i => ({ id: this.nextId(), name: i.name, qty: `${i.qty} ${i.unit}`, checked: false, cat: i.cat }));
    return expiring.slice(0, 8);
  });

  readonly weekMeals = computed(() => {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const recipes = this.svc.allRecipes();
    return days.map((day, i) => ({
      day,
      breakfast: recipes[i % recipes.length]?.title || 'Choose a meal',
      lunch:     recipes[(i+2) % recipes.length]?.title || 'Choose a meal',
      dinner:    recipes[(i+4) % recipes.length]?.title || 'Choose a meal',
      emoji:     recipes[i % recipes.length]?.emoji || '🍽️',
    }));
  });

  addToGrocery() {
    const name = this.newItem().trim();
    if (!name) return;
    this.groceryItems.update(list => [...list, {
      id: this.nextId(), name, qty: this.newQty().trim() || '1 pcs', checked: false, cat: 'pantry'
    }]);
    this.nextId.update(n => n + 1);
    this.newItem.set(''); this.newQty.set('');
  }

  addSuggested(item: GroceryItem) {
    if (this.groceryItems().some(g => g.name === item.name)) return;
    this.groceryItems.update(list => [...list, { ...item, id: this.nextId() }]);
    this.nextId.update(n => n + 1);
    this.toast('Added to grocery list!');
  }

  toggleCheck(id: number) {
    this.groceryItems.update(list => list.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  }

  removeItem(id: number) {
    this.groceryItems.update(list => list.filter(i => i.id !== id));
  }

  clearChecked() {
    this.groceryItems.update(list => list.filter(i => !i.checked));
  }

  hasCheckedItems() { return this.groceryItems().some(i => i.checked); }
  get uncheckedCount() { return this.groceryItems().filter(i => !i.checked).length; }

  private toastTimer: any;
  toast(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg.set(msg); this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 2000);
  }
}
