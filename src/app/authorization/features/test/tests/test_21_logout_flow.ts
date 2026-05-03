import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test21LogoutFlow extends BaseTest {
  get testNumber(): number {
    return 21;
  }

  get testName(): string {
    return 'Процесс выхода из системы';
  }

  execute(): Observable<TestResult> {
    const beforeStatus = this.tokenService.getCurrentStatus();
    let resultText = `Статус перед выходом: ${
      beforeStatus.isValid ? '✅ Авторизован' : '❌ Не авторизован'
    }\n`;
    resultText += 'Симуляция выхода из системы...\n';

    try {
      this.authService.clearSession();
      const afterStatus = this.tokenService.getCurrentStatus();
      resultText += `Статус после очистки: ${
        afterStatus.isValid ? '❌ Все еще авторизован' : '✅ Сессия очищена'
      }\n`;
      resultText += 'Восстановление сессии...\n';

      return this.authService.forceTokenRefresh().pipe(
        map(() => {
          resultText += 'Сессия восстановлена';
          return this.createResult('passed', resultText);
        }),
        catchError(() => {
          resultText += 'Не удалось восстановить сессию';
          return of(this.createResult('warning', resultText));
        }),
      );
    } catch (error: any) {
      resultText += `Ошибка при тестировании logout: ${error.message}`;
      return of(this.createResult('failed', resultText));
    }
  }
}
