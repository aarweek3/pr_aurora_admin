import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test05TokenConsistency extends BaseTest {
  get testNumber(): number {
    return 5;
  }

  get testName(): string {
    return 'Сравнение токенов';
  }

  execute(): Observable<TestResult> {
    const clientEmail = this.authService.getCurrentUser()?.email;
    const clientRoles = this.authService.getUserRoles();

    return this.tokenService.validateConsistency(clientEmail, clientRoles).pipe(
      map((result) => {
        const results = `
Клиент:
  Email: ${clientEmail || 'Отсутствует'}
  Роли: ${clientRoles.join(', ') || 'Отсутствуют'}
Сервер:
  Email: ${result.serverInfo?.email || 'Отсутствует'}
  Роли: ${result.serverInfo?.roles.join(', ') || 'Отсутствуют'}
Различия: ${result.differences.length ? result.differences.join('\n') : 'Отсутствуют'}
        `.trim();

        return this.createResult(result.isConsistent ? 'passed' : 'warning', results);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
