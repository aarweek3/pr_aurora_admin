import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test18CrossTabSession extends BaseTest {
  get testNumber(): number {
    return 18;
  }

  get testName(): string {
    return 'Межвкладочная сессия';
  }

  execute(): Observable<TestResult> {
    const currentStatus = this.tokenService.getCurrentStatus();
    let resultText = `Текущая вкладка: ${
      currentStatus.isValid ? '✅ Авторизован' : '❌ Не авторизован'
    }\n`;

    try {
      const testKey = 'auth_test_cross_tab';
      const testValue = Date.now().toString();

      localStorage.setItem(testKey, testValue);
      const retrievedValue = localStorage.getItem(testKey);

      if (retrievedValue === testValue) {
        resultText += 'localStorage работает корректно\n';
        resultText += 'Межвкладочная синхронизация возможна';
        localStorage.removeItem(testKey);
        return of(this.createResult('passed', resultText));
      } else {
        resultText += 'Проблемы с localStorage';
        return of(this.createResult('failed', resultText));
      }
    } catch (error: any) {
      resultText += `Ошибка localStorage: ${error.message}`;
      return of(this.createResult('failed', resultText));
    }
  }
}
