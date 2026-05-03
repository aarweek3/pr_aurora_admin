import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test27Forbidden extends BaseTest {
  get testNumber(): number {
    return 27;
  }

  get testName(): string {
    return 'Тест 403 (Forbidden)';
  }

  execute(): Observable<TestResult> {
    const url = `${environment.apiUrl}/api/test/test-403`;
    console.log('Отправка запроса:', url, { withCredentials: true });

    return this.http.get(url, { withCredentials: true, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        console.log('Ответ сервера:', response);
        console.log('Статус:', response.status);
        console.log('Тело ответа:', response.body);
        console.log(
          'Заголовки:',
          response.headers.keys().map((key: string) => `${key}: ${response.headers.get(key)}`),
        );

        const expectedStatus = 403;
        const expectedMessage = 'Access forbidden';

        const resultText = `HTTP Статус: ${response.status}\nСообщение: ${
          response.body?.message || 'Нет сообщения'
        }`;

        if (response.status === expectedStatus && response.body?.message === expectedMessage) {
          return this.createResult('passed', resultText);
        }
        return this.createResult('failed', resultText);
      }),
      catchError((error: any) => {
        console.log('Ошибка запроса:', error);
        console.log('Ошибка - детали:', JSON.stringify(error, null, 2));
        console.log('Статус:', error.status || 'undefined');
        console.log('Тело ошибки:', error.error || error.message);

        const status = error.status || 403; // Предполагаем 403 для HttpErrorResponse
        const message = error.error?.message || error.message || 'Access forbidden';

        const resultText = `HTTP Статус: ${status}\nСообщение: ${message}`;

        if (status === 403 && message.includes('Access forbidden')) {
          return of(this.createResult('passed', resultText));
        }
        return of(this.createResult('failed', resultText));
      }),
    );
  }
}
