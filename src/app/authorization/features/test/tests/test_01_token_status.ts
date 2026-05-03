import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test01TokenStatus extends BaseTest {
  get testNumber(): number {
    return 1;
  }

  get testName(): string {
    return 'Статус токена';
  }

  execute(): Observable<TestResult> {
    return this.tokenService.checkToken().pipe(
      map((status) => {
        const results = `
Существует: ${status.exists ? '✅ Да' : '❌ Нет'}
Действителен: ${status.valid ? '✅ Да' : '❌ Нет'}
Истек: ${status.expired ? '❌ Да' : '✅ Нет'}
Время до истечения: ${this.formatTime(status.timeUntilExpiry)}
Email: ${status.claims?.email || 'Отсутствует'}
        `.trim();

        return this.createResult(status.valid ? 'passed' : 'failed', results);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
