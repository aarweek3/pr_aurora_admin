import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { ApiEndpoints } from '@environments/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class Test03ApiRequest extends BaseTest {
  get testNumber(): number {
    return 3;
  }

  get testName(): string {
    return 'API-запрос';
  }

  execute(): Observable<TestResult> {
    return this.http
      .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=5', {
        withCredentials: true,
      })
      .pipe(
        map((data: any) => {
          const results = `
Пользователей: ${data.data?.length || 0}
Токен: ${this.tokenService.getCurrentStatus().isValid ? '✅ Да' : '❌ Нет'}
        `.trim();

          return this.createResult('passed', results);
        }),
        catchError((error) => {
          return [this.handleError(error)];
        }),
      );
  }
}
