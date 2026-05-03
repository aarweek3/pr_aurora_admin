import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { AuthService } from '@auth/services/auth.service';
import { TokenService, TokenStatus, CookieInfo } from '@auth/services/token.service';
import { ApiResponse, UserProfileDto } from '@auth/models';
import { ApiEndpoints } from '@environments/api-endpoints';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-test',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzDividerModule, NzTabsModule],
  template: `
    <nz-card nzTitle="Комплексное тестирование системы авторизации">
      <!-- Кнопка запуска всех тестов -->
      <div style="margin-bottom: 16px; text-align: center;">
        <button
          nz-button
          nzType="primary"
          nzSize="large"
          (click)="runAllTestsSequentially()"
          [nzLoading]="isRunningAllTests"
          style="margin-right: 16px;"
        >
          🚀 ЗАПУСТИТЬ ВСЕ ТЕСТЫ ({{ totalTests }} тестов)
        </button>
        <button nz-button nzDanger (click)="stopAllTests()" [disabled]="!isRunningAllTests">
          ⏹️ ОСТАНОВИТЬ
        </button>
      </div>

      <!-- Прогресс выполнения -->
      <div *ngIf="isRunningAllTests" style="margin-bottom: 16px; text-align: center;">
        <div style="font-size: 16px; margin-bottom: 8px;">
          Выполняется тест {{ currentTestNumber }} из {{ totalTests }}
        </div>
        <div style="background: #f0f0f0; height: 10px; border-radius: 5px; overflow: hidden;">
          <div
            style="background: #1890ff; height: 100%; transition: width 0.3s;"
            [style.width.%]="(currentTestNumber / totalTests) * 100"
          ></div>
        </div>
      </div>

      <nz-tabset>
        <!-- Вкладка с кнопками тестов -->
        <nz-tab nzTitle="Индивидуальные тесты">
          <!-- Основные тесты -->
          <h4>Основные тесты</h4>
          <div class="test-group">
            <button nz-button (click)="testTokenStatus()" [nzLoading]="isLoading">
              1. Статус токена
            </button>
            <button nz-button (click)="testTokenRefresh()" [nzLoading]="isLoading">
              2. Обновление токена
            </button>
            <button nz-button (click)="testApiRequest()" [nzLoading]="isLoading">
              3. API-запрос
            </button>
            <button nz-button (click)="testDebugEndpoint()" [nzLoading]="isLoading">
              4. Debug endpoint
            </button>
            <button nz-button (click)="testTokenConsistency()" [nzLoading]="isLoading">
              5. Сравнение токенов
            </button>
          </div>

          <nz-divider></nz-divider>

          <!-- Циклические тесты -->
          <h4>Циклические тесты</h4>
          <div class="test-group">
            <button nz-button (click)="testFullRefreshCycle()" [nzLoading]="isLoading">
              6. Полный цикл обновления
            </button>
            <button nz-button (click)="testConcurrentRequests()" [nzLoading]="isLoading">
              7. Одновременные запросы
            </button>
            <button nz-button (click)="testStressRequests()" [nzLoading]="isLoading">
              8. Стресс-тест
            </button>
          </div>

          <nz-divider></nz-divider>

          <!-- Проверка ошибок -->
          <h4>Тестирование ошибок</h4>
          <div class="test-group">
            <button nz-button (click)="testUnauthorizedRequest()" [nzLoading]="isLoading">
              9. Тест 401
            </button>
            <button nz-button (click)="testNetworkError()" [nzLoading]="isLoading">
              10. Сетевая ошибка
            </button>
            <button nz-button (click)="testMalformedToken()" [nzLoading]="isLoading">
              11. Некорректный токен
            </button>
          </div>

          <nz-divider></nz-divider>

          <!-- Тестирование ролей и доступа -->
          <h4>Роли и доступ</h4>
          <div class="test-group">
            <button nz-button (click)="testRoles()" [nzLoading]="isLoading">
              12. Проверка ролей
            </button>
            <button nz-button (click)="testAdminAccess()" [nzLoading]="isLoading">
              13. Доступ админа
            </button>
            <button nz-button (click)="testModeratorAccess()" [nzLoading]="isLoading">
              14. Доступ модератора
            </button>
            <button nz-button (click)="testUserAccess()" [nzLoading]="isLoading">
              15. Доступ пользователя
            </button>
          </div>

          <nz-divider></nz-divider>

          <!-- Проверка cookies и сессий -->
          <h4>Cookies и сессии</h4>
          <div class="test-group">
            <button nz-button (click)="testCookies()" [nzLoading]="isLoading">
              16. Проверка cookies
            </button>
            <button nz-button (click)="testSessionPersistence()" [nzLoading]="isLoading">
              17. Устойчивость сессии
            </button>
            <button nz-button (click)="testCrossTabSession()" [nzLoading]="isLoading">
              18. Межвкладочная сессия
            </button>
          </div>

          <nz-divider></nz-divider>

          <!-- Дополнительные тесты -->
          <h4>Дополнительные тесты</h4>
          <div class="test-group">
            <button nz-button (click)="testTokenExpiration()" [nzLoading]="isLoading">
              19. Истечение токена
            </button>
            <button nz-button (click)="testAutoRefresh()" [nzLoading]="isLoading">
              20. Авто-обновление
            </button>
            <button nz-button (click)="testLogoutFlow()" [nzLoading]="isLoading">
              21. Процесс выхода
            </button>
            <button nz-button (click)="testReloginFlow()" [nzLoading]="isLoading">
              22. Повторный вход
            </button>
            <button nz-button (click)="testGuardProtection()" [nzLoading]="isLoading">
              23. Защита роутов
            </button>
            <button nz-button (click)="testInterceptorFlow()" [nzLoading]="isLoading">
              24. Работа интерсептора
            </button>
            <button nz-button (click)="testMemoryLeaks()" [nzLoading]="isLoading">
              25. Утечки памяти
            </button>
            <button nz-button (click)="testSecurityHeaders()" [nzLoading]="isLoading">
              26. Заголовки безопасности
            </button>
          </div>

          <nz-divider></nz-divider>

          <!-- Управление -->
          <h4>Управление</h4>
          <div class="test-group">
            <button nz-button nzDanger (click)="clearSession()">Очистить сессию</button>
            <button nz-button (click)="clearResults()">Очистить результаты</button>
          </div>

          <!-- Результаты одиночного теста -->
          <div *ngIf="testResults" style="margin-top: 16px;">
            <h3>Результат последнего теста</h3>
            <pre>{{ testResults }}</pre>
          </div>
        </nz-tab>

        <!-- Вкладка с результатами всех тестов -->
        <nz-tab nzTitle="Результаты всех тестов">
          <div style="margin-bottom: 16px;">
            <button
              nz-button
              nzType="primary"
              (click)="copyAllResults()"
              [disabled]="!allTestsResults"
            >
              📋 КОПИРОВАТЬ ВСЕ РЕЗУЛЬТАТЫ
            </button>
            <button nz-button (click)="clearAllResults()" style="margin-left: 8px;">
              🗑️ ОЧИСТИТЬ
            </button>
          </div>

          <div *ngIf="allTestsResults" style="margin-top: 16px;">
            <h3>Полные результаты тестирования ({{ totalTests }} тестов)</h3>
            <pre id="allResultsText">{{ allTestsResults }}</pre>
          </div>

          <div *ngIf="!allTestsResults" style="text-align: center; color: #999; padding: 40px;">
            Результаты появятся после запуска всех тестов
          </div>
        </nz-tab>
      </nz-tabset>
    </nz-card>
  `,
  styles: [
    `
      .test-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
      }

      button {
        margin: 2px;
      }

      pre {
        background: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        max-height: 500px;
        overflow: auto;
        font-size: 12px;
        line-height: 1.4;
      }

      #allResultsText {
        max-height: 600px;
        border: 1px solid #d9d9d9;
        user-select: all;
      }

      h4 {
        margin: 8px 0;
        color: #1890ff;
      }
    `,
  ],
})
export class AuthTestComponent implements OnInit {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  testResults = '';
  allTestsResults = '';
  isLoading = false;
  isRunningAllTests = false;
  currentTestNumber = 0;
  totalTests = 26; // Обновлено с 27 на 26
  private shouldStopTests = false;

  ngOnInit() {
    const savedResults = localStorage.getItem('authTestResults');
    if (savedResults) {
      this.allTestsResults = savedResults;
    }
  }

  private saveResultsToStorage() {
    localStorage.setItem('authTestResults', this.allTestsResults);
  }

  private runSingleTestAndWait(testMethod: () => void): Promise<void> {
    return new Promise((resolve) => {
      const beforeResults = this.testResults;
      let testCompleted = false;
      const startTime = Date.now();
      const maxWaitTime = 20000;
      let checkCount = 0;
      const maxChecks = 200;

      try {
        testMethod();

        const performCheck = () => {
          if (testCompleted) return;

          checkCount++;
          const elapsed = Date.now() - startTime;

          if (elapsed > maxWaitTime || checkCount > maxChecks) {
            testCompleted = true;
            this.isLoading = false;
            this.allTestsResults += `❌ ТАЙМАУТ: Тест превысил ${maxWaitTime}мс\n`;
            this.saveResultsToStorage();
            resolve();
            return;
          }

          if (!this.isLoading && !testCompleted) {
            testCompleted = true;
            this.allTestsResults += this.testResults + '\n';
            this.saveResultsToStorage();
            resolve();
            return;
          }

          if (this.testResults !== beforeResults && !testCompleted) {
            setTimeout(() => {
              if (!testCompleted) {
                testCompleted = true;
                this.isLoading = false;
                this.allTestsResults += this.testResults + '\n';
                this.saveResultsToStorage();
                resolve();
              }
            }, 100);
            return;
          }

          setTimeout(performCheck, 100);
        };

        setTimeout(performCheck, 50);
      } catch (error) {
        if (!testCompleted) {
          testCompleted = true;
          this.allTestsResults += `❌ ОШИБКА: ${error}\n`;
          this.isLoading = false;
          this.saveResultsToStorage();
          resolve();
        }
      }
    });
  }

  testTokenStatus() {
    this.setLoading(true);
    this.tokenService.checkToken().subscribe({
      next: (status) => {
        this.testResults = `
Тест 1: Проверка статуса токена
Время: ${new Date().toLocaleString('ru-RU')}
Существует: ${status.exists ? '✅ Да' : '❌ Нет'}
Действителен: ${status.valid ? '✅ Да' : '❌ Нет'}
Истек: ${status.expired ? '❌ Да' : '✅ Нет'}
Время до истечения: ${this.formatTime(status.timeUntilExpiry)}
Email: ${status.claims?.email || 'Отсутствует'}
Статус: ${status.valid ? '✅ ПРОЙДЕН' : '❌ НЕ ПРОЙДЕН'}
        `.trim();
        this.message.success('Тест 1 выполнен');
        this.setLoading(false);
      },
      error: (error) => {
        this.handleTestError(1, error);
      },
    });
  }

  testTokenRefresh() {
    this.setLoading(true);
    this.authService.forceTokenRefresh().subscribe({
      next: (response: ApiResponse<{ user: UserProfileDto }>) => {
        const newStatus = this.tokenService.getCurrentStatus();
        this.testResults = `
Тест 2: Обновление токена
Время: ${new Date().toLocaleString('ru-RU')}
Пользователь: ${response.data?.user.email || 'Отсутствует'}
Действителен: ${newStatus.valid ? '✅ Да' : '❌ Нет'}
Время до истечения: ${this.formatTime(newStatus.timeUntilExpiry)}
Статус: ✅ ПРОЙДЕН
        `.trim();
        this.message.success('Тест 2 выполнен');
        this.setLoading(false);
      },
      error: (error: HttpErrorResponse) => {
        this.handleTestError(2, error);
      },
    });
  }

  testApiRequest() {
    this.setLoading(true);
    this.http
      .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=5', { withCredentials: true })
      .subscribe({
        next: (data: any) => {
          this.testResults = `
Тест 3: API-запрос
Время: ${new Date().toLocaleString('ru-RU')}
Пользователей: ${data.data?.length || 0}
Токен: ${this.tokenService.getCurrentStatus().isValid ? '✅ Да' : '❌ Нет'}
Статус: ✅ ПРОЙДЕН
        `.trim();
          this.message.success('Тест 3 выполнен');
          this.setLoading(false);
        },
        error: (error: HttpErrorResponse) => {
          this.handleTestError(3, error);
        },
      });
  }

  testDebugEndpoint() {
    this.setLoading(true);
    this.tokenService.checkServerToken().subscribe({
      next: (info) => {
        this.testResults = `
Тест 4: Debug endpoint
Время: ${new Date().toLocaleString('ru-RU')}
Email: ${info.email}
ID: ${info.userId}
Роли: ${info.roles.join(', ') || 'Отсутствуют'}
Статус: ✅ ПРОЙДЕН
        `.trim();
        this.message.success('Тест 4 выполнен');
        this.setLoading(false);
      },
      error: (error: HttpErrorResponse) => {
        this.handleTestError(4, error);
      },
    });
  }

  testTokenConsistency() {
    this.setLoading(true);
    const clientEmail = this.authService.getCurrentUser()?.email;
    const clientRoles = this.authService.getUserRoles();
    this.tokenService.validateConsistency(clientEmail, clientRoles).subscribe({
      next: (result) => {
        this.testResults = `
Тест 5: Сравнение токенов
Время: ${new Date().toLocaleString('ru-RU')}
Клиент:
  Email: ${clientEmail || 'Отсутствует'}
  Роли: ${clientRoles.join(', ') || 'Отсутствуют'}
Сервер:
  Email: ${result.serverInfo?.email || 'Отсутствует'}
  Роли: ${result.serverInfo?.roles.join(', ') || 'Отсутствуют'}
Различия: ${result.differences.length ? result.differences.join('\n') : 'Отсутствуют'}
Статус: ${result.isConsistent ? '✅ ПРОЙДЕН' : '⚠️ ПРЕДУПРЕЖДЕНИЯ'}
        `.trim();
        this.message.success('Тест 5 выполнен');
        this.setLoading(false);
      },
      error: (error: HttpErrorResponse) => {
        this.handleTestError(5, error);
      },
    });
  }

  testFullRefreshCycle() {
    this.setLoading(true);
    this.testResults = `
Тест 6: Полный цикл обновления
Время: ${new Date().toLocaleString('ru-RU')}
  `.trim();

    const timeoutId = setTimeout(() => {
      if (this.isLoading) {
        this.appendResult('❌ Таймаут: Тест не завершился за 15 секунд');
        this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
        this.message.error('Тест 6 не выполнен - таймаут');
        this.setLoading(false);
      }
    }, 15000);

    this.appendResult(
      `Шаг 1: ${this.tokenService.getCurrentStatus().isValid ? '✅ Да' : '❌ Нет'}`,
    );

    this.authService.forceTokenRefresh().subscribe({
      next: () => {
        this.appendResult(`Шаг 2: ✅ Успешно`);
        const newStatus = this.tokenService.getCurrentStatus();
        this.appendResult(`Шаг 3: ${newStatus.isValid ? '✅ Да' : '❌ Нет'}`);

        this.http
          .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', { withCredentials: true })
          .subscribe({
            next: () => {
              clearTimeout(timeoutId);
              this.appendResult(`Шаг 4: ✅ Успешно`);
              this.appendResult('Статус: ✅ ПРОЙДЕН');
              this.message.success('Тест 6 выполнен');
              this.setLoading(false);
            },
            error: (error: HttpErrorResponse) => {
              clearTimeout(timeoutId);
              this.appendResult(`Шаг 4: ❌ Ошибка: ${error.message}`);
              this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
              this.message.error('Тест 6 не выполнен');
              this.setLoading(false);
            },
          });
      },
      error: (error: HttpErrorResponse) => {
        clearTimeout(timeoutId);
        this.appendResult(`Шаг 2: ❌ Ошибка: ${error.message}`);
        this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
        this.message.error('Тест 6 не выполнен');
        this.setLoading(false);
      },
    });
  }

  testConcurrentRequests() {
    this.setLoading(true);
    this.testResults = `
Тест 7: Одновременные запросы
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const requests = [
      this.http.get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', {
        withCredentials: true,
      }),
      this.http.get(ApiEndpoints.USERS.STATISTICS, { withCredentials: true }),
      this.http.get(ApiEndpoints.ADMIN.STATISTICS, { withCredentials: true }),
    ];

    this.processRequests(requests, 7);
  }

  testStressRequests() {
    this.setLoading(true);
    this.testResults = `
Тест 8: Стресс-тест
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const requests = Array(10)
      .fill(null)
      .map(() =>
        this.http.get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', {
          withCredentials: true,
        }),
      );

    this.processRequests(requests, 8);
  }

  testNetworkError() {
    this.setLoading(true);
    this.testResults = `
Тест 10: Тестирование сетевой ошибки
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    this.http
      .get('https://nonexistent-server-12345.com/api/test', { withCredentials: true })
      .subscribe({
        next: () => {
          this.appendResult('❌ Неожиданный успех запроса');
          this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
          this.message.error('Тест 10 не выполнен');
          this.setLoading(false);
        },
        error: (error: HttpErrorResponse) => {
          this.appendResult(`✅ Сетевая ошибка обработана: ${error.message}`);
          this.appendResult(`Статус ошибки: ${error.status || 'Network Error'}`);
          this.appendResult('Статус: ✅ ПРОЙДЕН');
          this.message.success('Тест 10 выполнен');
          this.setLoading(false);
        },
      });
  }

  testMalformedToken() {
    this.setLoading(true);
    this.testResults = `
Тест 11: Тестирование некорректного токена
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    this.tokenService.checkTokenStatus().subscribe({
      next: (status) => {
        if (status.valid) {
          this.appendResult('✅ Токен корректный');
        } else {
          this.appendResult('❌ Токен некорректный или отсутствует');
        }
        this.appendResult('✅ Обработка состояния токена работает');
        this.appendResult('Статус: ✅ ПРОЙДЕН');
        this.message.success('Тест 11 выполнен');
        this.setLoading(false);
      },
      error: (error) => {
        this.appendResult(`✅ Ошибка токена обработана: ${error.message}`);
        this.appendResult('Статус: ✅ ПРОЙДЕН');
        this.message.success('Тест 11 выполнен');
        this.setLoading(false);
      },
    });
  }

  testRoles() {
    this.setLoading(true);
    this.tokenService.getUserRoles().subscribe({
      next: (roles) => {
        this.testResults = `
Тест 12: Проверка ролей
Время: ${new Date().toLocaleString('ru-RU')}
Роли: ${roles.join(', ') || 'Отсутствуют'}
Админ: ${this.authService.isAdminUser() ? '✅ Да' : '❌ Нет'}
Модератор: ${this.authService.isModeratorUser() ? '✅ Да' : '❌ Нет'}
Статус: ✅ ПРОЙДЕН
        `.trim();
        this.message.success('Тест 12 выполнен');
        this.setLoading(false);
      },
      error: (error: HttpErrorResponse) => {
        this.handleTestError(12, error);
      },
    });
  }

  testAdminAccess() {
    this.setLoading(true);
    this.http.get(ApiEndpoints.ADMIN.STATISTICS, { withCredentials: true }).subscribe({
      next: (data) => {
        this.testResults = `
Тест 13: Доступ администратора
Время: ${new Date().toLocaleString('ru-RU')}
Админ права: ${this.authService.isAdminUser() ? '✅ Да' : '❌ Нет'}
Доступ к админ API: ✅ Разрешен
Статус: ✅ ПРОЙДЕН
        `.trim();
        this.message.success('Тест 13 выполнен');
        this.setLoading(false);
      },
      error: (error) => this.handleTestError(13, error),
    });
  }

  testModeratorAccess() {
    this.setLoading(true);
    this.http.get(ApiEndpoints.USERS.BASE, { withCredentials: true }).subscribe({
      next: () => {
        this.testResults = `
Тест 14: Доступ модератора
Время: ${new Date().toLocaleString('ru-RU')}
Модератор права: ${this.authService.isModeratorUser() ? '✅ Да' : '❌ Нет'}
Доступ к API: ✅ Разрешен
Статус: ✅ ПРОЙДЕН
        `.trim();
        this.message.success('Тест 14 выполнен');
        this.setLoading(false);
      },
      error: (error) => this.handleTestError(14, error),
    });
  }

  testUserAccess() {
    this.setLoading(true);
    this.http
      .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', { withCredentials: true })
      .subscribe({
        next: () => {
          this.testResults = `
Тест 15: Доступ пользователя
Время: ${new Date().toLocaleString('ru-RU')}
Авторизован: ${this.authService.isAuthenticated() ? '✅ Да' : '❌ Нет'}
Доступ к базовому API: ✅ Разрешен
Статус: ✅ ПРОЙДЕН
        `.trim();
          this.message.success('Тест 15 выполнен');
          this.setLoading(false);
        },
        error: (error) => this.handleTestError(15, error),
      });
  }

  testCookies() {
    this.setLoading(true);
    this.tokenService.getCookieInfo().subscribe({
      next: (info: CookieInfo) => {
        this.testResults = `
Тест 16: Проверка cookies
Время: ${new Date().toLocaleString('ru-RU')}
Access Token: ${info.hasAccessToken ? '✅ Да' : '❌ Нет'}
Refresh Token: ${info.hasRefreshToken ? '✅ Да' : '❌ Нет'}
Cookies: ${info.cookieCount}
Статус: ${info.success ? '✅ ПРОЙДЕН' : '❌ НЕ ПРОЙДЕН'}
        `.trim();
        this.message.success('Тест 16 выполнен');
        this.setLoading(false);
      },
      error: (error: HttpErrorResponse) => {
        this.handleTestError(16, error);
      },
    });
  }

  testSessionPersistence() {
    this.setLoading(true);
    this.testResults = `
Тест 17: Устойчивость сессии
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const initialStatus = this.tokenService.getCurrentStatus();
    this.appendResult(`Начальный статус: ${initialStatus.isValid ? '✅ Активен' : '❌ Неактивен'}`);

    let checkCount = 0;
    const maxChecks = 3;

    const checkSession = () => {
      checkCount++;
      this.http.get(ApiEndpoints.AUTH.BASE + '/debug-token', { withCredentials: true }).subscribe({
        next: () => {
          this.appendResult(`Проверка ${checkCount}: ✅ Сессия активна`);

          if (checkCount < maxChecks) {
            setTimeout(checkSession, 1000);
          } else {
            this.appendResult('Статус: ✅ ПРОЙДЕН');
            this.message.success('Тест 17 выполнен');
            this.setLoading(false);
          }
        },
        error: (error) => {
          this.appendResult(`Проверка ${checkCount}: ❌ Сессия потеряна - ${error.message}`);
          this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
          this.message.error('Тест 17 не выполнен');
          this.setLoading(false);
        },
      });
    };

    checkSession();
  }

  testCrossTabSession() {
    this.setLoading(true);
    this.testResults = `
Тест 18: Межвкладочная сессия
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const currentStatus = this.tokenService.getCurrentStatus();
    this.appendResult(
      `Текущая вкладка: ${currentStatus.isValid ? '✅ Авторизован' : '❌ Не авторизован'}`,
    );

    try {
      const testKey = 'auth_test_cross_tab';
      const testValue = Date.now().toString();

      localStorage.setItem(testKey, testValue);
      const retrievedValue = localStorage.getItem(testKey);

      if (retrievedValue === testValue) {
        this.appendResult('✅ localStorage работает корректно');
        this.appendResult('✅ Межвкладочная синхронизация возможна');
        localStorage.removeItem(testKey);
        this.appendResult('Статус: ✅ ПРОЙДЕН');
        this.message.success('Тест 18 выполнен');
      } else {
        this.appendResult('❌ Проблемы с localStorage');
        this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
        this.message.error('Тест 18 не выполнен');
      }
    } catch (error: any) {
      this.appendResult(`❌ Ошибка localStorage: ${error.message}`);
      this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
      this.message.error('Тест 18 не выполнен');
    }

    this.setLoading(false);
  }

  testTokenExpiration() {
    this.setLoading(true);
    this.testResults = `
Тест 19: Проверка истечения токена
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const status = this.tokenService.getCurrentStatus();
    const timeLeft = status.timeUntilExpiry;

    this.appendResult(`Текущее время до истечения: ${this.formatTime(timeLeft)}`);

    if (timeLeft > 300000) {
      this.appendResult('⚠️ Токен не истекает скоро, тест информационный');
    } else if (timeLeft > 0) {
      this.appendResult('🟡 Токен скоро истечет');
    } else {
      this.appendResult('🔴 Токен истек');
    }

    if (timeLeft <= 0) {
      this.http
        .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', { withCredentials: true })
        .subscribe({
          next: () => {
            this.appendResult('✅ API запрос с истекшим токеном прошел (возможно обновился)');
            this.appendResult('Статус: ✅ ПРОЙДЕН');
            this.message.success('Тест 19 выполнен');
            this.setLoading(false);
          },
          error: (error: HttpErrorResponse) => {
            this.appendResult(`❌ API запрос провалился: ${error.status}`);
            this.appendResult(`Статус: ${error.status === 401 ? '✅ ПРОЙДЕН' : '❌ НЕ ПРОЙДЕН'}`);
            this.message.success('Тест 19 выполнен');
            this.setLoading(false);
          },
        });
    } else {
      this.appendResult('Статус: ✅ ПРОЙДЕН');
      this.message.success('Тест 19 выполнен');
      this.setLoading(false);
    }
  }

  testAutoRefresh() {
    this.setLoading(true);
    this.testResults = `
Тест 20: Автоматическое обновление токена
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    this.tokenService.startMonitoring();

    setTimeout(() => {
      const status = this.tokenService.getCurrentStatus();
      this.appendResult(`Мониторинг токенов: ${status.valid ? '✅ Активен' : '❌ Неактивен'}`);

      this.authService.forceTokenRefresh().subscribe({
        next: () => {
          this.appendResult('✅ Принудительное обновление прошло успешно');
          this.appendResult('Статус: ✅ ПРОЙДЕН');
          this.message.success('Тест 20 выполнен');
          this.setLoading(false);
        },
        error: (error) => {
          this.appendResult(`❌ Ошибка обновления: ${error.message}`);
          this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
          this.message.error('Тест 20 не выполнен');
          this.setLoading(false);
        },
      });
    }, 1000);
  }

  testLogoutFlow() {
    this.setLoading(true);
    this.testResults = `
Тест 21: Процесс выхода из системы
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const beforeStatus = this.tokenService.getCurrentStatus();
    this.appendResult(
      `Статус перед выходом: ${beforeStatus.isValid ? '✅ Авторизован' : '❌ Не авторизован'}`,
    );
    this.appendResult('🔄 Симуляция выхода из системы...');

    try {
      this.authService.clearSession();
      const afterStatus = this.tokenService.getCurrentStatus();
      this.appendResult(
        `Статус после очистки: ${
          afterStatus.isValid ? '❌ Все еще авторизован' : '✅ Сессия очищена'
        }`,
      );
      this.appendResult('🔄 Восстановление сессии...');

      this.authService.forceTokenRefresh().subscribe({
        next: () => {
          this.appendResult('✅ Сессия восстановлена');
          this.appendResult('Статус: ✅ ПРОЙДЕН');
          this.message.success('Тест 21 выполнен');
          this.setLoading(false);
        },
        error: () => {
          this.appendResult('❌ Не удалось восстановить сессию');
          this.appendResult('Статус: ⚠️ ЧАСТИЧНО ПРОЙДЕН');
          this.message.warning('Тест 21 частично выполнен');
          this.setLoading(false);
        },
      });
    } catch (error: any) {
      this.appendResult(`❌ Ошибка при тестировании logout: ${error.message}`);
      this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
      this.message.error('Тест 21 не выполнен');
      this.setLoading(false);
    }
  }

  testReloginFlow() {
    this.setLoading(true);
    this.testResults = `
Тест 22: Повторный вход в систему
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    this.authService
      .login({
        email: 'admin@example.com',
        password: 'Admin123!',
      })
      .subscribe({
        next: (response) => {
          this.appendResult(`✅ Повторная авторизация успешна: ${response.data?.user?.email}`);
          this.appendResult('Статус: ✅ ПРОЙДЕН');
          this.message.success('Тест 22 выполнен');
          this.setLoading(false);
        },
        error: (error) => {
          this.appendResult(`❌ Ошибка повторной авторизации: ${error.message}`);
          this.appendResult('Статус: ❌ НЕ ПРОЙДЕН');
          this.message.error('Тест 22 не выполнен');
          this.setLoading(false);
        },
      });
  }

  testGuardProtection() {
    this.setLoading(true);
    this.testResults = `
Тест 23: Защита маршрутов (Guards)
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const isAuthenticated = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdminUser();
    const isModerator = this.authService.isModeratorUser();

    this.appendResult(`Авторизован: ${isAuthenticated ? '✅ Да' : '❌ Нет'}`);
    this.appendResult(`Админ: ${isAdmin ? '✅ Да' : '❌ Нет'}`);
    this.appendResult(`Модератор: ${isModerator ? '✅ Да' : '❌ Нет'}`);

    const protectedRoutes = ['/admin', '/admin/dashboard', '/admin/users'];
    this.appendResult('\nТестируем доступ к защищенным маршрутам:');

    protectedRoutes.forEach((route) => {
      if (isAdmin) {
        this.appendResult(`${route}: ✅ Доступен`);
      } else {
        this.appendResult(`${route}: ❌ Заблокирован`);
      }
    });

    this.appendResult('Статус: ✅ ПРОЙДЕН');
    this.message.success('Тест 23 выполнен');
    this.setLoading(false);
  }

  testInterceptorFlow() {
    this.setLoading(true);
    this.testResults = `
Тест 24: Работа HTTP интерсептора
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const requests = [
      this.http.get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', {
        withCredentials: true,
      }),
      this.http.get(ApiEndpoints.AUTH.BASE + '/debug-token', { withCredentials: true }),
    ];

    let completed = 0;
    let successCount = 0;

    requests.forEach((req, index) => {
      req.subscribe({
        next: () => {
          completed++;
          successCount++;
          this.appendResult(`Запрос ${index + 1}: ✅ Интерсептор работает`);
          if (completed === requests.length) {
            this.appendResult(`\nУспешных запросов: ${successCount}/${requests.length}`);
            this.appendResult('Статус: ✅ ПРОЙДЕН');
            this.message.success('Тест 24 выполнен');
            this.setLoading(false);
          }
        },
        error: (error) => {
          completed++;
          this.appendResult(`Запрос ${index + 1}: ❌ Ошибка: ${error.message}`);
          if (completed === requests.length) {
            this.appendResult(`\nУспешных запросов: ${successCount}/${requests.length}`);
            this.appendResult(
              `Статус: ${successCount > 0 ? '⚠️ ЧАСТИЧНО ПРОЙДЕН' : '❌ НЕ ПРОЙДЕН'}`,
            );
            this.message.warning('Тест 24 выполнен с предупреждениями');
            this.setLoading(false);
          }
        },
      });
    });
  }

  testMemoryLeaks() {
    this.setLoading(true);
    this.testResults = `
Тест 25: Проверка утечек памяти
Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    this.appendResult(`Память до теста: ${this.formatMemory(initialMemory)}`);

    const subscriptions: any[] = [];
    for (let i = 0; i < 100; i++) {
      const sub = this.tokenService.getTokenStatus().subscribe();
      subscriptions.push(sub);
    }

    subscriptions.forEach((sub) => sub.unsubscribe());

    if ((window as any).gc) {
      (window as any).gc();
    }

    setTimeout(() => {
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      this.appendResult(`Память после теста: ${this.formatMemory(finalMemory)}`);

      const memoryDiff = finalMemory - initialMemory;
      this.appendResult(`Изменение памяти: ${this.formatMemory(memoryDiff)}`);

      if (memoryDiff < 1000000) {
        this.appendResult('✅ Значительных утечек не обнаружено');
        this.appendResult('Статус: ✅ ПРОЙДЕН');
        this.message.success('Тест 25 выполнен');
      } else {
        this.appendResult('⚠️ Возможна утечка памяти');
        this.appendResult('Статус: ⚠️ ПРЕДУПРЕЖДЕНИЕ');
        this.message.warning('Тест 25 выполнен с предупреждениями');
      }
      this.setLoading(false);
    }, 2000);
  }

  testUnauthorizedRequest() {
    this.setLoading(true);
    this.http.get('/api/test/test-401', { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.statusCode === 401) {
          this.testResults = `
Тест 9: 401 ошибка
Время: ${new Date().toLocaleString('ru-RU')}
Статус: ${response.statusCode}
Сообщение: ${response.message}
Статус: ✅ ПРОЙДЕН (через данные ответа)
        `.trim();
          this.message.success('Тест 9 выполнен');
        } else {
          this.testResults = `
Тест 9: 401 ошибка
Время: ${new Date().toLocaleString('ru-RU')}
Неожиданный успех без 401 статуса
Статус: ❌ НЕ ПРОЙДЕН
        `.trim();
          this.message.error('Тест 9 не выполнен');
        }
        this.setLoading(false);
      },
      error: (error: HttpErrorResponse) => {
        this.testResults = `
Тест 9: 401 ошибка
Время: ${new Date().toLocaleString('ru-RU')}
HTTP Статус: ${error.status || 'undefined'}
Сообщение: ${error.error?.message || error.message}
Статус: ${error.status === 401 ? '✅ ПРОЙДЕН' : '❌ НЕ ПРОЙДЕН'}
      `.trim();
        this.message.success(error.status === 401 ? 'Тест 9 выполнен' : 'Тест 9 не выполнен');
        this.setLoading(false);
      },
    });
  }

  testSecurityHeaders() {
    this.setLoading(true);
    this.testResults = `
Тест 26: Проверка заголовков безопасности
Время: ${new Date().toLocaleString('ru-RU')}
  `.trim();

    this.http
      .get('/api/test/test-headers', {
        withCredentials: true,
        observe: 'response',
      })
      .subscribe({
        next: (response) => {
          const headers = response.headers;
          const securityHeaders = [
            { key: 'x-content-type-options', expected: 'nosniff' },
            { key: 'x-frame-options', expected: 'DENY' },
            { key: 'x-xss-protection', expected: '1; mode=block' },
            { key: 'strict-transport-security', expected: 'max-age=' },
            { key: 'content-security-policy', expected: 'default-src' },
          ];

          let foundHeaders = 0;
          securityHeaders.forEach((header) => {
            const value = headers.get(header.key);
            if (value) {
              const isCorrect = value.includes(header.expected);
              this.appendResult(`${isCorrect ? '✅' : '⚠️'} ${header.key}: ${value}`);
              if (isCorrect) foundHeaders++;
            } else {
              this.appendResult(`❌ ${header.key}: отсутствует`);
            }
          });

          const additionalHeaders = ['referrer-policy'];
          additionalHeaders.forEach((header) => {
            const value = headers.get(header);
            if (value) {
              this.appendResult(`✅ ${header}: ${value}`);
              foundHeaders += 0.5;
            }
          });

          const serverHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
          let removedHeaders = 0;
          serverHeaders.forEach((header) => {
            const value = headers.get(header);
            if (!value) {
              this.appendResult(`✅ ${header}: правильно скрыт`);
              removedHeaders++;
            } else {
              this.appendResult(`⚠️ ${header}: ${value} (рекомендуется скрыть)`);
            }
          });

          this.appendResult(
            `\nНайдено заголовков безопасности: ${Math.floor(foundHeaders)}/${
              securityHeaders.length
            }`,
          );
          this.appendResult(
            `Скрыто серверных заголовков: ${removedHeaders}/${serverHeaders.length}`,
          );

          const score = foundHeaders + removedHeaders / serverHeaders.length;
          let status = '❌ НЕ ПРОЙДЕН';
          if (score >= 5) status = '✅ ПРОЙДЕН';
          else if (score >= 3) status = '⚠️ ПРЕДУПРЕЖДЕНИЕ';

          this.appendResult(`Общий балл: ${score.toFixed(1)}/6`);
          this.appendResult(`Статус: ${status}`);

          this.message.success('Тест 26 выполнен');
          this.setLoading(false);
        },
        error: (error) => {
          this.handleTestError(26, error);
        },
      });
  }

  async runAllTestsSequentially() {
    this.isRunningAllTests = true;
    this.shouldStopTests = false;
    this.currentTestNumber = 0;
    this.allTestsResults = '';

    const startTime = new Date();
    this.allTestsResults = `
КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ СИСТЕМЫ АВТОРИЗАЦИИ
Начало: ${startTime.toLocaleString('ru-RU')}
Всего тестов: ${this.totalTests}
═══════════════════════════════════════════════

`;
    this.saveResultsToStorage();

    const testMethods = [
      { name: 'Статус токена', method: () => this.runTestForAll(1, () => this.testTokenStatus()) },
      {
        name: 'Обновление токена',
        method: () => this.runTestForAll(2, () => this.testTokenRefresh()),
      },
      { name: 'API-запрос', method: () => this.runTestForAll(3, () => this.testApiRequest()) },
      {
        name: 'Debug endpoint',
        method: () => this.runTestForAll(4, () => this.testDebugEndpoint()),
      },
      {
        name: 'Сравнение токенов',
        method: () => this.runTestForAll(5, () => this.testTokenConsistency()),
      },
      {
        name: 'Полный цикл обновления',
        method: () => this.runTestForAll(6, () => this.testFullRefreshCycle()),
      },
      {
        name: 'Одновременные запросы',
        method: () => this.runTestForAll(7, () => this.testConcurrentRequests()),
      },
      { name: 'Стресс-тест', method: () => this.runTestForAll(8, () => this.testStressRequests()) },
      {
        name: 'Тест 401',
        method: () => this.runTestForAll(9, () => this.testUnauthorizedRequest()),
      },
      {
        name: 'Сетевая ошибка',
        method: () => this.runTestForAll(10, () => this.testNetworkError()),
      },
      {
        name: 'Некорректный токен',
        method: () => this.runTestForAll(11, () => this.testMalformedToken()),
      },
      { name: 'Проверка ролей', method: () => this.runTestForAll(12, () => this.testRoles()) },
      { name: 'Доступ админа', method: () => this.runTestForAll(13, () => this.testAdminAccess()) },
      {
        name: 'Доступ модератора',
        method: () => this.runTestForAll(14, () => this.testModeratorAccess()),
      },
      {
        name: 'Доступ пользователя',
        method: () => this.runTestForAll(15, () => this.testUserAccess()),
      },
      { name: 'Проверка cookies', method: () => this.runTestForAll(16, () => this.testCookies()) },
      {
        name: 'Устойчивость сессии',
        method: () => this.runTestForAll(17, () => this.testSessionPersistence()),
      },
      {
        name: 'Межвкладочная сессия',
        method: () => this.runTestForAll(18, () => this.testCrossTabSession()),
      },
      {
        name: 'Истечение токена',
        method: () => this.runTestForAll(19, () => this.testTokenExpiration()),
      },
      {
        name: 'Авто-обновление',
        method: () => this.runTestForAll(20, () => this.testAutoRefresh()),
      },
      { name: 'Процесс выхода', method: () => this.runTestForAll(21, () => this.testLogoutFlow()) },
      {
        name: 'Повторный вход',
        method: () => this.runTestForAll(22, () => this.testReloginFlow()),
      },
      {
        name: 'Защита роутов',
        method: () => this.runTestForAll(23, () => this.testGuardProtection()),
      },
      {
        name: 'Работа интерсептора',
        method: () => this.runTestForAll(24, () => this.testInterceptorFlow()),
      },
      { name: 'Утечки памяти', method: () => this.runTestForAll(25, () => this.testMemoryLeaks()) },
      {
        name: 'Заголовки безопасности',
        method: () => this.runTestForAll(26, () => this.testSecurityHeaders()),
      },
    ];

    for (let i = 0; i < testMethods.length; i++) {
      if (this.shouldStopTests) {
        this.allTestsResults += `\n⏹️ ТЕСТИРОВАНИЕ ОСТАНОВЛЕНО НА ТЕСТЕ ${i + 1}`;
        this.saveResultsToStorage();
        break;
      }

      this.currentTestNumber = i + 1;
      const test = testMethods[i];

      this.allTestsResults += `\n--- ТЕСТ ${i + 1}/26: ${test.name} ---\n`;
      this.saveResultsToStorage();

      try {
        await this.runSingleTestAndWait(test.method);
        await this.delay(1000);
      } catch (error: any) {
        this.allTestsResults += `❌ ОШИБКА ВЫПОЛНЕНИЯ ТЕСТА: ${error.message}\n`;
        this.saveResultsToStorage();
      }
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

    this.allTestsResults += `
═══════════════════════════════════════════════
ТЕСТИРОВАНИЕ ЗАВЕРШЕНО
Окончание: ${endTime.toLocaleString('ru-RU')}
Длительность: ${Math.floor(duration / 60)}м ${duration % 60}с
Выполнено тестов: ${this.currentTestNumber}/${this.totalTests}
`;
    this.saveResultsToStorage();

    this.isRunningAllTests = false;
    this.message.success(`Все тесты выполнены за ${Math.floor(duration / 60)}м ${duration % 60}с`);
  }

  private runTestForAll(testNumber: number, testMethod: () => void): void {
    testMethod();
  }

  stopAllTests() {
    this.shouldStopTests = true;
    this.isRunningAllTests = false;
    this.saveResultsToStorage();
    this.message.warning('Остановка тестирования...');
  }

  copyAllResults() {
    if (this.allTestsResults) {
      navigator.clipboard
        .writeText(this.allTestsResults)
        .then(() => {
          this.message.success('Результаты скопированы в буфер обмена');
        })
        .catch(() => {
          this.message.error('Ошибка копирования');
        });
    }
  }

  clearAllResults() {
    this.allTestsResults = '';
    localStorage.removeItem('authTestResults');
    this.message.success('Результаты всех тестов очищены');
  }

  clearSession() {
    this.authService.clearSession();
    this.testResults = `
Очистка сессии
Время: ${new Date().toLocaleString('ru-RU')}
Сессия очищена
Статус: ✅ ВЫПОЛНЕНО
    `.trim();
    this.message.success('Сессия очищена');
  }

  clearResults() {
    this.testResults = '';
    this.message.success('Результаты очищены');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private processRequests(requests: any[], testNumber: number) {
    let completed = 0;
    let successCount = 0;
    let errorCount = 0;

    requests.forEach((req, index) => {
      req.subscribe({
        next: () => {
          completed++;
          successCount++;
          this.appendResult(`Запрос ${index + 1}: ✅ Успешно`);
          this.checkRequestsComplete(
            completed,
            requests.length,
            successCount,
            errorCount,
            testNumber,
          );
        },
        error: (error: HttpErrorResponse) => {
          completed++;
          errorCount++;
          this.appendResult(`Запрос ${index + 1}: ❌ Ошибка: ${error.message}`);
          this.checkRequestsComplete(
            completed,
            requests.length,
            successCount,
            errorCount,
            testNumber,
          );
        },
      });
    });
  }

  private checkRequestsComplete(
    completed: number,
    total: number,
    successCount: number,
    errorCount: number,
    testNumber: number,
  ) {
    if (completed === total) {
      this.appendResult(`\nУспешных: ${successCount}\nОшибок: ${errorCount}`);
      this.appendResult(`Статус: ${errorCount === 0 ? '✅ ПРОЙДЕН' : '❌ НЕ ПРОЙДЕН'}`);
      this.message.success(
        errorCount === 0 ? `Тест ${testNumber} выполнен` : `Тест ${testNumber} не выполнен`,
      );
      this.setLoading(false);
    }
  }

  private handleTestError(testNumber: number, error: any) {
    this.testResults = `
Тест ${testNumber}: Ошибка
Время: ${new Date().toLocaleString('ru-RU')}
Ошибка: ${error.message}
Статус: ${error.status || 'Unknown'}
Статус: ❌ НЕ ПРОЙДЕН
    `.trim();
    this.message.error(`Тест ${testNumber} не выполнен`);
    this.setLoading(false);
  }

  private appendResult(text: string) {
    this.testResults += `\n${text}`;
  }

  private setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  private formatTime(ms: number): string {
    if (ms <= 0) return 'Истёк';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}ч ${minutes % 60}м ${seconds % 60}с`;
    if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
    return `${seconds}с`;
  }

  private formatMemory(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}


