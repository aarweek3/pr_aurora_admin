import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { environment } from '@environments/environment';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Test30Cors extends BaseTest {
  get testNumber(): number {
    return 30;
  }

  get testName(): string {
    return 'Проверка CORS';
  }

  execute(): Observable<TestResult> {
    const url = `${environment.apiUrl}/api/test/test-cors`;
    console.log('Запрос OPTIONS:', url, { withCredentials: true });

    return this.http
      .request('OPTIONS', url, {
        withCredentials: true,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>) => {
          console.log('Ответ:', response);
          console.log('Headers:', response.headers.keys());
          console.log(
            'Header Values:',
            response.headers.keys().map((key: string) => `${key}: ${response.headers.get(key)}`),
          );
          const headers = response.headers;
          let resultText = '';

          const corsHeaders = [
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-headers',
            'access-control-allow-credentials',
          ];

          let foundHeaders = 0;
          corsHeaders.forEach((header) => {
            const value = headers.get(header);
            if (value) {
              resultText += `✅ ${header}: ${value}\n`;
              foundHeaders++;
            } else {
              resultText += `❌ ${header}: отсутствует\n`;
            }
          });

          resultText += `\nНайдено CORS заголовков: ${foundHeaders}/${corsHeaders.length}`;

          return this.createResult(
            foundHeaders >= 2
              ? foundHeaders === corsHeaders.length
                ? 'passed'
                : 'warning'
              : 'failed',
            resultText,
          );
        }),
        catchError((error) => {
          console.log('Ошибка:', error);
          console.log('Ошибка - детали:', JSON.stringify(error, null, 2));
          return [this.handleError(error)];
        }),
      );
  }
}
