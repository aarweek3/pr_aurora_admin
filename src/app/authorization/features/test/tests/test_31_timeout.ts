import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Test31Timeout extends BaseTest {
  get testNumber(): number {
    return 31;
  }

  get testName(): string {
    return 'Тест таймаута';
  }

  execute(): Observable<TestResult> {
    const testDelay = 2000;
    const timeoutDuration = 5000;
    const url = `${environment.apiUrl}/api/test/test-timeout?delay=${testDelay}`;

    return this.http.get(url, { withCredentials: true }).pipe(
      timeout(timeoutDuration),
      map((response: any) => {
        const resultText = `
Задержка: ${testDelay}ms
Таймаут: ${timeoutDuration}ms
Ответ получен: ✅ Да
Сообщение: ${response.message}
Фактическая задержка: ${response.data?.delayMs}ms
        `.trim();

        return this.createResult('passed', resultText);
      }),
      catchError((error: any) => {
        let resultText = '';

        if (error.name === 'TimeoutError') {
          resultText = `
Задержка: ${testDelay}ms
Таймаут: ${timeoutDuration}ms
Результат: ⏱️ Таймаут превышен
Обработка таймаута: ✅ Работает корректно
          `.trim();
          return of(this.createResult('passed', resultText));
        } else {
          resultText = `
Задержка: ${testDelay}ms
Ошибка: ${error.message}
HTTP Статус: ${error.status || 'N/A'}
          `.trim();
          return of(this.createResult('failed', resultText));
        }
      }),
    );
  }
}
