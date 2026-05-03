import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { ApiEndpoints } from '@environments/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class Test15UserAccess extends BaseTest {
  get testNumber(): number {
    return 15;
  }

  get testName(): string {
    return 'Доступ пользователя';
  }

  execute(): Observable<TestResult> {
    return this.http
      .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', {
        withCredentials: true,
      })
      .pipe(
        map(() => {
          const results = `
Авторизован: ${this.authService.isAuthenticated() ? '✅ Да' : '❌ Нет'}
Доступ к базовому API: ✅ Разрешен
        `.trim();

          return this.createResult('passed', results);
        }),
        catchError((error) => {
          return [this.handleError(error)];
        }),
      );
  }
}
