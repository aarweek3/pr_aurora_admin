import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { ApiEndpoints } from '@environments/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class Test08StressRequests extends BaseTest {
  get testNumber(): number {
    return 8;
  }

  get testName(): string {
    return 'Стресс-тест';
  }

  execute(): Observable<TestResult> {
    const requests = Array(10)
      .fill(null)
      .map((_, index) =>
        this.http
          .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', {
            withCredentials: true,
          })
          .pipe(
            map(() => ({ success: true, index: index + 1 })),
            catchError((error) => of({ success: false, index: index + 1, error: error.message })),
          ),
      );

    return forkJoin(requests).pipe(
      map((results) => {
        const successCount = results.filter((r) => r.success).length;
        const errorCount = results.length - successCount;

        let resultText = '';
        results.forEach((result) => {
          if (result.success) {
            resultText += `Запрос ${result.index}: ✅ Успешно\n`;
          } else {
            resultText += `Запрос ${result.index}: ❌ Ошибка: ${(result as any).error}\n`;
          }
        });

        resultText += `\nУспешных: ${successCount}\nОшибок: ${errorCount}`;

        return this.createResult(errorCount === 0 ? 'passed' : 'failed', resultText);
      }),
    );
  }
}
