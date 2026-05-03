import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from '@auth/services/auth.service';
import { TokenService } from '@auth/services/token.service';
import { Observable } from 'rxjs';

export interface TestResult {
  testNumber: number;
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  results: string;
  timestamp: Date;
}

export abstract class BaseTest {
  protected http = inject(HttpClient);
  protected message = inject(NzMessageService);
  protected authService = inject(AuthService);
  protected tokenService = inject(TokenService);

  abstract get testNumber(): number;
  abstract get testName(): string;
  abstract execute(): Observable<TestResult>;

  protected createResult(status: 'passed' | 'failed' | 'warning', results: string): TestResult {
    return {
      testNumber: this.testNumber,
      testName: this.testName,
      status,
      results: `
Тест ${this.testNumber}: ${this.testName}
Время: ${new Date().toLocaleString('ru-RU')}
${results}
Статус: ${this.getStatusEmoji(status)}
      `.trim(),
      timestamp: new Date(),
    };
  }

  protected formatTime(ms: number): string {
    if (ms <= 0) return 'Истёк';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}ч ${minutes % 60}м ${seconds % 60}с`;
    if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
    return `${seconds}с`;
  }

  protected formatMemory(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  protected handleError(error: HttpErrorResponse): TestResult {
    return this.createResult(
      'failed',
      `Ошибка: ${error.message}
Статус: ${error.status || 'Unknown'}`
    );
  }

  private getStatusEmoji(status: 'passed' | 'failed' | 'warning'): string {
    switch (status) {
      case 'passed': return '✅ ПРОЙДЕН';
      case 'failed': return '❌ НЕ ПРОЙДЕН';
      case 'warning': return '⚠️ ПРЕДУПРЕЖДЕНИЕ';
    }
  }
}
