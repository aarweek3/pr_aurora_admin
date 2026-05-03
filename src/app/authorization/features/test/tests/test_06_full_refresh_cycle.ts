import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { ApiEndpoints } from '@environments/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class Test06FullRefreshCycle extends BaseTest {
  get testNumber(): number {
    return 6;
  }

  get testName(): string {
    return 'Полный цикл обновления';
  }

  execute(): Observable<TestResult> {
    let stepResults = '';
    const initialStatus = this.tokenService.getCurrentStatus();
    stepResults += `Шаг 1: ${initialStatus.isValid ? '✅ Да' : '❌ Нет'}\n`;

    return this.authService.forceTokenRefresh().pipe(
      switchMap(() => {
        stepResults += 'Шаг 2: ✅ Успешно\n';
        const newStatus = this.tokenService.getCurrentStatus();
        stepResults += `Шаг 3: ${newStatus.isValid ? '✅ Да' : '❌ Нет'}\n`;

        return this.http.get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', {
          withCredentials: true,
        });
      }),
      map(() => {
        stepResults += 'Шаг 4: ✅ Успешно';
        return this.createResult('passed', stepResults);
      }),
      catchError((error) => {
        stepResults += `Ошибка на одном из шагов: ${error.message}`;
        return of(this.createResult('failed', stepResults));
      }),
    );
  }
}
