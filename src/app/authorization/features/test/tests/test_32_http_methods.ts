import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseTest, TestResult } from './base_test';
import { environment } from '@environments/environment';

interface MethodTestResult {
  method: string;
  success: boolean;
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Test32HttpMethods extends BaseTest {
  get testNumber(): number {
    return 32;
  }

  get testName(): string {
    return 'Тест HTTP методов';
  }

  execute(): Observable<TestResult> {
    const url = `${environment.apiUrl}/api/test/test-methods`;

    const methods = [
      { name: 'POST', request: this.http.post(url, {}, { withCredentials: true }) },
      { name: 'PUT', request: this.http.put(url, {}, { withCredentials: true }) },
      { name: 'PATCH', request: this.http.patch(url, {}, { withCredentials: true }) },
      { name: 'DELETE', request: this.http.delete(url, { withCredentials: true }) },
    ];

    const requests = methods.map((method) =>
      method.request.pipe(
        map(
          (response: any): MethodTestResult => ({
            method: method.name,
            success: true,
            message: response.message,
          }),
        ),
        catchError((error) =>
          of<MethodTestResult>({
            method: method.name,
            success: false,
            error: error.message,
          }),
        ),
      ),
    );

    return forkJoin(requests).pipe(
      map((results: MethodTestResult[]) => {
        const successCount = results.filter((r) => r.success).length;
        let resultText = '';

        results.forEach((result) => {
          if (result.success && result.message) {
            resultText += `${result.method}: ✅ ${result.message}\n`;
          } else if (!result.success && result.error) {
            resultText += `${result.method}: ❌ ${result.error}\n`;
          }
        });

        resultText += `\nУспешных методов: ${successCount}/${methods.length}`;

        return this.createResult(
          successCount === methods.length ? 'passed' : 'warning',
          resultText,
        );
      }),
    );
  }
}
