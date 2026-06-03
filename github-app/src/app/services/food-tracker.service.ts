import { Injectable, signal, computed } from '@angular/core';
import { FoodItem, FoodCategory, ExpiryStatus, Alert, Recipe } from '../models/food-item.model';

const STORAGE_KEY  = 'sfet_items_v2';
const SAVED_KEY    = 'sfet_saved_recipes';
const ALERTS_KEY   = 'sfet_alerts';

function addDays(n: number): string {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const SEED: FoodItem[] = [
  { id:1,  name:'Full Cream Milk',  cat:'dairy',     qty:2,   unit:'L',    expiry:addDays(3),   note:'',              addedVia:'manual' },
  { id:2,  name:'Spinach',          cat:'produce',   qty:200, unit:'g',    expiry:addDays(1),   note:'',              addedVia:'manual' },
  { id:3,  name:'Chicken Breast',   cat:'meat',      qty:500, unit:'g',    expiry:addDays(-1),  note:'Marinated',     addedVia:'barcode'},
  { id:4,  name:'Sourdough Bread',  cat:'bakery',    qty:1,   unit:'loaf', expiry:addDays(5),   note:'',              addedVia:'manual' },
  { id:5,  name:'Greek Yoghurt',    cat:'dairy',     qty:400, unit:'g',    expiry:addDays(8),   note:'',              addedVia:'manual' },
  { id:6,  name:'Tomatoes',         cat:'produce',   qty:6,   unit:'pcs',  expiry:addDays(4),   note:'',              addedVia:'manual' },
  { id:7,  name:'Orange Juice',     cat:'beverages', qty:1,   unit:'L',    expiry:addDays(0),   note:'',              addedVia:'barcode'},
  { id:8,  name:'Basmati Rice',     cat:'pantry',    qty:1,   unit:'kg',   expiry:addDays(120), note:'',              addedVia:'manual' },
  { id:9,  name:'Salmon Fillet',    cat:'meat',      qty:300, unit:'g',    expiry:addDays(2),   note:'',              addedVia:'ocr'    },
  { id:10, name:'Leftover Curry',   cat:'leftovers', qty:1,   unit:'box',  expiry:addDays(-2),  note:'Fridge shelf 2',addedVia:'manual' },
  { id:11, name:'Cheddar Cheese',   cat:'dairy',     qty:250, unit:'g',    expiry:addDays(14),  note:'',              addedVia:'barcode'},
  { id:12, name:'Paracetamol',      cat:'medicine',  qty:20,  unit:'tabs', expiry:addDays(180), note:'500mg',         addedVia:'manual' },
];

const RECIPE_DB: Recipe[] = [
  { id:1,  title:'Milkshake',         emoji:'🥤', description:'Creamy blend of milk and fruits.', ingredients:['milk','banana','honey'], usesItems:['Milk','Full Cream Milk'], time:'5 min',  difficulty:'Easy'   },
  { id:2,  title:'Bread Pizza',       emoji:'🍕', description:'Quick pizza on sourdough toast.',  ingredients:['bread','tomato','cheese'], usesItems:['Sourdough Bread','Tomatoes','Cheddar Cheese'], time:'10 min', difficulty:'Easy' },
  { id:3,  title:'Chicken Stir-Fry',  emoji:'🍳', description:'Quick pan-fried chicken with veg.',ingredients:['chicken','spinach','garlic'], usesItems:['Chicken Breast','Spinach'], time:'20 min', difficulty:'Medium' },
  { id:4,  title:'Tomato Salad',      emoji:'🥗', description:'Fresh tomato and yoghurt salad.',  ingredients:['tomatoes','yoghurt','olive oil'], usesItems:['Tomatoes','Greek Yoghurt'], time:'5 min',  difficulty:'Easy'   },
  { id:5,  title:'Salmon Bowl',       emoji:'🐟', description:'Pan-seared salmon on rice.',       ingredients:['salmon','rice','soy sauce'], usesItems:['Salmon Fillet','Basmati Rice'], time:'25 min', difficulty:'Medium' },
  { id:6,  title:'Spinach Smoothie',  emoji:'🥬', description:'Healthy green spinach smoothie.',  ingredients:['spinach','milk','banana'], usesItems:['Spinach','Full Cream Milk'], time:'5 min',  difficulty:'Easy'   },
  { id:7,  title:'Yoghurt Parfait',   emoji:'🫙', description:'Layered yoghurt with fruit.',      ingredients:['yoghurt','fruit','granola'], usesItems:['Greek Yoghurt'], time:'5 min',  difficulty:'Easy'   },
  { id:8,  title:'Curry Rice',        emoji:'🍛', description:'Reheat leftover curry on rice.',   ingredients:['curry','rice'], usesItems:['Leftover Curry','Basmati Rice'], time:'10 min', difficulty:'Easy'   },
  { id:9,  title:'OJ Fruit Punch',    emoji:'🍊', description:'Mix OJ with soda for a fresh punch.',ingredients:['orange juice','soda','mint'], usesItems:['Orange Juice'], time:'3 min',  difficulty:'Easy'   },
  { id:10, title:'Cheese Toast',      emoji:'🧀', description:'Melted cheddar on toasted bread.', ingredients:['bread','cheese'], usesItems:['Sourdough Bread','Cheddar Cheese'], time:'5 min',  difficulty:'Easy'   },
];

@Injectable({ providedIn: 'root' })
export class FoodTrackerService {
  private _items        = signal<FoodItem[]>(this.load(STORAGE_KEY, SEED));
  private _savedRecipes = signal<number[]>(this.load(SAVED_KEY, []));
  private _alerts       = signal<Alert[]>([]);
  private _nextId       = signal<number>(Math.max(...this.load<FoodItem[]>(STORAGE_KEY, SEED).map(i => i.id), 0) + 1);

  readonly items         = this._items.asReadonly();
  readonly savedRecipes  = this._savedRecipes.asReadonly();
  readonly alerts        = this._alerts.asReadonly();

  readonly totalCount    = computed(() => this._items().length);
  readonly expiredCount  = computed(() => this._items().filter(i => this.daysUntil(i.expiry) < 0).length);
  readonly soonCount     = computed(() => this._items().filter(i => { const d = this.daysUntil(i.expiry); return d >= 0 && d <= 3; }).length);
  readonly freshCount    = computed(() => this._items().filter(i => this.daysUntil(i.expiry) > 3).length);
  readonly unreadAlerts  = computed(() => this._alerts().filter(a => !a.read).length);

  readonly urgentItems   = computed(() =>
    this._items()
      .filter(i => this.daysUntil(i.expiry) <= 3)
      .sort((a,b) => this.daysUntil(a.expiry) - this.daysUntil(b.expiry))
      .slice(0, 5)
  );

  readonly suggestedRecipes = computed(() => {
    const names = this._items()
      .filter(i => this.daysUntil(i.expiry) <= 5 && this.daysUntil(i.expiry) >= 0)
      .map(i => i.name.toLowerCase());
    return RECIPE_DB.filter(r =>
      r.usesItems.some(u => names.some(n => n.includes(u.toLowerCase()) || u.toLowerCase().includes(n)))
    ).slice(0, 6);
  });

  readonly allRecipes = computed(() => RECIPE_DB);

  constructor() { this.generateAlerts(); }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  addItem(item: Omit<FoodItem,'id'|'savedAt'>): FoodItem {
    const newItem: FoodItem = { ...item, id: this._nextId(), savedAt: Date.now() };
    this._nextId.update(n => n + 1);
    this.saveItems([...this._items(), newItem]);
    this.generateAlerts();
    return newItem;
  }

  deleteItem(id: number): void {
    this.saveItems(this._items().filter(i => i.id !== id));
    this.generateAlerts();
  }

  // ── Recipe saves ─────────────────────────────────────────────────────────
  toggleSaveRecipe(id: number): void {
    const cur = this._savedRecipes();
    const next = cur.includes(id) ? cur.filter(r => r !== id) : [...cur, id];
    this._savedRecipes.set(next);
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  }

  isRecipeSaved(id: number): boolean {
    return this._savedRecipes().includes(id);
  }

  getSavedRecipes(): Recipe[] {
    return RECIPE_DB.filter(r => this._savedRecipes().includes(r.id));
  }

  // ── Alerts ────────────────────────────────────────────────────────────────
  generateAlerts(): void {
    const alerts: Alert[] = this._items()
      .map(i => ({ days: this.daysUntil(i.expiry), item: i }))
      .filter(({ days }) => days <= 3)
      .map(({ days, item }, idx): Alert => ({
        id: idx + 1,
        itemId: item.id,
        itemName: item.name,
        expiry: item.expiry,
        daysLeft: days,
        read: false,
        type: days < 0 ? 'expired' : days === 0 ? 'critical' : 'warning',
      }));
    this._alerts.set(alerts);
  }

  markAllAlertsRead(): void {
    this._alerts.update(a => a.map(x => ({ ...x, read: true })));
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  daysUntil(dateStr: string): number {
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(dateStr); d.setHours(0,0,0,0);
    return Math.round((d.getTime() - today.getTime()) / 86400000);
  }

  getStatus(dateStr: string): ExpiryStatus {
    const d = this.daysUntil(dateStr);
    return d < 0 ? 'expired' : d <= 3 ? 'expires-soon' : 'fresh';
  }

  getStatusLabel(dateStr: string): string {
    const d = this.daysUntil(dateStr);
    if (d < 0) return `Expired ${Math.abs(d)}d ago`;
    if (d === 0) return 'Expires today!';
    if (d === 1) return 'Expires tomorrow';
    return `${d} days left`;
  }

  getProgressPct(dateStr: string): number {
    const d = this.daysUntil(dateStr);
    return d < 0 ? 100 : Math.min(100, Math.max(0, 100 - (d / 30) * 100));
  }

  countByCategory(catId: string): number {
    return catId === 'all' ? this._items().length : this._items().filter(i => i.cat === catId).length;
  }

  filtered(filter: string, cat: string, search: string): FoodItem[] {
    return this._items()
      .filter(item => {
        const st = this.getStatus(item.expiry);
        if (filter === 'expired' && st !== 'expired') return false;
        if (filter === 'soon' && st !== 'expires-soon') return false;
        if (filter === 'fresh' && st !== 'fresh') return false;
        if (cat !== 'all' && item.cat !== cat) return false;
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a,b) => this.daysUntil(a.expiry) - this.daysUntil(b.expiry));
  }

  formatDate(str: string): string {
    return new Date(str + 'T00:00:00').toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  }

  defaultExpiry(): string { return addDays(7); }

  catEmoji(catId: string): string {
    const map: Record<string, string> = {
      dairy:'🥛', produce:'🥦', meat:'🥩', bakery:'🍞',
      pantry:'🫙', frozen:'🧊', beverages:'🧃', leftovers:'🍱', medicine:'💊'
    };
    return map[catId] ?? '📦';
  }

  private saveItems(items: FoodItem[]): void {
    this._items.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
}
