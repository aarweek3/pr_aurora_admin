import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';

@Component({
  selector: 'app-platform-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzAlertModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Platform Management Standard v3.5"
        subtitle="Исчерпывающее руководство по архитектуре, бизнес-логике и обслуживанию справочников Aggregator."
        icon="🏗️"
        componentPath="src/app/pages/help/platform-help/platform-help.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ОБЗОР -->
        <nz-tab nzTitle="🌟 Обзор">
          <div class="help-section">
            <nz-card nzTitle="Назначение и Эталонный статус">
              <p>
                Модуль <strong>Platform Of Aggregator</strong> — это «Золотой стандарт» (Golden
                Sample) реализации справочников в системе Aurora Admin v3.5. Он объединяет в себе
                все современные архитектурные паттерны: Signals, OnPush, SSOT и продвинутую
                SEO-оптимизацию.
              </p>

              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="thunderbolt" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Signals First:</strong> Полное отсутствие RxJS-подписок в шаблонах.
                    Прямая связь между бизнес-состоянием и UI через <code>signal</code>.
                  </div>
                </div>
                <div class="f-item">
                  <i nz-icon nzType="setting" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Maintenance Ready:</strong> Встроенные инструменты для очистки,
                    восстановления и инициализации данных из JSON.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="global" class="f-icon"></i>
                  <div class="f-text">
                    <strong>AI-Ready Content:</strong> Интеллектуальное заполнение пустых
                    локализаций из мастер-контента для SEO-стабильности.
                  </div>
                </div>
              </div>
            </nz-card>

            <nz-alert
              nzType="info"
              nzMessage="Архитектурное правило"
              nzDescription="Любой новый справочник в папке AGREGATOR/PAGES/SPRAVKA должен создаваться путем клонирования или следования паттернам модуля Platform."
              nzShowIcon
            ></nz-alert>
          </div>
        </nz-tab>

        <!-- 2. АРХИТЕКТУРА И ЛОГИКА -->
        <nz-tab nzTitle="🧠 Логика и Архитектура">
          <div class="help-section">
            <nz-card nzTitle="Жизненный цикл данных (Data Lifecycle)">
              <div class="logic-flow">
                <div class="flow-step"><strong>API Layer</strong><br />HTTP запросы</div>
                <i nz-icon nzType="arrow-right"></i>
                <div class="flow-step"><strong>State Service</strong><br />updateState()</div>
                <i nz-icon nzType="arrow-right"></i>
                <div class="flow-step"><strong>Signals</strong><br />computed()</div>
                <i nz-icon nzType="arrow-right"></i>
                <div class="flow-step"><strong>Components</strong><br />OnPush Render</div>
              </div>
            </nz-card>

            <div class="logic-grid">
              <div class="logic-card">
                <h4>Бизнес-логика: Localization Fallbacks</h4>
                <p>
                  Метод <code>applyEnglishFallbacks()</code> в State-сервисе гарантирует, что база
                  данных не будет содержать «дырок» в контенте:
                </p>
                <ul>
                  <li>
                    Если поле <code>name</code> или <code>description</code> в текущем языке пусто —
                    оно автоматически копируется из локализации <strong>en-US</strong> при
                    сохранении.
                  </li>
                  <li>Аналогично обрабатываются SEO-метатеги (metaTitle, metaDescription).</li>
                  <li>
                    Источник истины — техническое поле <code>name</code> или
                    <code>canonicalName</code> объекта.
                  </li>
                </ul>
              </div>
              <div class="logic-card">
                <h4>Централизованный Loading</h4>
                <p>Паттерн <code>executeWithLoading()</code>:</p>
                <ul>
                  <li>
                    Позволяет одной строкой обернуть любой Observable запрос в состояние загрузки.
                  </li>
                  <li>
                    Автоматически переключает <code>loading</code> или
                    <code>modalLoading</code> сигналы.
                  </li>
                  <li>
                    Гарантирует завершение индикации загрузки через оператор <code>finalize</code>.
                  </li>
                </ul>
              </div>
            </div>

            <av-help-copy-container
              title="Пример реализации SSOT Signal Service"
              [content]="architectureCode"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- 3. ОБСЛУЖИВАНИЕ ДАННЫХ -->
        <nz-tab nzTitle="🛠 Обслуживание">
          <div class="help-section">
            <nz-card nzTitle="Блок обслуживания (Maintenance Block)">
              <p>
                Для администраторов предусмотрен скрытый блок управления целостностью данных. Он
                вызывается нажатием на <strong>иконку шестеренки</strong> в заголовке
                Manager-компонента.
              </p>

              <div class="maintenance-detail">
                <div class="m-item">
                  <nz-tag nzColor="error">Очистить БД</nz-tag>
                  <p>
                    Полная очистка таблицы. Реализована защита <strong>Challenge Modal</strong>:
                    пользователю нужно решить математический пример, чтобы подтвердить действие. Это
                    предотвращает случайное удаление всех данных.
                  </p>
                </div>
                <div class="m-item">
                  <nz-tag nzColor="processing">Считать данные из БД</nz-tag>
                  <p>
                    Принудительное обновление текущего списка. Реализована защита
                    <strong>Confirm Modal</strong>: перед выполнением запрашивается подтверждение.
                    После загрузки выводится информационное окно о количестве найденных записей или
                    предупреждение о пустой базе.
                  </p>
                </div>
                <div class="m-item">
                  <nz-tag nzColor="warning">Перенести из JSON в БД</nz-tag>
                  <p>
                    Функция <code>seedFromJson()</code>. Читает эталонный JSON-файл на сервере и
                    наполняет пустую базу. <strong>Важно:</strong> действие блокируется, если в базе
                    уже есть хотя бы одна запись.
                  </p>
                </div>
              </div>
            </nz-card>

            <div class="logic-card full-width">
              <h4>Где реализована логика кнопок?</h4>
              <ul>
                <li>
                  <strong>UI:</strong> Контрол <code>app-button-control-json-block</code> в шаблоне
                  <code>ManagerComponent</code>.
                </li>
                <li>
                  <strong>Flow Control:</strong> Методы <code>handleReadFromDb()</code> (с
                  подтверждением) и <code>clearDatabase()</code> в <code>ManagerComponent</code>.
                </li>
                <li>
                  <strong>State:</strong> Методы <code>loadItems()</code>,
                  <code>seedFromJson()</code>, <code>clearDatabase()</code> в State-сервисе.
                </li>
                <li>
                  <strong>API:</strong> Одноименные эндпоинты в
                  <code>PlatformOfAggregatorApiService</code>, проксирующие запросы к бэкенду.
                </li>
              </ul>
            </div>
          </div>
        </nz-tab>

        <!-- 4. КОМПОНЕНТЫ И РЕЖИМЫ -->
        <nz-tab nzTitle="🖥 Режимы и UI">
          <div class="help-section">
            <nz-card nzTitle="Три режима отображения (View Modes)">
              <p>
                Manager-компонент управляет переменной <code>viewMode</code>, которая переключает
                способ взаимодействия с формами:
              </p>
              <div class="view-mode-grid">
                <div class="v-mode">
                  <h5>1. Modal Mode</h5>
                  <p>Форма открывается в стандартном всплывающем окне поверх списка.</p>
                </div>
                <div class="v-mode">
                  <h5>2. Inline (Split) Mode</h5>
                  <p>
                    Экран делится на две части: слева список, справа форма редактирования. Идеально
                    для быстрой правки нескольких записей.
                  </p>
                </div>
                <div class="v-mode">
                  <h5>3. Page Mode</h5>
                  <p>
                    Переход на отдельный роут (/:id/edit). Используется для сложных правок, когда
                    нужно полное пространство экрана.
                  </p>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 5. ЧЕК-ЛИСТЫ -->
        <nz-tab nzTitle="📋 Чек-листы">
          <div class="help-section">
            <nz-card nzTitle="Client Structure Checklist">
              <div class="checklist-grid">
                <div class="checklist-item">
                  <nz-tag nzColor="geekblue">Base System</nz-tag>
                  <ul>
                    <li>
                      <strong>Manager:</strong> platform-of-aggregator-manager.component.ts
                      (Оркестратор)
                    </li>
                    <li>
                      <strong>State:</strong> platform-of-aggregator-state.service.ts (Логика и
                      Сигналы)
                    </li>
                    <li>
                      <strong>API:</strong> platform-of-aggregator-api.service.ts (HTTP
                      взаимодействие)
                    </li>
                  </ul>
                </div>
                <div class="checklist-item">
                  <nz-tag nzColor="purple">View Components</nz-tag>
                  <ul>
                    <li><strong>List:</strong> components/platform-of-aggregator-list/</li>
                    <li>
                      <strong>Form:</strong> components/platform-of-aggregator-form/ (Общая база)
                    </li>
                    <li><strong>Modal:</strong> platform-of-aggregator-modal.component.ts</li>
                    <li>
                      <strong>Details:</strong> components/platform-of-aggregator-details/
                      (Просмотр)
                    </li>
                  </ul>
                </div>
              </div>
              <av-help-copy-container
                title="Полный список файлов клиентской части"
                [content]="clientChecklistCode"
                bgColor="#1e1b4b"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 6. СОРТИРОВКА -->
        <nz-tab nzTitle="📊 Сортировка">
          <div class="help-section">
            <nz-card nzTitle="Серверная сортировка (Server-Side Sorting)">
              <p>
                В Aurora v3.5 реализован паттерн <strong>Pure Server Sorting</strong>. Это означает,
                что при клике на заголовок колонки данные пересчитываются на стороне БД, что
                гарантирует корректную работу пагинации и учет всех записей базы, а не только
                текущей страницы.
              </p>

              <div class="logic-grid">
                <div class="logic-card">
                  <h4>Реализация на клиенте</h4>
                  <ul>
                    <li>
                      <strong>State:</strong> Поля <code>sortBy</code> (строка) и
                      <code>sortDirection</code> (0 - Asc, 1 - Desc).
                    </li>
                    <li>
                      <strong>Service:</strong> Метод
                      <code>setSort(column, direction)</code> обновляет состояние и сбрасывает
                      страницу на первую.
                    </li>
                    <li>
                      <strong>UI:</strong> Директивы <code>[nzSortFn]="true"</code> и
                      <code>(nzSortOrderChange)</code> в заголовках <code>th</code>.
                    </li>
                  </ul>
                </div>
                <div class="logic-card">
                  <h4>Реализация на сервере</h4>
                  <ul>
                    <li>
                      <strong>DTO:</strong> Параметры <code>SortBy</code> и
                      <code>SortDirection</code> в объекте запроса страницы.
                    </li>
                    <li>
                      <strong>Logic:</strong> Метод <code>ApplySorting</code> в C# сервисе
                      использует <code>switch</code> для динамического построения
                      <code>OrderBy</code>. Поддерживает поля: <code>Id</code>, <code>Name</code>,
                      <code>SortOrder</code> и др.
                    </li>
                    <li>
                      <strong>Default:</strong> "Золотой стандарт" — сортировка по
                      <strong>Name</strong> (алфавиту).
                    </li>
                  </ul>
                </div>
              </div>

              <av-help-copy-container
                title="Паттерн подключения сортировки (Frontend)"
                [content]="sortingCode"
                bgColor="#1e293b"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 7. AI PROMPT -->
        <nz-tab nzTitle="🤖 AI Prompt">
          <div class="help-section">
            <nz-card nzTitle="Мастер-промпт для клонирования справочника" class="ai-card">
              <p class="ai-intro">
                Используйте этот промпт для генерации нового функционального раздела в стиле v3.5:
              </p>
              <av-help-copy-container
                title="Master Prompt: Aurora v3.5 Reference"
                [content]="masterPrompt"
                bgColor="#0f172a"
              ></av-help-copy-container>
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
        max-width: 1400px;
        margin: 0 auto;
        min-height: 800px;
      }
      .help-tabs {
        margin-top: 24px;
      }
      .help-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-top: 16px;
      }

      /* Logic Flow */
      .logic-flow {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 20px;
        background: #f0f7ff;
        border-radius: 12px;
      }
      .flow-step {
        text-align: center;
        padding: 12px;
        background: white;
        border: 1px solid #bfdbfe;
        border-radius: 8px;
        font-size: 13px;
      }

      /* Features and Maintenance */
      .feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }
      .feature-item,
      .f-item {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding: 16px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      }
      .f-icon {
        font-size: 20px;
        color: #3b82f6;
      }
      .f-text {
        font-size: 14px;
        color: #475569;
      }

      .maintenance-detail {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 16px;
      }
      .m-item {
        padding: 12px;
        border-left: 4px solid #e2e8f0;
        background: #f8fafc;
      }
      .m-item p {
        margin: 4px 0 0 0;
        font-size: 13px;
        color: #64748b;
      }

      .logic-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      .logic-card {
        padding: 20px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
      }
      .logic-card h4 {
        margin-bottom: 12px;
        font-weight: 700;
        color: #1e293b;
      }
      .logic-card ul {
        padding-left: 18px;
        color: #64748b;
        font-size: 13px;
      }
      .full-width {
        grid-column: 1 / -1;
      }

      /* View Modes */
      .view-mode-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-top: 16px;
      }
      .v-mode {
        padding: 16px;
        background: #f1f5f9;
        border-radius: 8px;
        text-align: center;
      }
      .v-mode h5 {
        margin-bottom: 8px;
        font-weight: 700;
      }
      .v-mode p {
        font-size: 12px;
        color: #64748b;
      }

      .checklist-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 20px;
      }
      .checklist-item {
        padding: 16px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
      }
      .checklist-item ul {
        padding-left: 18px;
        list-style-type: circle;
        font-size: 13px;
        color: #64748b;
        margin-top: 10px;
      }
    `,
  ],
})
export class PlatformHelpComponent {
  architectureCode = `// --- ПАТТЕРН executeWithLoading ---
private executeWithLoading<T>(operation: Observable<T>, isModal = false): Observable<T> {
  const loadingKey = isModal ? 'modalLoading' : 'loading';
  this.updateState({ [loadingKey]: true, error: null } as any);

  return operation.pipe(
    takeUntil(this.destroy$),
    finalize(() => this.updateState({ [loadingKey]: false } as any))
  );
}

// --- ПАТТЕРН Localization Fallbacks ---
private applyEnglishFallbacks(data: Dto) {
  const enLoc = data.localizations.find(l => l.languageCode === 'en-US');
  data.localizations.forEach(loc => {
    if (!loc.name?.trim()) loc.name = enLoc?.name || data.canonicalName;
    // ... копирование SEO данных
  });
}`;

  clientChecklistCode = `Путь: src/app/AGREGATOR/PAGES/SPRAVKA/PlatformOfAggregatorPage/...

[ ] MANAGER: platform-of-aggregator-manager.component.ts (Включает Maintenance блок)
[ ] STATE: services/platform-of-aggregator-state.service.ts
[ ] API: services/platform-of-aggregator-api.service.ts
[ ] LIST: components/platform-of-aggregator-list/
[ ] FORM: components/platform-of-aggregator-form/
[ ] DETAILS: components/platform-of-aggregator-details/
[ ] MODAL: components/platform-of-aggregator-modal/
[ ] VIEW-MODAL: components/platform-of-aggregator-view-modal/
[ ] INLINE: components/platform-of-aggregator-inline/
[ ] PAGE-FORM: components/platform-of-aggregator-page-form/`;

  masterPrompt = `TASK: Create administrative module for [ENTITY_NAME]
Reference: PlatformOfAggregatorPage (Aurora v3.5)

Key Logic Requirements:
1. Signal State Management: Single writable signal<State>.
2. SSOT Actions: loadItems, save, delete (soft/hard), restore, seedFromJson, clearDatabase.
3. Loading Pattern: Use executeWithLoading helper for signals.
4. SEO Fallbacks: Transfer content from en-US if localized fields are empty.
5. Server Sorting: Default by 'Name', persistent via signals.
6. Multi-Mode: Support Modal, Private Page, and Inline (Split) views.
7. Maintenance: Implement the standard ButtonControlJsonBlock in the Manager header.`;

  sortingCode = `// 1. В ТАБЛИЦЕ (TEMPLATE)
<th [nzSortFn]="true" 
    [nzSortOrder]="state.sortBy() === 'Name' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
    (nzSortOrderChange)="onSortChange('Name', $event)">
    Название
</th>

<th [nzSortFn]="true" 
    [nzSortOrder]="state.sortBy() === 'Id' ? (state.sortDirection() === 0 ? 'ascend' : 'descend') : null"
    (nzSortOrderChange)="onSortChange('Id', $event)">
    ID
</th>

// 2. В КОМПОНЕНТЕ (TS)
onSortChange(column: string, direction: string | null): void {
  this.state.setSort(column, direction);
}

// 3. В STATE СЕРВИСЕ
setSort(column: string, direction: string | null): void {
  const dirNum = direction === 'descend' ? 1 : 0;
  this.updateState({ sortBy: column, sortDirection: dirNum, pageNumber: 1 });
  this.loadItems();
}`;
}
