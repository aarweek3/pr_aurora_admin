import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ApiEndpoints } from '../../../../../environments/api-endpoints';
import { AuthService } from '../../../services/auth.service';
import { RequestTraceService } from '../../../services/request-trace.service';
import { TokenService } from '../../../services/token.service';

@Component({
  selector: 'app-simulator-tab',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzDividerModule,
    NzTagModule,
    NzPopoverModule,
    NzAlertModule,
    NzSpaceModule,
    NzProgressModule,
    NzTimelineModule,
    NzToolTipModule,
  ],
  templateUrl: './simulator-tab.component.html',
  styleUrls: ['./simulator-tab.component.scss'],
})
export class SimulatorTabComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private trace = inject(RequestTraceService);

  // Available Trace Steps from the service
  traceSteps = this.trace.steps;

  private message = inject(NzMessageService);
  private logger = inject(LoggerConsoleService).getLogger('SimulatorTab');

  // Signals
  isLoading = signal(false);
  isBruteForcing = signal(false);
  concurrencyProgress = signal(0);
  rateLimitProgress = signal(0);
  rateLimitHistory = signal<Array<{ id: number; status: number; success: boolean }>>([]);

  lastResult = signal<{
    status: number;
    message: string;
    description?: string;
    type: 'success' | 'error' | 'warning';
    verdict?: string;
    isSuccess?: boolean;
  } | null>(null);

  testResult = signal<{ name: string; success: boolean; message: string; timestamp: Date } | null>(
    null,
  );

  securityScanResults = signal<{
    xssCheck: { success: boolean; details: string };
    cookieCheck: { success: boolean; details: string };
    storageCheck: { success: boolean; details: string };
    isScanning: boolean;
  } | null>(null);

  constructor() {}

  // --- HTTP Error Triggers ---

  simulate401(): void {
    this.logger.info('Запуск теста потока: 401 -> Обновление -> Успех');
    localStorage.setItem('accessToken', 'invalid_stale_token_' + Date.now());

    this.runTest(
      'Тест автоматического восстановления сессии',
      (options) => {
        return this.http.get(ApiEndpoints.AUTH.DEBUG_TOKEN, options);
      },
      (res, isError) => {
        if (!isError && res) {
          return {
            success: true,
            text: 'ТЕСТ УСПЕШЕН: Система обнаружила невалидный токен, автоматически выполнила Refresh-запрос через HttpOnly Cookies и успешно повторила ваш оригинальный запрос. Пользователь даже не заметил сбоя.',
          };
        }
        return {
          success: false,
          text: 'ТЕСТ НЕ ПРОШЕЛ: Автоматическое обновление токена не сработало или сессия не была восстановлена.',
        };
      },
      'Проверка способности интерцептора прозрачно обновлять сессию при получении 401 Unauthorized.',
    );
  }

  simulate403(): void {
    this.logger.info('Тест ограничения прав доступа (RBAC)');
    const currentStatus = this.tokenService.getCurrentStatus();
    const isAdmin = currentStatus.userRoles.includes('Admin');

    this.runTest(
      'Тест ограничения прав доступа (RBAC)',
      (options) => {
        return this.http.get(ApiEndpoints.ADMIN.STATISTICS, options);
      },
      (res, isError) => {
        if (isError && res.status === 403) {
          return {
            success: true,
            text: 'ТЕСТ УСПЕШЕН: Сервер отклонил запрос (403 Forbidden). Это подтверждает корректную работу Role-Based Access Control для пользователей без прав администратора.',
          };
        }

        if (!isError && isAdmin) {
          return {
            success: true,
            text: 'ТЕСТ УСПЕШЕН: Запрос выполнен успешно (200 OK). Так как вы являетесь Администратором, доступ к этому ресурсу для вас открыт согласно политике безопасности.',
          };
        }

        return {
          success: false,
          text: isAdmin
            ? `ТЕСТ НЕ ПРОШЕЛ: Вы администратор, но сервер вернул ошибку ${res.status} вместо 200 OK.`
            : 'ТЕСТ НЕ ПРОШЕЛ: Доступ был разрешен, хотя у вас нет прав Администратора. Это указывает на уязвимость в защите эндпоинта.',
        };
      },
      'Проверка серверной валидации ролей. Тест адаптируется под вашу текущую роль.',
    );
  }

  simulate500(): void {
    this.runTest(
      'Тест обработки критических ошибок сервера',
      (options) => {
        return this.http.get(ApiEndpoints.AUTH.BASE + '/error-test', options);
      },
      (err, isError) => {
        if (isError && err.status === 500) {
          return {
            success: true,
            text: 'ТЕСТ УСПЕШЕН: Приложение корректно перехватило фатальную ошибку сервера (500). Глобальный обработчик предотвратил "падение" интерфейса и вывел пользователю понятное уведомление.',
          };
        }
        return {
          success: false,
          text: 'ТЕСТ НЕ ПРОШЕЛ: Ошибка 500 не была корректно обработана слоем HTTP-интерцепторов.',
        };
      },
      'Проверка устойчивости фронтенда к сбоям на стороне бэкенда (Internal Server Error).',
    );
  }

  simulateNetworkError(): void {
    this.runTest(
      'Тест устойчивости при обрыве связи',
      (options) => {
        return this.http.get('https://invalid-domain-aurora-test.com/api', options);
      },
      (err, isError) => {
        if (isError && (err.status === 0 || err.name === 'HttpErrorResponse')) {
          return {
            success: true,
            text: 'ТЕСТ УСПЕШЕН: Система правильно распознала сетевой сбой (DNS или CORS). Фронтенд успешно обработал отсутствие ответа от сервера, сохранив стабильность работы.',
          };
        }
        return {
          success: false,
          text: 'ТЕСТ НЕ ПРОШЕЛ: Сетевая ошибка не была распознана как критический сбой связи.',
        };
      },
      'Проверка поведения приложения в условиях отсутствия интернета или недоступности API-сервера.',
    );
  }

  // --- Token Lifecycle ---

  expireTokenNow(): void {
    this.tokenService.clearStatus();
    this.message.warning('Token status cleared.');
    this.lastResult.set({
      status: 0,
      message: 'Client-side Token Expired (Mock)',
      type: 'warning',
    });
  }

  corruptToken(): void {
    localStorage.setItem('accessToken', 'invalid.token.payload');
    this.message.error('Token corrupted in LocalStorage.');
  }

  revokeServerSession(): void {
    this.http.post(ApiEndpoints.AUTH.LOGOUT, {}, { withCredentials: true }).subscribe({
      next: () => {
        this.message.success('Сессия аннулирована на сервере.');
        this.lastResult.set({
          status: 200,
          message: 'Сессия удалена на сервере',
          description: 'Refresh-кука удалена.',
          type: 'warning',
          isSuccess: true,
        });
      },
    });
  }

  spoofUserIdentity(): void {
    const fakeId = 'Hacker-' + Math.floor(Math.random() * 1000);
    this.tokenService.spoofStatus({
      userId: fakeId,
      userEmail: 'hacker@blackhat.com',
      userRoles: ['Admin', 'Sudo', 'GodMode'],
    });
    this.message.error('UserID подменен в памяти!');
  }

  // --- Stress Testing ---

  runConcurrencyTest(): void {
    this.isLoading.set(true);
    this.concurrencyProgress.set(10);

    const requests = Array(10)
      .fill(null)
      .map((_, i) =>
        this.http
          .get(ApiEndpoints.AUTH.DEBUG_TOKEN, {
            headers: { 'X-Simulator-Request': 'true', 'X-Test-Id': i.toString() },
          })
          .pipe(
            tap(() => this.concurrencyProgress.update((p) => p + 9)),
            catchError(() => of(null)),
          ),
      );

    forkJoin(requests)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((results) => {
        const successCount = results.filter((r) => r !== null).length;
        this.concurrencyProgress.set(100);
        this.lastResult.set({
          status: successCount === 10 ? 200 : 207,
          message: 'Стресс-тест конкуренции',
          description: 'Запуск 10 параллельных запросов.',
          type: successCount === 10 ? 'success' : 'warning',
          verdict:
            successCount === 10
              ? 'ТЕСТ УСПЕШЕН: Все 10 запросов прошли успешно.'
              : `ТЕСТ НЕ ПРОШЕЛ: Только ${successCount} из 10 успешно.`,
          isSuccess: successCount === 10,
        });
      });
  }

  // --- Rate Limiting & Brute-force ---

  runRateLimitTest(): void {
    if (this.isBruteForcing()) return;

    this.isBruteForcing.set(true);
    this.rateLimitProgress.set(0);
    this.rateLimitHistory.set([]);

    const totalRequests = 15;
    let completed = 0;

    const sendRequest = (id: number) => {
      return this.http
        .get(ApiEndpoints.AUTH.STRESS_TEST, { headers: { 'X-Simulator-Request': 'true' } })
        .pipe(
          tap(() =>
            this.rateLimitHistory.update((h) => [...h, { id, status: 200, success: true }]),
          ),
          catchError((err) => {
            const status = err.status || 0;
            this.rateLimitHistory.update((h) => [...h, { id, status, success: false }]);
            return of(null);
          }),
          finalize(() => {
            completed++;
            this.rateLimitProgress.set(Math.round((completed / totalRequests) * 100));
            if (completed === totalRequests) this.finishRateLimitTest();
          }),
        );
    };

    for (let i = 0; i < totalRequests; i++) {
      setTimeout(() => sendRequest(i + 1).subscribe(), i * 150);
    }
  }

  private finishRateLimitTest(): void {
    this.isBruteForcing.set(false);
    const history = this.rateLimitHistory();
    const blockedCount = history.filter((h) => h.status === 429).length;

    this.lastResult.set({
      status: blockedCount > 0 ? 429 : 200,
      message: 'Тест Rate Limiting (Блокировка)',
      description: 'Симуляция превышения лимита запросов (Brute-force).',
      type: blockedCount > 0 ? 'success' : 'warning',
      verdict:
        blockedCount > 0
          ? `ТЕСТ УСПЕШЕН: Сервер заблокировал ${blockedCount} из 15 запросов (429 Too Many Requests).`
          : 'ТЕСТ НЕ ПРОШЕЛ: Ни один запрос не был заблокирован.',
      isSuccess: blockedCount > 0,
    });
  }

  // --- Security Scanner ---

  runSecurityScan(): void {
    this.securityScanResults.set({
      xssCheck: { success: false, details: 'Сканирование...' },
      cookieCheck: { success: false, details: 'Запрос к API...' },
      storageCheck: { success: false, details: 'Анализ...' },
      isScanning: true,
    });

    setTimeout(() => {
      const sensitiveKeys = ['token', 'accessToken', 'jwt', 'secret'];
      const leakedKeys = Object.keys(window).filter((key) =>
        sensitiveKeys.some((sk) => key.toLowerCase().includes(sk.toLowerCase())),
      );
      this.securityScanResults.update((s) =>
        s
          ? {
              ...s,
              xssCheck: {
                success: leakedKeys.length === 0,
                details: leakedKeys.length === 0 ? 'ОК' : 'Утечка',
              },
            }
          : null,
      );
    }, 600);

    setTimeout(() => {
      const hasTokenInLS = !!localStorage.getItem('accessToken');
      this.securityScanResults.update((s) =>
        s
          ? {
              ...s,
              storageCheck: { success: !hasTokenInLS, details: !hasTokenInLS ? 'Чисто' : 'В LS' },
            }
          : null,
      );
    }, 1200);

    this.http.get<any>(ApiEndpoints.AUTH.DEBUG_COOKIES, { withCredentials: true }).subscribe({
      next: (res) => {
        this.securityScanResults.update((s) =>
          s
            ? {
                ...s,
                cookieCheck: {
                  success: res.hasAccessToken,
                  details: res.hasAccessToken ? 'Активны' : 'Нет',
                },
              }
            : null,
        );
        this.finishScan();
      },
      error: () => {
        this.securityScanResults.update((s) =>
          s ? { ...s, cookieCheck: { success: false, details: 'Ошибка' } } : null,
        );
        this.finishScan();
      },
    });
  }

  private finishScan(): void {
    setTimeout(() => {
      this.securityScanResults.update((s) => (s ? { ...s, isScanning: false } : null));
      this.message.success('Сканирование завершено');
    }, 500);
  }

  // --- Helpers ---

  getTimelineColor(type: string): string {
    switch (type) {
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      case 'warning':
        return 'orange';
      case 'request':
        return 'blue';
      case 'retry':
        return 'purple';
      default:
        return 'gray';
    }
  }

  private runTest(
    label: string,
    requestFn: (options?: any) => any,
    verdictFn: (res: any, isError: boolean) => { success: boolean; text: string },
    description: string = '',
  ): void {
    this.trace.clear();
    this.isLoading.set(true);
    const options = { headers: { 'X-Simulator-Request': 'true' } };

    requestFn(options)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          const verdict = verdictFn(res, false);
          this.lastResult.set({
            status: 200,
            message: label,
            description,
            type: verdict.success ? 'success' : 'error',
            verdict: verdict.text,
            isSuccess: verdict.success,
          });
        },
        error: (err: any) => {
          const verdict = verdictFn(err, true);
          this.lastResult.set({
            status: err.status || 0,
            message: label,
            description,
            type: verdict.success ? 'success' : 'error',
            verdict: verdict.text,
            isSuccess: verdict.success,
          });
        },
      });
  }

  clearResults(): void {
    this.lastResult.set(null);
    this.concurrencyProgress.set(0);
    this.rateLimitProgress.set(0);
    this.rateLimitHistory.set([]);
  }
}
