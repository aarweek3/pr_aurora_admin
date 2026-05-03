import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { ApiEndpoints } from '@environments/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class Test14ModeratorAccess extends BaseTest {
  get testNumber(): number {
    return 14;
  }

  get testName(): string {
    return 'Доступ модератора';
  }

  execute(): Observable<TestResult> {
    return this.http.get(ApiEndpoints.USERS.BASE, { withCredentials: true }).pipe(
      map(() => {
        const results = `
Модератор права: ${this.authService.isModeratorUser() ? '✅ Да' : '❌ Нет'}
Доступ к API: ✅ Разрешен
        `.trim();

        return this.createResult('passed', results);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
