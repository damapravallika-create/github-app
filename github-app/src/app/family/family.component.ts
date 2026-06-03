import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FamilyMember {
  id: number; name: string; email: string;
  role: 'admin' | 'member'; avatar: string; joined: string;
}

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './family.component.html',
  styleUrl: './family.component.scss',
})
export class FamilyComponent {
  members = signal<FamilyMember[]>([
    { id: 1, name: 'You (Admin)', email: 'you@example.com', role: 'admin', avatar: 'YO', joined: 'May 2026' },
  ]);

  showInvite  = signal(false);
  inviteEmail = signal('');
  inviteName  = signal('');
  inviteError = signal('');
  inviteSent  = signal(false);
  nextId      = signal(2);

  toastMsg     = signal('');
  toastVisible = signal(false);

  toggleInvite() { this.showInvite.update(v => !v); this.inviteError.set(''); this.inviteSent.set(false); }

  sendInvite() {
    const email = this.inviteEmail().trim();
    const name  = this.inviteName().trim();
    if (!email || !name) { this.inviteError.set('Please enter both name and email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.inviteError.set('Invalid email address.'); return; }
    if (this.members().some(m => m.email === email)) { this.inviteError.set('This person is already a member.'); return; }

    // Simulate sending invite
    setTimeout(() => {
      this.members.update(list => [...list, {
        id: this.nextId(), name, email, role: 'member',
        avatar: name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
        joined: 'Pending'
      }]);
      this.nextId.update(n => n + 1);
      this.inviteSent.set(true);
      this.inviteEmail.set(''); this.inviteName.set('');
      this.toast(`✅ Invite sent to ${name}!`);
    }, 800);
  }

  removeMember(id: number) {
    this.members.update(list => list.filter(m => m.id !== id));
    this.toast('Member removed');
  }

  private toastTimer: any;
  toast(msg: string) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastMsg.set(msg); this.toastVisible.set(true);
    this.toastTimer = setTimeout(() => this.toastVisible.set(false), 2500);
  }
}
