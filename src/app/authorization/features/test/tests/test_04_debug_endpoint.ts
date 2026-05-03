import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test04DebugEndpoint extends BaseTest {
  get testNumber(): number {
    return 4;
  }

  get testName(): string {
    return 'Debug endpoint';
  }

  execute(): Observable<TestResult> {
    return this.tokenService.checkServerToken().pipe(
      map((info) => {
        const results = `
Email: ${info.email}
ID: ${info.userId}
Роли: ${info.roles.join(', ') || 'Отсутствуют'}
        `.trim();

        return this.createResult('passed', results);
      }),
      catchError((error) => {
        return [this.handleError(error)];
      }),
    );
  }
}
