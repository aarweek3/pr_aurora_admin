import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { AvRatingComponent } from '@shared/components/ui/rating/rating.component';
import { HelpCopyContainerComponent, HelpPathHeaderComponent } from '@shared/components/ui';

/**
 * RatingHelpComponent
 *
 * Продвинутая документация для компонента рейтинга.
 * Включает интерактивное демо, описание API и примеры кода.
 */
@Component({
  selector: 'app-rating-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzTabsModule,
    NzTableModule,
    NzSelectModule,
    NzInputNumberModule,
    NzSliderModule,
    AvRatingComponent,
    HelpCopyContainerComponent,
    HelpPathHeaderComponent,
  ],
  template: `
    <div class="help-container">
      <!-- HEADER -->
      <av-help-path-header
        title="Aurora Rating Star"
        subtitle="Продвинутый компонент рейтинга с поддержкой суб-пиксельного заполнения через CSS градиенты."
        icon="⭐"
        componentPath="src/app/shared/components/ui/rating/rating.component.ts"
      ></av-help-path-header>

      <nz-tabset nzType="card" class="help-tabs">
        <!-- 1. ДЕМОНСТРАЦИЯ -->
        <nz-tab nzTitle="🚀 Демонстрация">
          <div class="demo-section">
            <nz-card nzTitle="Песочница" class="demo-card">
              <div class="rating-demo-box">
                <av-rating
                  [value]="ratingValue()"
                  [size]="size()"
                  [color]="color()"
                  [showValue]="showValue()"
                ></av-rating>
              </div>

              <!-- CONTROLS -->
              <div class="demo-controls">
                <div class="controls-grid">
                  <div class="control-group">
                    <label>Значение (0-5):</label>
                    <div style="display: flex; gap: 12px; align-items: center;">
                      <nz-slider
                        style="flex: 1"
                        [nzMin]="0"
                        [nzMax]="5"
                        [nzStep]="0.1"
                        [ngModel]="ratingValue()"
                        (ngModelChange)="ratingValue.set($event)"
                      ></nz-slider>
                      <nz-input-number
                        [ngModel]="ratingValue()"
                        (ngModelChange)="ratingValue.set($event)"
                        [nzMin]="0"
                        [nzMax]="5"
                        [nzStep]="0.1"
                      ></nz-input-number>
                    </div>
                  </div>

                  <div class="control-group">
                    <label>Размер (px):</label>
                    <nz-input-number
                      [ngModel]="size()"
                      (ngModelChange)="size.set($event)"
                      [nzMin]="8"
                      [nzMax]="120"
                    ></nz-input-number>
                  </div>

                  <div class="control-group">
                    <label>Цвет закраски:</label>
                    <div class="color-presets">
                      <div
                        *ngFor="let c of colorPresets"
                        [style.background]="c"
                        class="color-circle"
                        [class.active]="color() === c"
                        (click)="color.set(c)"
                      ></div>
                    </div>
                  </div>

                  <div class="control-group">
                    <label>Показывать число:</label>
                    <nz-select [ngModel]="showValue()" (ngModelChange)="showValue.set($event)">
                      <nz-option [nzValue]="true" nzLabel="Да"></nz-option>
                      <nz-option [nzValue]="false" nzLabel="Нет"></nz-option>
                    </nz-select>
                  </div>
                </div>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Базовое использование"
              [content]="basicUsage"
            ></av-help-copy-container>
          </div>
        </nz-tab>

        <!-- 2. API -->
        <nz-tab nzTitle="📖 API & Свойства">
          <div class="api-section">
            <nz-card nzTitle="Inputs (Входящие параметры)">
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

            <nz-card nzTitle="Технические особенности">
              <div class="tech-note">
                <h4>Почему это круто?</h4>
                <p>
                  В отличие от стандартных библиотек, которые используют "половинчатые" звезды,
                  <code>av-rating</code> использует <strong>CSS Masking</strong> и
                  <strong>Linear Gradients</strong>. Это позволяет:
                </p>
                <ul>
                  <li>Отображать ЛЮБОЕ дробное значение (напр. 3.27) с точностью до пикселя.</li>
                  <li>Использовать всего 1 DOM-элемент на одну звезду (всего 5 на компонент).</li>
                  <li>Легко менять цвет через Input без перерисовки иконок.</li>
                </ul>
              </div>
            </nz-card>
          </div>
        </nz-tab>

        <!-- 3. КЕЙСЫ -->
        <nz-tab nzTitle="💡 Примеры">
          <div class="logic-section">
            <nz-card nzTitle="Разные размеры и цвета">
              <div style="display: flex; flex-direction: column; gap: 24px;">
                <div class="case-item">
                  <div class="case-label">Миниатюрный (в таблицах)</div>
                  <av-rating [value]="4.5" [size]="12"></av-rating>
                </div>
                <div class="case-item">
                  <div class="case-label">Стандартный (в карточках)</div>
                  <av-rating [value]="3.8" [size]="20" [showValue]="true"></av-rating>
                </div>
                <div class="case-item">
                  <div class="case-label">Акцентный (в деталях)</div>
                  <av-rating
                    [value]="4.2"
                    [size]="32"
                    color="#52c41a"
                    [showValue]="true"
                  ></av-rating>
                </div>
              </div>
            </nz-card>

            <av-help-copy-container
              title="Пример сложной настройки"
              [content]="advancedUsage"
            ></av-help-copy-container>
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
      .rating-demo-box {
        padding: 48px;
        background: #f8fafc;
        border-radius: 16px;
        margin-bottom: 24px;
        display: flex;
        justify-content: center;
        border: 1px dashed #e2e8f0;
      }

      .controls-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 24px;
        padding: 16px 0;
      }

      .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        label {
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      }

      .color-presets {
        display: flex;
        gap: 8px;
      }
      .color-circle {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s;
        &.active {
          transform: scale(1.2);
          outline: 2px solid #1890ff;
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

      .tech-note {
        background: #fffbe6;
        border: 1px solid #ffe58f;
        padding: 20px;
        border-radius: 12px;
        h4 {
          color: #856404;
          margin-bottom: 12px;
          font-weight: 700;
        }
        p,
        li {
          color: #856404;
          font-size: 14px;
        }
        ul {
          padding-left: 20px;
          margin-top: 8px;
        }
      }

      .case-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        background: #fafafa;
        border-radius: 8px;
        border: 1px solid #f0f0f0;
      }
      .case-label {
        font-weight: 600;
        color: #595959;
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
export class RatingHelpComponent {
  ratingValue = signal(3.8);
  size = signal(48);
  color = signal('#fadb14');
  showValue = signal(true);

  colorPresets = ['#fadb14', '#ff4d4f', '#52c41a', '#1890ff', '#722ed1', '#eb2f96'];

  inputs = [
    { name: 'value', type: 'number', default: '0', desc: 'Текущий рейтинг (от 0 до 5)' },
    { name: 'size', type: 'number', default: '18', desc: 'Размер звезды в пикселях' },
    { name: 'color', type: 'string', default: '#fadb14', desc: 'HEX цвет закрашенной части' },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'false',
      desc: 'Отображать ли число рядом со звездами',
    },
    {
      name: 'total',
      type: 'number',
      default: '5',
      desc: 'Количество звезд (в текущей версии зафиксировано 5)',
    },
  ];

  basicUsage = `<av-rating [value]="3.8" [showValue]="true"></av-rating>`;

  advancedUsage = `<av-rating 
  [value]="program.rating" 
  [size]="24" 
  color="#52c41a" 
  [showValue]="true">
</av-rating>`;
}
