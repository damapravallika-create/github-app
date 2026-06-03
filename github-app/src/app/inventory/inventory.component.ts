import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FoodTrackerService } from '../services/food-tracker.service';

type Location = 'fridge' | 'pantry' | 'freezer' | 'counter';

const LOCATIONS: { id: Location; label: string; icon: string; emoji: string }[] = [
  { id: 'fridge',  label: 'Fridge',   icon: 'ti-snowflake', emoji: '🧊' },
  { id: 'pantry',  label: 'Pantry',   icon: 'ti-archive',   emoji: '🗄️' },
  { id: 'freezer', label: 'Freezer',  icon: 'ti-temperature-minus', emoji: '❄️' },
  { id: 'counter', label: 'Counter',  icon: 'ti-home',      emoji: '🍽️' },
];

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent {
  svc = inject(FoodTrackerService);
  locations = LOCATIONS;
  activeLocation = signal<Location | 'all'>('all');
  searchQ = signal('');

  // Batch tracking map: itemId -> { batch, mfg }
  batchData = signal<Record<number, { batch: string; mfg: string }>>({});
  editBatchId = signal<number | null>(null);
  batchInput  = signal('');
  mfgInput    = signal('');

  readonly filtered = computed(() => {
    const items = this.svc.items();
    const loc = this.activeLocation();
    const q   = this.searchQ().toLowerCase();
    return items.filter(i => {
      const matchLoc = loc === 'all' || this.guessLocation(i.cat) === loc;
      const matchQ   = !q || i.name.toLowerCase().includes(q);
      return matchLoc && matchQ;
    }).sort((a, b) => this.svc.daysUntil(a.expiry) - this.svc.daysUntil(b.expiry));
  });

  readonly countByLocation = computed(() => {
    const items = this.svc.items();
    const counts: Record<string, number> = { all: items.length };
    LOCATIONS.forEach(l => {
      counts[l.id] = items.filter(i => this.guessLocation(i.cat) === l.id).length;
    });
    return counts;
  });

  guessLocation(cat: string): Location {
    if (['dairy','meat','beverages','leftovers'].includes(cat)) return 'fridge';
    if (['frozen'].includes(cat)) return 'freezer';
    if (['produce'].includes(cat)) return 'counter';
    return 'pantry';
  }

  locationOf(cat: string) {
    return LOCATIONS.find(l => l.id === this.guessLocation(cat));
  }

  startEditBatch(id: number) {
    const data = this.batchData()[id];
    this.batchInput.set(data?.batch || '');
    this.mfgInput.set(data?.mfg || '');
    this.editBatchId.set(id);
  }

  saveBatch(id: number) {
    this.batchData.update(d => ({
      ...d,
      [id]: { batch: this.batchInput(), mfg: this.mfgInput() }
    }));
    this.editBatchId.set(null);
  }

  getBatch(id: number) { return this.batchData()[id]; }
}
