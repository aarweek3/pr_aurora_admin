import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { AuthService } from '@auth/services/auth.service';
import { TestResult } from './tests/base_test';
import { Test01TokenStatus } from './tests/test_01_token_status';
import { Test02TokenRefresh } from './tests/test_02_token_refresh';
import { Test03ApiRequest } from './tests/test_03_api_request';
import { Test04DebugEndpoint } from './tests/test_04_debug_endpoint';
import { Test05TokenConsistency } from './tests/test_05_token_consistency';
import { Test06FullRefreshCycle } from './tests/test_06_full_refresh_cycle';
import { Test07ConcurrentRequests } from './tests/test_07_concurrent_requests';
import { Test08StressRequests } from './tests/test_08_stress_requests';
import { Test09UnauthorizedRequest } from './tests/test_09_unauthorized_request';
import { Test10NetworkError } from './tests/test_10_network_error';
import { Test11MalformedToken } from './tests/test_11_malformed_token';
import { Test12Roles } from './tests/test_12_roles';
import { Test13AdminAccess } from './tests/test_13_admin_access';
import { Test14ModeratorAccess } from './tests/test_14_moderator_access';
import { Test15UserAccess } from './tests/test_15_user_access';
import { Test16Cookies } from './tests/test_16_cookies';
import { Test17SessionPersistence } from './tests/test_17_session_persistence';
import { Test18CrossTabSession } from './tests/test_18_cross_tab_session';
import { Test19TokenExpiration } from './tests/test_19_token_expiration';
import { Test20AutoRefresh } from './tests/test_20_auto_refresh';
import { Test21LogoutFlow } from './tests/test_21_logout_flow';
import { Test22ReloginFlow } from './tests/test_22_relogin_flow';
import { Test23GuardProtection } from './tests/test_23_guard_protection';
import { Test24InterceptorFlow } from './tests/test_24_interceptor_flow';
import { Test25MemoryLeaks } from './tests/test_25_memory_leaks';
import { Test26SecurityHeaders } from './tests/test_26_security_headers';
import { Test27Forbidden } from './tests/test_27_forbidden';
import { Test29TokenValidation } from './tests/test_29_token_validation';
import { Test28ExceptionHandling } from './tests/test_28_exception_handling';
import { Test30Cors } from './tests/test_30_cors';
import { Test31Timeout } from './tests/test_31_timeout';
import { Test32HttpMethods } from './tests/test_32_http_methods';
import { Test33Ping } from './tests/test_33_ping';

@Component({
  selector: 'app-auth-test-refactored',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzDividerModule, NzTabsModule],
  template: `
    <nz-card nzTitle="Комплексное тестирование системы авторизации">
      <div style="margin-bottom: 16px; text-align: center;">
        <button
          nz-button
          nzType="primary"
          nzSize="large"
          (click)="runAllTests()"
          [nzLoading]="isRunningAllTests"
          style="margin-right: 16px;"
        >
          Запустить все тесты ({{ totalTests }} тестов)
        </button>
        <button nz-button nzDanger (click)="stopAllTests()" [disabled]="!isRunningAllTests">
          Остановить
        </button>
      </div>

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
        <nz-tab nzTitle="Индивидуальные тесты">
          <h4>Основные тесты</h4>
          <div class="test-group">
            <button nz-button (click)="runTest(1)" [nzLoading]="isLoading">1. Статус токена</button>
            <button nz-button (click)="runTest(2)" [nzLoading]="isLoading">
              2. Обновление токена
            </button>
            <button nz-button (click)="runTest(3)" [nzLoading]="isLoading">3. API-запрос</button>
            <button nz-button (click)="runTest(4)" [nzLoading]="isLoading">
              4. Debug endpoint
            </button>
            <button nz-button (click)="runTest(5)" [nzLoading]="isLoading">
              5. Сравнение токенов
            </button>
          </div>

          <nz-divider></nz-divider>

          <h4>Циклические тесты</h4>
          <div class="test-group">
            <button nz-button (click)="runTest(6)" [nzLoading]="isLoading">
              6. Полный цикл обновления
            </button>
            <button nz-button (click)="runTest(7)" [nzLoading]="isLoading">
              7. Одновременные запросы
            </button>
            <button nz-button (click)="runTest(8)" [nzLoading]="isLoading">8. Стресс-тест</button>
          </div>

          <nz-divider></nz-divider>

          <h4>Тестирование ошибок</h4>
          <div class="test-group">
            <button nz-button (click)="runTest(9)" [nzLoading]="isLoading">9. Тест 401</button>
            <button nz-button (click)="runTest(10)" [nzLoading]="isLoading">
              10. Сетевая ошибка
            </button>
            <button nz-button (click)="runTest(11)" [nzLoading]="isLoading">
              11. Некорректный токен
            </button>
            <button nz-button (click)="runTest(27)" [nzLoading]="isLoading">27. Тест 403</button>
            <button nz-button (click)="runTest(28)" [nzLoading]="isLoading">
              28. Обработка исключений
            </button>
          </div>

          <nz-divider></nz-divider>

          <h4>Роли и доступ</h4>
          <div class="test-group">
            <button nz-button (click)="runTest(12)" [nzLoading]="isLoading">
              12. Проверка ролей
            </button>
            <button nz-button (click)="runTest(13)" [nzLoading]="isLoading">
              13. Доступ админа
            </button>
            <button nz-button (click)="runTest(14)" [nzLoading]="isLoading">
              14. Доступ модератора
            </button>
            <button nz-button (click)="runTest(15)" [nzLoading]="isLoading">
              15. Доступ пользователя
            </button>
          </div>

          <nz-divider></nz-divider>

          <h4>Cookies и сессии</h4>
          <div class="test-group">
            <button nz-button (click)="runTest(16)" [nzLoading]="isLoading">
              16. Проверка cookies
            </button>
            <button nz-button (click)="runTest(17)" [nzLoading]="isLoading">
              17. Устойчивость сессии
            </button>
            <button nz-button (click)="runTest(18)" [nzLoading]="isLoading">
              18. Межвкладочная сессия
            </button>
          </div>

          <nz-divider></nz-divider>

          <h4>Валидация и токены</h4>
          <div class="test-group">
            <button nz-button (click)="runTest(19)" [nzLoading]="isLoading">
              19. Истечение токена
            </button>
            <button nz-button (click)="runTest(20)" [nzLoading]="isLoading">
              20. Авто-обновление
            </button>
            <button nz-button (click)="runTest(29)" [nzLoading]="isLoading">
              29. Детальная валидация
            </button>
          </div>

          <nz-divider></nz-divider>

          <h4>Процессы авторизации</h4>
          <div class="test-group">
            <button nz-button (click)="runTest(21)" [nzLoading]="isLoading">
              21. Процесс выхода
            </button>
            <button nz-button (click)="runTest(22)" [nzLoading]="isLoading">
              22. Повторный вход
            </button>
            <button nz-button (click)="runTest(23)" [nzLoading]="isLoading">
              23. Защита роутов
            </button>
            <button nz-button (click)="runTest(24)" [nzLoading]="isLoading">
              24. Работа интерсептора
            </button>
          </div>

          <nz-divider></nz-divider>

          <h4>Производительность и безопасность</h4>
          <div class="test-group">
            <button nz-button (click)="runTest(25)" [nzLoading]="isLoading">
              25. Утечки памяти
            </button>
            <button nz-button (click)="runTest(26)" [nzLoading]="isLoading">
              26. Заголовки безопасности
            </button>
            <button nz-button (click)="runTest(30)" [nzLoading]="isLoading">30. CORS</button>
            <button nz-button (click)="runTest(31)" [nzLoading]="isLoading">31. Таймауты</button>
          </div>

          <nz-divider></nz-divider>

          <h4>HTTP и сервер</h4>
          <div class="test-group">
            <button nz-button (click)="runTest(32)" [nzLoading]="isLoading">32. HTTP методы</button>
            <button nz-button (click)="runTest(33)" [nzLoading]="isLoading">33. Ping</button>
          </div>

          <nz-divider></nz-divider>

          <h4>Управление</h4>
          <div class="test-group">
            <button nz-button nzDanger (click)="clearSession()">Очистить сессию</button>
            <button nz-button (click)="clearResults()">Очистить результаты</button>
          </div>

          <div *ngIf="testResults" style="margin-top: 16px;">
            <h3>Результат последнего теста</h3>
            <pre>{{ testResults }}</pre>
          </div>
        </nz-tab>

        <nz-tab nzTitle="Результаты всех тестов">
          <div style="margin-bottom: 16px;">
            <button
              nz-button
              nzType="primary"
              (click)="copyAllResults()"
              [disabled]="!allTestsResults"
            >
              Копировать все результаты
            </button>
            <button nz-button (click)="clearAllResults()" style="margin-left: 8px;">
              Очистить
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
export class AuthTestComponentRefactored implements OnInit {
  private message = inject(NzMessageService);
  private authService = inject(AuthService);

  private tests = [
    inject(Test01TokenStatus),
    inject(Test02TokenRefresh),
    inject(Test03ApiRequest),
    inject(Test04DebugEndpoint),
    inject(Test05TokenConsistency),
    inject(Test06FullRefreshCycle),
    inject(Test07ConcurrentRequests),
    inject(Test08StressRequests),
    inject(Test09UnauthorizedRequest),
    inject(Test10NetworkError),
    inject(Test11MalformedToken),
    inject(Test12Roles),
    inject(Test13AdminAccess),
    inject(Test14ModeratorAccess),
    inject(Test15UserAccess),
    inject(Test16Cookies),
    inject(Test17SessionPersistence),
    inject(Test18CrossTabSession),
    inject(Test19TokenExpiration),
    inject(Test20AutoRefresh),
    inject(Test21LogoutFlow),
    inject(Test22ReloginFlow),
    inject(Test23GuardProtection),
    inject(Test24InterceptorFlow),
    inject(Test25MemoryLeaks),
    inject(Test26SecurityHeaders),
    inject(Test27Forbidden),
    inject(Test28ExceptionHandling),
    inject(Test29TokenValidation),
    inject(Test30Cors),
    inject(Test31Timeout),
    inject(Test32HttpMethods),
    inject(Test33Ping),
  ];

  testResults = '';
  allTestsResults = '';
  isLoading = false;
  isRunningAllTests = false;
  currentTestNumber = 0;
  totalTests = 33;
  private shouldStopTests = false;

  ngOnInit() {
    const savedResults = localStorage.getItem('authTestResults');
    if (savedResults) {
      this.allTestsResults = savedResults;
    }
  }

  runTest(testNumber: number) {
    this.isLoading = true;
    const test = this.tests[testNumber - 1];

    test.execute().subscribe({
      next: (result: TestResult) => {
        this.testResults = result.results;
        this.message.success(`Тест ${testNumber} выполнен`);
        this.isLoading = false;
      },
      error: (error) => {
        this.testResults = `Ошибка выполнения теста ${testNumber}: ${error.message}`;
        this.message.error(`Тест ${testNumber} не выполнен`);
        this.isLoading = false;
      },
    });
  }

  async runAllTests() {
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
    this.saveResults();

    for (let i = 0; i < this.tests.length; i++) {
      if (this.shouldStopTests) {
        this.allTestsResults += `\nТестирование остановлено на тесте ${i + 1}`;
        this.saveResults();
        break;
      }

      this.currentTestNumber = i + 1;
      const test = this.tests[i];

      this.allTestsResults += `\n--- ТЕСТ ${i + 1}/33: ${test.testName} ---\n`;
      this.saveResults();

      try {
        const result = await this.executeTest(test);
        this.allTestsResults += result.results + '\n';
        this.saveResults();
        await this.delay(1000);
      } catch (error: any) {
        this.allTestsResults += `Ошибка выполнения теста: ${error.message}\n`;
        this.saveResults();
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
    this.saveResults();

    this.isRunningAllTests = false;
    this.message.success(`Все тесты выполнены за ${Math.floor(duration / 60)}м ${duration % 60}с`);
  }

  private executeTest(test: any): Promise<TestResult> {
    return new Promise((resolve, reject) => {
      test.execute().subscribe({
        next: (result: TestResult) => resolve(result),
        error: (error: any) => reject(error),
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  stopAllTests() {
    this.shouldStopTests = true;
    this.isRunningAllTests = false;
    this.saveResults();
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
Статус: Выполнено
    `.trim();
    this.message.success('Сессия очищена');
  }

  clearResults() {
    this.testResults = '';
    this.message.success('Результаты очищены');
  }

  private saveResults() {
    localStorage.setItem('authTestResults', this.allTestsResults);
  }
}
