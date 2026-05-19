// src/app/auth/components/admin-activity-logs/admin-activity-logs.component.ts
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivityLogsService } from '@auth/services/activity-logs.service';
import { ActivityLogDto } from '@auth/models';
import { ACTIVITY_ACTION_LABELS } from '@auth/models';

@Component({
  selector: 'app-admin-activity-logs',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzTagModule, NzButtonModule, NzIconModule],
  template: `
    <div class="logs-container">
      <div class="header">
        <h2>Логи активности</h2>
        <button nz-button nzType="default" (click)="loadLogs()">
          <span nz-icon nzType="reload"></span>
          Обновить
        </button>
      </div>

      <nz-table [nzData]="logs" [nzLoading]="loading" [nzPageSize]="20">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Действие</th>
            <th>Статус</th>
            <th>Дата</th>
            <th>IP адрес</th>
            <th>Устройство</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let log of logs">
            <td>{{ log.userFullName }}</td>
            <td>{{ getActionLabel(log.action) }}</td>
            <td>
              <nz-tag [nzColor]="log.success ? 'green' : 'red'">
                {{ log.success ? 'Успех' : 'Ошибка' }}
              </nz-tag>
            </td>
            <td>{{ log.timestamp | date: 'short' }}</td>
            <td>{{ log.ipAddress || 'N/A' }}</td>
            <td>{{ log.deviceType }}</td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `,
  styles: [
    `
      .logs-container {
        padding: 24px;
        background: #fff;
        border-radius: 8px;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }

      .header h2 {
        margin: 0;
      }
    `,
  ],
})
export class AdminActivityLogsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly activityLogsService = inject(ActivityLogsService);
  private readonly message = inject(NzMessageService);

  logs: ActivityLogDto[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLogs(): void {
    this.loading = true;
    this.activityLogsService
      .getRecentActivities(50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.logs = response.data || [];
          this.loading = false;
        },
        error: () => {
          this.message.error('Ошибка при загрузке логов');
          this.loading = false;
        },
      });
  }

  getActionLabel(action: string): string {
    return ACTIVITY_ACTION_LABELS[action as keyof typeof ACTIVITY_ACTION_LABELS] || action;
  }
}
