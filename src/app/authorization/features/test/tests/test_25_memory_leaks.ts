import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';

@Injectable({
  providedIn: 'root',
})
export class Test25MemoryLeaks extends BaseTest {
  get testNumber(): number {
    return 25;
  }

  get testName(): string {
    return 'Проверка утечек памяти';
  }

  execute(): Observable<TestResult> {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    let resultText = `Память до теста: ${this.formatMemory(initialMemory)}\n`;

    const subscriptions: any[] = [];
    for (let i = 0; i < 100; i++) {
      const sub = this.tokenService.getTokenStatus().subscribe();
      subscriptions.push(sub);
    }

    subscriptions.forEach((sub) => sub.unsubscribe());

    if ((window as any).gc) {
      (window as any).gc();
    }

    return timer(2000).pipe(
      switchMap(() => {
        const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
        resultText += `Память после теста: ${this.formatMemory(finalMemory)}\n`;

        const memoryDiff = finalMemory - initialMemory;
        resultText += `Изменение памяти: ${this.formatMemory(memoryDiff)}\n`;

        if (memoryDiff < 1000000) {
          resultText += 'Значительных утечек не обнаружено';
          return of(this.createResult('passed', resultText));
        } else {
          resultText += 'Возможна утечка памяти';
          return of(this.createResult('warning', resultText));
        }
      }),
    );
  }
}
