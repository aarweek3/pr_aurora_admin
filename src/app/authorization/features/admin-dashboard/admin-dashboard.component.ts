import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService } from '@auth/services/auth.service';
import { TokenService } from '@auth/services/token.service';

interface DashboardStatistics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  ordersThisWeek: number;
  averageOrderValue: number;
  conversionRate: number;
  activeUsers: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzStatisticModule,
    NzGridModule,
    NzIconModule,
    NzSpinModule,
    NzButtonModule,
  ],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {{ authService.getCurrentUser()?.email }}</p>
        <div class="user-info">
          <span class="role-badge" *ngFor="let role of authService.getUserRoles()">
            {{ role }}
          </span>
          <button nz-button nzType="link" nzSize="small" (click)="showDebugInfo = !showDebugInfo">
            {{ showDebugInfo ? 'Hide' : 'Show' }} Debug Info
          </button>
        </div>
      </div>

      <!-- Debug Information -->
      <nz-card *ngIf="showDebugInfo" nzTitle="Debug Information" class="debug-card">
        <div class="debug-info">
          <div>
            <strong>Is Authenticated:</strong>
            {{ authService.isLoggedIn() }}
          </div>
          <div>
            <strong>Is Admin:</strong>
            {{ authService.isAdminUser() }}
          </div>
          <div>
            <strong>Is Moderator:</strong>
            {{ authService.isModeratorUser() }}
          </div>
          <div>
            <strong>User Roles:</strong>
            {{ authService.getUserRoles().join(', ') || 'None' }}
          </div>
          <div>
            <strong>Token Valid:</strong>
            {{ tokenService.isTokenValid() }}
          </div>
          <div>
            <strong>Token Status:</strong>
            {{ tokenService.getStatusText() }}
          </div>
          <div>
            <strong>Time Until Expiry:</strong>
            {{
              tokenService.formatTimeUntilExpiry(tokenService.getCurrentStatus().timeUntilExpiry)
            }}
          </div>
        </div>
      </nz-card>

      <div nz-row [nzGutter]="[16, 16]" class="statistics-container">
        <!-- Total Users -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
          <nz-card class="statistic-card">
            <nz-statistic
              [nzValue]="statistics?.totalUsers || 0"
              nzTitle="Total Users"
              nzPrefix="👥"
              [nzValueStyle]="{ color: '#3f8600' }"
            ></nz-statistic>
            <div class="statistic-footer">
              <span class="trend-up">
                <i nz-icon nzType="arrow-up" nzTheme="outline"></i>
                +12% this month
              </span>
            </div>
          </nz-card>
        </div>

        <!-- Total Orders -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
          <nz-card class="statistic-card">
            <nz-statistic
              [nzValue]="statistics?.totalOrders || 0"
              nzTitle="Total Orders"
              nzPrefix="📦"
              [nzValueStyle]="{ color: '#1890ff' }"
            ></nz-statistic>
            <div class="statistic-footer">
              <span class="trend-up">
                <i nz-icon nzType="arrow-up" nzTheme="outline"></i>
                +8% this week
              </span>
            </div>
          </nz-card>
        </div>

        <!-- Total Revenue -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
          <nz-card class="statistic-card">
            <nz-statistic
              [nzValue]="statistics?.totalRevenue || 0"
              nzTitle="Total Revenue"
              nzPrefix="💰"
              nzSuffix="$"
              [nzValueStyle]="{ color: '#cf1322' }"
            ></nz-statistic>
            <div class="statistic-footer">
              <span class="trend-up">
                <i nz-icon nzType="arrow-up" nzTheme="outline"></i>
                +15% this month
              </span>
            </div>
          </nz-card>
        </div>

        <!-- New Users -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
          <nz-card class="statistic-card">
            <nz-statistic
              [nzValue]="statistics?.newUsersThisMonth || 0"
              nzTitle="New Users"
              nzPrefix="🆕"
              [nzValueStyle]="{ color: '#722ed1' }"
            ></nz-statistic>
            <div class="statistic-footer">
              <span class="period">This month</span>
            </div>
          </nz-card>
        </div>

        <!-- Orders This Week -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
          <nz-card class="statistic-card">
            <nz-statistic
              [nzValue]="statistics?.ordersThisWeek || 0"
              nzTitle="Orders This Week"
              nzPrefix="📈"
              [nzValueStyle]="{ color: '#13c2c2' }"
            ></nz-statistic>
            <div class="statistic-footer">
              <span class="trend-neutral">
                <i nz-icon nzType="minus" nzTheme="outline"></i>
                No change
              </span>
            </div>
          </nz-card>
        </div>

        <!-- Average Order Value -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
          <nz-card class="statistic-card">
            <nz-statistic
              [nzValue]="statistics?.averageOrderValue || 0"
              nzTitle="Average Order"
              nzPrefix="💳"
              nzSuffix="$"
              [nzValueStyle]="{ color: '#fa8c16' }"
            ></nz-statistic>
            <div class="statistic-footer">
              <span class="trend-up">
                <i nz-icon nzType="arrow-up" nzTheme="outline"></i>
                +5% this week
              </span>
            </div>
          </nz-card>
        </div>

        <!-- Conversion Rate -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
          <nz-card class="statistic-card">
            <nz-statistic
              [nzValue]="statistics?.conversionRate || 0"
              nzTitle="Conversion Rate"
              nzPrefix="📊"
              nzSuffix="%"
              [nzValueStyle]="{ color: '#52c41a' }"
            ></nz-statistic>
            <div class="statistic-footer">
              <span class="trend-down">
                <i nz-icon nzType="arrow-down" nzTheme="outline"></i>
                -2% this month
              </span>
            </div>
          </nz-card>
        </div>

        <!-- Active Users -->
        <div nz-col nzXs="24" nzSm="12" nzMd="8" nzLg="6">
          <nz-card class="statistic-card">
            <nz-statistic
              [nzValue]="statistics?.activeUsers || 0"
              nzTitle="Active Users"
              nzPrefix="🟢"
              [nzValueStyle]="{ color: '#eb2f96' }"
            ></nz-statistic>
            <div class="statistic-footer">
              <span class="period">Online now</span>
            </div>
          </nz-card>
        </div>
      </div>

      <!-- Additional Statistics -->
      <div nz-row [nzGutter]="[16, 16]" class="additional-stats">
        <div nz-col nzXs="24" nzSm="12" nzLg="8">
          <nz-card nzTitle="Sales Statistics">
            <nz-statistic
              [nzValue]="1234567"
              nzTitle="Orders Processed"
              nzSuffix="📋"
              [nzValueStyle]="{ color: '#3f8600' }"
              [nzLoading]="loading"
            ></nz-statistic>
          </nz-card>
        </div>

        <div nz-col nzXs="24" nzSm="12" nzLg="8">
          <nz-card nzTitle="Profit Growth">
            <nz-statistic
              [nzValue]="25.3"
              nzTitle="Quarterly Growth"
              nzPrefix="📈"
              nzSuffix="%"
              [nzValueStyle]="{ color: '#cf1322' }"
              [nzLoading]="loading"
            ></nz-statistic>
          </nz-card>
        </div>

        <div nz-col nzXs="24" nzSm="12" nzLg="8">
          <nz-card nzTitle="Response Time">
            <nz-statistic
              [nzValue]="1.2"
              nzTitle="Average Time (sec)"
              nzSuffix="⏱️"
              [nzValueStyle]="{ color: '#1890ff' }"
              [nzLoading]="loading"
            ></nz-statistic>
          </nz-card>
        </div>
      </div>

      <!-- Actions -->
      <div class="dashboard-actions">
        <button nz-button nzType="primary" (click)="refreshStatistics()" [nzLoading]="loading">
          <i nz-icon nzType="reload" nzTheme="outline"></i>
          Refresh Statistics
        </button>
        <button nz-button nzType="default" (click)="testTokenStatus()">
          <i nz-icon nzType="safety-certificate" nzTheme="outline"></i>
          Test Token Status
        </button>
      </div>

      <!-- Loading Overlay -->
      <nz-spin [nzSpinning]="loading" nzTip="Loading statistics...">
        <div class="loading-placeholder" *ngIf="loading">
          <!-- Empty space for spinner demo -->
        </div>
      </nz-spin>
    </div>
  `,
  styles: [
    `
      .admin-dashboard {
        padding: 24px;
        background: #f5f5f5;
        min-height: 100vh;
      }

      .dashboard-header {
        margin-bottom: 24px;
        text-align: center;
      }

      .dashboard-header h1 {
        color: #1890ff;
        font-size: 28px;
        margin-bottom: 8px;
      }

      .dashboard-header p {
        color: #666;
        font-size: 16px;
        margin: 0 0 8px 0;
      }

      .user-info {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .role-badge {
        background: #1890ff;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }

      .debug-card {
        margin-bottom: 24px;
        border: 2px dashed #1890ff;
      }

      .debug-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 8px;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 13px;
      }

      .statistics-container {
        margin-bottom: 24px;
      }

      .statistic-card {
        height: 140px;
        transition: all 0.3s ease;
        cursor: pointer;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .statistic-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }

      .statistic-footer {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #f0f0f0;
      }

      .trend-up {
        color: #52c41a;
        font-size: 12px;
        font-weight: 500;
      }

      .trend-down {
        color: #ff4d4f;
        font-size: 12px;
        font-weight: 500;
      }

      .trend-neutral {
        color: #faad14;
        font-size: 12px;
        font-weight: 500;
      }

      .period {
        color: #8c8c8c;
        font-size: 12px;
      }

      .additional-stats {
        margin-top: 24px;
      }

      .additional-stats .ant-card {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .dashboard-actions {
        margin-top: 24px;
        text-align: center;
        display: flex;
        justify-content: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      .loading-placeholder {
        height: 200px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 8px;
      }

      ::ng-deep .ant-statistic-title {
        font-weight: 500;
        color: #666;
        margin-bottom: 8px;
      }

      ::ng-deep .ant-statistic-content {
        font-size: 20px;
        font-weight: 600;
      }

      ::ng-deep .ant-statistic-content-prefix,
      ::ng-deep .ant-statistic-content-suffix {
        font-size: 16px;
      }

      @media (max-width: 768px) {
        .admin-dashboard {
          padding: 16px;
        }

        .dashboard-header h1 {
          font-size: 24px;
        }

        .statistic-card {
          height: auto;
          min-height: 120px;
        }

        .user-info {
          flex-direction: column;
          gap: 4px;
        }

        .debug-info {
          grid-template-columns: 1fr;
          font-size: 12px;
        }

        .dashboard-actions {
          flex-direction: column;
          align-items: center;
        }

        .dashboard-actions button {
          width: 100%;
          max-width: 300px;
        }
      }
    `,
  ],
})
export class AdminDashboardComponent implements OnInit {
  public authService = inject(AuthService);
  public tokenService = inject(TokenService);

  statistics: DashboardStatistics | null = null;
  loading = false;
  showDebugInfo = false;

  ngOnInit() {
    this.loadStatistics();
    this.logComponentInfo();
  }

  private logComponentInfo(): void {
    console.log('=== ADMIN DASHBOARD COMPONENT ===');
    console.log('Component loaded successfully');
    console.log('User authenticated:', this.authService.isLoggedIn());
    console.log('Current user:', this.authService.getCurrentUser()?.email);
    console.log('User roles:', this.authService.getUserRoles());
    console.log('Is admin:', this.authService.isAdminUser());
    console.log('Token valid:', this.tokenService.isTokenValid());
    console.log('Token status:', this.tokenService.getStatusText());
    console.log('==================================');
  }

  private loadStatistics() {
    this.loading = true;
    this.getStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
        this.loading = false;
        console.log('Statistics loaded:', data);
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.loading = false;
      },
    });
  }

  private getStatistics(): Observable<DashboardStatistics> {
    const mockData: DashboardStatistics = {
      totalUsers: 15672,
      totalOrders: 8394,
      totalRevenue: 2847293.5,
      newUsersThisMonth: 423,
      ordersThisWeek: 187,
      averageOrderValue: 1847.25,
      conversionRate: 3.8,
      activeUsers: 142,
    };
    return of(mockData).pipe(delay(1500));
  }

  refreshStatistics() {
    console.log('Refreshing statistics...');
    this.loadStatistics();
  }

  testTokenStatus() {
    console.log('=== TOKEN STATUS TEST ===');
    console.log('Token valid:', this.tokenService.isTokenValid());
    console.log('Current status:', this.tokenService.getCurrentStatus());
    console.log('Status color:', this.tokenService.getStatusColor());
    console.log('Status text:', this.tokenService.getStatusText());
    console.log(
      'Time until expiry:',
      this.tokenService.formatTimeUntilExpiry(this.tokenService.getCurrentStatus().timeUntilExpiry),
    );

    // Trigger a manual token check
    this.tokenService.checkTokenStatus().subscribe({
      next: (status) => {
        console.log('Manual token check result:', status);
      },
      error: (error) => {
        console.error('Manual token check failed:', error);
      },
    });
    console.log('========================');
  }

  formatLargeNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}
