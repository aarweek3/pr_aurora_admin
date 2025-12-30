import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { UserSessionDto } from '../../../models';
import { AuthService } from '../../../services/auth.service';
import { SessionEvent } from '../../models/auth-control.models';

@Component({
  selector: 'app-session-tab',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzTagModule,
    NzButtonModule,
    NzIconModule,
    NzListModule,
    NzAvatarModule,
    NzStatisticModule,
    NzPopoverModule,
    NzPopconfirmModule,
  ],
  templateUrl: './session-tab.component.html',
  styleUrls: ['./session-tab.component.scss'],
})
export class SessionTabComponent implements OnInit {
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

  ngOnInit(): void {
    // Original init logic without session loading
  }

  // loadActiveSessions removed

  onRevokeSession(sessionId: number): void {
    this.authService.revokeSession(sessionId).subscribe({
      next: () => {
        this.message.success('Session revoked');
        // loadActiveSessions() call removed as it's no longer available
      },
      error: () => this.message.error('Failed to revoke session'),
    });
  }

  isCurrentSession(session: UserSessionDto): boolean {
    const currentToken = localStorage.getItem('refreshToken');
    return session.refreshToken === currentToken;
  }

  getDeviceIcon(userAgent?: string): string {
    if (!userAgent) return 'desktop';
    if (userAgent.toLowerCase().includes('windows')) return 'windows';
    if (userAgent.toLowerCase().includes('mac')) return 'apple';
    if (userAgent.toLowerCase().includes('android')) return 'android';
    if (userAgent.toLowerCase().includes('iphone') || userAgent.toLowerCase().includes('ipad'))
      return 'apple';
    if (userAgent.toLowerCase().includes('mobile')) return 'mobile';
    return 'laptop';
  }

  refreshSession(): void {
    this.message.loading('Refreshing session details...');
    // Implementation for refreshing profile
    this.authService.getProfile().subscribe();
    setTimeout(() => this.message.success('Session details updated'), 500);
  }

  logout(): void {
    this.message.loading('Logging out...');
    this.authService.logout().subscribe({
      next: () => this.message.success('Logged out successfully'),
      error: () => this.message.error('Logout failed'),
    });
  }

  unlinkExternalAccount(provider: string): void {
    this.message.loading(`Unlinking ${provider} account...`);
    this.authService.unlinkExternal(provider).subscribe({
      next: () => this.message.success('Account unlinked successfully'),
      error: () => this.message.error('Failed to unlink account'),
    });
  }
}
