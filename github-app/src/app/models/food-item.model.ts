export type FoodCategory =
  | 'dairy' | 'produce' | 'meat' | 'bakery'
  | 'pantry' | 'frozen' | 'beverages' | 'leftovers' | 'medicine';

export type ExpiryStatus = 'expired' | 'expires-soon' | 'fresh';

export interface FoodItem {
  id: number;
  name: string;
  cat: FoodCategory;
  qty: number;
  unit: string;
  expiry: string;       // YYYY-MM-DD
  note: string;
  barcode?: string;
  imageUrl?: string;
  addedVia?: 'manual' | 'barcode' | 'ocr';
  savedAt?: number;     // timestamp
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  usesItems: string[];  // food item names it uses
  emoji: string;
  time: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Alert {
  id: number;
  itemId: number;
  itemName: string;
  expiry: string;
  daysLeft: number;
  read: boolean;
  type: 'expired' | 'critical' | 'warning';
}

export interface CategoryMeta {
  id: string;
  label: string;
  icon: string;
  emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'all',       label: 'All',        icon: 'ti-grid-dots', emoji: '' },
  { id: 'dairy',     label: 'Dairy',      icon: 'ti-bottle',    emoji: '🥛' },
  { id: 'produce',   label: 'Produce',    icon: 'ti-leaf',      emoji: '🥦' },
  { id: 'meat',      label: 'Meat & Fish',icon: 'ti-fish',      emoji: '🥩' },
  { id: 'bakery',    label: 'Bakery',     icon: 'ti-bread',     emoji: '🍞' },
  { id: 'pantry',    label: 'Pantry',     icon: 'ti-archive',   emoji: '🫙' },
  { id: 'frozen',    label: 'Frozen',     icon: 'ti-snowflake', emoji: '🧊' },
  { id: 'beverages', label: 'Beverages',  icon: 'ti-cup',       emoji: '🧃' },
  { id: 'leftovers', label: 'Leftovers',  icon: 'ti-bowl',      emoji: '🍱' },
  { id: 'medicine',  label: 'Medicine',   icon: 'ti-pill',      emoji: '💊' },
];
