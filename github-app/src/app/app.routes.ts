import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: 'auth',      loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent),           canActivate: [guestGuard] },
  { path: '',          loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),           canActivate: [authGuard]  },
  { path: 'scan',      loadComponent: () => import('./scan/scan.component').then(m => m.ScanComponent),           canActivate: [authGuard]  },
  { path: 'recipes',   loadComponent: () => import('./recipes/recipes.component').then(m => m.RecipesComponent),  canActivate: [authGuard]  },
  { path: 'saved',     loadComponent: () => import('./saved/saved.component').then(m => m.SavedComponent),        canActivate: [authGuard]  },
  { path: 'insights',  loadComponent: () => import('./insights/insights.component').then(m => m.InsightsComponent),  canActivate: [authGuard] },
  { path: 'planner',   loadComponent: () => import('./planner/planner.component').then(m => m.PlannerComponent),     canActivate: [authGuard] },
  { path: 'profile',   loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),     canActivate: [authGuard] },
  { path: 'inventory', loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent), canActivate: [authGuard] },
  { path: 'family',    loadComponent: () => import('./family/family.component').then(m => m.FamilyComponent),         canActivate: [authGuard] },
  { path: 'nutrition', loadComponent: () => import('./nutrition/nutrition.component').then(m => m.NutritionComponent), canActivate: [authGuard] },
  { path: 'settings',  loadComponent: () => import('./settings/settings.component').then(m => m.SettingsComponent),   canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
