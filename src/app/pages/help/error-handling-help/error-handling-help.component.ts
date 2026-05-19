import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

@Component({
  selector: 'app-error-handling-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTagModule,
    NzTimelineModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Error Handling Guide"
        subtitle="Стандарты и механизмы обработки ошибок на стороне сервера и клиента в экосистеме Aurora."
        icon="⚠️"
        componentPath="src/app/pages/help/error-handling-help/error-handling-help.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- ТАБ 1: СЕРВЕР -->
        <nz-tab nzTitle="🖥️ Сервер (ASP.NET Core)">
          <div class="demo-section">
            <nz-card nzTitle="Глобальный обработчик (AuthExceptionMiddleware)">
              <p>
                Middleware является единственной точкой выхода всех ошибок. Его работа делится на
                два сценария:
              </p>

              <div class="logic-grid">
                <div class="logic-item">
                  <h4>⚡ Сценарий 1: Перехват Exception</h4>
                  <p>
                    Если в любом месте кода (контроллер, сервис, БД) выбрасывается
                    <code>throw new Exception()</code>, middleware ловит его в блоке
                    <code>catch</code> и вызывает <code>HandleExceptionAsync</code>.
                  </p>
                </div>
                <div class="logic-item">
                  <h4>🚪 Сценарий 2: Перехват статус-кода</h4>
                  <p>
                    Если код выполнился без исключений, но Identity или авторизация вернули
                    <code>401</code> или <code>403</code>, middleware перехватывает этот статус и
                    оборачивает его в JSON, чтобы фронтенд всегда получал объект.
                  </p>
                </div>
              </div>

              <h4 style="margin-top: 24px;">Алгоритм работы HandleExceptionAsync:</h4>
              <nz-timeline>
                <nz-timeline-item nzColor="blue">
                  <b>Идентификация:</b> Генерация или получение
                  <code>CorrelationId</code> (TraceIdentifier) для связи логов сервера и клиента.
                </nz-timeline-item>
                <nz-timeline-item nzColor="orange">
                  <b>Логирование:</b> Если ошибка — это <code>ArgumentException</code> или
                  <code>ConflictException</code>, она логируется как <b>Warning</b> (вина клиента).
                  Остальные — как <b>Error</b> (вина сервера).
                </nz-timeline-item>
                <nz-timeline-item nzColor="purple">
                  <b>Маппинг статуса:</b> Проверка типа исключения через <code>switch</code>:
                  <ul>
                    <li><code>SecurityTokenException</code> ──► <b>401</b></li>
                    <li><code>FileNotFoundException</code> ──► <b>404</b></li>
                    <li><code>ConflictException</code> ──► <b>409</b></li>
                    <li>Все остальные ──► <b>500</b></li>
                  </ul>
                </nz-timeline-item>
                <nz-timeline-item nzColor="green">
                  <b>Сериализация:</b> Запись в <code>Response</code> объекта
                  <code>ErrorResponseModel</code> с текущей датой (UTC) и деталями.
                </nz-timeline-item>
              </nz-timeline>
            </nz-card>

            <av-help-copy-container
              title="Пример выброса исключения (Service/Controller)"
              [content]="serverThrowExample"
            ></av-help-copy-container>

            <av-help-copy-container
              title="Модель ответа (ErrorResponseModel.cs)"
              [content]="serverErrorModel"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- ТАБ 2: КЛИЕНТ -->
        <nz-tab nzTitle="🌐 Клиент (Angular)">
          <div class="demo-section">
            <nz-card nzTitle="Цепочка интерцепторов">
              <p>В Angular ошибки проходят через последовательность перехватчиков:</p>
              <nz-timeline>
                <nz-timeline-item nzColor="blue">
                  <b>HttpErrorInterceptor:</b> Первым ловит ответ. Превращает
                  <code>HttpErrorResponse</code> в наш объект <code>ErrorResponse</code>.
                </nz-timeline-item>
                <nz-timeline-item nzColor="purple">
                  <b>authInterceptor:</b> Обрабатывает специфику авторизации (401 Refresh Token, 403
                  Redirect).
                </nz-timeline-item>
                <nz-timeline-item nzColor="green">
                  <b>UI Component:</b> Ловит ошибку в блоке <code>catchError</code> или
                  <code>subscribe({{ '{' }} error: ... {{ '}' }})</code>.
                </nz-timeline-item>
              </nz-timeline>
            </nz-card>

            <av-help-copy-container
              title="Обработка в компоненте (на примере Login)"
              [content]="clientComponentExample"
            ></av-help-copy-container>

            <nz-card nzTitle="Логика выбора сообщения">
              <p>Система ищет наиболее подходящий текст для пользователя в следующем порядке:</p>
              <ol>
                <li><code>error.status === 0</code> -> <b>"Нет связи с сервером"</b></li>
                <li><code>serverError.userMessage</code> (если прислал сервер)</li>
                <li><code>serverError.detail</code> (техническое описание)</li>
                <li>Маппинг по статус-коду в <code>error-response.model.ts</code></li>
              </ol>
            </nz-card>
          </div>
        </nz-tab>
        <!-- ТАБ 3: СХЕМА -->
        <nz-tab nzTitle="🗺️ Схема потока">
          <div class="demo-section">
            <nz-card nzTitle="Сквозной путь ошибки (Full Stack Flow)">
              <div class="mermaid-container">
                <pre class="mermaid-code">
  [ BACKEND ]
  1. [Exception] (в коде сервиса)
  2. [AuthExceptionMiddleware] ──► Формирует JSON (ErrorResponseModel)
          │
  [ NETWORK ]
  3. [HTTP Response] (4xx, 5xx или 0)
          │
  [ CLIENT (Angular) ]
  4. [HttpErrorInterceptor] ─────► Превращает в ErrorResponse (Class)
  5. [authInterceptor] ──────────► Обрабатывает 401/403
  6. [Component .subscribe] ─────► Извлекает сообщение
  7. [getFriendlyMessage] ───────► Финальный текст
  8. [NzMessage (UI)] ───────────► Показ уведомления
                </pre
                >
              </div>
            </nz-card>

            <nz-card nzTitle="Специфика Network Error (Status 0)">
              <p>Если сервер недоступен, цепочка сокращается:</p>
              <ol>
                <li><b>Браузер:</b> net::ERR_CONNECTION_REFUSED.</li>
                <li><b>Angular:</b> HttpErrorResponse (status 0).</li>
                <li><b>HttpErrorInterceptor:</b> Метод <code>createNetworkError()</code>.</li>
                <li><b>UI:</b> Сообщение "Нет связи с сервером".</li>
              </ol>
            </nz-card>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [
    `
      .help-container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .help-tabs {
        margin-top: 24px;
      }
      .demo-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-top: 24px;
      }
      .logic-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-top: 16px;
      }
      .logic-item {
        padding: 12px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .logic-item p {
        margin: 8px 0 0 0;
        font-size: 13px;
        color: #64748b;
      }
      code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        color: #0f172a;
        font-family: 'Fira Code', monospace;
        font-size: 0.9em;
      }
      .mermaid-container {
        background: #f8fafc;
        padding: 24px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        overflow-x: auto;
      }
      .mermaid-code {
        color: #0f172a;
        font-family: 'Fira Code', monospace;
        line-height: 1.5;
        margin: 0;
        font-weight: 500;
      }
    `,
  ],
})
export class ErrorHandlingHelpComponent {
  serverThrowExample = `// 1. В сервисе (бизнес-логика)
public async Task UpdateCategory(CategoryDto dto) {
    var exists = await _repo.AnyAsync(x => x.Name == dto.Name);
    if (exists) {
        // Это исключение middleware смапит на 409 Conflict
        throw new ConflictException("Категория с таким именем уже существует", "Name");
    }
}

// 2. В контроллере (валидация)
[HttpPost]
public IActionResult Create([FromBody] Request request) {
    if (request == null) {
        // Это исключение middleware смапит на 400 BadRequest
        throw new ArgumentNullException(nameof(request));
    }
    // ...
}`;

  serverErrorModel = `{
  "success": false,
  "message": "Ошибка валидации",
  "statusCode": 400,
  "correlationId": "0HMN...-A",
  "errorCode": "INVALID_PARAMETER",
  "conflictField": null,
  "timestamp": "2026-04-25T..."
}`;

  clientComponentExample = `// 1. Пример использования в компоненте (Pattern: Aurora standard)
this.service.save(data).subscribe({
  next: (res) => this.message.success('Успешно сохранено'),
  error: (error) => {
    // ВАЖНО: Интерцепторы уже превратили ошибку в ErrorResponse
    // или в стандартный объект Error
    this.handleServiceError(error);
  }
});

// 2. Метод обработки (Pattern: Extraction & Sanitization)
private handleServiceError(error: any): void {
  // Извлекаем наиболее "человечное" сообщение
  const rawMessage = error?.userMessage || 
                     error?.detail || 
                     error?.message || 
                     'Неизвестная ошибка';

  // Получаем "дружелюбный" текст на основе ключевых слов или статуса
  const friendlyMessage = this.getFriendlyMessage(rawMessage, error);

  // Выводим уведомление
  this.message.error(friendlyMessage);
  
  // Выключаем индикаторы загрузки
  this.isLoading.set(false);
}

// 3. Метод маппинга (Pattern: Friendly Mapper)
private getFriendlyMessage(msg: string, error: any): string {
  const lower = msg.toLowerCase();
  
  // Проверка по статусу (самый надежный способ)
  if (error?.status === 0) return 'Нет связи с сервером';
  
  // Проверка по ключевым словам
  if (lower.includes('conflict') || lower.includes('exists')) {
    return 'Такая запись уже существует в системе';
  }
  
  return msg;
}`;
}
