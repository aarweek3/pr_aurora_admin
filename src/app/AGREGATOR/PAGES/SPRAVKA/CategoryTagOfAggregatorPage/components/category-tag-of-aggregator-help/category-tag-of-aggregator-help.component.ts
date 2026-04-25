import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-category-tag-of-aggregator-help',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzTagModule,
    NzIconModule,
    NzAlertModule,
    NzTableModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="help-content" style="padding: 24px; font-family: 'Inter', sans-serif;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <span style="font-size: 32px;">🏷️</span>
        <div>
          <h2 style="margin: 0; color: #0f172a; font-weight: 800;">Категории Тегов Агрегатора</h2>
          <p style="margin: 0; color: #64748b;">Техническая спецификация и правила управления группами тегов.</p>
        </div>
      </div>

      <nz-tabset nzType="card">
        <!-- ОБЗОР -->
        <nz-tab nzTitle="🌟 Обзор">
          <div style="padding-top: 16px; display: flex; flex-direction: column; gap: 16px;">
            <nz-card nzTitle="Назначение категории">
              <p>
                <strong>CategoryTagOfAggregator</strong> — это высокоуровневая сущность для логической группировки тегов. 
                Она определяет контекст тега (например, "Лицензии" или "ОС") и может влиять на визуальное отображение тегов на витрине.
              </p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                   <h4 style="color: #0f172a; margin-bottom: 8px;">🔹 Группировка</h4>
                   <p style="font-size: 13px; color: #475569; margin: 0;">Позволяет фильтровать теги в админке и на сайте по их принадлежности к типу данных.</p>
                </div>
                <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                   <h4 style="color: #0f172a; margin-bottom: 8px;">🎨 Визуальный стиль</h4>
                   <p style="font-size: 13px; color: #475569; margin: 0;">Категория может задавать дефолтный цвет или иконку для всех дочерних тегов.</p>
                </div>
              </div>
            </nz-card>

            <nz-alert
              nzType="info"
              nzMessage="Связь 1:N (One-to-Many)"
              nzDescription="Один тег может принадлежать только одной категории. Категория может содержать неограниченное количество тегов."
              nzShowIcon
            ></nz-alert>
          </div>
        </nz-tab>

        <!-- МОДЕЛЬ ДАННЫХ -->
        <nz-tab nzTitle="💾 Структура">
          <div style="padding-top: 16px;">
            <nz-table #fieldsTable [nzData]="fields" [nzFrontPagination]="false" nzSize="small">
              <thead>
                <tr>
                  <th>Поле</th>
                  <th>Тип</th>
                  <th>Описание</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let f of fieldsTable.data">
                  <td><code>{{ f.name }}</code></td>
                  <td><nz-tag>{{ f.type }}</nz-tag></td>
                  <td>{{ f.desc }}</td>
                </tr>
              </tbody>
            </nz-table>
          </div>
        </nz-tab>

        <!-- UI & СТАНДАРТЫ -->
        <nz-tab nzTitle="🎨 Стандарты UI">
          <div style="padding-top: 16px;">
            <nz-card nzTitle="Slug (Технический идентификатор)">
              <p>Для всех категорий обязательно использование <strong>Slug</strong> в формате lowercase-kebab-case.</p>
              <div style="background: #1e293b; padding: 16px; border-radius: 8px; color: #e2e8f0; font-family: monospace;">
                .av-tag-slug &#123; <br/>
                &nbsp;&nbsp;font-family: 'JetBrains Mono', monospace;<br/>
                &nbsp;&nbsp;background: #f1f5f9;<br/>
                &nbsp;&nbsp;color: #475569;<br/>
                &#125;
              </div>
              <p style="margin-top: 12px; font-size: 12px; color: #64748b;">
                Это обеспечивает консистентность с другими справочниками (Разработчики, Лицензии).
              </p>
            </nz-card>
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [`
    :host { display: block; background: white; }
    .help-content { max-width: 900px; margin: 0 auto; }
  `]
})
export class CategoryTagOfAggregatorHelpComponent {
  fields = [
    { name: 'Id', type: 'int', desc: 'Уникальный идентификатор' },
    { name: 'Slug', type: 'string', desc: 'Уникальный URL-код (например, operating-systems)' },
    { name: 'IconPath', type: 'string', desc: 'Путь к иконке в хранилище' },
    { name: 'Color', type: 'string', desc: 'Hex-код цвета или "inherit"' },
    { name: 'IsActive', type: 'bool', desc: 'Флаг активности категории' },
    { name: 'SortOrder', type: 'int', desc: 'Порядок сортировки в списках' }
  ];
}
