import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { ApiEndpoints } from '@environments/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class Test13AdminAccess extends BaseTest {
  get testNumber(): number {
    return 13;
  }

  get testName(): string {
    return 'Доступ администратора';
  }

  execute(): Observable<TestResult> {
    return this.http.get(ApiEndpoints.ADMIN.STATISTICS, { withCredentials: true }).pipe(
      map(() => {
        const results = `
Админ права: ${this.authService.isAdminUser() ? '✅ Да' : '❌ Нет'}
Доступ к админ API: ✅ Разрешен
        `.trim();

        return this.createResult('passed', results);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
