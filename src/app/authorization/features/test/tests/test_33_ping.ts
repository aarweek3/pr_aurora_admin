import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Test33Ping extends BaseTest {
  get testNumber(): number {
    return 33;
  }

  get testName(): string {
    return 'Ping (Работоспособность сервера)';
  }

  execute(): Observable<TestResult> {
    const startTime = Date.now();
    const url = `${environment.apiUrl}/api/test/test-ping`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((response: any) => {
        const responseTime = Date.now() - startTime;
        const data = response.data;

        const resultText = `
Ответ: ${response.message}
Время ответа: ${responseTime}ms
Сервер: ${data.server}
Версия: ${data.version}
Окружение: ${data.environment || 'N/A'}
Timestamp: ${data.timestamp}
        `.trim();

        return this.createResult(responseTime < 5000 ? 'passed' : 'warning', resultText);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
