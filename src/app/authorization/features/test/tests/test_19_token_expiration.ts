import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { ApiEndpoints } from '@environments/api-endpoints';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Test19TokenExpiration extends BaseTest {
  get testNumber(): number {
    return 19;
  }

  get testName(): string {
    return 'Проверка истечения токена';
  }

  execute(): Observable<TestResult> {
    const status = this.tokenService.getCurrentStatus();
    const timeLeft = status.timeUntilExpiry;
    let resultText = `Текущее время до истечения: ${this.formatTime(timeLeft)}\n`;

    if (timeLeft > 300000) {
      resultText += 'Токен не истекает скоро, тест информационный';
      return of(this.createResult('passed', resultText));
    } else if (timeLeft > 0) {
      resultText += 'Токен скоро истечет';
      return of(this.createResult('passed', resultText));
    } else {
      resultText += 'Токен истек\n';

      return this.http
        .get(ApiEndpoints.USERS.BASE + '?pageNumber=1&pageSize=1', {
          withCredentials: true,
        })
        .pipe(
          map(() => {
            resultText += 'API запрос с истекшим токеном прошел (возможно обновился)';
            return this.createResult('passed', resultText);
          }),
          catchError((error: HttpErrorResponse) => {
            resultText += `API запрос провалился: ${error.status}`;
            return of(this.createResult(error.status === 401 ? 'passed' : 'failed', resultText));
          }),
        );
    }
  }
}
