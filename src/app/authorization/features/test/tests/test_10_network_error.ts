import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Test10NetworkError extends BaseTest {
  get testNumber(): number {
    return 10;
  }

  get testName(): string {
    return 'Сетевая ошибка';
  }

  execute(): Observable<TestResult> {
    return this.http
      .get('https://nonexistent-server-12345.com/api/test', {
        withCredentials: true,
      })
      .pipe(
        map(() => {
          return this.createResult('failed', 'Неожиданный успех запроса');
        }),
        catchError((error: HttpErrorResponse) => {
          const results = `
Сетевая ошибка обработана: ${error.message}
Статус ошибки: ${error.status || 'Network Error'}
        `.trim();
          return of(this.createResult('passed', results));
        }),
      );
  }
}
