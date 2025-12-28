import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { interval, Subscription } from 'rxjs';
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
  ],
  templateUrl: './tokens-tab.component.html',
  styleUrls: ['./tokens-tab.component.scss'],
})
export class TokensTabComponent implements OnInit, OnDestroy {
  private tokenService = inject(TokenService);
  private message = inject(NzMessageService);
  private timerSub?: Subscription;

  // Signals
  tokenStatus = signal<any>(null); // Uses TokenStatus interface from TokenService

  // Computed
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
    // Initial fetch
    this.updateStatus();

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
    // In a real scenario, we would call AuthService.refreshToken()
    // For now, we just simulate a check
    this.tokenService.checkTokenStatus().subscribe({
      next: (status) => {
        this.tokenStatus.set(status);
        this.message.success('Token status updated');
      },
      error: () => this.message.error('Refresh check failed'),
    });
  }

  copyToken(): void {
    // In real app, we might not have access to raw token string in client JS if HttpOnly
    // But if we did (or if we copy decoded claims):
    this.message.info('Raw token is HttpOnly and cannot be copied securely via JS');
  }
}
