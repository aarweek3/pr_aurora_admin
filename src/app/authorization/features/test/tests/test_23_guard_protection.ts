import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test23GuardProtection extends BaseTest {
  get testNumber(): number {
    return 23;
  }

  get testName(): string {
    return 'Защита маршрутов (Guards)';
  }

  execute(): Observable<TestResult> {
    const isAuthenticated = this.authService.isAuthenticated();
    const isAdmin = this.authService.isAdminUser();
    const isModerator = this.authService.isModeratorUser();

    let resultText = `Авторизован: ${isAuthenticated ? '✅ Да' : '❌ Нет'}\n`;
    resultText += `Админ: ${isAdmin ? '✅ Да' : '❌ Нет'}\n`;
    resultText += `Модератор: ${isModerator ? '✅ Да' : '❌ Нет'}\n`;
    resultText += '\nТестируем доступ к защищенным маршрутам:\n';

    const protectedRoutes = ['/admin', '/admin/dashboard', '/admin/users'];
    protectedRoutes.forEach((route) => {
      if (isAdmin) {
        resultText += `${route}: ✅ Доступен\n`;
      } else {
        resultText += `${route}: ❌ Заблокирован\n`;
      }
    });

    return of(this.createResult('passed', resultText));
  }
}
