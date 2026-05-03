import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test20AutoRefresh extends BaseTest {
  get testNumber(): number {
    return 20;
  }

  get testName(): string {
    return 'Автоматическое обновление токена';
  }

  execute(): Observable<TestResult> {
    let resultText = '';
    this.tokenService.startMonitoring();

    return timer(1000).pipe(
      switchMap(() => {
        const status = this.tokenService.getCurrentStatus();
        resultText += `Мониторинг токенов: ${status.valid ? '✅ Активен' : '❌ Неактивен'}\n`;

        return this.authService.forceTokenRefresh();
      }),
      map(() => {
        resultText += 'Принудительное обновление прошло успешно';
        return this.createResult('passed', resultText);
      }),
      catchError((error) => {
        resultText += `Ошибка обновления: ${error.message}`;
        return [this.createResult('failed', resultText)];
      }),
    );
  }
}
