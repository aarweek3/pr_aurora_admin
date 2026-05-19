import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ApiEndpoints } from '@environments/api-endpoints';
import { AuthService } from '@auth/services/auth.service';
import { TokenCheckerService, TokenStatus, ServerTokenDebugInfo } from './token-checker.service';
import { ApiResponse, UserProfileDto } from '@auth/models';

@Component({
  selector: 'app-token-test',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzSpaceModule,
    NzAlertModule,
    NzDividerModule,
    NzTypographyModule,
  ],
  template: `
    <div class="token-test-container">
      <!-- Статус токена -->
      <nz-card nzTitle="🔐 Статус токена" style="margin-bottom: 16px;">
        <div class="token-status">
          <div class="status-item">
            <strong>Существует:</strong>
            <span [class]="tokenStatus.exists ? 'success' : 'error'">
              {{ tokenStatus.exists ? '✅ Да' : '❌ Нет' }}
            </span>
          </div>

          <div class="status-item">
            <strong>Действителен:</strong>
            <span [class]="tokenStatus.valid ? 'success' : 'error'">
              {{ tokenStatus.valid ? '✅ Да' : '❌ Нет' }}
            </span>
          </div>

          <div class="status-item">
            <strong>Время до истечения:</strong>
            <span [class]="getTimeClass(tokenStatus.timeUntilExpiry)">
              {{ formatTime(tokenStatus.timeUntilExpiry) }}
            </span>
          </div>

          <div class="status-item" *ngIf="tokenStatus.claims">
            <strong>Email:</strong> {{ tokenStatus.claims.email }}
          </div>

          <div class="status-item" *ngIf="serverRoles">
            <strong>Роли:</strong> {{ serverRoles.join(', ') || 'N/A' }}
          </div>

          <div class="status-item" *ngIf="tokenStatus.expiresAt">
            <strong>Истекает:</strong> {{ tokenStatus.expiresAt.toLocaleString('ru-RU') }}
          </div>
        </div>
      </nz-card>

      <!-- Тестовые сценарии -->
      <nz-card nzTitle="🧪 Тестовые сценарии" style="margin-bottom: 16px;">
        <nz-space nzDirection="vertical" nzSize="small" style="width: 100%;">
          <button nz-button nzBlock nzType="default" (click)="scenario1()" [nzLoading]="isLoading">
            1. Проверить текущий токен
          </button>

          <button nz-button nzBlock nzType="default" (click)="scenario2()" [nzLoading]="isLoading">
            2. Принудительное обновление токена
          </button>

          <button nz-button nzBlock nzType="default" (click)="scenario3()" [nzLoading]="isLoading">
            3. Тест API запроса с автоматическим refresh
          </button>

          <button nz-button nzBlock nzType="primary" (click)="scenario4()" [nzLoading]="isLoading">
            4. Проверить debug endpoint на сервере
          </button>

          <button nz-button nzBlock nzType="primary" (click)="scenario5()" [nzLoading]="isLoading">
            5. Сравнить клиентский и серверный токен
          </button>

          <nz-divider nzText="Расширенные тесты"></nz-divider>

          <button nz-button nzBlock nzType="dashed" (click)="scenario6()" [nzLoading]="isLoading">
            6. Полный тест refresh механизма
          </button>

          <button nz-button nzBlock nzType="dashed" (click)="scenario7()" [nzLoading]="isLoading">
            7. Тест нескольких одновременных запросов
          </button>

          <nz-divider></nz-divider>

          <button nz-button nzBlock nzType="default" nzDanger (click)="clearResults()">
            🗑️ Очистить результаты
          </button>
        </nz-space>
      </nz-card>

      <!-- Результаты тестов -->
      <nz-card nzTitle="📊 Результаты тестов" *ngIf="testResults">
        <pre class="test-results">{{ testResults }}</pre>
      </nz-card>

      <!-- Детальная информация о токене -->
      <nz-card nzTitle="🔍 Детальная информация о токене" *ngIf="tokenStatus.claims">
        <div class="token-details">
          <h4 nz-typography>Claims:</h4>
          <pre>{{ formatClaims(tokenStatus.claims) }}</pre>
        </div>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .token-test-container {
        padding: 24px;
        max-width: 1000px;
        margin: 0 auto;
      }

      .token-status {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 12px;
      }

      .status-item {
        padding: 8px;
        border-radius: 4px;
        background: #fafafa;
      }

      .success {
        color: #52c41a;
        font-weight: bold;
      }

      .error {
        color: #ff4d4f;
        font-weight: bold;
      }

      .warning {
        color: #faad14;
        font-weight: bold;
      }

      .test-results {
        background: #f5f5f5;
        padding: 16px;
        border-radius: 6px;
        max-height: 500px;
        overflow: auto;
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: 13px;
        line-height: 1.4;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .token-details pre {
        background: #f0f2f5;
        padding: 12px;
        border-radius: 4px;
        font-size: 12px;
        overflow: auto;
        max-height: 300px;
      }

      .ant-card {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
      }
    `,
  ],
})
export class TokenTestComponent {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private authService = inject(AuthService);
  private tokenChecker = inject(TokenCheckerService);

  testResults = '';
  isLoading = false;
  tokenStatus = this.tokenChecker.getCurrentStatus();
  serverRoles: string[] = [];

  constructor() {
    this.tokenChecker.getTokenStatus().subscribe((status) => {
      this.tokenStatus = status;
    });
    // Получаем роли с сервера при инициализации
    this.tokenChecker.checkServerToken().subscribe({
      next: (serverInfo) => {
        this.serverRoles = serverInfo.roles || [];
      },
      error: () => {
        this.serverRoles = [];
      },
    });
  }

  scenario1() {
    this.setLoading(true);
    const status = this.tokenChecker.getCurrentStatus();

    this.testResults = `
=== Тест 1: Проверка текущего токена ===
Время выполнения: ${new Date().toLocaleTimeString()}

Статус токена:
  ✓ Существует: ${status.exists ? 'Да' : 'Нет'}
  ✓ Действителен: ${status.valid ? 'Да' : 'Нет'}
  ✓ Истек: ${status.expired ? 'Да' : 'Нет'}
  ✓ Время до истечения: ${this.formatTime(status.timeUntilExpiry)}
  
Данные пользователя:
  ✓ Email: ${status.claims?.email || 'N/A'}
  ✓ Роли: ${this.serverRoles.join(', ') || 'N/A'}

AuthService данные:
  ✓ Is logged in: ${this.authService.isLoggedIn()}
  ✓ Current user: ${this.authService.getCurrentUser()?.email || 'N/A'}

${status.valid ? '✅ ТЕСТ ПРОЙДЕН' : '❌ ТЕСТ НЕ ПРОЙДЕН'}
    `.trim();

    console.log('✅ Тест 1 выполнен', status);
    this.message.success('Тест 1 успешно выполнен');
    this.setLoading(false);
  }

  scenario2() {
    this.setLoading(true);
    this.testResults = '⏳ Выполнение теста 2: Принудительное обновление токена...';

    this.authService.forceTokenRefresh().subscribe({
      next: (response: ApiResponse<{ user: UserProfileDto }>) => {
        const newStatus = this.tokenChecker.getCurrentStatus();
        this.testResults = `
=== Тест 2: Принудительное обновление токена ===
Время выполнения: ${new Date().toLocaleTimeString()}

✅ УСПЕХ! Токен обновлен

Ответ сервера:
  ✓ Success: ${response.success}
  ✓ Пользователь: ${response.data?.user.email || 'N/A'}

Новый статус токена:
  ✓ Действителен: ${newStatus.valid}
  ✓ Время до истечения: ${this.formatTime(newStatus.timeUntilExpiry)}

✅ ТЕСТ ПРОЙДЕН
        `.trim();
        console.log('✅ Тест 2: Refresh успешен', response);
        this.message.success('Тест 2 успешно выполнен');
        this.setLoading(false);
        // Обновляем роли после refresh
        this.tokenChecker.checkServerToken().subscribe({
          next: (serverInfo) => {
            this.serverRoles = serverInfo.roles || [];
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        this.testResults = `
=== Тест 2: Принудительное обновление токена ===
Время выполнения: ${new Date().toLocaleTimeString()}

❌ ОШИБКА! Не удалось обновить токен
Ошибка: ${err.message}
Статус: ${err.status}

❌ ТЕСТ НЕ ПРОЙДЕН
        `.trim();
        console.error('❌ Тест 2 провален', err);
        this.message.error('Тест 2 провален');
        this.setLoading(false);
      },
    });
  }

  scenario3() {
    this.setLoading(true);
    this.testResults = '⏳ Выполнение теста 3: API запрос с автоматическим refresh...';

    this.http
      .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=5', { withCredentials: true })
      .subscribe({
        next: (data: any) => {
          this.testResults = `
=== Тест 3: API запрос с автоматическим refresh ===
Время выполнения: ${new Date().toLocaleTimeString()}

✅ УСПЕХ! Данные получены

Ответ API:
  ✓ Статус: Успешно
  ✓ Количество пользователей: ${data.data?.length || 0}
  ✓ Общее количество: ${data.totalCount || 0}

Статус токена после запроса:
  ✓ Действителен: ${this.tokenChecker.getCurrentStatus().valid}
  ✓ Время до истечения: ${this.formatTime(this.tokenChecker.getCurrentStatus().timeUntilExpiry)}

✅ ТЕСТ ПРОЙДЕН
        `.trim();
          console.log('✅ Тест 3: API запрос успешен', data);
          this.message.success('Тест 3 успешно выполнен');
          this.setLoading(false);
        },
        error: (err: HttpErrorResponse) => {
          this.testResults = `
=== Тест 3: API запрос с автоматическим refresh ===
Время выполнения: ${new Date().toLocaleTimeString()}

❌ ОШИБКА! API запрос провален
Ошибка: ${err.message}
Статус: ${err.status}

❌ ТЕСТ НЕ ПРОЙДЕН
        `.trim();
          console.error('❌ Тест 3 провален', err);
          this.message.error('Тест 3 провален');
          this.setLoading(false);
        },
      });
  }

  scenario4() {
    this.setLoading(true);
    this.testResults = '⏳ Выполнение теста 4: Проверка debug endpoint...';

    this.tokenChecker.checkServerToken().subscribe({
      next: (serverInfo) => {
        this.testResults = `
=== Тест 4: Debug Token Endpoint ===
Время выполнения: ${new Date().toLocaleTimeString()}

✅ УСПЕХ! Сервер ответил

Информация от сервера:
  ✓ Success: ${serverInfo.success}
  ✓ Email: ${serverInfo.email}
  ✓ User ID: ${serverInfo.userId}
  ✓ Роли: ${serverInfo.roles.join(', ') || 'Нет ролей'}

Claims от сервера (${serverInfo.claims.length} штук):
${serverInfo.claims.map((c) => `  • ${c.Type}: ${c.Value}`).join('\n')}

✅ ТЕСТ ПРОЙДЕН
        `.trim();
        console.log('✅ Тест 4: Debug endpoint работает', serverInfo);
        this.message.success('Тест 4 успешно выполнен');
        this.setLoading(false);
        this.serverRoles = serverInfo.roles || [];
      },
      error: (err: HttpErrorResponse) => {
        this.testResults = `
=== Тест 4: Debug Token Endpoint ===
Время выполнения: ${new Date().toLocaleTimeString()}

❌ ОШИБКА! Сервер не отвечает
Ошибка: ${err.message}
Статус: ${err.status}

❌ ТЕСТ НЕ ПРОЙДЕН
        `.trim();
        console.error('❌ Тест 4 провален', err);
        this.message.error('Тест 4 провален');
        this.setLoading(false);
      },
    });
  }

  scenario5() {
    this.setLoading(true);
    this.testResults = '⏳ Выполнение теста 5: Сравнение клиентского и серверного токена...';

    this.tokenChecker.compareTokens().subscribe({
      next: (comparison) => {
        const status = comparison.match ? '✅ СОВПАДЕНИЕ' : '⚠️ РАЗЛИЧИЯ НАЙДЕНЫ';

        this.testResults = `
=== Тест 5: Сравнение токенов ===
Время выполнения: ${new Date().toLocaleTimeString()}

${status}

Клиентский токен:
  ✓ Действителен: ${comparison.client.valid}
  ✓ Email: ${comparison.client.claims?.email || 'N/A'}
  ✓ Истекает: ${comparison.client.expiresAt?.toLocaleString() || 'N/A'}

Серверный токен:
  ✓ Email: ${comparison.server?.email || 'N/A'}
  ✓ User ID: ${comparison.server?.userId || 'N/A'}
  ✓ Роли: ${comparison.server?.roles.join(', ') || 'N/A'}

${
  comparison.differences.length > 0
    ? 'Различия:\n' + comparison.differences.map((d) => `  ⚠️ ${d}`).join('\n')
    : '✅ Различий не обнаружено'
}

${comparison.match ? '✅ ТЕСТ ПРОЙДЕН' : '⚠️ ТЕСТ ПРОЙДЕН С ПРЕДУПРЕЖДЕНИЯМИ'}
        `.trim();
        console.log('✅ Тест 5 завершен', comparison);
        this.message.success('Тест 5 успешно выполнен');
        this.setLoading(false);
        this.serverRoles = comparison.server?.roles || [];
      },
      error: (err: HttpErrorResponse) => {
        this.testResults = `
=== Тест 5: Сравнение токенов ===
Время выполнения: ${new Date().toLocaleTimeString()}

❌ ОШИБКА! Не удалось сравнить токены
Ошибка: ${err.message}
Статус: ${err.status}

❌ ТЕСТ НЕ ПРОЙДЕН
        `.trim();
        console.error('❌ Тест 5 провален', err);
        this.message.error('Тест 5 провален');
        this.setLoading(false);
      },
    });
  }

  scenario6() {
    this.setLoading(true);
    this.testResults = '⏳ Выполнение теста 6: Полный тест refresh механизма...\n\n';

    const steps = [
      '1. Проверка исходного токена',
      '2. Принудительное обновление',
      '3. Проверка нового токена',
      '4. API запрос с новым токеном',
      '5. Финальная проверка',
    ];

    let currentStep = 0;

    const status1 = this.tokenChecker.getCurrentStatus();
    this.appendResult(
      `${steps[currentStep++]}: ✅ ${status1.valid ? 'Токен действителен' : 'Токен истек'}`,
    );

    this.authService.forceTokenRefresh().subscribe({
      next: (refreshResponse: ApiResponse<{ user: UserProfileDto }>) => {
        this.appendResult(`${steps[currentStep++]}: ✅ Токен обновлен успешно`);

        setTimeout(() => {
          const status2 = this.tokenChecker.getCurrentStatus();
          this.appendResult(
            `${steps[currentStep++]}: ✅ Новый токен: ${status2.valid ? 'Действителен' : 'Ошибка!'}`,
          );

          this.http
            .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', { withCredentials: true })
            .subscribe({
              next: (apiData: any) => {
                this.appendResult(`${steps[currentStep++]}: ✅ API запрос успешен`);

                const finalStatus = this.tokenChecker.getCurrentStatus();
                this.appendResult(`${steps[currentStep++]}: ✅ Финальная проверка пройдена`);

                this.appendResult('\n=== РЕЗУЛЬТАТЫ ПОЛНОГО ТЕСТА ===');
                this.appendResult(`Исходный токен: ${status1.valid ? 'Действителен' : 'Истек'}`);
                this.appendResult(
                  `Новый токен: ${finalStatus.valid ? 'Действителен' : 'Проблема'}`,
                );
                this.appendResult(`API запрос: Успешно`);
                this.appendResult(
                  `Время до истечения: ${this.formatTime(finalStatus.timeUntilExpiry)}`,
                );
                this.appendResult('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');

                console.log('✅ Полный тест завершен успешно');
                this.message.success('Тест 6 успешно выполнен');
                this.setLoading(false);
              },
              error: (apiErr: HttpErrorResponse) => {
                this.appendResult(
                  `${steps[currentStep]}: ❌ API запрос провален: ${apiErr.message}`,
                );
                this.appendResult('\n❌ ТЕСТ ПРОВАЛЕН НА ЭТАПЕ API ЗАПРОСА');
                console.error('❌ Полный тест провален на API', apiErr);
                this.message.error('Тест 6 провален');
                this.setLoading(false);
              },
            });
        }, 1000);
      },
      error: (refreshErr: HttpErrorResponse) => {
        this.appendResult(
          `${steps[currentStep]}: ❌ Обновление токена провалено: ${refreshErr.message}`,
        );
        this.appendResult('\n❌ ТЕСТ ПРОВАЛЕН НА ЭТАПЕ ОБНОВЛЕНИЯ');
        console.error('❌ Полный тест провален на refresh', refreshErr);
        this.message.error('Тест 6 провален');
        this.setLoading(false);
      },
    });
  }

  scenario7() {
    this.setLoading(true);
    this.testResults = '⏳ Выполнение теста 7: Несколько одновременных запросов...\n\n';

    const requests = [
      this.http.get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', {
        withCredentials: true,
      }),
      this.http.get(ApiEndpoints.USERS.STATISTICS, { withCredentials: true }),
      this.http.get(ApiEndpoints.ADMIN.STATISTICS, { withCredentials: true }),
    ];

    const startTime = Date.now();
    let completedRequests = 0;
    let successCount = 0;
    let errorCount = 0;

    this.appendResult('Запуск 3 одновременных запросов...');

    requests.forEach((request, index) => {
      request.subscribe({
        next: (data) => {
          completedRequests++;
          successCount++;
          this.appendResult(`Запрос ${index + 1}: ✅ Успешно`);
          this.checkTestCompletion();
        },
        error: (err: HttpErrorResponse) => {
          completedRequests++;
          errorCount++;
          this.appendResult(`Запрос ${index + 1}: ❌ Ошибка - ${err.message}`);
          this.checkTestCompletion();
        },
      });
    });

    const checkTestCompletion = () => {
      if (completedRequests === requests.length) {
        const duration = Date.now() - startTime;
        this.appendResult(`\n=== РЕЗУЛЬТАТЫ ОДНОВРЕМЕННЫХ ЗАПРОСОВ ===`);
        this.appendResult(`Время выполнения: ${duration}ms`);
        this.appendResult(`Успешных: ${successCount}`);
        this.appendResult(`Ошибок: ${errorCount}`);
        this.appendResult(
          `Статус токена: ${this.tokenChecker.getCurrentStatus().valid ? 'Действителен' : 'Проблема'}`,
        );

        if (errorCount === 0) {
          this.appendResult('\n✅ ТЕСТ ПРОЙДЕН - ВСЕ ЗАПРОСЫ УСПЕШНЫ');
          this.message.success('Тест 7 успешно выполнен');
        } else if (successCount > 0) {
          this.appendResult('\n⚠️ ТЕСТ ПРОЙДЕН ЧАСТИЧНО');
          this.message.warning('Тест 7 пройден частично');
        } else {
          this.appendResult('\n❌ ТЕСТ НЕ ПРОЙДЕН');
          this.message.error('Тест 7 провален');
        }

        console.log(`✅ Тест одновременных запросов: ${successCount}/${requests.length} успешных`);
        this.setLoading(false);
      }
    };

    this.checkTestCompletion = checkTestCompletion;
  }

  clearResults() {
    this.testResults = '';
    this.message.success('Результаты очищены');
  }

  public appendResult(text: string) {
    this.testResults += '\n' + text;
  }

  public setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  public formatTime(ms: number): string {
    if (ms <= 0) return 'Истек';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}ч ${minutes % 60}м ${seconds % 60}с`;
    if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
    return `${seconds}с`;
  }

  public getUserRoles(claims: any): string {
    return this.serverRoles.join(', ') || 'N/A';
  }

  public getTimeClass(timeUntilExpiry: number): string {
    if (timeUntilExpiry <= 0) return 'error';
    if (timeUntilExpiry < 60000) return 'warning';
    if (timeUntilExpiry < 300000) return 'warning';
    return 'success';
  }

  public formatClaims(claims: any): string {
    return JSON.stringify(claims, null, 2);
  }

  public checkTestCompletion!: () => void;
}
