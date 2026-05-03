import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiEndpoints } from '@environments/api-endpoints';
import { LoggerConsoleService } from '@shared/logger-console/services/logger-console.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { finalize } from 'rxjs/operators';

interface ApiEndpoint {
  label: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
}

@Component({
  selector: 'app-playground-tab',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzIconModule,
    NzGridModule,
    NzDividerModule,
    NzTagModule,
    NzPopoverModule,
    NzAlertModule,
    NzSpaceModule,
    NzSpinModule,
    NzSelectModule,
    NzInputModule,
    NzFormModule,
    FormsModule,
    NzTabsModule,
    NzDescriptionsModule,
  ],
  templateUrl: './playground-tab.component.html',
  styleUrls: ['./playground-tab.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class PlaygroundTabComponent {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private logger = inject(LoggerConsoleService).getLogger('PlaygroundTab');

  // Available Endpoints
  endpoints: ApiEndpoint[] = [
    {
      label: 'Профиль пользователя',
      url: ApiEndpoints.AUTH.PROFILE,
      method: 'GET',
      description: 'Получение данных текущего пользователя из JWT или сессии.',
    },
    {
      label: 'Отладка токена (Claims)',
      url: ApiEndpoints.AUTH.DEBUG_TOKEN,
      method: 'GET',
      description: 'Возвращает все claims из текущего Access Token.',
    },
    {
      label: 'Проверка Cookies',
      url: ApiEndpoints.AUTH.DEBUG_COOKIES,
      method: 'GET',
      description: 'Проверяет наличие и валидность HttpOnly cookies на стороне сервера.',
    },
    {
      label: 'Статистика (Admin Only)',
      url: ApiEndpoints.ADMIN.STATISTICS,
      method: 'GET',
      description:
        'Запрос к защищенному админскому ресурсу. Вызывает 403 для обычных пользователей.',
    },
    {
      label: 'Тест 401 (Принудительно)',
      url: ApiEndpoints.AUTH.BASE + '/unauthorized-test',
      method: 'GET',
      description: 'Эндпоинт, который всегда возвращает 401 для проверки механизма Refresh.',
    },
    {
      label: 'Test 403 (Forbidden)',
      url: ApiEndpoints.AUTH.BASE + '/test-403',
      method: 'GET',
      description: 'Endpoint that returns 403 if your roles are insufficient.',
    },
    {
      label: '📝 Свой запрос (ручной ввод)',
      url: '',
      method: 'GET',
      description: 'Введите любой относительный или абсолютный URL для проверки.',
    },
  ];

  // State Signals
  selectedIndex = signal<number>(0);
  customUrl = signal<string>('');
  selectedMethod = signal<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  isLoading = signal(false);
  lastResponse = signal<any | null>(null);

  constructor() {}

  sendRequest(): void {
    const endpoint = this.endpoints[this.selectedIndex()];
    const isCustom = this.selectedIndex() === this.endpoints.length - 1;
    const targetUrl = isCustom ? this.customUrl() : endpoint.url;
    const targetMethod = isCustom ? this.selectedMethod() : endpoint.method;

    if (!targetUrl) {
      this.message.warning('Введите URL запроса');
      return;
    }

    this.isLoading.set(true);
    this.lastResponse.set(null);
    this.logger.info(`Sending ${targetMethod} request to ${targetUrl}`);

    const options = {
      headers: { 'X-Simulator-Request': 'true' },
      withCredentials: true,
    };

    let request$;
    switch (targetMethod) {
      case 'GET':
        request$ = this.http.get(targetUrl, options);
        break;
      case 'POST':
        request$ = this.http.post(targetUrl, {}, options);
        break;
      case 'PUT':
        request$ = this.http.put(targetUrl, {}, options);
        break;
      case 'DELETE':
        request$ = this.http.delete(targetUrl, options);
        break;
      default:
        request$ = this.http.get(targetUrl, options);
    }

    request$.pipe(finalize(() => this.isLoading.set(false))).subscribe({
      next: (res) => {
        this.logger.info('Playground Result (Success):', res);
        this.lastResponse.set({
          status: 200,
          statusText: 'OK',
          body: res,
          ok: true,
          timestamp: new Date().toISOString(),
        });
        this.message.success('Request completed successfully');
      },
      error: (err: HttpErrorResponse) => {
        this.logger.error('Playground Result (Error):', err);
        this.lastResponse.set({
          status: err.status,
          statusText: err.statusText || 'Error',
          body: err.error || err.message,
          ok: false,
          timestamp: new Date().toISOString(),
        });
        this.message.error(`Request failed with status ${err.status}`);
      },
    });
  }

  onEndpointChange(index: number): void {
    this.selectedIndex.set(index);
    if (index < this.endpoints.length - 1) {
      this.selectedMethod.set(this.endpoints[index].method);
    }
  }

  getJsonString(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }
}
