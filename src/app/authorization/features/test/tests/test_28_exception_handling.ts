import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Test28ExceptionHandling extends BaseTest {
  get testNumber(): number {
    return 28;
  }

  get testName(): string {
    return 'Обработка исключений';
  }

  execute(): Observable<TestResult> {
    const url = `${environment.apiUrl}/api/test/test-exception`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((response: any) => {
        return this.createResult('failed', 'Неожиданный успех - исключение не было выброшено');
      }),
      catchError((error: HttpErrorResponse) => {
        let resultText = `
HTTP Статус: ${error.status}
Тип ошибки: ${error.name}
Сообщение: ${error.error?.message || error.message}
        `.trim();

        if (error.status >= 500) {
          resultText += '\nСерверная ошибка корректно обработана';
        }

        const isPassed = error.status === 500 || error.status === 0;

        return of(this.createResult(isPassed ? 'passed' : 'warning', resultText));
      }),
    );
  }
}
