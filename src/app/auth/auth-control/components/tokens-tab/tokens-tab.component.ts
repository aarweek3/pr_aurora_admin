import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { interval, Subscription } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { TokenService } from '../../../services/token.service';

@Component({
  selector: 'app-tokens-tab',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzProgressModule,
    NzButtonModule,
    NzTagModule,
    NzIconModule,
    NzToolTipModule,
    NzModalModule,
    NzAlertModule,
  ],
  templateUrl: './tokens-tab.component.html',
  styleUrls: ['./tokens-tab.component.scss'],
})
export class TokensTabComponent implements OnInit, OnDestroy {
  private tokenService = inject(TokenService);
  private message = inject(NzMessageService);
  // Inject Logger
  private logger = inject(LoggerConsoleService).getLogger('TokensTab');
  private timerSub?: Subscription;

  // Signals
  tokenStatus = signal<any>(null); // Uses TokenStatus interface from TokenService
  cookieStatus = signal<any>(null); // Uses CookieInfo interface
  consistencyStatus = signal<any>(null); // Stores result of consistency check
  isHelpVisible = signal(false); // Controls Help Modal visibility
  isCheckingConsistency = signal(false); // Loading state for consistency check

  // Computed
  systemHealth = computed<{
    level: 'error' | 'warning' | 'success' | 'info';
    title: string;
    message: string;
    recommendation: string;
  }>(() => {
    const token = this.tokenStatus();
    const cookie = this.cookieStatus();
    const consistency = this.consistencyStatus();

    // 1. Critical: Token Invalid or Missing
    if (!token?.valid) {
      return {
        level: 'error',
        title: 'Authentication Failed',
        message: 'Active session not found. Access Token is missing or expired.',
        recommendation: 'Please perform a full Login via the Auth page.',
      };
    }

    // 2. Critical: Consistency Check Failed
    if (consistency && !consistency.isConsistent) {
      return {
        level: 'error',
        title: 'Security Mismatch Detected',
        message: 'Critical desynchronization between Client and Server data.',
        recommendation:
          'Immediate action required: Click "Force Refresh" or Logout/Login to restore integrity.',
      };
    }

    // 3. Warning: No Refresh Token (HttpOnly Cookie missing)
    if (cookie && !cookie.hasRefreshToken) {
      return {
        level: 'warning',
        title: 'Session Fragile',
        message: 'Refresh Token cookie is missing. The session cannot be renewed automatically.',
        recommendation:
          'Check browser privacy settings or third-party cookie blockers. Re-login may fix this.',
      };
    }

    // 4. Warning: Token Expiring Soon (< 5 min)
    if (token.timeUntilExpiry < 300000) {
      return {
        level: 'warning',
        title: 'Session Expiring Soon',
        message: `Your session will expire in less than 5 minutes.`,
        recommendation: 'The system should auto-renew shortly. You can also click "Force Refresh".',
      };
    }

    // 5. Success: All Good
    return {
      level: 'success',
      title: 'System Healthy',
      message:
        'Authentication system is fully operational. Tokens are valid, and server data is consistent.',
      recommendation: 'No actions required.',
    };
  });

  timeLeftPercent = computed(() => {
    const status = this.tokenStatus();
    if (!status || !status.valid) return 0;

    // Assuming 15 minutes max life for calculation visualization
    // In real app, we should know the total life duration.
    // For now, let's map 15 min (900000ms) to 100%
    const maxDuration = 15 * 60 * 1000;
    const timeLeft = status.timeUntilExpiry;

    const percent = (timeLeft / maxDuration) * 100;
    return Math.min(Math.max(percent, 0), 100);
  });

  statusColor = computed(() => {
    const status = this.tokenStatus();
    if (!status?.valid) return '#ff4d4f'; // Error red
    if (status.timeUntilExpiry < 120000) return '#faad14'; // Warning yellow (< 2 min)
    return '#52c41a'; // Success green
  });

  constructor() {}

  ngOnInit(): void {
    this.logger.debug('TokensTab: Initializing...');

    // Initial fetch
    this.tokenService.checkTokenStatus().subscribe((status) => {
      this.logger.info('TokensTab: Initial Token Status', status);
      this.tokenStatus.set(status);

      // Auto-check consistency on load if token is valid
      if (status.valid) {
        this.checkConsistency(status.userEmail || undefined, status.userRoles, true);
      }
    });

    this.tokenService.getCookieInfo().subscribe((info) => {
      this.logger.info('TokensTab: Initial Cookie Info', info);
      this.cookieStatus.set(info);
    });

    // Auto refresh every second for smooth progress bar
    this.timerSub = interval(1000).subscribe(() => {
      this.updateStatus();
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  updateStatus(): void {
    const status = this.tokenService.getCurrentStatus();
    this.tokenStatus.set(status);
  }

  forceRefresh(): void {
    this.message.loading('Forcing token refresh...');
    this.logger.debug('TokensTab: Force refresh initiated');

    // Refresh token status
    this.tokenService.checkTokenStatus().subscribe({
      next: (status) => {
        this.logger.info('TokensTab: Token Status Refreshed', status);
        this.tokenStatus.set(status);
        this.message.success('Token status updated');
        // Also refresh cookie info
        this.tokenService.getCookieInfo().subscribe((info) => {
          this.logger.info('TokensTab: Cookie Info Refreshed', info);
          this.cookieStatus.set(info);
        });
        // Re-check consistency
        this.checkConsistency(status.userEmail || undefined, status.userRoles, true);
      },
      error: (err) => {
        this.logger.error('TokensTab: Refresh check failed', err);
        this.message.error('Refresh check failed');
      },
    });
  }

  checkConsistency(email?: string, roles?: string[], silent: boolean = false): void {
    // Use current status if args not provided
    const currentStatus = this.tokenStatus();
    const checkEmail = email ?? currentStatus?.userEmail;
    const checkRoles = roles ?? currentStatus?.userRoles;

    this.logger.debug('TokensTab: Checking consistency...', {
      email: checkEmail,
      roles: checkRoles,
    });

    if (!silent) {
      this.isCheckingConsistency.set(true);
    }

    // Show specific loading message as requested
    let msgId: string | null = null;
    if (!silent) {
      msgId = this.message.loading(
        `Request sent: Email=${checkEmail}, Roles=[${checkRoles?.join(', ')}]`,
        { nzDuration: 0 },
      ).messageId;
    }

    this.tokenService
      .validateConsistency(checkEmail, checkRoles)
      .pipe(
        delay(silent ? 0 : 2000), // Artificial delay for better UX
        finalize(() => {
          if (!silent) {
            this.isCheckingConsistency.set(false);
            if (msgId) this.message.remove(msgId);
          }
        }),
      )
      .subscribe((result) => {
        this.logger.info('TokensTab: Consistency Result', result);
        this.consistencyStatus.set(result);

        if (!silent) {
          if (result.isConsistent) {
            this.message.success('Response received: Success (Data Consistent)');
          } else {
            this.message.error('Response received: Failure (Data Mismatch)');
          }
        }
      });
  }

  copyToken(): void {
    const data = this.tokenStatus();
    if (!data) {
      this.message.warning('No data to copy');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(
      () => this.message.success('Token data copied to clipboard (JSON)'),
      (err) => this.message.error('Failed to copy data'),
    );
  }

  exportData(): void {
    const data = this.tokenStatus();
    if (!data) {
      this.message.warning('No data to export');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `token-debug-${new Date().getTime()}.json`;
    a.click();

    window.URL.revokeObjectURL(url);
    this.message.success('Data exported successfully');
  }
}
