// src/app/cors-test/cors-test.component.ts
import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface TestResult {
  title: string;
  success: boolean;
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-cors-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cors-test-container">
      <h1>🧪 CORS Test из Angular</h1>
      <p>
        <strong>Текущий origin:</strong>
        {{ currentOrigin }}
      </p>

      <div class="buttons">
        <button (click)="testGet()" class="btn">🔥 Test GET</button>
        <button (click)="testPost()" class="btn">📝 Test POST</button>
        <button (click)="testWithCredentials()" class="btn">🍪 Test with Cookies</button>
        <button (click)="testPreflight()" class="btn">✈️ Test Preflight</button>
        <button (click)="clearResults()" class="btn clear">🗑️ Clear</button>
      </div>

      <div class="results">
        <div
          *ngFor="let result of results"
          [class]="'result ' + (result.success ? 'success' : 'error')"
        >
          <h3>{{ result.success ? '✅' : '❌' }} {{ result.title }}</h3>
          <pre>{{ result.content }}</pre>
          <small>{{ result.timestamp | date : 'HH:mm:ss' }}</small>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .cors-test-container {
        padding: 20px;
        font-family: Arial, sans-serif;
      }

      .buttons {
        margin: 20px 0;
      }

      .btn {
        margin: 5px;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        background: #007bff;
        color: white;
        cursor: pointer;
      }

      .btn:hover {
        background: #0056b3;
      }

      .btn.clear {
        background: #dc3545;
      }

      .result {
        margin: 10px 0;
        padding: 15px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background: #f9f9f9;
      }

      .result.success {
        background: #e6ffe6;
        border-color: #99ff99;
      }

      .result.error {
        background: #ffe6e6;
        border-color: #ff9999;
      }

      pre {
        background: #f0f0f0;
        padding: 10px;
        border-radius: 4px;
        overflow-x: auto;
        white-space: pre-wrap;
      }

      h3 {
        margin-top: 0;
      }

      small {
        color: #666;
      }
    `,
  ],
})
export class CorsTestComponent {
  private readonly API_URL = 'https://localhost:7233';

  currentOrigin = window.location.origin;
  results: TestResult[] = [];

  constructor(private http: HttpClient) {}

  private addResult(title: string, success: boolean, content: string) {
    this.results.unshift({
      title,
      success,
      content,
      timestamp: new Date(),
    });

    // Ограничиваем до 10 результатов
    if (this.results.length > 10) {
      this.results = this.results.slice(0, 10);
    }
  }

  async testGet() {
    console.log('🔄 Testing GET from origin:', this.currentOrigin);

    try {
      const response = await this.http.get<any>(`${this.API_URL}/api/CorsDebug/test`).toPromise();

      this.addResult(
        'GET Request',
        true,
        `Status: 200\n` +
          `Origin in response: ${response.origin || 'null'}\n` +
          `Response: ${JSON.stringify(response, null, 2)}`,
      );
    } catch (error: any) {
      console.error('GET Error:', error);
      this.addResult(
        'GET Request',
        false,
        `Error: ${error.message || error.error?.message || 'Unknown error'}\n` +
          `Status: ${error.status || 'N/A'}\n` +
          `Причина: ${this.getErrorCause(error)}`,
      );
    }
  }

  async testPost() {
    console.log('🔄 Testing POST from origin:', this.currentOrigin);

    try {
      const testData = {
        test: 'data from Angular',
        origin: this.currentOrigin,
        timestamp: new Date().toISOString(),
      };

      const response = await this.http
        .post<any>(`${this.API_URL}/api/CorsDebug/test`, testData)
        .toPromise();

      this.addResult(
        'POST Request',
        true,
        `Status: 200\n` + `Response: ${JSON.stringify(response, null, 2)}`,
      );
    } catch (error: any) {
      console.error('POST Error:', error);
      this.addResult(
        'POST Request',
        false,
        `Error: ${error.message || error.error?.message || 'Unknown error'}\n` +
          `Status: ${error.status || 'N/A'}\n` +
          `Причина: ${this.getErrorCause(error)}`,
      );
    }
  }

  async testWithCredentials() {
    console.log('🔄 Testing with credentials from origin:', this.currentOrigin);

    try {
      const response = await this.http
        .get<any>(`${this.API_URL}/api/CorsDebug/test`, {
          withCredentials: true, // Включаем cookies!
        })
        .toPromise();

      this.addResult(
        'Request with Credentials',
        true,
        `Status: 200\n` +
          `Origin detected: ${response.origin || 'null'}\n` +
          `Cookies sent: ${response.headers?.Cookie ? 'YES' : 'NO'}\n` +
          `Response: ${JSON.stringify(response, null, 2)}`,
      );
    } catch (error: any) {
      console.error('Credentials Error:', error);
      this.addResult(
        'Request with Credentials',
        false,
        `Error: ${error.message || error.error?.message || 'Unknown error'}\n` +
          `Status: ${error.status || 'N/A'}\n` +
          `Причина: ${this.getErrorCause(error)}`,
      );
    }
  }

  async testPreflight() {
    console.log('🔄 Testing preflight from origin:', this.currentOrigin);

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Custom-Header': 'test-value', // Кастомный заголовок для preflight
      });

      const response = await this.http
        .post<any>(
          `${this.API_URL}/api/CorsDebug/test`,
          { preflightTest: true },
          {
            headers,
            withCredentials: true,
          },
        )
        .toPromise();

      this.addResult(
        'Preflight Request',
        true,
        `Status: 200\n` + `Response: ${JSON.stringify(response, null, 2)}`,
      );
    } catch (error: any) {
      console.error('Preflight Error:', error);
      this.addResult(
        'Preflight Request',
        false,
        `Error: ${error.message || error.error?.message || 'Unknown error'}\n` +
          `Status: ${error.status || 'N/A'}\n` +
          `Причина: ${this.getErrorCause(error)}`,
      );
    }
  }

  clearResults() {
    this.results = [];
  }

  private getErrorCause(error: any): string {
    if (error.status === 0) {
      return 'CORS блокирует запрос или сервер недоступен';
    } else if (error.status === 404) {
      return 'Endpoint не найден';
    } else if (error.status >= 500) {
      return 'Ошибка сервера';
    } else if (error.message?.includes('CORS')) {
      return 'CORS policy блокирует запрос';
    }
    return `HTTP Error ${error.status}`;
  }
}
