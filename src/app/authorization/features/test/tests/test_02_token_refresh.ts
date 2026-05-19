import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ApiResponse, UserProfileDto } from '@auth/models';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test02TokenRefresh extends BaseTest {
  get testNumber(): number {
    return 2;
  }

  get testName(): string {
    return 'Обновление токена';
  }

  execute(): Observable<TestResult> {
    return this.authService.forceTokenRefresh().pipe(
      map((response: ApiResponse<{ user: UserProfileDto }>) => {
        const newStatus = this.tokenService.getCurrentStatus();
        const results = `
Пользователь: ${response.data?.user.email || 'Отсутствует'}
Действителен: ${newStatus.valid ? '✅ Да' : '❌ Нет'}
Время до истечения: ${this.formatTime(newStatus.timeUntilExpiry)}
        `.trim();

        return this.createResult('passed', results);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
