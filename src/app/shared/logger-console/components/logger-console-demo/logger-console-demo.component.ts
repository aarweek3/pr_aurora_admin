import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { LoggerConsoleService } from '../../services/logger-console.service';

@Component({
  selector: 'app-logger-console-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logger-console-demo.component.html',
  styleUrls: ['./logger-console-demo.component.scss'],
})
export class LoggerConsoleDemoComponent {
  private loggerService = inject(LoggerConsoleService);
  private logger = this.loggerService.getLogger(this);

  /** Сигнал для демонстрации отслеживания состояния */
  counter = signal(0);

  constructor() {
    // Подписываемся на отслеживание сигнала "Demo Counter"
    this.loggerService.trackSignal(this.counter, 'Demo Counter');
  }

  /** Генерация простых логов */
  logInfo(): void {
    this.logger.info('User clicked "Info" button', { userId: 42, active: true });
  }

  logWarn(): void {
    this.logger.warn('Low disk space warning', { available: '500MB', path: '/var/data' });
  }

  logError(): void {
    this.logger.error(
      'Failed to save settings',
      new Error('Network timeout during save operation'),
    );
  }

  logDebug(): void {
    this.logger.debug('State snapshot before update', {
      uiState: 'idle',
      pendingTransactions: 0,
      timestamp: Date.now(),
    });
  }

  /** Генерация сложного объекта */
  logBigObject(): void {
    const complexObj = {
      id: 'obj_99',
      metadata: {
        creator: 'Antigravity',
        tags: ['demo', 'stress-test', 'json-viewer'],
        settings: {
          nested: {
            deep: {
              value: 'You found me!',
              arr: [1, 2, { nested: 'inner' }],
            },
          },
        },
      },
      data: Array.from({ length: 5 }, (_, i) => ({ id: i, val: Math.random() })),
    };
    this.logger.log('Complex data object for testing JSON viewer', complexObj);
  }

  /** Стресс-тест на 1000 записей */
  spamLogs(): void {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      this.logger.debug(`Spam message #${i}`, { index: i, time: new Date().toISOString() });
    }
    const end = performance.now();
    this.logger.info(`Stress test completed: 1000 logs in ${(end - start).toFixed(2)}ms`);
  }

  /** Симуляция критической ошибки */
  simulateFatalError(): void {
    // В реальном приложении это может быть необработанный Promise или JS Error
    // Мы вызовем ошибку вручную через логгер для демонстрации
    this.logger.error(
      'CRITICAL ERROR: Application core failed to initialize core-bootstrap-0.1.js',
      {
        stack:
          'Error: Bootstrap failed\n    at init (main.js:10:5)\n    at Object.run (app.js:20:1)',
      },
    );
  }

  /** Методы для изменения сигнала */
  increment(): void {
    this.counter.update((v) => v + 1);
  }

  decrement(): void {
    this.counter.update((v) => v - 1);
  }
}
