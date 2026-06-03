import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodTrackerService } from '../services/food-tracker.service';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
})
export class InsightsComponent {
  svc = inject(FoodTrackerService);

  readonly catBreakdown = computed(() => {
    const items = this.svc.items();
    if (!items.length) return [];
    const cats: Record<string, number> = {};
    items.forEach(i => { cats[i.cat] = (cats[i.cat] || 0) + 1; });
    return Object.entries(cats)
      .map(([cat, count]) => ({ cat, count, pct: Math.round((count / items.length) * 100) }))
      .sort((a, b) => b.count - a.count);
  });

  readonly statusBreakdown = computed(() => [
    { label:'Fresh',    count:this.svc.freshCount(),   color:'#76c442', pct:this.pct(this.svc.freshCount())   },
    { label:'Expiring', count:this.svc.soonCount(),    color:'#f5a623', pct:this.pct(this.svc.soonCount())    },
    { label:'Expired',  count:this.svc.expiredCount(), color:'#e74c3c', pct:this.pct(this.svc.expiredCount()) },
  ]);

  readonly wasteScore = computed(() => {
    const total = this.svc.totalCount();
    if (!total) return 100;
    return Math.round(((total - this.svc.expiredCount()) / total) * 100);
  });

  readonly moneySaved = computed(() => this.svc.freshCount() * 50);

  readonly itemsTracked = computed(() => this.svc.totalCount());

  readonly topExpiring = computed(() =>
    this.svc.items()
      .filter(i => { const d = this.svc.daysUntil(i.expiry); return d >= 0 && d <= 7; })
      .sort((a,b) => this.svc.daysUntil(a.expiry) - this.svc.daysUntil(b.expiry))
      .slice(0, 5)
  );

  private pct(count: number) {
    const total = this.svc.totalCount();
    return total ? Math.round((count / total) * 100) : 0;
  }

  scoreColor() {
    const s = this.wasteScore();
    return s >= 80 ? '#76c442' : s >= 60 ? '#f5a623' : '#e74c3c';
  }

  scoreLabel() {
    const s = this.wasteScore();
    return s >= 80 ? 'Excellent! 🎉' : s >= 60 ? 'Good 👍' : s >= 40 ? 'Needs attention ⚠️' : 'Poor 🚨';
  }
}
