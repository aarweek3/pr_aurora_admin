import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test22ReloginFlow extends BaseTest {
  get testNumber(): number {
    return 22;
  }

  get testName(): string {
    return 'Повторный вход в систему';
  }

  execute(): Observable<TestResult> {
    return this.authService
      .login({
        email: 'admin@example.com',
        password: 'Admin123!',
      })
      .pipe(
        map((response) => {
          const resultText = `Повторная авторизация успешна: ${response.data?.user?.email}`;
          return this.createResult('passed', resultText);
        }),
        catchError((error) => {
          const resultText = `Ошибка повторной авторизации: ${error.message}`;
          return [this.createResult('failed', resultText)];
        }),
      );
  }
}
