import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Test26SecurityHeaders extends BaseTest {
  get testNumber(): number {
    return 26;
  }

  get testName(): string {
    return 'Проверка заголовков безопасности';
  }

  execute(): Observable<TestResult> {
    const url = `${environment.apiUrl}/api/test/test-headers`;

    return this.http
      .get(url, {
        withCredentials: true,
        observe: 'response',
      })
      .pipe(
        map((response) => {
          const headers = response.headers;
          let resultText = '';

          const securityHeaders = [
            { key: 'x-content-type-options', expected: 'nosniff' },
            { key: 'x-frame-options', expected: 'DENY' },
            { key: 'x-xss-protection', expected: '1; mode=block' },
            { key: 'strict-transport-security', expected: 'max-age=' },
            { key: 'content-security-policy', expected: 'default-src' },
          ];

          let foundHeaders = 0;
          securityHeaders.forEach((header) => {
            const value = headers.get(header.key);
            if (value) {
              const isCorrect = value.includes(header.expected);
              resultText += `${isCorrect ? '✅' : '⚠️'} ${header.key}: ${value}\n`;
              if (isCorrect) foundHeaders++;
            } else {
              resultText += `❌ ${header.key}: отсутствует\n`;
            }
          });

          const additionalHeaders = ['referrer-policy'];
          additionalHeaders.forEach((header) => {
            const value = headers.get(header);
            if (value) {
              resultText += `✅ ${header}: ${value}\n`;
              foundHeaders += 0.5;
            }
          });

          const serverHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
          let removedHeaders = 0;
          serverHeaders.forEach((header) => {
            const value = headers.get(header);
            if (!value) {
              resultText += `✅ ${header}: правильно скрыт\n`;
              removedHeaders++;
            } else {
              resultText += `⚠️ ${header}: ${value} (рекомендуется скрыть)\n`;
            }
          });

          resultText += `\nНайдено заголовков безопасности: ${Math.floor(foundHeaders)}/${
            securityHeaders.length
          }\n`;
          resultText += `Скрыто серверных заголовков: ${removedHeaders}/${serverHeaders.length}\n`;

          const score = foundHeaders + removedHeaders / serverHeaders.length;
          let status: 'passed' | 'warning' | 'failed' = 'failed';
          if (score >= 5) status = 'passed';
          else if (score >= 3) status = 'warning';

          resultText += `Общий балл: ${score.toFixed(1)}/6`;

          return this.createResult(status, resultText);
        }),
        catchError((error) => {
          return [this.handleError(error)];
        }),
      );
  }
}
