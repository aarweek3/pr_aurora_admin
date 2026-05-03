import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Test09UnauthorizedRequest extends BaseTest {
  get testNumber(): number {
    return 9;
  }

  get testName(): string {
    return 'Тест 401';
  }

  execute(): Observable<TestResult> {
    const url = `${environment.apiUrl}/api/test/test-401`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((response: any) => {
        // Сервер повертає 200 OK з statusCode: 401 в тілі
        if (response && (response.statusCode === 401 || response.status === 401)) {
          const results = `
Статус: ${response.statusCode || response.status}
Сообщение: ${response.message}
          `.trim();
          return this.createResult('passed', results);
        } else {
          return this.createResult('failed', 'Неожиданный успех без 401 статуса');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        // Якщо прийшов HTTP 401
        if (error.status === 401) {
          const results = `
HTTP Статус: ${error.status}
Сообщение: ${error.error?.message || error.message}
          `.trim();
          return of(this.createResult('passed', results));
        }

        // Інші помилки
        const results = `
HTTP Статус: ${error.status || 'undefined'}
Сообщение: ${error.error?.message || error.message}
        `.trim();
        return of(this.createResult('failed', results));
      }),
    );
  }
}
