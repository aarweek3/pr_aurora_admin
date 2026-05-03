import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Test29TokenValidation extends BaseTest {
  get testNumber(): number {
    return 29;
  }

  get testName(): string {
    return 'Детальная валидация токена';
  }

  execute(): Observable<TestResult> {
    const url = `${environment.apiUrl}/api/test/test-token-validation`;

    return this.http.get(url, { withCredentials: true }).pipe(
      map((response: any) => {
        const data = response.data;
        let resultText = `
User ID: ${data.userId || 'Отсутствует'}
Email: ${data.email || 'Отсутствует'}
Роли: ${data.roles?.join(', ') || 'Отсутствуют'}
Авторизован: ${data.isAuthenticated ? '✅ Да' : '❌ Нет'}

Claims:
${Object.entries(data.claims || {})
  .map(([key, value]) => `  ${key}: ${value}`)
  .join('\n')}
        `.trim();

        const hasRequiredFields = data.userId && data.email && data.isAuthenticated;

        return this.createResult(hasRequiredFields ? 'passed' : 'failed', resultText);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
