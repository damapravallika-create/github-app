import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodTrackerService } from '../services/food-tracker.service';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nutrition.component.html',
  styleUrl: './nutrition.component.scss',
})
export class NutritionComponent {
  svc = inject(FoodTrackerService);
  selected = signal<number | null>(null);

  readonly nutritionMap: Record<string, any> = {
    dairy:     { calories: 150, protein: 8,  carbs: 12, fat: 8,  fiber: 0, tip: 'Good source of calcium and protein.' },
    produce:   { calories: 45,  protein: 2,  carbs: 9,  fat: 0,  fiber: 4, tip: 'High in vitamins, minerals and fiber.' },
    meat:      { calories: 250, protein: 26, carbs: 0,  fat: 15, fiber: 0, tip: 'Rich in protein and B12 vitamins.' },
    bakery:    { calories: 200, protein: 6,  carbs: 38, fat: 3,  fiber: 2, tip: 'Choose whole grain for more fiber.' },
    pantry:    { calories: 180, protein: 4,  carbs: 35, fat: 2,  fiber: 3, tip: 'Check sodium content on the label.' },
    frozen:    { calories: 160, protein: 8,  carbs: 20, fat: 5,  fiber: 2, tip: 'Frozen vegetables retain most nutrients.' },
    beverages: { calories: 80,  protein: 0,  carbs: 20, fat: 0,  fiber: 0, tip: 'Prefer water and natural juices.' },
    leftovers: { calories: 200, protein: 10, carbs: 25, fat: 8,  fiber: 2, tip: 'Consume within 2-3 days.' },
    medicine:  { calories: 0,   protein: 0,  carbs: 0,  fat: 0,  fiber: 0, tip: 'Follow prescribed dosage.' },
  };

  getNutrition(cat: string) { return this.nutritionMap[cat] || this.nutritionMap['pantry']; }

  readonly totalNutrition = computed(() => {
    const items = this.svc.items().filter(i => this.svc.getStatus(i.expiry) !== 'expired');
    return items.reduce((acc, item) => {
      const n = this.getNutrition(item.cat);
      acc.calories += n.calories;
      acc.protein  += n.protein;
      acc.carbs    += n.carbs;
      acc.fat      += n.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  });

  barWidth(val: number, max: number) { return Math.min(100, (val / max) * 100); }
}
