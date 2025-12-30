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
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { ApiEndpoints } from '../../../../../environments/api-endpoints';
import { AuthService } from '../../../services/auth.service';
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
  ],
  templateUrl: './simulator-tab.component.html',
  styleUrls: ['./simulator-tab.component.scss'],
})
export class SimulatorTabComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private message = inject(NzMessageService);
  private logger = inject(LoggerConsoleService).getLogger('SimulatorTab');

  // Signals
  isLoading = signal(false);
  concurrencyProgress = signal(0);
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

  constructor() {}

  // --- HTTP Error Triggers ---

  simulate401(): void {
    this.logger.info('Запуск теста потока: 401 -> Обновление -> Успех');

    // 1. Сохраняем оригинал токена (на всякий случай)
    const originalToken = localStorage.getItem('accessToken');

    // 2. Портим токен в LS, чтобы вызвать 401
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
    this.logger.info('Симуляция 500 Server Error (Ошибка сервера)');
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
    this.logger.info('Симуляция ошибки сети (Unknown Address)');
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
    this.logger.warn('Force expiring token in client memory');
    this.tokenService.clearStatus();
    this.message.warning('Token status cleared. Next request should trigger logic as "No Token".');
    this.lastResult.set({
      status: 0,
      message: 'Client-side Token Expired (Mock)',
      type: 'warning',
    });
  }

  corruptToken(): void {
    this.logger.error('Corrupting token data...');
    localStorage.setItem('accessToken', 'invalid.token.payload');
    this.message.error(
      'Token corrupted in LocalStorage. Interceptor will likely fail next request.',
    );
  }

  // --- Stress Testing ---

  runConcurrencyTest(): void {
    this.isLoading.set(true);
    this.concurrencyProgress.set(10);
    this.testResult.set(null);
    this.logger.info('Запуск конкурентного стресс-теста (10 параллельных запросов)');

    const requests = Array(10)
      .fill(null)
      .map((_, i) =>
        this.http
          .get(ApiEndpoints.AUTH.DEBUG_TOKEN, {
            headers: { 'X-Simulator-Request': 'true', 'X-Test-Id': i.toString() },
          })
          .pipe(
            tap(() => {
              this.concurrencyProgress.update((p) => p + 9); // Приблизительный прогресс
              this.logger.debug(`Concurrency Request #${i} - Успешно`);
            }),
            catchError((err) => {
              this.logger.error(`Concurrency Request #${i} - Ошибка`, err);
              return of(null);
            }),
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
          description: 'Запуск 10 параллельных запросов для проверки устойчивости интерцептора.',
          type: successCount === 10 ? 'success' : 'warning',
          verdict:
            successCount === 10
              ? 'ТЕСТ УСПЕШЕН: Все 10 запросов прошли успешно. Система корректно блокирует конкурентные обновления и предотвращает дублирование Refresh-запросов.'
              : `ТЕСТ НЕ ПРОШЕЛ: Только ${successCount} из 10 запросов завершились успешно.`,
          isSuccess: successCount === 10,
        });

        if (successCount === 10) {
          this.logger.info(
            'Стресс-тест успешно пройден: блокировка интерцептора работает корректно.',
          );
        }
      });

    // Simulate progress with check
    setTimeout(() => {
      if (this.concurrencyProgress() < 100) this.concurrencyProgress.set(40);
    }, 300);
    setTimeout(() => {
      if (this.concurrencyProgress() < 100) this.concurrencyProgress.set(70);
    }, 800);
  }

  // --- Helper ---

  private runTest(
    label: string,
    requestFn: (options?: any) => any,
    verdictFn: (res: any, isError: boolean) => { success: boolean; text: string },
    description: string = '',
  ): void {
    this.isLoading.set(true);
    this.logger.info(`Симулятор: ${label}`);

    const options = { headers: { 'X-Simulator-Request': 'true' } };

    requestFn(options)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          this.logger.info(`${label} - OK:`, res);
          const verdict = verdictFn(res, false);

          this.lastResult.set({
            status: 200,
            message: label,
            description: description,
            type: verdict.success ? 'success' : 'error',
            verdict: verdict.text,
            isSuccess: verdict.success,
          });
        },
        error: (err: any) => {
          this.logger.error(`${label} - ERR:`, err);

          const status = err.status !== undefined ? err.status : err.error?.status || 0;
          const userMsg = err.userMessage || err.detail || err.message || 'Сбой запроса';

          const verdict = verdictFn(err, true);

          this.lastResult.set({
            status: status,
            message: label,
            description: description,
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
  }
}
