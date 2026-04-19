import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-documentation-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Documentation Guide"
        subtitle="Стандарты создания справочных страниц и документации в проекте Aurora."
        icon="📚"
        componentPath="src/app/pages/help/documentation-help/documentation-help.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ФИЛОСОФИЯ И ПУТИ -->
        <nz-tab nzTitle="🌐 Концепция">
          <div class="demo-section">
            <nz-card nzTitle="Где живут справки?">
              <div class="logic-grid">
                <div class="logic-item">
                  <h4>📍 Пути (Paths)</h4>
                  <p>
                    Все справочные страницы располагаются в <code>src/app/pages/help/</code>. Каждая
                    страница — это отдельная директория с компонентом.
                  </p>
                </div>
                <div class="logic-item">
                  <h4>🧠 Логика</h4>
                  <p>
                    Мы используем <b>Standalone Components</b>. Для сложных UI-контролов
                    предпочтительна интерактивная справка с "песочницей", для текстовых мануалов —
                    <code>HelpDocumentationComponent</code>.
                  </p>
                </div>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Структура папки help"
              [content]="folderStructure"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- 2. ИНСТРУМЕНТАРИЙ -->
        <nz-tab nzTitle="🛠 Компоненты">
          <div class="integration-section">
            <nz-card nzTitle="ShowcaseComponent (av-showcase)" class="info-card">
              <p>
                Основной компонент для демонстрации UI-контролов. Содержит 3 зоны: Табы управления,
                Результат и Документацию.
              </p>
              <div class="path-item">
                <span class="p-label">Selector:</span>
                <code>av-showcase</code>
              </div>
              <div class="path-item">
                <span class="p-label">Template Slots:</span>
                <code
                  >[showcase-tabs], [showcase-result], [showcase-docs], [showcase-examples]</code
                >
              </div>
            </nz-card>

            <nz-card nzTitle="HelpCopyContainer (av-help-copy-container)" class="info-card">
              <p>Блок для отображения кода с кнопкой копирования.</p>
              <div class="path-item">
                <span class="p-label">Selector:</span>
                <code>av-help-copy-container</code>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Пример использования Showcase"
              [content]="showcaseExample"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- 3. РЕГИСТРАЦИЯ -->
        <nz-tab nzTitle="🔗 Подключение">
          <div class="logic-section">
            <nz-card nzTitle="1. Маршрутизация (help.routes.ts)">
              <p>Добавьте новый объект в массив <code>HELP_ROUTES</code>:</p>
              <code>{{ routeExample }}</code>
            </nz-card>

            <nz-card nzTitle="2. Боковое меню (sidebar-default.config.ts)">
              <p>
                Найдите группу <code>help-group</code> и добавьте элемент в <code>submenu</code>:
              </p>
              <code>{{ sidebarExample }}</code>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 4. AI PROMPT -->
        <nz-tab nzTitle="🤖 AI Prompt">
          <div class="ai-section">
            <nz-card nzTitle="Промпт для генерации новой справки" class="ai-card">
              <p class="ai-description">
                Скопируйте этот текст и отправьте агенту, чтобы он создал новую страницу по
                стандарту:
              </p>
              <av-help-copy-container
                title="AI Command"
                [content]="aiPrompt"
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
        max-width: 1200px;
        margin: 0 auto;
      }
      .help-header {
        display: none;
      }
      .header-icon {
        font-size: 56px;
      }
      h1 {
        font-size: 36px;
        font-weight: 900;
        margin: 0;
        color: #0369a1;
        letter-spacing: -0.025em;
      }
      .subtitle {
        color: #075985;
        font-size: 18px;
        margin: 8px 0 0 0;
        font-weight: 500;
      }

      .help-tabs {
        margin-top: 24px;
      }

      .demo-section,
      .integration-section,
      .logic-section,
      .ai-section {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-top: 24px;
      }

      .logic-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
      }
      .logic-item h4 {
        color: #0f172a;
        margin-bottom: 12px;
        font-size: 18px;
        font-weight: 700;
      }
      .logic-item p {
        color: #475569;
        font-size: 15px;
        line-height: 1.6;
        margin: 0;
      }

      .path-item {
        display: flex;
        gap: 12px;
        align-items: center;
        margin-bottom: 12px;
      }
      .p-label {
        min-width: 140px;
        font-weight: 700;
        color: #64748b;
        font-size: 13px;
        text-transform: uppercase;
      }

      .ai-description {
        font-size: 15px;
        color: #475569;
        margin-bottom: 16px;
        border-left: 4px solid #38bdf8;
        padding-left: 16px;
      }

      code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        color: #0f172a;
        font-family: 'Fira Code', monospace;
        font-size: 0.9em;
      }
    `,
  ],
})
export class DocumentationHelpComponent {
  folderStructure = `src/app/pages/help/
├── documentation-help/      <-- Ваша новая папка
│   ├── documentation-help.component.ts
│   └── (html/scss если не inline)
├── search-help/
├── modal-help/
└── help.routes.ts           <-- Здесь регистрация пути`;

  showcaseExample = `<av-showcase [config]="showcaseConfig">
  <div showcase-tabs>
    <!-- Контролы управления (сигналы/формы) -->
  </div>

  <div showcase-result>
    <!-- Живой компонент -->
  </div>

  <div showcase-docs>
    <!-- Таблица API или описание -->
  </div>
</av-showcase>`;

  routeExample = `{
  path: 'my-new-control',
  component: MyNewControlHelpComponent
}`;

  sidebarExample = `{
  id: 'sidebar-my-new-control',
  label: 'Мой компонент',
  route: '/help/my-new-control',
  icon: 'appstore'
}`;

  aiPrompt = `Создай новую страницу справки для компонента [НАЗВАНИЕ].
1. Создай папку src/app/pages/help/placeholder-help/
2. Используй стандарт Aurora: Standalone component, av-showcase, av-help-copy-container.
3. Добавь табы: Демонстрация (песочница с сигналами), API (таблица), Примеры кода.
4. Зарегистрируй компонент в src/app/pages/help/help.routes.ts.
5. Добавь пункт в src/app/shared/components/layout/left-sidebar/sidebar-default.config.ts в секцию HELP.
6. Используй премиальный дизайн: градиенты в хедере, тени, скругления 16px-20px.`;
}
