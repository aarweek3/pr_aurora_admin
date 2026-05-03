import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { CookieInfo } from '@auth/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class Test16Cookies extends BaseTest {
  get testNumber(): number {
    return 16;
  }

  get testName(): string {
    return 'Проверка cookies';
  }

  execute(): Observable<TestResult> {
    return this.tokenService.getCookieInfo().pipe(
      map((info: CookieInfo) => {
        const results = `
Access Token: ${info.hasAccessToken ? '✅ Да' : '❌ Нет'}
Refresh Token: ${info.hasRefreshToken ? '✅ Да' : '❌ Нет'}
Cookies: ${info.cookieCount}
        `.trim();

        return this.createResult(info.success ? 'passed' : 'failed', results);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
