import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { UserSessionDto } from '../../../models';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sessions-manager-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzPopconfirmModule,
    NzAvatarModule,
    NzDividerModule,
    NzToolTipModule,
    NzSwitchModule,
  ],
  template: `
    <div class="sessions-manager-container">
      <nz-card [nzTitle]="titleTemplate" [nzExtra]="extraTemplate" class="sessions-card">
        <ng-template #titleTemplate>
          <div class="card-header">
            <span nz-icon nzType="desktop" class="header-icon"></span>
            <span>Управление сессиями</span>
          </div>
        </ng-template>

        <ng-template #extraTemplate>
          <div class="header-controls">
            <span class="switch-label">Показать историю</span>
            <nz-switch [(ngModel)]="showHistory" (ngModelChange)="loadSessions()"></nz-switch>
            <nz-divider nzType="vertical"></nz-divider>
            <button nz-button nzType="text" (click)="loadSessions()">
              <span nz-icon nzType="reload"></span>
            </button>
          </div>
        </ng-template>

        <nz-table
          #basicTable
          [nzData]="sessions()"
          [nzLoading]="isLoading()"
          [nzShowPagination]="true"
          [nzPageSize]="10"
        >
          <thead>
            <tr>
              <th nzWidth="60px"></th>
              <th>Устройство / Браузер</th>
              <th>IP Адрес</th>
              <th>Время входа</th>
              <th>Активность</th>
              <th>Статус</th>
              <th nzWidth="100px">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              *ngFor="let data of basicTable.data"
              [class.current-session-row]="isCurrentSession(data)"
            >
              <!-- Icon -->
              <td class="icon-cell">
                <nz-avatar
                  [nzIcon]="getDeviceIcon(data.userAgent)"
                  [nzShape]="'square'"
                  [class]="getDeviceClass(data.userAgent)"
                >
                </nz-avatar>
              </td>

              <!-- Device Info -->
              <td>
                <div class="device-info">
                  <div class="main-text" nz-tooltip [nzTooltipTitle]="data.userAgent">
                    {{ getShortUserAgent(data.userAgent) }}
                  </div>
                  <div class="sub-text" *ngIf="isCurrentSession(data)">
                    <nz-tag [nzColor]="'blue'">Текущая сессия</nz-tag>
                  </div>
                </div>
              </td>

              <!-- IP -->
              <td>
                <span class="ip-address">{{ data.ipAddress || 'Unknown' }}</span>
              </td>

              <!-- Login Time -->
              <td>
                {{ data.createdAt | date : 'medium' }}
              </td>

              <!-- Expiry / Activity -->
              <td>
                <span class="sub-text">Истекает: {{ data.expiresAt | date : 'mediumDate' }}</span>
              </td>

              <!-- Status -->
              <td>
                <nz-tag *ngIf="!data.isRevoked && !isExpired(data)" nzColor="success"
                  >Активна</nz-tag
                >
                <nz-tag *ngIf="data.isRevoked" nzColor="error">Отозвана</nz-tag>
                <nz-tag *ngIf="!data.isRevoked && isExpired(data)" nzColor="default"
                  >Истекла</nz-tag
                >
              </td>

              <!-- Actions -->
              <td>
                <button
                  *ngIf="!data.isRevoked && !isExpired(data) && !isCurrentSession(data)"
                  nz-button
                  nzType="text"
                  nzDanger
                  nz-popconfirm
                  nzPopconfirmTitle="Вы уверены, что хотите завершить эту сессию?"
                  (nzOnConfirm)="revokeSession(data.id)"
                >
                  <span nz-icon nzType="close-circle"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </nz-table>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .sessions-card {
        border-radius: 8px;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .header-icon {
        font-size: 18px;
        color: #1890ff;
      }

      .header-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .switch-label {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.65);
      }

      .icon-cell {
        text-align: center;
      }

      .device-info {
        display: flex;
        flex-direction: column;
      }

      .main-text {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.85);
        cursor: help;
      }

      .sub-text {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
      }

      .ip-address {
        font-family: monospace;
        background: #f5f5f5;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .current-session-row {
        background-color: #e6f7ff;
      }

      ::ng-deep .ant-avatar {
        background-color: transparent;
        color: #595959;
      }

      .clean-device {
        color: #52c41a;
        background: #f6ffed !important;
      }
      .windows-device {
        color: #1890ff;
        background: #e6f7ff !important;
      }
      .apple-device {
        color: #8c8c8c;
        background: #f5f5f5 !important;
      }
      .mobile-device {
        color: #fa8c16;
        background: #fff7e6 !important;
      }
    `,
  ],
})
export class SessionsManagerTabComponent implements OnInit {
  private authService = inject(AuthService);
  private message = inject(NzMessageService);

  sessions = signal<UserSessionDto[]>([]);
  isLoading = signal(false);
  showHistory = false;

  ngOnInit(): void {
    this.loadSessions();
  }

  loadSessions(): void {
    this.isLoading.set(true);
    this.authService.getUserSessions(this.showHistory).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.sessions.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.message.error('Ошибка загрузки сессий');
        this.isLoading.set(false);
      },
    });
  }

  revokeSession(id: number): void {
    this.authService.revokeSession(id).subscribe({
      next: () => {
        this.message.success('Сессия успешно завершена');
        this.loadSessions(); // Reload to update status
      },
      error: () => this.message.error('Не удалось завершить сессию'),
    });
  }

  // --- Helpers ---

  isCurrentSession(session: UserSessionDto): boolean {
    const currentToken = localStorage.getItem('refreshToken');
    return session.refreshToken === currentToken;
  }

  isExpired(session: UserSessionDto): boolean {
    return new Date(session.expiresAt) < new Date();
  }

  getShortUserAgent(userAgent?: string): string {
    if (!userAgent) return 'Неизвестное устройство';
    // Simple parser for display
    if (userAgent.length > 60) {
      // Try to extract useful parts (Browser + OS)
      // Very basic heuristic
      const parts = userAgent.split(') ');
      if (parts.length > 0) return parts[0] + ')'; // Return first part usually containing OS
      return userAgent.substring(0, 60) + '...';
    }
    return userAgent;
  }

  getDeviceIcon(userAgent?: string): string {
    if (!userAgent) return 'desktop';
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'mobile';
    if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';
    return 'desktop';
  }

  getDeviceClass(userAgent?: string): string {
    if (!userAgent) return '';
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'windows-device';
    if (ua.includes('mac') || ua.includes('ios')) return 'apple-device';
    if (ua.includes('android')) return 'mobile-device';
    return 'clean-device';
  }
}
