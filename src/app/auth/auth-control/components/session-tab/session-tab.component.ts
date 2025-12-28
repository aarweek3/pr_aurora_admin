import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { AuthService } from '../../../services/auth.service';
import { SessionEvent } from '../../models/auth-control.models';

@Component({
  selector: 'app-session-tab',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzListModule,
    NzAvatarModule,
    NzStatisticModule,
  ],
  templateUrl: './session-tab.component.html',
  styleUrls: ['./session-tab.component.scss'],
})
export class SessionTabComponent {
  private authService = inject(AuthService);
  private message = inject(NzMessageService);

  // Signals linked to AuthService
  // Note: Assuming authService has these signals/methods based on TZ
  currentUser = computed(() => this.authService.getCurrentUser());
  isAuthenticated = this.authService.isAuthenticated;

  // Computed values
  userRoles = computed(() => {
    // If not signal, we might need manual update
    return this.authService.getUserRoles();
  });

  // Mock data for session timeline (Phase 1)
  sessionEvents = signal<SessionEvent[]>([
    {
      timestamp: new Date(),
      type: 'login',
      status: 'success',
      message: 'Initial login successful',
    },
  ]);

  constructor() {}

  refreshSession(): void {
    this.message.loading('Refreshing session details...');
    // Implementation for refreshing
    setTimeout(() => this.message.success('Session details updated'), 500);
  }

  logout(): void {
    this.message.loading('Logging out...');
    this.authService.logout().subscribe({
      next: () => this.message.success('Logged out successfully'),
      error: () => this.message.error('Logout failed'),
    });
  }
}
