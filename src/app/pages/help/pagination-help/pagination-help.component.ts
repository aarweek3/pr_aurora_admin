import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import {
  PaginationComponent,
  PaginationChangeEvent,
  PaginationVariant,
  PaginationSize,
  PaginationShape,
} from '@shared/components/ui/pagination';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';

@Component({
  selector: 'app-pagination-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzSelectModule,
    NzInputNumberModule,
    NzSwitchModule,
    PaginationComponent,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <!-- HEADER -->
      <av-help-path-header
        title="Aurora Pagination Hero"
        subtitle="Универсальный компонент навигации с поддержкой сигналов, кастомных стилей и серверной пагинации."
        icon="🔢"
        componentPath="src/app/pages/help/pagination-help/pagination-help.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ПЕСОЧНИЦА -->
        <nz-tab nzTitle="🚀 Демонстрация">
          <div class="demo-section">
            <nz-card nzTitle="Песочница компонента" class="demo-card">
              <div class="pagination-demo-box">
                <av-pagination
                  [total]="total()"
                  [(currentPage)]="current"
                  [(pageSize)]="size"
                  [variant]="variant()"
                  [size]="pageSizeVariant()"
                  [shape]="shape()"
                  [color]="color()"
                  [showQuickJumper]="showQuickJumper()"
                  [showSizeChanger]="showSizeChanger()"
                  (paginationChange)="handlePageChange($event)"
                ></av-pagination>
              </div>

              <!-- LOG -->
              <div class="action-log" *ngIf="lastEvent()">
                <div class="log-header">Последнее событие (paginationChange):</div>
                <pre>{{ lastEvent() | json }}</pre>
              </div>

              <!-- CONTROLS -->
              <div class="demo-controls">
                <hr />
                <div class="controls-grid">
                  <div class="control-group">
                    <label>Объектов всего:</label>
                    <nz-input-number
                      [ngModel]="total()"
                      (ngModelChange)="total.set($event)"
                      [nzMin]="0"
                      [nzStep]="10"
                    ></nz-input-number>
                  </div>

                  <div class="control-group">
                    <label>Вариант:</label>
                    <nz-select [ngModel]="variant()" (ngModelChange)="variant.set($event)">
                      <nz-option nzValue="default" nzLabel="Default"></nz-option>
                      <nz-option nzValue="simple" nzLabel="Simple"></nz-option>
                      <nz-option nzValue="compact" nzLabel="Compact"></nz-option>
                      <nz-option nzValue="minimal" nzLabel="Minimal"></nz-option>
                    </nz-select>
                  </div>

                  <div class="control-group">
                    <label>Форма кнопок:</label>
                    <nz-select [ngModel]="shape()" (ngModelChange)="shape.set($event)">
                      <nz-option nzValue="rounded" nzLabel="Rounded"></nz-option>
                      <nz-option nzValue="square" nzLabel="Square"></nz-option>
                      <nz-option nzValue="circle" nzLabel="Circle"></nz-option>
                    </nz-select>
                  </div>

                  <div class="control-group">
                    <label>Цвет:</label>
                    <nz-select [ngModel]="color()" (ngModelChange)="color.set($event)">
                      <nz-option nzValue="primary" nzLabel="Primary"></nz-option>
                      <nz-option nzValue="success" nzLabel="Success"></nz-option>
                      <nz-option nzValue="warning" nzLabel="Warning"></nz-option>
                      <nz-option nzValue="danger" nzLabel="Danger"></nz-option>
                    </nz-select>
                  </div>

                  <div class="control-group">
                    <label>Быстрый переход:</label>
                    <nz-switch
                      [ngModel]="showQuickJumper()"
                      (ngModelChange)="showQuickJumper.set($event)"
                    ></nz-switch>
                  </div>

                  <div class="control-group">
                    <label>Выбор размера:</label>
                    <nz-switch
                      [ngModel]="showSizeChanger()"
                      (ngModelChange)="showSizeChanger.set($event)"
                    ></nz-switch>
                  </div>
                </div>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Пример использования"
              [content]="basicUsage"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- 2. API -->
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

            <nz-card nzTitle="Outputs (События)">
              <nz-table #outputTable [nzData]="outputs" [nzFrontPagination]="false" nzSize="small">
                <thead>
                  <tr>
                    <th>Событие</th>
                    <th>Тип параметра</th>
                    <th>Описание</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let data of outputTable.data">
                    <td>
                      <code>{{ data.name }}</code>
                    </td>
                    <td>
                      <span class="type-tag">{{ data.type }}</span>
                    </td>
                    <td>{{ data.desc }}</td>
                  </tr>
                </tbody>
              </nz-table>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 3. КЕЙСЫ -->
        <nz-tab nzTitle="💡 Кейсы">
          <div class="logic-section">
            <nz-card nzTitle="Интеграция с nz-table">
              <p>
                При использовании <code>av-pagination</code> с таблицей Ng-Zorro, необходимо
                отключить встроенную пагинацию таблицы:
              </p>
              <av-help-copy-container
                title="Table Integration"
                [content]="tableIntegration"
              ></av-help-copy-container>
            </nz-card>

            <nz-card nzTitle="🤖 Prompt для быстрой интеграции">
              <p class="ai-description">
                Используйте этот промпт, чтобы ИИ быстро добавил пагинацию в ваш справочник:
              </p>
              <av-help-copy-container
                title="AI Prompt"
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
        color: #166534;
        letter-spacing: -0.025em;
      }
      .subtitle {
        color: #15803d;
        font-size: 18px;
        margin: 8px 0 0 0;
        font-weight: 500;
      }

      .help-tabs {
        margin-top: 24px;
      }

      .demo-section,
      .api-section,
      .logic-section {
        display: flex;
        flex-direction: column;
        gap: 32px;
        padding-top: 24px;
      }

      .demo-card {
        border-radius: 20px;
        border: none;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
      }
      .pagination-demo-box {
        padding: 32px;
        background: #f8fafc;
        border-radius: 16px;
        margin-bottom: 24px;
        display: flex;
        justify-content: center;
        border: 1px dashed #e2e8f0;
      }

      .action-log {
        background: #0f172a;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 24px;
        pre {
          color: #38bdf8;
          margin: 0;
          font-family: 'Fira Code', monospace;
          font-size: 13px;
        }
        .log-header {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
      }

      .controls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 24px;
        padding: 16px 0;
      }

      .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        label {
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }
        nz-select,
        nz-input-number {
          width: 100%;
        }
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

      .ai-description {
        font-size: 15px;
        color: #475569;
        margin-bottom: 16px;
        border-left: 4px solid #10b981;
        padding-left: 16px;
      }

      hr {
        border: 0;
        border-top: 1px solid #f1f5f9;
        margin: 24px 0;
      }

      code {
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        color: #0f172a;
        font-family: 'Fira Code', monospace;
      }
    `,
  ],
})
export class PaginationHelpComponent {
  // Signals for demo
  total = signal(150);
  current = signal(1);
  size = signal(10);
  variant = signal<PaginationVariant>('default');
  pageSizeVariant = signal<PaginationSize>('medium');
  shape = signal<PaginationShape>('rounded');
  color = signal<'primary' | 'success' | 'warning' | 'danger'>('primary');
  showQuickJumper = signal(true);
  showSizeChanger = signal(true);

  lastEvent = signal<PaginationChangeEvent | null>(null);

  handlePageChange(event: PaginationChangeEvent) {
    this.lastEvent.set(event);
  }

  inputs = [
    { name: 'total', type: 'input<number>', default: '0', desc: 'Общее количество записей' },
    {
      name: 'currentPage',
      type: 'model<number>',
      default: '1',
      desc: 'Текущая страница (двустороннее связывание)',
    },
    {
      name: 'pageSize',
      type: 'model<number>',
      default: '10',
      desc: 'Размер страницы (двустороннее связывание)',
    },
    {
      name: 'variant',
      type: 'PaginationVariant',
      default: 'default',
      desc: 'Стиль: default | simple | compact | minimal',
    },
    {
      name: 'size',
      type: 'PaginationSize',
      default: 'medium',
      desc: 'Размер: small | medium | large',
    },
    {
      name: 'shape',
      type: 'PaginationShape',
      default: 'rounded',
      desc: 'Форма кнопок: square | rounded | circle',
    },
    {
      name: 'color',
      type: 'string',
      default: 'primary',
      desc: 'Цвет: primary | success | warning | danger',
    },
    {
      name: 'showQuickJumper',
      type: 'boolean',
      default: 'false',
      desc: 'Показывать поле быстрого перехода',
    },
    {
      name: 'showSizeChanger',
      type: 'boolean',
      default: 'true',
      desc: 'Показывать выбор размера страницы',
    },
  ];

  outputs = [
    {
      name: 'paginationChange',
      type: 'PaginationChangeEvent',
      desc: 'Срабатывает при любом изменении (страница или размер)',
    },
    { name: 'pageChange', type: 'number', desc: 'Срабатывает только при смене страницы' },
    {
      name: 'pageSizeChange',
      type: 'number',
      desc: 'Срабатывает только при смене размера страницы',
    },
  ];

  basicUsage = `<av-pagination
  [total]="100"
  [(currentPage)]="page"
  [(pageSize)]="size"
  [showQuickJumper]="true"
  (paginationChange)="onParamsChange($event)">
</av-pagination>`;

  tableIntegration = `<!-- 1. Отключаем пагинацию в таблице -->
<nz-table 
  [nzData]="items" 
  [nzShowPagination]="false">
  ...
</nz-table>

<!-- 2. Добавляем наш компонент вниз -->
<div class="pagination-footer">
  <av-pagination 
    [total]="total" 
    [(currentPage)]="page" 
    [(pageSize)]="size"
    (paginationChange)="loadData()">
  </av-pagination>
</div>`;

  aiPrompt = `Внедрите универсальную пагинацию av-pagination из @shared/components/ui/pagination в мой справочник.
1. Импортируйте PaginationComponent и добавьте в imports.
2. Отключите стандартную пагинацию в nz-table через [nzShowPagination]="false".
3. Добавьте <av-pagination> под таблицей.
4. Свяжите [total], [(currentPage)] и [(pageSize)] с переменными в контроллере.
5. Настройте вызов метода загрузки данных через (paginationChange).`;
}
