import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test12Roles extends BaseTest {
  get testNumber(): number {
    return 12;
  }

  get testName(): string {
    return 'Проверка ролей';
  }

  execute(): Observable<TestResult> {
    return this.tokenService.getUserRoles().pipe(
      map((roles) => {
        const results = `
Роли: ${roles.join(', ') || 'Отсутствуют'}
Админ: ${this.authService.isAdminUser() ? '✅ Да' : '❌ Нет'}
Модератор: ${this.authService.isModeratorUser() ? '✅ Да' : '❌ Нет'}
        `.trim();

        return this.createResult('passed', results);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
