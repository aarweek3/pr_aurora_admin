import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  HelpCopyContainerComponent,
  HelpPathActionsComponent,
  HelpPathHeaderComponent,
  ShowcaseComponent,
  ShowcaseConfig,
} from '@shared/components/ui';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-path-actions-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    HelpPathHeaderComponent,
    HelpPathActionsComponent,
    HelpCopyContainerComponent,
    ShowcaseComponent,
  ],
  template: `
    <div class="help-container">
      <av-help-path-header
        title="Блок кнопок (Copy, Open)"
        subtitle="Универсальные действия для работы с путями файлов: копирование в буфер и открытие в IDE."
        icon="🖱️"
        componentPath="src/app/shared/components/ui/help-path-actions/help-path-actions.component.ts"
      ></av-help-path-header>

      <av-showcase [config]="showcaseConfig">
        <div showcase-tabs>
          <nz-card nzTitle="Параметры демонстрации">
            <p>Этот компонент не требует сложных настроек, кроме передачи пути к файлу.</p>
            <div class="path-input-preview">
              <strong>Текущий путь:</strong>
              <code>{{ demoPath() }}</code>
            </div>
          </nz-card>
        </div>

        <div showcase-result>
          <div class="demo-result-box">
            <div class="demo-item">
              <span>Стандартный вид внутри строки:</span>
              <div class="path-row-preview">
                <code>{{ demoPath() }}</code>
                <av-help-path-actions [path]="demoPath()"></av-help-path-actions>
              </div>
            </div>
          </div>
        </div>

        <div showcase-docs>
          <nz-tabset nzType="card" class="help-tabs">
            <nz-tab nzTitle="📖 Использование">
              <div class="doc-section">
                <h3>Базовый пример</h3>
                <p>
                  Компонент <code>av-help-path-actions</code> принимает обязательный входной
                  параметр <code>path</code>.
                </p>

                <av-help-copy-container
                  title="HTML Template"
                  [content]="basicUsage"
                ></av-help-copy-container>

                <av-help-copy-container
                  title="TypeScript Import"
                  [content]="importUsage"
                ></av-help-copy-container>
              </div>
            </nz-tab>

            <nz-tab nzTitle="⚙️ Свойства (API)">
              <div class="doc-section">
                <h3>Inputs</h3>
                <ul>
                  <li>
                    <code>path (string, required)</code> — Полный путь к файлу, который будет
                    использоваться для копирования и открытия в редакторе.
                  </li>
                </ul>
              </div>
            </nz-tab>

            <nz-tab nzTitle="🧠 Сервисы">
              <div class="logic-section">
                <h3>Зависимости</h3>
                <p>Компонент использует следующие системные сервисы:</p>
                <ul>
                  <li>
                    <strong>IconDataService</strong> — для отправки команды
                    <code>OPEN_FILE</code> на бэкенд.
                  </li>
                  <li>
                    <strong>ClipboardModule (&#64;angular/cdk)</strong> — для взаимодействия с
                    буфером обмена.
                  </li>
                  <li>
                    <strong>NzMessageService</strong> — для отображения уведомлений об успехе или
                    ошибке.
                  </li>
                </ul>
              </div>
            </nz-tab>
          </nz-tabset>
        </div>
      </av-showcase>
    </div>
  `,
  styles: [
    `
      .help-container {
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .demo-result-box {
        padding: 40px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px dashed #cbd5e1;
      }

      .demo-item {
        display: flex;
        flex-direction: column;
        gap: 12px;

        span {
          font-weight: 600;
          color: #64748b;
          font-size: 14px;
        }
      }

      .path-row-preview {
        display: flex;
        align-items: center;
        gap: 12px;
        background: white;
        padding: 8px 16px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

        code {
          color: #2563eb;
          font-weight: 500;
        }
      }

      .path-input-preview {
        margin-top: 12px;
        code {
          display: block;
          margin-top: 4px;
          background: #f1f5f9;
          padding: 4px 8px;
          border-radius: 4px;
        }
      }

      .doc-section,
      .logic-section {
        padding-top: 20px;
        h3 {
          margin-bottom: 12px;
          color: #0f172a;
        }
        p {
          color: #475569;
          margin-bottom: 16px;
          line-height: 1.6;
        }
        ul {
          padding-left: 20px;
          li {
            margin-bottom: 8px;
            color: #475569;
          }
        }
      }

      code {
        font-family: 'Fira Code', monospace;
        font-size: 0.9em;
      }
    `,
  ],
})
export class PathActionsHelpComponent {
  showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Блок кнопок (Copy, Open)',
      description: 'Универсальные действия для работы с путями файлов.',
      componentName: 'HelpPathActionsComponent',
      componentPath:
        'src/app/shared/components/ui/help-path-actions/help-path-actions.component.ts',
    },
    resultTitle: 'Демонстрация',
    showExamples: true,
    showDocs: true,
  };

  demoPath = signal('src/app/pages/help/path-actions-help/path-actions-help.component.ts');

  basicUsage = `<av-help-path-actions [path]="myFilePath"></av-help-path-actions>`;

  importUsage = `import { HelpPathActionsComponent } from '@shared/components/ui';

@Component({
  standalone: true,
  imports: [HelpPathActionsComponent],
  // ...
})`;
}
