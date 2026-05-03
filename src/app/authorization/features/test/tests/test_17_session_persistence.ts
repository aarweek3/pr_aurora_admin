import { Injectable } from '@angular/core';
import { Observable, of, concat } from 'rxjs';
import { map, catchError, delay, take, toArray, switchMap } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { ApiEndpoints } from '@environments/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class Test17SessionPersistence extends BaseTest {
  get testNumber(): number {
    return 17;
  }

  get testName(): string {
    return 'Устойчивость сессии';
  }

  execute(): Observable<TestResult> {
    const initialStatus = this.tokenService.getCurrentStatus();
    let resultText = `Начальный статус: ${initialStatus.isValid ? '✅ Активен' : '❌ Неактивен'}\n`;

    const maxChecks = 3;
    const checks: Observable<{ success: boolean; count: number; error?: string }>[] = [];

    for (let i = 1; i <= maxChecks; i++) {
      checks.push(
        of(null).pipe(
          delay((i - 1) * 1000),
          switchMap(() =>
            this.http
              .get(ApiEndpoints.AUTH.BASE + '/debug-token', {
                withCredentials: true,
              })
              .pipe(
                map(() => ({ success: true, count: i })),
                catchError((error) => of({ success: false, count: i, error: error.message })),
              ),
          ),
        ),
      );
    }

    return concat(...checks).pipe(
      toArray(),
      map((results) => {
        results.forEach((result) => {
          if (result.success) {
            resultText += `Проверка ${result.count}: ✅ Сессия активна\n`;
          } else {
            resultText += `Проверка ${result.count}: ❌ Сессия потеряна - ${result.error}\n`;
          }
        });

        const allSuccess = results.every((r) => r.success);
        return this.createResult(allSuccess ? 'passed' : 'failed', resultText);
      }),
      catchError((error) => {
        resultText += `Критическая ошибка: ${error.message}`;
        return of(this.createResult('failed', resultText));
      }),
    );
  }
}
