import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { 
  HelpCopyContainerComponent,
  HelpPathHeaderComponent
} from '@shared/components/ui';

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
    HelpCopyContainerComponent,
    HelpPathHeaderComponent
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Platform Management v3.5"
        subtitle="Архитектурный стандарт управления справочниками на базе Angular Signals и OnPush."
        icon="🏗️"
        componentPath="src/app/pages/help/platform-help/platform-help.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ОБЗОР -->
        <nz-tab nzTitle="🌟 Обзор">
          <div class="help-section">
            <nz-card nzTitle="Назначение">
              <p>Модуль <strong>Platform Of Aggregator</strong> — это эталонная реализация справочника Aurora admin v3.5. Он служит шаблоном для создания любых CRUD-модулей, требующих мультиязычности и SEO-оптимизации.</p>
              
              <div class="feature-grid">
                <div class="feature-item">
                  <i nz-icon nzType="thunderbolt" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Signals First:</strong> Полное отсутствие RxJS-подписок в шаблонах. Использование <code>signal</code>, <code>computed</code> и <code>toSignal</code>.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="block" class="f-icon"></i>
                  <div class="f-text">
                    <strong>Smart State:</strong> Сервис-хранилище (SSOT) управляет всем состоянием, включая пагинацию, поиск и режимы отображения.
                  </div>
                </div>
                <div class="feature-item">
                  <i nz-icon nzType="global" class="f-icon"></i>
                  <div class="f-text">
                    <strong>SEO Fallbacks:</strong> Автоматическое заполнение пустых локализаций из мастер-контента (en-US).
                  </div>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 2. АРХИТЕКТУРА -->
        <nz-tab nzTitle="🧠 Архитектура v3.5">
          <div class="help-section">
            <nz-card nzTitle="Single Source of Truth (SSOT)">
              <p>Вся логика модуля сосредоточена в <strong>State Service</strong>. Компоненты являются «глупыми» (presentational) и лишь отображают данные из сигналов сервиса.</p>
              <av-help-copy-container 
                title="Pattern: Signal State Service" 
                [content]="architectureCode"
              ></av-help-copy-container>
            </nz-card>

            <div class="logic-grid">
              <div class="logic-card">
                <h4>Слой Представления</h4>
                <ul>
                  <li><strong>Standalone Only:</strong> Все компоненты независимы.</li>
                  <li><strong>OnPush Strategy:</strong> Максимальная производительность.</li>
                  <li><strong>Split View:</strong> Поддержка Modal, Inline и Page режимов в одном менеджере.</li>
                </ul>
              </div>
              <div class="logic-card">
                <h4>Слой Данных</h4>
                <ul>
                  <li><strong>Soft Delete:</strong> Полноценная работа с корзиной (Restore/Hard Delete).</li>
                  <li><strong>Auto-Mapping:</strong> Преобразование DTO в реактивные состояния.</li>
                </ul>
              </div>
            </div>
          </div>
        </nz-tab>

        <!-- 3. МОДЕЛИ -->
        <nz-tab nzTitle="📦 Модели">
          <div class="help-section">
            <nz-card nzTitle="State Interface">
              <p>Полное описание состояния модуля:</p>
              <av-help-copy-container 
                title="PlatformOfAggregatorState" 
                [content]="stateModelCode"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 4. КАК СОЗДАТЬ АНАЛОГ -->
        <nz-tab nzTitle="🛠 Как создать аналог">
          <div class="help-section guide-section">
            <nz-card nzTitle="Пошаговый план (Recipe)">
              <div class="steps-container">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h5>Модель и API</h5>
                    <p>Создайте DTO и <code>ApiService</code>. Убедитесь, что API поддерживает пагинацию и фильтры.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h5>State Service</h5>
                    <p>Реализуйте сервис на базе <code>signal()</code>. Добавьте методы <code>loadItems</code>, <code>save</code>, <code>delete</code>.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h5>Компоненты (v3.5)</h5>
                    <p>Разделите логику: <code>List</code>, <code>Form</code>, <code>Modal</code>, <code>Inline</code>. Используйте <code>Manager</code> как хост.</p>
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <h5>Роутинг</h5>
                    <p>Настройте дочерние маршруты для поддержки режима "Отдельная страница" (/:id/edit).</p>
                  </div>
                </div>
              </div>
            </nz-card>

            <div class="info-alert info">
              <strong>Совет:</strong> Используйте существующие SCSS файлы модуля Platform как основу. Они содержат переменные для стекломорфизма и адаптивные сетки.
            </div>
          </div>
        </nz-tab>

        <!-- 5. ЧЕК-ЛИСТ СЕРВЕР -->
        <nz-tab nzTitle="📋 Чек-лист Сервер">
          <div class="help-section">
            <nz-card nzTitle="Backend Architecture Checklist">
              <p>Полный перечень компонентов серверной части для реализации справочника по стандарту v3.5:</p>
              <div class="checklist-grid">
                <div class="checklist-item">
                  <nz-tag nzColor="blue">DAL</nz-tag>
                  <ul>
                    <li><strong>Entity:</strong> PlatformOfAggregator.cs</li>
                    <li><strong>Localization:</strong> PlatformOfAggregatorLocalization.cs</li>
                    <li><strong>Repository:</strong> IPlatformOfAggregatorRepository / PlatformOfAggregatorRepository</li>
                  </ul>
                </div>
                <div class="checklist-item">
                  <nz-tag nzColor="green">BLL</nz-tag>
                  <ul>
                    <li><strong>Service:</strong> IPlatformOfAggregatorService / PlatformOfAggregatorService</li>
                    <li><strong>DTOs:</strong> PlatformOfAggregatorDto.cs (Item, Detail, Create, Update)</li>
                    <li><strong>Validation:</strong> PlatformOfAggregatorValidators (FluentValidation)</li>
                    <li><strong>Mapping:</strong> PlatformOfAggregatorProfile (AutoMapper)</li>
                  </ul>
                </div>
                <div class="checklist-item">
                  <nz-tag nzColor="orange">API</nz-tag>
                  <ul>
                    <li><strong>Controller:</strong> PlatformOfAggregatorController.cs</li>
                    <li><strong>Registration:</strong> ServiceCollectionExtensions.cs (AddScoped)</li>
                  </ul>
                </div>
              </div>
              <av-help-copy-container 
                title="Полный чек-лист с путями" 
                [content]="serverChecklistCode"
                bgColor="#1e293b"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 6. ЧЕК-ЛИСТ КЛИЕНТ -->
        <nz-tab nzTitle="💻 Чек-лист Клиент">
          <div class="help-section">
            <nz-card nzTitle="Client Architecture Checklist (Signals v3.5)">
              <p>Список основных файлов фронтенд-модуля и их ответственности:</p>
              <div class="checklist-grid">
                <div class="checklist-item">
                  <nz-tag nzColor="geekblue">Data & State</nz-tag>
                  <ul>
                    <li><strong>Model:</strong> platform-of-aggregator.model.ts</li>
                    <li><strong>API:</strong> platform-of-aggregator-api.service.ts</li>
                    <li><strong>State:</strong> platform-of-aggregator-state.service.ts (SSOT)</li>
                  </ul>
                </div>
                <div class="checklist-item">
                  <nz-tag nzColor="purple">Components</nz-tag>
                  <ul>
                    <li><strong>Manager:</strong> platform-of-aggregator-manager.component.ts</li>
                    <li><strong>List:</strong> platform-of-aggregator-list.component.ts</li>
                    <li><strong>Form:</strong> platform-of-aggregator-page-form.component.ts</li>
                    <li><strong>Modal:</strong> platform-of-aggregator-modal.component.ts</li>
                  </ul>
                </div>
                <div class="checklist-item">
                  <nz-tag nzColor="cyan">Configuration</nz-tag>
                  <ul>
                    <li><strong>Routing:</strong> platform-of-aggregator.routes.ts</li>
                    <li><strong>EndPoints:</strong> end-points.ts</li>
                  </ul>
                </div>
              </div>
              <av-help-copy-container 
                title="Полный чек-лист с путями" 
                [content]="clientChecklistCode"
                bgColor="#1e1b4b"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 7. AI PROMPT -->
        <nz-tab nzTitle="🤖 AI Prompt">
          <div class="help-section">
             <nz-card nzTitle="Промпт для генерации нового справочника" class="ai-card">
              <p class="ai-intro">Скопируйте этот промпт в чат с ИИ-помощником для создания нового раздела по стандарту Aurora v3.5:</p>
              <av-help-copy-container 
                title="Master Prompt: New Aurora Module" 
                [content]="masterPrompt"
                bgColor="#0f172a"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [`
    .help-container { padding: 32px; max-width: 1400px; margin: 0 auto; }
    .help-tabs { margin-top: 24px; }
    
    .help-section { display: flex; flex-direction: column; gap: 32px; padding-top: 24px; }

    /* Features */
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 24px; }
    .feature-item { display: flex; gap: 16px; align-items: flex-start; padding: 20px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
    .f-icon { font-size: 24px; color: #3b82f6; margin-top: 4px; }
    .f-text strong { display: block; margin-bottom: 4px; color: #0f172a; }
    .f-text { font-size: 14px; color: #475569; line-height: 1.5; }

    /* Logic Grid */
    .logic-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .logic-card { padding: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 16px; }
    .logic-card h4 { margin-bottom: 16px; font-weight: 700; color: #1e293b; }
    .logic-card ul { padding-left: 20px; color: #64748b; }
    .logic-card li { margin-bottom: 8px; }

    /* Guide Steps */
    .steps-container { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
    .step { display: flex; gap: 20px; align-items: flex-start; }
    .step-number { 
      min-width: 32px; height: 32px; background: #3b82f6; color: white; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-weight: 700;
    }
    .step-content h5 { margin: 0 0 4px 0; font-weight: 700; color: #0f172a; }
    .step-content p { margin: 0; color: #64748b; font-size: 14px; }

    .info-alert {
      padding: 20px; border-radius: 12px; border-left: 8px solid; margin-top: 16px;
    }
    .info-alert.info { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }

    .ai-intro { color: #64748b; font-size: 14px; margin-bottom: 16px; border-left: 4px solid #3b82f6; padding-left: 12px; }

    /* Checklist */
    .checklist-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .checklist-item { padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
    .checklist-item ul { padding-left: 18px; margin-top: 12px; list-style-type: circle; color: #64748b; font-size: 13px; }
    .checklist-item li { margin-bottom: 6px; }

    @media (max-width: 768px) {
      .logic-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class PlatformHelpComponent {
  architectureCode = `// Standard SSOT Signal Service Structure
@Injectable({ providedIn: 'root' })
export class FeatureStateService {
  // 1. Single State (Signal)
  private readonly state = signal<FeatureState>(INITIAL_STATE);

  // 2. Computed Selectors
  readonly items = computed(() => this.state().items);
  readonly loading = computed(() => this.state().loading);

  // 3. Reducer Helper
  private updateState(partial: Partial<FeatureState>) {
    this.state.update(s => ({ ...s, ...partial }));
  }

  // 4. Reactive Actions
  load() {
    this.api.get().subscribe(data => this.updateState({ items: data }));
  }
}`;

  stateModelCode = `export interface PlatformOfAggregatorState {
  items: PlatformOfAggregatorItemDto[];
  total: number;
  loading: boolean;
  pageNumber: number;
  pageSize: number;
  searchTerm: string;
  languageId: number | null;
  showDeleted: boolean;

  // Form State
  modalVisible: boolean;
  modalMode: 'add' | 'edit';
  editingItem: PlatformOfAggregatorDetailDto | null;
  modalLoading: boolean;

  error: ErrorResponse | null;
  deletingId: number | null;

  // View State
  viewModalVisible: boolean;
  viewItem: PlatformOfAggregatorDetailDto | null;
}`;

  masterPrompt = `### TASK: CREATE AURORA v3.5 MODULE
Create a professional administrative module for [ENTITY_NAME] in Aurora Admin.

### FOLDER STRUCTURE:
src/app/[MODULE_PATH]/
├── components/
│   ├── entity-list/         (Table + Filters)
│   ├── entity-form/         (Shared Base Form)
│   ├── entity-modal/        (Modal wrapper)
│   └── entity-inline/       (Split-view wrapper)
├── services/
│   ├── entity-api.service.ts
│   └── entity-state.service.ts
├── models/
│   └── entity.model.ts
└── entity-manager.component.ts

### REQUIREMENTS:
1. USE SIGNALS: All state must be in entity-state.service.ts as a single signal<State>.
2. ONPUSH: Use ChangeDetectionStrategy.OnPush in every component.
3. STANDALONE: All components must be standalone.
4. CRUD FEATURES: Pagination, Search (debounced), Soft Delete (Trash mode), Detail viewing.
5. LOCALIZATION: Integrate LanguageService to handle multiple locales with SEO fallbacks (taking content from en-US if current is empty).
6. UI: Modern glassmorphism design, skeleton loading in tables, sticky status bar at the bottom.

Use PlatformOfAggregator module as a reference architecture.`;

  serverChecklistCode = `### 📋 Чек-лист реализации серверной части (Aurora v3.5)

---

#### 1. Уровень данных (DAL - Data Access Layer)
На этом уровне определяется структура таблиц в БД и базовые операции с ними.

*   **[ ] Сущность (Entity):**
    *   **Файл:** DAL\\Models\\Aggregator\\PlatformOfAggregator.cs
    *   **Роль:** Описание основной таблицы. Наследует FullAuditableEntityOfAggregator (Soft Delete, аудит).
*   **[ ] Локализация (Localization Entity):**
    *   **Файл:** DAL\\Models\\Aggregator\\Localizations\\PlatformOfAggregatorLocalization.cs
    *   **Роль:** Таблица для хранения переводов (имя, описание) и SEO-данных.
*   **[ ] Интерфейс репозитория:**
    *   **Файл:** DAL\\Repositories\\Interfaces\\IPlatformOfAggregatorRepository.cs
*   **[ ] Реализация репозитория:**
    *   **Файл:** DAL\\Repositories\\PlatformOfAggregatorRepository.cs
*   **[ ] Регистрация в Unit of Work:**
    *   **Файлы:** DAL\\Interfaces\\IUnitOfWork.cs и DAL\\Repositories\\UnitOfWork.cs

---

#### 2. Слой логики (Business Logic / Page Services)
Здесь сосредоточена вся бизнес-логика: проверка уникальности, обработка SEO, пагинация.

*   **[ ] Интерфейс сервиса:**
    *   **Файл:** Project_Server_Auth\\Pages\\AGGREGATOR\\PlatformOfAggregator\\Interfaces\\IPlatformOfAggregatorService.cs
*   **[ ] Реализация сервиса:**
    *   **Файл:** Project_Server_Auth\\Pages\\AGGREGATOR\\PlatformOfAggregator\\Services\\PlatformOfAggregatorService.cs
*   **[ ] Модели данных (DTO):**
    *   **Файл:** Project_Server_Auth\\Pages\\AGGREGATOR\\PlatformOfAggregator\\Dtos\\PlatformOfAggregatorDto.cs
*   **[ ] Валидаторы (FluentValidation):**
    *   **Файл:** Project_Server_Auth\\Pages\\AGGREGATOR\\PlatformOfAggregator\\Validators\\PlatformOfAggregatorValidators.cs
*   **[ ] Маппинг (AutoMapper):**
    *   **Файл:** Project_Server_Auth\\Pages\\AGGREGATOR\\PlatformOfAggregator\\Mappings\\PlatformOfAggregatorProfile.cs

---

#### 3. Слой API (Controllers)
Внешний интерфейс для общения с фронтендом.

*   **[ ] Контроллер:**
    *   **Файл:** Project_Server_Auth\\Controllers\\PlatformOfAggregatorController.cs
    *   **Роль:** Обработка HTTP-запросов. Роут: api/v1/aggregator/platforms.

---

#### 4. Инфраструктура и регистрация (DI)
Связывание всех частей воедино.

*   **[ ] Регистрация зависимостей (DI):**
    *   **Файл:** Project_Server_Auth\\Extensions\\ServiceCollectionExtensions.cs
    *   **Роль:** Регистрация сервиса и репозитория через services.AddScoped.`;

  clientChecklistCode = `### 📋 Чек-лист реализации клиентской части (Angular 17+ Signals)

---

#### 1. Структура модуля
Путь: src/app/AGREGATOR/PAGES/SPRAVKA/PlatformOfAggregatorPage

*   **[ ] Менеджер (Оркестратор):**
    *   **Файл:** platform-of-aggregator-manager.component.ts
    *   **Роль:** Главный хост, управляющий режимами Modal / Inline / Page и передающий сигналы состояния дочерним компонентам.
*   **[ ] Роутинг:**
    *   **Файл:** platform-of-aggregator.routes.ts
    *   **Роль:** Определение путей и ленивая загрузка компонентов.

---

#### 2. Модели и API
*   **[ ] Интерфейсы и State:**
    *   **Файл:** models/platform-of-aggregator.model.ts
*   **[ ] API Сервис:**
    *   **Файл:** services/platform-of-aggregator-api.service.ts
    *   **Роль:** Инкапсуляция HTTP-запросов к бэкенду.

---

#### 3. State Management (Angular Signals)
*   **[ ] Сервис состояния (SSOT):**
    *   **Файл:** services/platform-of-aggregator-state.service.ts
    *   **Роль:** Единый источник правды. Хранит данные в signal(), обрабатывает пагинацию, фильтры и CRUD-операции.

---

#### 4. Компоненты (Standalone + OnPush)
*   **[ ] Список (List):**
    *   **Файл:** components/platform-of-aggregator-list/platform-of-aggregator-list.component.ts
    *   **Роль:** Таблица, фильтры, пагинация. Только отображение данных из State.
*   **[ ] Форма (Form):**
    *   **Файл:** components/platform-of-aggregator-page-form/platform-of-aggregator-page-form.component.ts
    *   **Роль:** Общая логика редактирования (Reactive Forms + Localizations).
*   **[ ] Модальные окна:**
    *   **Файлы:** platform-of-aggregator-modal.component.ts, platform-of-aggregator-view-modal.component.ts
    *   **Роль:** Обертки для формы и просмотра в диалоговых окнах.

---

#### 5. Конфигурация
*   **[ ] Точки доступа (EndPoints):**
    *   **Файл:** end-points.ts
    *   **Роль:** Централизованное хранение URL для API.`;
}

