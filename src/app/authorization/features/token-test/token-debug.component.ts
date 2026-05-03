// src/app/auth/components/token-debug.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { AuthService } from '@auth/services/auth.service';
import { ApiResponse, UserProfileDto } from '@auth/models';
import { HttpErrorResponse } from '@angular/common/http';
import { TokenService, TokenStatus } from '@auth/services/token.service';

@Component({
  selector: 'app-token-debug',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzTagModule,
    NzAlertModule,
    NzDividerModule,
  ],
  template: `
    <div class="debug-container">
      <nz-card nzTitle="Панель отладки токена" [nzExtra]="extraTemplate" class="token-debug">
        <div *ngIf="tokenStatus$ | async as status">
          <nz-alert
            *ngIf="!status.isValid"
            nzType="error"
            nzMessage="Токен недействителен или истек"
            nzShowIcon
            style="margin-bottom: 16px;"
          ></nz-alert>

          <nz-alert
            *ngIf="status.isValid && status.timeUntilExpiry < 300000"
            nzType="warning"
            nzMessage="Срок действия токена скоро истечет"
            [nzDescription]="
              'Осталось времени: ' + tokenService.formatTimeUntilExpiry(status.timeUntilExpiry)
            "
            nzShowIcon
            style="margin-bottom: 16px;"
          ></nz-alert>

          <nz-descriptions nzBordered [nzColumn]="1" style="margin-bottom: 24px;">
            <nz-descriptions-item nzTitle="Статус">
              <nz-tag [nzColor]="tokenService.getStatusColor(status)">
                {{ tokenService.getStatusText(status) }}
              </nz-tag>
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="Email пользователя" *ngIf="status.userEmail">
              {{ status.userEmail }}
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="ID пользователя" *ngIf="status.userId">
              {{ status.userId }}
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="Роли" *ngIf="status.userRoles.length > 0">
              <nz-tag nzColor="blue" *ngFor="let role of status.userRoles">
                {{ role }}
              </nz-tag>
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="Истекает в" *ngIf="status.expiresAt">
              {{ status.expiresAt | date : 'dd.MM.yyyy HH:mm:ss' }}
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="Осталось времени" *ngIf="status.isValid">
              <span [class.text-warning]="status.timeUntilExpiry < 300000">
                {{ tokenService.formatTimeUntilExpiry(status.timeUntilExpiry) }}
              </span>
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="Последняя проверка">
              {{ status.lastChecked | date : 'dd.MM.yyyy HH:mm:ss' }}
            </nz-descriptions-item>
          </nz-descriptions>

          <nz-divider nzText="Состояние клиента"></nz-divider>

          <nz-descriptions nzBordered [nzColumn]="1" style="margin-bottom: 24px;">
            <nz-descriptions-item nzTitle="Авторизован">
              <nz-tag [nzColor]="authService.isLoggedIn() ? 'green' : 'red'">
                {{ authService.isLoggedIn() ? 'Да' : 'Нет' }}
              </nz-tag>
            </nz-descriptions-item>

            <nz-descriptions-item
              nzTitle="Текущий пользователь"
              *ngIf="authService.getCurrentUser()"
            >
              {{ authService.getCurrentUser()?.email }}
            </nz-descriptions-item>

            <nz-descriptions-item
              nzTitle="Роли клиента"
              *ngIf="authService.getUserRoles().length > 0"
            >
              <nz-tag nzColor="purple" *ngFor="let role of authService.getUserRoles()">
                {{ role }}
              </nz-tag>
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="Является админом">
              <nz-tag [nzColor]="authService.isAdminUser() ? 'green' : 'default'">
                {{ authService.isAdminUser() ? 'Да' : 'Нет' }}
              </nz-tag>
            </nz-descriptions-item>

            <nz-descriptions-item nzTitle="Является модератором">
              <nz-tag [nzColor]="authService.isModeratorUser() ? 'green' : 'default'">
                {{ authService.isModeratorUser() ? 'Да' : 'Нет' }}
              </nz-tag>
            </nz-descriptions-item>
          </nz-descriptions>

          <div class="actions">
            <button nz-button nzType="default" (click)="refreshStatus()" [nzLoading]="loading">
              Обновить статус
            </button>

            <button nz-button nzType="primary" (click)="testRefresh()" [nzLoading]="loading">
              Проверить обновление токена
            </button>

            <button
              nz-button
              nzType="default"
              (click)="validateConsistency()"
              [nzLoading]="loading"
            >
              Проверить согласованность
            </button>

            <button nz-button nzType="default" (click)="checkCookies()" [nzLoading]="loading">
              Проверить Cookies
            </button>

            <button nz-button nzDanger (click)="clearSession()">Очистить сессию</button>
          </div>

          <div *ngIf="testResults" class="test-results">
            <nz-divider nzText="Результаты тестов"></nz-divider>
            <pre>{{ testResults }}</pre>
          </div>
        </div>

        <ng-template #extraTemplate>
          <button nz-button nzSize="small" (click)="copyInfo()">Скопировать инфо</button>
        </ng-template>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .debug-container {
        padding: 24px;
        max-width: 1000px;
        margin: 0 auto;
      }

      .token-debug {
        margin: 16px;
        max-width: 800px;
      }

      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .text-warning {
        color: #faad14;
        font-weight: 600;
      }

      .test-results {
        background: #f5f5f5;
        padding: 16px;
        border-radius: 6px;
        max-height: 400px;
        overflow: auto;
        margin-top: 16px;
      }

      .test-results pre {
        margin: 0;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 12px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-break: break-word;
      }

      nz-alert {
        margin-bottom: 16px;
      }
    `,
  ],
})
export class TokenDebugComponent implements OnInit {
  public tokenService = inject(TokenService);
  public authService = inject(AuthService);
  private message = inject(NzMessageService);

  tokenStatus$!: Observable<TokenStatus>;
  loading = false;
  testResults = '';

  ngOnInit() {
    this.tokenStatus$ = this.tokenService.getTokenStatus();
  }

  refreshStatus() {
    this.loading = true;
    this.tokenService.checkTokenStatus().subscribe({
      next: (status) => {
        this.message.success('Статус обновлен');
        this.testResults = `Обновление статуса: Успешно
Действителен: ${status.isValid}
Пользователь: ${status.userEmail}
Роли: [${status.userRoles.join(', ')}]
Истекает: ${status.expiresAt?.toLocaleString() || 'Неизвестно'}
Последняя проверка: ${status.lastChecked.toLocaleString()}`;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.message.error('Не удалось обновить статус');
        this.testResults = `Обновление статуса: Ошибка
${error.message}`;
        this.loading = false;
      },
    });
  }

  testRefresh() {
    this.loading = true;
    this.authService.refreshToken().subscribe({
      next: (response: ApiResponse<{ user: UserProfileDto }>) => {
        this.message.success('Токен успешно обновлен');
        this.testResults = `Обновление токена: Успешно
Пользователь: ${response.data?.user.email}
Успех: ${response.success}
Время: ${new Date().toLocaleString()}`;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.message.error('Обновление токена не удалось');
        this.testResults = `Обновление токена: Не удалось
Ошибка: ${error.message}
Статус: ${error.status}
Время: ${new Date().toLocaleString()}`;
        this.loading = false;
      },
    });
  }

  validateConsistency() {
    this.loading = true;
    const clientUser = this.authService.getCurrentUser();
    const clientRoles = this.authService.getUserRoles();

    this.tokenService.validateConsistency(clientUser?.email, clientRoles).subscribe({
      next: (result) => {
        if (result.isConsistent) {
          this.message.success('Данные согласованы');
          this.testResults = `Проверка согласованности: ПРОЙДЕНА
Данные клиента и сервера полностью совпадают.

Инфо с сервера:
- Email: ${result.serverInfo?.email}
- Роли: [${result.serverInfo?.roles.join(', ')}]
- ID пользователя: ${result.serverInfo?.userId}

Инфо с клиента:
- Email: ${result.clientInfo.email || 'Нет'}
- Роли: [${result.clientInfo.roles?.join(', ') || 'Нет'}]`;
        } else {
          this.message.warning('Найдены несоответствия');
          this.testResults = `Проверка согласованности: НАЙДЕНЫ ПРОБЛЕМЫ

Различия:
${result.differences.map((difference: string) => '- ' + difference).join('\n')}

Инфо с клиента:
- Email: ${result.clientInfo.email || 'Нет'}
- Роли: [${result.clientInfo.roles?.join(', ') || 'Нет'}]

Инфо с сервера:
- Email: ${result.serverInfo?.email || 'Нет'}
- Роли: [${result.serverInfo?.roles.join(', ') || 'Нет'}]
- ID пользователя: ${result.serverInfo?.userId || 'Нет'}`;
        }
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.message.error('Ошибка проверки согласованности');
        this.testResults = `Проверка согласованности: Ошибка
${error.message}`;
        this.loading = false;
      },
    });
  }

  checkCookies() {
    this.loading = true;
    this.tokenService.getCookieInfo().subscribe({
      next: (cookieInfo) => {
        this.message.success('Информация о cookies получена');
        this.testResults = `Проверка Cookies: Успешно
Есть Access Token: ${cookieInfo.hasAccessToken}
Есть Refresh Token: ${cookieInfo.hasRefreshToken}
Всего Cookies: ${cookieInfo.cookieCount}
Ответ сервера: ${cookieInfo.success}
Время: ${new Date().toLocaleString()}`;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.message.error('Проверка cookies не удалась');
        this.testResults = `Проверка Cookies: Ошибка
${error.message}
Время: ${new Date().toLocaleString()}`;
        this.loading = false;
      },
    });
  }

  clearSession() {
    this.authService.clearSession();
    this.message.success('Сессия очищена');
    this.testResults = `Сессия успешно очищена
Все данные на стороне клиента удалены
Статус токена сброшен
Время: ${new Date().toLocaleString()}`;
  }

  copyInfo() {
    const status = this.tokenService.getCurrentStatus();
    const user = this.authService.getCurrentUser();

    const info = {
      tokenStatus: status,
      clientState: {
        isAuthenticated: this.authService.isLoggedIn(),
        currentUser: user,
        roles: this.authService.getUserRoles(),
        isAdmin: this.authService.isAdminUser(),
        isModerator: this.authService.isModeratorUser(),
      },
      timestamp: new Date().toISOString(),
      testResults: this.testResults || null,
    };

    navigator.clipboard.writeText(JSON.stringify(info, null, 2)).then(() => {
      this.message.success('Отладочная информация скопирована в буфер обмена');
    });
  }
}


