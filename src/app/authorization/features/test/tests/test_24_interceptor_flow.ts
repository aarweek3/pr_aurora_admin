import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { ApiEndpoints } from '@environments/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class Test24InterceptorFlow extends BaseTest {
  get testNumber(): number {
    return 24;
  }

  get testName(): string {
    return 'Работа HTTP интерсептора';
  }

  execute(): Observable<TestResult> {
    const requests = [
      this.http
        .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', {
          withCredentials: true,
        })
        .pipe(
          map(() => ({ success: true, index: 1 })),
          catchError((error) => of({ success: false, index: 1, error: error.message })),
        ),
      this.http
        .get(ApiEndpoints.AUTH.BASE + '/debug-token', {
          withCredentials: true,
        })
        .pipe(
          map(() => ({ success: true, index: 2 })),
          catchError((error) => of({ success: false, index: 2, error: error.message })),
        ),
    ];

    return forkJoin(requests).pipe(
      map((results) => {
        const successCount = results.filter((r) => r.success).length;
        let resultText = '';

        results.forEach((result) => {
          if (result.success) {
            resultText += `Запрос ${result.index}: ✅ Интерсептор работает\n`;
          } else {
            resultText += `Запрос ${result.index}: ❌ Ошибка: ${(result as any).error}\n`;
          }
        });

        resultText += `\nУспешных запросов: ${successCount}/${requests.length}`;

        return this.createResult(
          successCount > 0 ? (successCount === requests.length ? 'passed' : 'warning') : 'failed',
          resultText,
        );
      }),
    );
  }
}
