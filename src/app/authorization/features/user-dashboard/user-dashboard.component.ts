import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzStatisticModule,
    NzDropDownModule,
  ],
  template: `
    <div style="padding: 24px;">
      <nz-card style="margin-bottom: 24px;">
        <h1>USER</h1>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="margin: 0; font-size: 24px;">Добро пожаловать, {{ getUserName() }}!</h1>
            <p style="margin: 8px 0; color: #666;">Ваша роль: {{ getUserRoles() }}</p>
            <p style="margin: 0; color: #999;">{{ getCurrentDate() }}</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button nz-button nzType="text" [routerLink]="['/profile']">
              <span nz-icon nzType="user"></span>
              Профиль
            </button>
            <button nz-button nzType="text" nzDanger (click)="logout()">
              <span nz-icon nzType="logout"></span>
              Выход
            </button>
          </div>
        </div>
      </nz-card>

      <nz-card nzTitle="Быстрые действия" style="margin-bottom: 24px;">
        <div nz-row [nzGutter]="16">
          <div nz-col [nzSpan]="6">
            <button nz-button nzType="primary" nzBlock nzSize="large" [routerLink]="['/profile']">
              <span nz-icon nzType="user"></span>
              Мой профиль
            </button>
          </div>

          <div nz-col [nzSpan]="18">
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button nz-button nzType="default" nzSize="large" [routerLink]="['/admin/test']">
                <span nz-icon nzType="experiment"></span>
                Тест
              </button>
              <button nz-button nzType="default" nzSize="large" [routerLink]="['/admin/test-one']">
                <span nz-icon nzType="experiment"></span>
                Тест №1
              </button>
              <button nz-button nzType="default" nzSize="large" [routerLink]="['/admin/test-two']">
                <span nz-icon nzType="experiment"></span>
                Тест №2
              </button>
              <button nz-button nzType="default" nzSize="large" [routerLink]="['/admin/cors-test']">
                <span nz-icon nzType="api"></span>
                CORS тест
              </button>
              <button nz-button nzType="default" nzSize="large" disabled>
                <span nz-icon nzType="file-text"></span>
                Документы
              </button>
            </div>
          </div>
        </div>
      </nz-card>

      <div nz-row [nzGutter]="16" style="margin-bottom: 24px;">
        <div nz-col [nzSpan]="8">
          <nz-card>
            <nz-statistic nzTitle="Активные сессии" [nzValue]="1" nzSuffix="сессия"></nz-statistic>
          </nz-card>
        </div>
        <div nz-col [nzSpan]="8">
          <nz-card>
            <nz-statistic nzTitle="Последний вход" [nzValue]="getLastLoginTime()"></nz-statistic>
          </nz-card>
        </div>
        <div nz-col [nzSpan]="8">
          <nz-card>
            <nz-statistic nzTitle="Уведомления" [nzValue]="0" nzSuffix="новых"></nz-statistic>
          </nz-card>
        </div>
      </div>

      <nz-card nzTitle="Последняя активность">
        <div
          style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;"
        >
          <span nz-icon nzType="login"></span>
          <span>Вход в систему - {{ getLastLoginTime() }}</span>
        </div>
        <div
          style="display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;"
        >
          <span nz-icon nzType="user"></span>
          <span>Обновление профиля - вчера</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 8px 0;">
          <span nz-icon nzType="file-text"></span>
          <span>Просмотр документов - 5 дней назад</span>
        </div>
      </nz-card>
    </div>
  `,
})
export class UserDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private message = inject(NzMessageService);

  ngOnInit(): void {
    console.log('UserDashboard загружен для пользователя');
  }

  logout(): void {
    this.message.loading('Выход из системы...');
    this.authService.logout().subscribe({
      next: () => {
        this.message.remove();
        this.message.success('До свидания!');
      },
      error: () => {
        this.message.remove();
        this.message.error('Ошибка при выходе');
        this.router.navigate(['/auth/login']);
      },
    });
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.fullName || user?.email || 'Пользователь';
  }

  getUserRoles(): string {
    const roles = this.authService.getUserRoles();
    return roles.length > 0 ? roles.join(', ') : 'Пользователь';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  getLastLoginTime(): string {
    return new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
