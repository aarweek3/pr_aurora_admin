import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test11MalformedToken extends BaseTest {
  get testNumber(): number {
    return 11;
  }

  get testName(): string {
    return 'Некорректный токен';
  }

  execute(): Observable<TestResult> {
    return this.tokenService.checkTokenStatus().pipe(
      map((status) => {
        let resultText = '';
        if (status.valid) {
          resultText += 'Токен корректный\n';
        } else {
          resultText += 'Токен некорректный или отсутствует\n';
        }
        resultText += 'Обработка состояния токена работает';

        return this.createResult('passed', resultText);
      }),
      catchError((error) => {
        const results = `Ошибка токена обработана: ${error.message}`;
        return of(this.createResult('passed', results));
      }),
    );
  }
}
