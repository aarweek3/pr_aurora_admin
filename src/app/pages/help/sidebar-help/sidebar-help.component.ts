import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { 
  HelpCopyContainerComponent,
  HelpPathHeaderComponent
} from '@shared/components/ui';

@Component({
  selector: 'app-sidebar-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Sidebar Management"
        subtitle="Полное руководство по настройке и управлению боковым меню Aurora Admin."
        icon="🗂️"
        componentPath="src/app/pages/help/sidebar-help/sidebar-help.component.ts"
        docPath="src/app/shared/components/layout/left-sidebar/sidebar-default.config.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. СТАНДАРТНАЯ ИНСТРУКЦИЯ (Перенос существующего контента) -->
        <nz-tab nzTitle="📜 Руководство">
          <div class="demo-section">
            <nz-card>
              <div class="existing-html-content">
                <h2>Структура конфигурации</h2>
                <p>Меню строится динамически на основе массива групп (<code>menuGroups</code>). Каждая группа содержит заголовок и набор вложенных элементов.</p>
                
                <div class="info-alert">
                  <strong>Важно:</strong> Порядок пунктов в меню соответствует их порядку в массиве <code>items</code>.
                </div>

                <h3>Основные типы пунктов:</h3>
                <ul>
                  <li><strong>Link</strong>: Обычная ссылка на роут.</li>
                  <li><strong>Submenu</strong>: Раскрывающийся список подпунктов.</li>
                </ul>

                <div class="logic-grid">
                  <div class="logic-item">
                    <h4>1. Как добавить новую группу</h4>
                    <p>Группы разделяют блоки меню (например, «Администрирование», «Инструменты»).</p>
                  </div>
                  <div class="logic-item">
                    <h4>2. Как добавить ссылку</h4>
                    <p>Пункт типа <code>link</code> выполняет навигацию по приложению.</p>
                  </div>
                </div>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Пример конфигурации группы"
              [content]="groupExample"
            ></av-help-copy-container>

            <av-help-copy-container
              title="Пример пункта меню (Link)"
              [content]="linkExample"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- 2. ПУТИ И ИНТЕГРАЦИЯ -->
        <nz-tab nzTitle="🛠 Интеграция">
          <div class="integration-section">
            <nz-card nzTitle="Ключевые файлы системы" class="info-card">
              <div class="path-list">
                <div class="path-item">
                  <span class="p-label">Конфигурация:</span>
                  <code>src/app/shared/components/layout/left-sidebar/sidebar-default.config.ts</code>
                </div>
                <div class="path-item">
                  <span class="p-label">Модель данных:</span>
                  <code>src/app/shared/components/layout/left-sidebar/sidebar.model.ts</code>
                </div>
                <div class="path-item">
                  <span class="p-label">Компонент:</span>
                  <code>src/app/shared/components/layout/left-sidebar/left-sidebar.component.ts</code>
                </div>
              </div>
            </nz-card>

            <nz-card nzTitle="Поддерживаемые баджи (Badges)">
              <p>Вы можете добавлять визуальные индикаторы к пунктам меню:</p>
              <code>{{ badgeExample }}</code>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 3. АРХИТЕКТУРА -->
        <nz-tab nzTitle="🧠 Архитектура">
          <div class="logic-section">
            <nz-card nzTitle="Как это работает внутри">
              <div class="logic-grid">
                <div class="logic-item">
                  <h4>🔄 Реактивный конфиг</h4>
                  <p>Конфигурация передается в <code>AdminLayoutComponent</code>, который прокидывает её в <code>LeftSidebarComponent</code> через Input-сигналы.</p>
                </div>
                <div class="logic-item">
                  <h4>🏗️ Динамическая генерация</h4>
                  <p>Шаблон сайдбара использует рекурсию или вложенные циклы для отображения неограниченного уровня вложенности (технически до 3-х уровней для удобства UX).</p>
                </div>
                <div class="logic-item">
                  <h4>🎨 Стилизация</h4>
                  <p>Цвета папок и иконок могут настраиваться через свойство <code>intent</code> (primary, success, warning, danger, orange).</p>
                </div>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 4. AI PROMPT -->
        <nz-tab nzTitle="🤖 AI Prompt">
          <div class="ai-section">
            <nz-card nzTitle="Команда для ИИ на добавление раздела" class="ai-card">
              <p class="ai-description">Используйте этот промпт, чтобы агент правильно интегрировал новые страницы в меню:</p>
              <av-help-copy-container 
                title="AI Command: Add Sidebar Item" 
                [content]="aiPrompt"
                bgColor="#0f172a"
              ></av-help-copy-container>
            </nz-card>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [`
    .help-container { padding: 32px; max-width: 1200px; margin: 0 auto; }
    .help-header { display: none; }
    .header-icon { font-size: 56px; }
    h1 { font-size: 36px; font-weight: 900; margin: 0; color: #9d174d; letter-spacing: -0.025em; }
    .subtitle { color: #be185d; font-size: 18px; margin: 8px 0 0 0; font-weight: 500; }

    .help-tabs { margin-top: 24px; }
    
    .demo-section, .integration-section, .logic-section, .ai-section { 
      display: flex; 
      flex-direction: column; 
      gap: 24px; 
      padding-top: 24px;
    }

    .existing-html-content h2 { color: #0f172a; font-size: 22px; margin-bottom: 16px; font-weight: 700; }
    .existing-html-content h3 { color: #334155; font-size: 18px; margin: 20px 0 12px 0; font-weight: 600; }
    .existing-html-content p { color: #475569; line-height: 1.6; }
    .existing-html-content ul { padding-left: 20px; color: #475569; }
    .existing-html-content li { margin-bottom: 8px; }

    .info-alert {
      background: #fff9db;
      padding: 16px;
      border-left: 5px solid #fcc419;
      margin: 20px 0;
      border-radius: 4px;
      color: #856404;
    }

    .logic-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
      gap: 24px; 
      margin-top: 20px;
    }
    .logic-item h4 { color: #0f172a; margin-bottom: 12px; font-size: 18px; font-weight: 700; }
    .logic-item p { color: #475569; font-size: 15px; line-height: 1.6; margin: 0; }

    .path-list { display: flex; flex-direction: column; gap: 12px; }
    .path-item { display: flex; gap: 12px; align-items: center; }
    .p-label { min-width: 140px; font-weight: 700; color: #64748b; font-size: 13px; text-transform: uppercase; }

    .ai-description { font-size: 15px; color: #475569; margin-bottom: 16px; border-left: 4px solid #ec4899; padding-left: 16px; }
    
    code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      color: #0f172a;
      font-family: 'Fira Code', monospace;
      font-size: 0.9em;
    }
  `]
})
export class SidebarHelpComponent {
  groupExample = `{
  id: 'administration',
  title: 'Администрирование',
  items: [
    // Список объектов элементов
  ]
}`;

  linkExample = `{
  id: 'admin-users',
  icon: 'team',
  label: 'Пользователи',
  route: '/admin/users',
  badge: {
     value: 'Pro',
     intent: 'info'
  }
}`;

  badgeExample = `badge: {                
  value: 'New',         // Текст баджа
  intent: 'success'     // Цвет: danger | warning | success | info
}`;

  aiPrompt = `Интегрируй новую страницу в боковое меню.
1. Найди конфигурацию в src/app/shared/components/layout/left-sidebar/sidebar-default.config.ts.
2. В группе [НАЗВАНИЕ_ГРУППЫ] (или создай новую) добавь объект:
   {
     id: '[UNIQUE_ID]',
     label: '[НАЗВАНИЕ_ПУНКТА]',
     route: '[URL_ПУТЬ]',
     icon: '[ANT_DESIGN_ICON_NAME]'
   }
3. Убедись, что id уникален.
4. Если страница новая или важная, добавь badge { value: 'New', intent: 'success' }.`;
}
