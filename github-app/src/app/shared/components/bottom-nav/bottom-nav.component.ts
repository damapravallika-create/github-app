import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FoodTrackerService } from '../../../services/food-tracker.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {
  svc      = inject(FoodTrackerService);
  router   = inject(Router);
  showMore = signal(false);

  navItems = [
    { path: '/',         label: 'Home',     icon: 'ti-home-2'      },
    { path: '/scan',     label: 'Scan',     icon: 'ti-scan'        },
    { path: '/insights', label: 'Insights', icon: 'ti-chart-bar'   },
    { path: '/planner',  label: 'Planner',  icon: 'ti-calendar'    },
    { path: '/profile',  label: 'Profile',  icon: 'ti-user-circle' },
  ];

  moreItems = [
    { path: '/recipes',   label: 'Recipes',   icon: 'ti-tools-kitchen-2' },
    { path: '/saved',     label: 'Saved',     icon: 'ti-heart'           },
    { path: '/inventory', label: 'Inventory', icon: 'ti-archive'         },
    { path: '/family',    label: 'Family',    icon: 'ti-users'           },
    { path: '/nutrition', label: 'Nutrition', icon: 'ti-heart-rate-monitor' },
    { path: '/settings',  label: 'Settings',  icon: 'ti-settings'        },
  ];

  toggleMore() { this.showMore.update(v => !v); }
  goTo(path: string) { this.router.navigate([path]); this.showMore.set(false); }
}
