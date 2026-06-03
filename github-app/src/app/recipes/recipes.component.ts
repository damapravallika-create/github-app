import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodTrackerService } from '../services/food-tracker.service';
import { Recipe } from '../models/food-item.model';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss',
})
export class RecipesComponent {
  svc = inject(FoodTrackerService);

  activeTab  = signal<'suggested' | 'all'>('suggested');
  selected   = signal<Recipe | null>(null);
  toastMsg   = signal('');
  toastVisible = signal(false);

  setTab(t: 'suggested' | 'all') { this.activeTab.set(t); }
  openRecipe(r: Recipe)  { this.selected.set(r); }
  closeRecipe()          { this.selected.set(null); }

  toggleSave(id: number) {
    this.svc.toggleSaveRecipe(id);
    this.toast(this.svc.isRecipeSaved(id) ? '❤️ Recipe saved!' : '💔 Recipe unsaved');
  }

  diffColor(d: string) {
    return d === 'Easy' ? '#76c442' : d === 'Medium' ? '#f5a623' : '#e74c3c';
  }

  private toastTimer: any;
  toast(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg.set(msg); this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 2200);
  }
}
