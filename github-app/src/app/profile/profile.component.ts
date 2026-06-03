import { Component, signal, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FoodTrackerService } from '../services/food-tracker.service';
import { ThemeService } from '../services/theme.service';
import { LanguageService, Lang } from '../services/language.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  svc      = inject(FoodTrackerService);
  theme    = inject(ThemeService);
  langSvc  = inject(LanguageService);
  private router     = inject(Router);
  private platformId = inject(PLATFORM_ID);

  userName  = signal('');
  userEmail = signal('');
  editMode  = signal(false);
  editName  = signal('');

  languages = [
    { code: 'en' as Lang, label: 'English',  flag: '🇬🇧' },
    { code: 'hi' as Lang, label: 'हिंदी',    flag: '🇮🇳' },
    { code: 'te' as Lang, label: 'తెలుగు',   flag: '🇮🇳' },
    { code: 'ta' as Lang, label: 'தமிழ்',    flag: '🇮🇳' },
  ];

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const user = JSON.parse(localStorage.getItem('sfet_user') || '{}');
    this.userName.set(user.name || 'User');
    this.userEmail.set(user.email || '');
    this.editName.set(user.name || 'User');
  }

  startEdit() { this.editMode.set(true); }

  saveName() {
    const name = this.editName().trim();
    if (!name) return;
    this.userName.set(name);
    if (isPlatformBrowser(this.platformId)) {
      const user = JSON.parse(localStorage.getItem('sfet_user') || '{}');
      localStorage.setItem('sfet_user', JSON.stringify({ ...user, name }));
    }
    this.editMode.set(false);
  }

  setLang(lang: Lang) { this.langSvc.setLang(lang); }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('sfet_user');
    }
    this.router.navigate(['/auth']);
  }

  get initials() {
    return this.userName().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
