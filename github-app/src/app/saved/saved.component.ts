import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodTrackerService } from '../services/food-tracker.service';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="page">
  <div class="page-head">
    <div class="page-title"><i class="ti ti-heart"></i> Saved Recipes</div>
    <div class="page-sub">Your favourite recipes, always at hand</div>
  </div>

  @if (svc.getSavedRecipes().length === 0) {
    <div class="empty">
      <i class="ti ti-heart"></i>
      <p>No saved recipes yet.</p>
      <p class="sub">Go to Recipes and tap ❤️ to save your favourites.</p>
    </div>
  } @else {
    <div class="recipe-grid">
      @for (recipe of svc.getSavedRecipes(); track recipe.id) {
        <div class="recipe-card">
          <div class="recipe-emoji">{{ recipe.emoji }}</div>
          <div class="recipe-title">{{ recipe.title }}</div>
          <div class="recipe-desc">{{ recipe.description }}</div>
          <div class="recipe-meta">
            <span><i class="ti ti-clock"></i> {{ recipe.time }}</span>
            <span>{{ recipe.difficulty }}</span>
          </div>
          <div class="ingr">
            @for (i of recipe.ingredients; track i) { <span class="chip">{{ i }}</span> }
          </div>
          <button class="unsave-btn" (click)="svc.toggleSaveRecipe(recipe.id)">
            <i class="ti ti-heart-filled"></i> Unsave
          </button>
        </div>
      }
    </div>
  }
</div>
  `,
  styles: [`
    :host{display:block}
    .page{padding:0 1rem 80px;max-width:900px;margin:0 auto}
    .page-head{padding:1.25rem 0 1rem;border-bottom:1px solid #2d4a2d;margin-bottom:1.25rem}
    .page-title{font-family:'DM Serif Display',serif;font-size:22px;color:#f0ead6;display:flex;align-items:center;gap:8px;i{font-size:20px;color:#e74c3c}}
    .page-sub{font-size:12px;color:#6a8f6a;margin-top:4px}
    .empty{text-align:center;padding:3rem 1rem;color:#6a8f6a;i{font-size:44px;display:block;margin-bottom:.75rem;opacity:.4}p{font-size:14px}.sub{font-size:12px;margin-top:4px}}
    .recipe-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
    .recipe-card{background:#162416;border:1px solid #2d4a2d;border-radius:12px;padding:1.1rem}
    .recipe-emoji{font-size:30px;margin-bottom:.5rem}
    .recipe-title{font-size:15px;font-weight:600;color:#f0ead6;margin-bottom:3px}
    .recipe-desc{font-size:12px;color:#6a8f6a;margin-bottom:.5rem;line-height:1.4}
    .recipe-meta{display:flex;gap:12px;font-size:11px;color:#8aab8a;margin-bottom:.6rem;i{margin-right:3px}}
    .ingr{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:.75rem}
    .chip{background:#1a2e1a;border:1px solid #2d4a2d;color:#76c442;font-size:10px;padding:2px 7px;border-radius:6px}
    .unsave-btn{background:#3d1a1a;border:1px solid #e74c3c;color:#e87070;font-family:inherit;font-size:12px;padding:6px 14px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .2s;
      &:hover{background:#4d2a2a}
    }
  `]
})
export class SavedComponent {
  svc = inject(FoodTrackerService);
}
