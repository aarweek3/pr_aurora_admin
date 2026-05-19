import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { AvSearchComponent } from '@shared/components/ui/search';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';

@Component({
  selector: 'app-search-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    AvSearchComponent,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Universal Search Hero"
        subtitle="Универсальный компонент поиска Aurora с поддержкой умной задержки и AI-интеграции."
        icon="🔍"
        componentPath="src/app/pages/help/search-help/search-help.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ПЕСОЧНИЦА -->
        <nz-tab nzTitle="🚀 Демонстрация">
          <div class="demo-section">
            <nz-card nzTitle="Живое превью" class="demo-card">
              <div class="search-demo-box">
                <av-search
                  [avLoading]="isLoading()"
                  [avPlaceholder]="placeholder()"
                  [avDebounceTime]="debounce()"
                  [showButton]="showBtn()"
                  (searchChange)="handleSearch($event)"
                  [(value)]="searchQuery"
                ></av-search>
              </div>

              <div class="search-log" *ngIf="lastQuery()">
                <div class="log-item">
                  <span class="log-label">Событие (searchChange):</span>
                  <span class="log-value">{{ lastQuery() }}</span>
                </div>
              </div>

              <div class="demo-controls">
                <hr />
                <div class="control-row">
                  <label class="av-checkbox-label">
                    <input type="checkbox" [checked]="isLoading()" (change)="toggleLoading()" />
                    <span class="checkbox-text">Имитация загрузки</span>
                  </label>
                  <label class="av-checkbox-label">
                    <input
                      type="checkbox"
                      [checked]="showBtn()"
                      (change)="showBtn.set(!showBtn())"
                    />
                    <span class="checkbox-text">Показывать кнопку</span>
                  </label>
                </div>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Базовый код для вставки"
              [content]="usageCode"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- 2. ИНТЕГРАЦИЯ -->
        <nz-tab nzTitle="🛠 Подключение">
          <div class="integration-section">
            <nz-card nzTitle="Пути к компоненту" class="info-card">
              <div class="path-list">
                <div class="path-item">
                  <span class="p-label">Component:</span>
                  <code>src/app/shared/components/ui/search/search.component.ts</code>
                </div>
                <div class="path-item">
                  <span class="p-label">Styles:</span>
                  <code>src/app/shared/components/ui/search/search.component.scss</code>
                </div>
                <div class="path-item">
                  <span class="p-label">Module Export:</span>
                  <code>&#64;shared/components/ui/search</code>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="🤖 Prompt для AI (Скопируй меня)" class="ai-card">
              <div class="ai-prompt-box">
                <p class="ai-description">
                  Используйте этот текст для быстрой интеграции поиска через ИИ-помощника:
                </p>
                <av-help-copy-container
                  title="AI Integration Prompt"
                  [content]="aiPrompt"
                  bgColor="#0f172a"
                ></av-help-copy-container>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Полный пример регистрации в Standalone"
              [content]="fullSetupCode"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- 3. API -->
        <nz-tab nzTitle="📖 API & Свойства">
          <div class="api-section">
            <nz-card nzTitle="Inputs (Свойства)">
              <nz-table #inputTable [nzData]="inputs" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr>
                    <th>Свойство</th>
                    <th>Тип</th>
                    <th>Дефолт</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let data of inputTable.data">
                    <td>
                      <code>{{ data.name }}</code>
                    </td>
                    <td>
                      <span class="type-tag">{{ data.type }}</span>
                    </td>
                    <td>
                      <code>{{ data.default }}</code>
                    </td>
                    <td>{{ data.desc }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 4. ЛОГИКА -->
        <nz-tab nzTitle="🧠 Архитектура">
          <div class="logic-section">
            <nz-card nzTitle="Как это работает внутри">
              <div class="logic-grid">
                <div class="logic-item">
                  <h4>⚡ Реактивный Debounce</h4>
                  <p>
                    Компонент использует внутренний <code>Subject</code>. При наборе текста событие
                    (searchChange) не генерируется мгновенно. Оно "ждет" паузы в 300мс (настраивается),
                    чтобы не спамить API сервера.
                  </p>
                </div>
                <div class="logic-item">
                  <h4>🔘 Ручной триггер</h4>
                  <p>
                    Нажатие на иконку поиска, кнопку "Найти" или клавишу <b>Enter</b> игнорирует
                    задержку и вызывает поиск немедленно.
                  </p>
                </div>
                <div class="logic-item">
                  <h4>🔄 Двусторонние Signals</h4>
                  <p>
                    Проп <code>[(value)]</code> реализован через Angular Model Signals. Это
                    гарантирует мгновенную синхронизацию данных между родителем и поиском без лишних
                    "Side-effects".
                  </p>
                </div>
                <div class="logic-item">
                  <h4>⏳ Состояние Loading</h4>
                  <p>
                    Если <code>[avLoading]="true"</code>, иконка лупы в поле скрывается, и на её
                    месте появляется анимированный спиннер Aurora. Кнопка при этом не блокируется.
                  </p>
                </div>
              </div>
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

      .help-header {
        display: none;
      }
      .help-tabs {
        margin-top: 24px;
      }

      .demo-section,
      .integration-section,
      .api-section,
      .logic-section {
        display: flex;
        flex-direction: column;
        gap: 32px;
        padding-top: 24px;
      }

      .demo-card {
        border-radius: 16px;
        border: none;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      }
      .search-demo-box {
        max-width: 600px;
        margin-bottom: 24px;
      }

      .search-log {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 24px;
      }
      .log-item {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .log-label {
        font-size: 14px;
        color: #166534;
        font-weight: 700;
      }
      .log-value {
        font-family: 'Fira Code', monospace;
        font-size: 14px;
        color: #14532d;
      }

      .av-checkbox-label {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 8px 16px;
        background: #f8fafc;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .av-checkbox-label:hover {
        background: #f1f5f9;
      }
      .checkbox-text {
        font-size: 14px;
        color: #475569;
        font-weight: 500;
      }

      .path-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .path-item {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .p-label {
        min-width: 120px;
        font-weight: 700;
        color: #64748b;
        font-size: 13px;
      }

      .ai-prompt-box {
        padding: 8px;
      }
      .ai-description {
        font-size: 14px;
        color: #64748b;
        margin-bottom: 12px;
      }

      .type-tag {
        background: #eff6ff;
        color: #2563eb;
        padding: 2px 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        border: 1px solid #dbeafe;
      }

      .logic-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
      }
      .logic-item h4 {
        color: #0f172a;
        margin-bottom: 10px;
        font-size: 16px;
        font-weight: 700;
      }
      .logic-item p {
        color: #64748b;
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
      }

      hr {
        border: 0;
        border-top: 1px solid #f1f5f9;
        margin: 24px 0;
      }
    `,
  ],
})
export class SearchHelpComponent {
  searchQuery = '';
  lastQuery = signal('');
  isLoading = signal(false);
  placeholder = signal('Попробуйте найти что-нибудь...');
  debounce = signal(300);
  showBtn = signal(false);

  handleSearch(query: string) {
    this.lastQuery.set(query);
  }

  toggleLoading() {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 2000);
  }

  inputs = [
    {
      name: 'value',
      type: 'model<string>',
      default: "''",
      desc: 'Двустороннее реактивное связывание',
    },
    { name: 'avPlaceholder', type: 'string', default: 'Поиск...', desc: 'Placeholder поля ввода' },
    {
      name: 'avDebounceTime',
      type: 'number',
      default: '300',
      desc: 'Задержка дебаунса в миллисекундах',
    },
    {
      name: 'avLoading',
      type: 'boolean',
      default: 'false',
      desc: 'Включает спиннер Aurora вместо иконки',
    },
    {
      name: 'showButton',
      type: 'boolean',
      default: 'true',
      desc: 'Показывать ли кнопку "Найти/Search"',
    },
    {
      name: 'avSize',
      type: 'string',
      default: 'default',
      desc: 'Размер: small | default | large | x-large',
    },
  ];

  usageCode = `<av-search
  [(value)]="searchTerm"
  [avLoading]="isLoading"
  (searchChange)="onSearchTriggered($event)"
  avPlaceholder="Поиск по ID..."
></av-search>`;

  fullSetupCode = `// 1. Импорт в компоненте
import { AvSearchComponent } from '@shared/components/ui/search';

@Component({
  ...
  standalone: true,
  imports: [AvSearchComponent, ...], // Добавьте сюда
})
export class MyListComponent {
  searchTerm = '';
  isLoading = false;

  onSearchTriggered(term: string) {
    this.isLoading = true;
    this.apiService.search(term).subscribe(() => this.isLoading = false);
  }
}`;

  aiPrompt = `Внедрите универсальный компонент поиска AvSearchComponent из @shared/components/ui/search в мой текущий компонент. 
Основные шаги:
1. Добавьте AvSearchComponent в массив imports в декораторе @Component.
2. В шаблоне вставьте <av-search> на место старого поиска.
3. Настройте двустороннее связывание через [(value)] с переменной поиска.
4. Добавьте вызов метода фильтрации через событие (searchChange).
5. Настройте индикацию загрузки через свойство [avLoading], если в компоненте есть соответствующий статус.`;
}
