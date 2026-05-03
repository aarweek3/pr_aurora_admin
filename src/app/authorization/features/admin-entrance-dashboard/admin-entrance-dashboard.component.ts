import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { AuthService } from '@auth/services/auth.service';
import { TokenService } from '@auth/services/token.service';

@Component({
  selector: 'app-admin-entrance-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzStatisticModule,
    NzTagModule,
    NzDividerModule,
  ],
  template: `
    <div class="dashboard-container">
      <h1>Admin</h1>
      <!-- Welcome Section -->
      <div class="welcome-section">
        <nz-card [nzBordered]="false" class="welcome-card">
          <div class="welcome-header">
            <div class="welcome-info">
              <h1>Welcome, {{ getUserName() }}!</h1>
              <p>
                Your system role:
                <strong>{{ getUserRoles() }}</strong>
              </p>
              <p>{{ getCurrentDate() }}</p>
              <div class="token-info">
                <nz-tag [nzColor]="getTokenStatusColor()">Token: {{ getTokenStatusText() }}</nz-tag>
                <span class="token-expiry">
                  {{ getTokenExpiryText() }}
                </span>
              </div>
            </div>
            <div class="user-actions">
              <button
                nz-button
                nzType="text"
                nzSize="small"
                [routerLink]="['/profile']"
                class="profile-btn"
              >
                <span nz-icon nzType="user"></span>
                Profile
              </button>
              <button
                nz-button
                nzType="text"
                nzSize="small"
                (click)="toggleDebugInfo()"
                class="debug-btn"
              >
                <span nz-icon nzType="bug"></span>
                Debug
              </button>
              <button
                nz-button
                nzType="text"
                nzSize="small"
                nzDanger
                (click)="logout()"
                class="logout-btn"
              >
                <span nz-icon nzType="logout"></span>
                Logout
              </button>
            </div>
          </div>
        </nz-card>
      </div>

      <!-- Debug Information -->
      <div class="debug-section" *ngIf="showDebugInfo">
        <nz-card nzTitle="Debug Information" class="debug-card">
          <div class="debug-grid">
            <div class="debug-item">
              <strong>Is Authenticated:</strong>
              <nz-tag [nzColor]="authService.isLoggedIn() ? 'green' : 'red'">
                {{ authService.isLoggedIn() }}
              </nz-tag>
            </div>
            <div class="debug-item">
              <strong>Current User:</strong>
              {{ authService.getCurrentUser()?.email || 'None' }}
            </div>
            <div class="debug-item">
              <strong>User Roles:</strong>
              <nz-tag nzColor="blue" *ngFor="let role of authService.getUserRoles()">
                {{ role }}
              </nz-tag>
            </div>
            <div class="debug-item">
              <strong>Is Admin:</strong>
              <nz-tag [nzColor]="authService.isAdminUser() ? 'green' : 'default'">
                {{ authService.isAdminUser() }}
              </nz-tag>
            </div>
            <div class="debug-item">
              <strong>Token Valid:</strong>
              <nz-tag [nzColor]="tokenService.isTokenValid() ? 'green' : 'red'">
                {{ tokenService.isTokenValid() }}
              </nz-tag>
            </div>
            <div class="debug-item">
              <strong>Token Status:</strong>
              {{ tokenService.getStatusText() }}
            </div>
            <div class="debug-item">
              <strong>Time Until Expiry:</strong>
              {{
                tokenService.formatTimeUntilExpiry(tokenService.getCurrentStatus().timeUntilExpiry)
              }}
            </div>
            <div class="debug-item">
              <strong>Last Token Check:</strong>
              {{ tokenService.getCurrentStatus().lastChecked | date : 'HH:mm:ss' }}
            </div>
          </div>
          <nz-divider></nz-divider>
          <div class="debug-actions">
            <button nz-button nzSize="small" (click)="refreshTokenStatus()">
              <span nz-icon nzType="reload"></span>
              Refresh Token Status
            </button>
            <button nz-button nzSize="small" [routerLink]="['/debug/tokens']">
              <span nz-icon nzType="experiment"></span>
              Advanced Debug
            </button>
          </div>
        </nz-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <nz-card nzTitle="Quick Actions" class="actions-card">
          <div nz-row [nzGutter]="[16, 16]">
            <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
              <button
                nz-button
                nzType="primary"
                nzSize="large"
                [routerLink]="['/admin/dashboard']"
                class="action-btn"
              >
                <span nz-icon nzType="dashboard"></span>
                Admin Dashboard
              </button>
            </div>
            <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
              <button
                nz-button
                nzType="default"
                nzSize="large"
                [routerLink]="['/admin/users']"
                class="action-btn"
              >
                <span nz-icon nzType="team"></span>
                User Management
              </button>
            </div>
            <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
              <button
                nz-button
                nzType="default"
                nzSize="large"
                [routerLink]="['/admin/roles']"
                class="action-btn"
              >
                <span nz-icon nzType="safety"></span>
                Role Management
              </button>
            </div>
            <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
              <button
                nz-button
                nzType="default"
                nzSize="large"
                [routerLink]="['/debug/tokens']"
                class="action-btn"
              >
                <span nz-icon nzType="experiment"></span>
                Token Debug
              </button>
            </div>
          </div>
        </nz-card>
      </div>

      <!-- Statistics -->
      <div class="stats-section">
        <div nz-row [nzGutter]="[16, 16]">
          <div nz-col nzXs="24" nzSm="12" nzMd="6">
            <nz-card class="stat-card">
              <nz-statistic
                nzTitle="Total Users"
                [nzValue]="getTotalUsers()"
                nzSuffix="users"
                [nzValueStyle]="{ color: '#3f8600' }"
              ></nz-statistic>
            </nz-card>
          </div>
          <div nz-col nzXs="24" nzSm="12" nzMd="6">
            <nz-card class="stat-card">
              <nz-statistic
                nzTitle="Active Sessions"
                [nzValue]="getActiveSessions()"
                nzSuffix="sessions"
                [nzValueStyle]="{ color: '#1890ff' }"
              ></nz-statistic>
            </nz-card>
          </div>
          <div nz-col nzXs="24" nzSm="12" nzMd="6">
            <nz-card class="stat-card">
              <nz-statistic
                nzTitle="Token Expires In"
                [nzValue]="getTokenExpiryMinutes()"
                nzSuffix="min"
                [nzValueStyle]="getExpiryColor()"
              ></nz-statistic>
            </nz-card>
          </div>
          <div nz-col nzXs="24" nzSm="12" nzMd="6">
            <nz-card class="stat-card">
              <nz-statistic
                nzTitle="System Status"
                nzValue="Online"
                [nzValueStyle]="{ color: '#52c41a' }"
              ></nz-statistic>
            </nz-card>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section">
        <nz-card nzTitle="Recent Activity">
          <div class="activity-item">
            <span nz-icon nzType="login" class="activity-icon success"></span>
            <span class="activity-text">Logged into system</span>
            <span class="activity-time">{{ getLoginTime() }}</span>
          </div>
          <div class="activity-item">
            <span nz-icon nzType="safety-certificate" class="activity-icon info"></span>
            <span class="activity-text">Token refreshed automatically</span>
            <span class="activity-time">{{ getTokenRefreshTime() }}</span>
          </div>
          <div class="activity-item">
            <span nz-icon nzType="user" class="activity-icon warning"></span>
            <span class="activity-text">Profile accessed</span>
            <span class="activity-time">Yesterday</span>
          </div>
          <div class="activity-item">
            <span nz-icon nzType="setting" class="activity-icon default"></span>
            <span class="activity-text">Admin panel accessed</span>
            <span class="activity-time">2 days ago</span>
          </div>
        </nz-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 24px;
        background: #f0f2f5;
        min-height: 100vh;
      }

      .welcome-section {
        margin-bottom: 24px;
      }

      .welcome-card {
        background: linear-gradient(135deg, #1890ff 0%, #40c4ff 100%);
        color: white;
      }

      .welcome-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .welcome-info h1 {
        color: white;
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
      }

      .welcome-info p {
        color: rgba(255, 255, 255, 0.9);
        margin: 4px 0;
      }

      .token-info {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;
      }

      .token-expiry {
        color: rgba(255, 255, 255, 0.8);
        font-size: 12px;
      }

      .user-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }

      .profile-btn,
      .debug-btn,
      .logout-btn {
        color: white !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        height: 32px;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .profile-btn:hover,
      .debug-btn:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
      }

      .logout-btn:hover {
        background: rgba(255, 0, 0, 0.2) !important;
        border-color: rgba(255, 0, 0, 0.5) !important;
      }

      .debug-section {
        margin-bottom: 24px;
      }

      .debug-card {
        border: 2px dashed #1890ff;
      }

      .debug-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 12px;
        margin-bottom: 16px;
      }

      .debug-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 13px;
      }

      .debug-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .quick-actions {
        margin-bottom: 24px;
      }

      .action-btn {
        width: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 14px;
      }

      .stats-section {
        margin-bottom: 24px;
      }

      .stat-card {
        transition: all 0.3s ease;
      }

      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      .activity-section {
        margin-bottom: 24px;
      }

      .activity-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .activity-item:last-child {
        border-bottom: none;
      }

      .activity-icon {
        width: 20px;
        display: flex;
        justify-content: center;
      }

      .activity-icon.success {
        color: #52c41a;
      }
      .activity-icon.info {
        color: #1890ff;
      }
      .activity-icon.warning {
        color: #faad14;
      }
      .activity-icon.default {
        color: #8c8c8c;
      }

      .activity-text {
        flex: 1;
      }

      .activity-time {
        color: #8c8c8c;
        font-size: 12px;
      }

      @media (max-width: 768px) {
        .dashboard-container {
          padding: 16px;
        }

        .welcome-header {
          flex-direction: column;
          gap: 16px;
        }

        .welcome-info h1 {
          font-size: 24px;
        }

        .debug-grid {
          grid-template-columns: 1fr;
        }

        .action-btn {
          height: 50px;
          font-size: 13px;
        }

        .user-actions {
          width: 100%;
          justify-content: center;
        }
      }
    `,
  ],
})
export class AdminEntranceDashboardComponent implements OnInit {
  public authService = inject(AuthService);
  public tokenService = inject(TokenService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  showDebugInfo = false;

  ngOnInit(): void {
    console.log('=== ADMIN ENTRANCE DASHBOARD ===');
    console.log('Component loaded successfully');
    console.log('User:', this.authService.getCurrentUser()?.email);
    console.log('Roles:', this.authService.getUserRoles());
    console.log('Token valid:', this.tokenService.isTokenValid());
    console.log('================================');
  }

  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }

  refreshTokenStatus(): void {
    this.message.loading('Refreshing token status...', { nzDuration: 1000 });
    this.tokenService.checkTokenStatus().subscribe({
      next: (status) => {
        this.message.success('Token status refreshed');
        console.log('Token status refreshed:', status);
      },
      error: (error) => {
        this.message.error('Failed to refresh token status');
        console.error('Token refresh failed:', error);
      },
    });
  }

  logout(): void {
    this.message.loading('Logging out...', { nzDuration: 0 });
    this.authService.logout().subscribe({
      next: () => {
        this.message.remove();
        this.message.success('Goodbye!');
      },
      error: () => {
        this.message.remove();
        this.message.error('Logout error');
        // Force redirect even on error
        this.router.navigate(['/auth/login']);
      },
    });
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (user?.fullName) {
      return user.fullName;
    }
    return user?.email || 'Administrator';
  }

  getUserRoles(): string {
    const roles = this.authService.getUserRoles();
    return roles.length > 0 ? roles.join(', ') : 'Administrator';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getTokenStatusColor(): string {
    return this.tokenService.getStatusColor();
  }

  getTokenStatusText(): string {
    return this.tokenService.getStatusText();
  }

  getTokenExpiryText(): string {
    const status = this.tokenService.getCurrentStatus();
    if (!status.isValid) return 'Invalid token';
    return `Expires in ${this.tokenService.formatTimeUntilExpiry(status.timeUntilExpiry)}`;
  }

  getTokenExpiryMinutes(): number {
    const status = this.tokenService.getCurrentStatus();
    return Math.floor(status.timeUntilExpiry / (1000 * 60));
  }

  getExpiryColor(): { color: string } {
    const minutes = this.getTokenExpiryMinutes();
    if (minutes < 5) return { color: '#ff4d4f' };
    if (minutes < 15) return { color: '#faad14' };
    return { color: '#52c41a' };
  }

  getTotalUsers(): number {
    // Mock data - replace with actual API call
    return 15672;
  }

  getActiveSessions(): number {
    // Mock data - could be calculated from token service
    return 1;
  }

  getLoginTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTokenRefreshTime(): string {
    const lastChecked = this.tokenService.getCurrentStatus().lastChecked;
    return lastChecked.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
