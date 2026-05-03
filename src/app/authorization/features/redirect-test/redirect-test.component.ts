// src/app/features/redirect-test/redirect-test.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '@auth/services/auth.service';
import { TokenService } from '@auth/services/token.service';

@Component({
  selector: 'app-redirect-test',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzDescriptionsModule,
    NzTagModule,
    NzDividerModule,
  ],
  template: `
    <div class="test-container">
      <nz-card nzTitle="Redirect System Test" class="test-card">
        <!-- User Info Section -->
        <nz-descriptions nzBordered [nzColumn]="1" style="margin-bottom: 24px;">
          <nz-descriptions-item nzLabel="Current User">
            {{ getCurrentUserEmail() }}
          </nz-descriptions-item>

          <nz-descriptions-item nzLabel="User Roles">
            <nz-tag nzColor="blue" *ngFor="let role of getUserRoles()">
              {{ role }}
            </nz-tag>
            <span *ngIf="getUserRoles().length === 0" style="color: #999;">No roles</span>
          </nz-descriptions-item>

          <nz-descriptions-item nzLabel="Authenticated">
            <nz-tag [nzColor]="isAuthenticated() ? 'green' : 'red'">
              {{ isAuthenticated() ? 'Yes' : 'No' }}
            </nz-tag>
          </nz-descriptions-item>

          <nz-descriptions-item nzLabel="Is Admin">
            <nz-tag [nzColor]="isAdmin() ? 'green' : 'default'">
              {{ isAdmin() ? 'Yes' : 'No' }}
            </nz-tag>
          </nz-descriptions-item>

          <nz-descriptions-item nzLabel="Is Moderator">
            <nz-tag [nzColor]="isModerator() ? 'green' : 'default'">
              {{ isModerator() ? 'Yes' : 'No' }}
            </nz-tag>
          </nz-descriptions-item>

          <nz-descriptions-item nzLabel="Recommended Route">
            <code class="route-code">{{ getRecommendedRoute() }}</code>
          </nz-descriptions-item>
        </nz-descriptions>

        <!-- Token Status Section -->
        <nz-card nzTitle="Token Status" nzSize="small" style="margin-bottom: 24px;">
          <nz-descriptions [nzColumn]="2" nzSize="small">
            <nz-descriptions-item nzLabel="Token Valid">
              <nz-tag [nzColor]="tokenService.isTokenValid() ? 'green' : 'red'">
                {{ tokenService.isTokenValid() ? 'Valid' : 'Invalid' }}
              </nz-tag>
            </nz-descriptions-item>

            <nz-descriptions-item nzLabel="Token Status">
              <nz-tag [nzColor]="tokenService.getStatusColor()">
                {{ tokenService.getStatusText() }}
              </nz-tag>
            </nz-descriptions-item>

            <nz-descriptions-item nzLabel="Time Until Expiry">
              {{
                tokenService.formatTimeUntilExpiry(tokenService.getCurrentStatus().timeUntilExpiry)
              }}
            </nz-descriptions-item>

            <nz-descriptions-item nzLabel="Last Checked">
              {{ tokenService.getCurrentStatus().lastChecked | date : 'HH:mm:ss' }}
            </nz-descriptions-item>
          </nz-descriptions>
        </nz-card>

        <!-- Test Navigation Section -->
        <div class="actions-section">
          <h3>Test Navigation:</h3>

          <div class="button-group">
            <button
              nz-button
              nzType="primary"
              (click)="navigateTo('/admin-entrance-dashboard')"
              [nzLoading]="loading"
            >
              Admin Entrance
            </button>

            <button
              nz-button
              nzType="default"
              (click)="navigateTo('/admin/dashboard')"
              [nzLoading]="loading"
            >
              Admin Dashboard
            </button>

            <button
              nz-button
              nzType="default"
              (click)="navigateTo('/dashboard')"
              [nzLoading]="loading"
            >
              User Dashboard
            </button>

            <button
              nz-button
              nzType="default"
              (click)="navigateTo('/moderator/dashboard')"
              [nzLoading]="loading"
            >
              Moderator Dashboard
            </button>
          </div>

          <nz-divider></nz-divider>

          <div class="button-group">
            <button nz-button nzType="dashed" (click)="testRedirectLogic()" [nzLoading]="loading">
              Test Redirect Logic
            </button>

            <button nz-button nzType="default" (click)="refreshRoles()" [nzLoading]="loading">
              Refresh Roles
            </button>

            <button nz-button nzType="default" (click)="refreshTokenStatus()" [nzLoading]="loading">
              Refresh Token
            </button>

            <button nz-button nzDanger (click)="logout()" [nzLoading]="loading">Logout</button>
          </div>

          <nz-divider></nz-divider>

          <div class="button-group">
            <button nz-button nzType="link" (click)="navigateTo('/debug/tokens')" *ngIf="isAdmin()">
              Token Debug Panel
            </button>

            <button nz-button nzType="link" (click)="runFullDiagnostic()">
              Run Full Diagnostic
            </button>
          </div>
        </div>

        <!-- Expected Behavior Info -->
        <div class="info-section">
          <h4>Expected Behavior:</h4>
          <ul>
            <li>
              <strong>Admin:</strong>
              should be redirected to
              <code>/admin-entrance-dashboard</code>
            </li>
            <li>
              <strong>Moderator:</strong>
              should be redirected to
              <code>/moderator/dashboard</code>
            </li>
            <li>
              <strong>User:</strong>
              should be redirected to
              <code>/dashboard</code>
            </li>
            <li>
              <strong>Unauthenticated:</strong>
              should be redirected to
              <code>/auth/login</code>
            </li>
          </ul>
        </div>

        <!-- Diagnostic Results -->
        <div class="diagnostic-section" *ngIf="diagnosticResults">
          <h4>Diagnostic Results:</h4>
          <pre class="diagnostic-output">{{ diagnosticResults }}</pre>
        </div>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .test-container {
        padding: 24px;
        background: #f5f5f5;
        min-height: 100vh;
      }

      .test-card {
        max-width: 1000px;
        margin: 0 auto;
      }

      .actions-section {
        margin-top: 24px;
      }

      .actions-section h3 {
        margin-bottom: 16px;
        color: #1890ff;
      }

      .button-group {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
      }

      .route-code {
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Consolas', 'Monaco', monospace;
        color: #1890ff;
      }

      .info-section {
        margin-top: 24px;
        padding: 16px;
        background: #e6f7ff;
        border-radius: 6px;
        border-left: 4px solid #1890ff;
      }

      .info-section h4 {
        margin: 0 0 12px 0;
        color: #1890ff;
      }

      .info-section ul {
        margin: 0;
        padding-left: 20px;
      }

      .info-section li {
        margin-bottom: 8px;
      }

      .info-section code {
        background: #f5f5f5;
        padding: 1px 4px;
        border-radius: 2px;
        font-family: 'Consolas', 'Monaco', monospace;
      }

      .diagnostic-section {
        margin-top: 24px;
        padding: 16px;
        background: #fff7e6;
        border-radius: 6px;
        border-left: 4px solid #fa8c16;
      }

      .diagnostic-section h4 {
        margin: 0 0 12px 0;
        color: #fa8c16;
      }

      .diagnostic-output {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        line-height: 1.4;
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        max-height: 300px;
        overflow: auto;
      }

      @media (max-width: 768px) {
        .test-container {
          padding: 16px;
        }

        .button-group {
          flex-direction: column;
        }

        .button-group button {
          width: 100%;
        }
      }
    `,
  ],
})
export class RedirectTestComponent implements OnInit {
  public authService = inject(AuthService);
  public tokenService = inject(TokenService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  loading = false;
  diagnosticResults = '';

  ngOnInit(): void {
    console.log('=== REDIRECT TEST COMPONENT ===');
    this.logComponentState();
  }

  private logComponentState(): void {
    console.log('Redirect Test Component initialized');
    console.log('User authenticated:', this.authService.isLoggedIn());
    console.log('Current user:', this.authService.getCurrentUser()?.email);
    console.log('User roles:', this.authService.getUserRoles());
    console.log('Token valid:', this.tokenService.isTokenValid());
    console.log('Recommended route:', this.getRecommendedRoute());
    console.log('===================================');
  }

  getCurrentUserEmail(): string {
    return this.authService.getCurrentUser()?.email || 'Unknown';
  }

  getUserRoles(): string[] {
    return this.authService.getUserRoles();
  }

  isAuthenticated(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.isAdminUser();
  }

  isModerator(): boolean {
    return this.authService.isModeratorUser();
  }

  getRecommendedRoute(): string {
    return this.authService.getRedirectRoute();
  }

  navigateTo(route: string): void {
    this.loading = true;
    console.log(`Attempting navigation to: ${route}`);

    this.router
      .navigate([route])
      .then((success) => {
        this.loading = false;
        if (success) {
          this.message.success(`Navigated to ${route}`);
          console.log(`✅ Navigation successful: ${route}`);
        } else {
          this.message.warning(`Navigation failed: ${route}`);
          console.log(`❌ Navigation failed: ${route}`);
        }
      })
      .catch((error) => {
        this.loading = false;
        this.message.error(`Navigation error: ${error.message}`);
        console.error(`❌ Navigation error:`, error);
      });
  }

  testRedirectLogic(): void {
    this.loading = true;
    console.log('=== TESTING REDIRECT LOGIC ===');

    const recommendedRoute = this.getRecommendedRoute();
    console.log(`Recommended route: ${recommendedRoute}`);

    // Use AuthService redirect logic
    this.authService.redirectAfterLogin();

    this.message.success(`Redirect logic executed. Target: ${recommendedRoute}`);
    this.loading = false;
    console.log('===============================');
  }

  refreshRoles(): void {
    this.loading = true;
    console.log('Refreshing user roles...');

    this.authService.loadUserRoles().subscribe({
      next: (roles) => {
        this.loading = false;
        this.message.success('Roles refreshed successfully');
        console.log('✅ Roles updated:', roles);
      },
      error: (error) => {
        this.loading = false;
        this.message.error('Failed to refresh roles');
        console.error('❌ Error refreshing roles:', error);
      },
    });
  }

  refreshTokenStatus(): void {
    this.loading = true;
    console.log('Refreshing token status...');

    this.tokenService.checkTokenStatus().subscribe({
      next: (status) => {
        this.loading = false;
        this.message.success('Token status refreshed');
        console.log('✅ Token status updated:', status);
      },
      error: (error) => {
        this.loading = false;
        this.message.error('Failed to refresh token status');
        console.error('❌ Error refreshing token:', error);
      },
    });
  }

  runFullDiagnostic(): void {
    console.log('=== RUNNING FULL DIAGNOSTIC ===');

    const diagnostic = {
      timestamp: new Date().toISOString(),
      authentication: {
        isLoggedIn: this.authService.isLoggedIn(),
        currentUser: this.authService.getCurrentUser(),
        userRoles: this.authService.getUserRoles(),
        isAdmin: this.authService.isAdminUser(),
        isModerator: this.authService.isModeratorUser(),
      },
      token: {
        isValid: this.tokenService.isTokenValid(),
        status: this.tokenService.getStatusText(),
        statusColor: this.tokenService.getStatusColor(),
        currentStatus: this.tokenService.getCurrentStatus(),
        timeUntilExpiry: this.tokenService.formatTimeUntilExpiry(
          this.tokenService.getCurrentStatus().timeUntilExpiry,
        ),
      },
      navigation: {
        currentUrl: this.router.url,
        recommendedRoute: this.getRecommendedRoute(),
      },
      browser: {
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus: navigator.onLine,
      },
    };

    this.diagnosticResults = JSON.stringify(diagnostic, null, 2);
    console.log('Diagnostic completed:', diagnostic);
    console.log('==============================');

    this.message.success('Full diagnostic completed - check results below');
  }

  logout(): void {
    this.loading = true;
    console.log('Initiating logout...');

    this.authService.logout().subscribe({
      next: () => {
        this.loading = false;
        this.message.success('Logout successful');
        console.log('✅ Logout completed successfully');
      },
      error: (error) => {
        this.loading = false;
        this.message.error('Logout error occurred');
        console.error('❌ Logout error:', error);
      },
    });
  }
}
