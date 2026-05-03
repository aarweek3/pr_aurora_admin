import { CommonModule } from '@angular/common';
import { Component, inject, input, computed } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { IconLaboratoryService } from '@shared/services/icon-laboratory.service';
import { HelpPathActionsComponent } from '../help-path-actions/help-path-actions.component';

/**
 * AvHelpPathHeaderComponent
 * 
 * Унифицированный хедер для справочных страниц.
 * Отображает заголовок, подзаголовок и пути к файлам с кнопками действий.
 * Поддерживает несколько путей для каждой категории.
 */
@Component({
  selector: 'av-help-path-header',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    ClipboardModule,
    HelpPathActionsComponent
  ],
  template: `
    <div class="help-header-wrapper">
      <div class="help-header-main" *ngIf="!hideHeader()">
        <div class="header-icon" *ngIf="icon()">{{ icon() }}</div>
        <div class="header-text">
          <h1>{{ title() }}</h1>
          <p class="subtitle" *ngIf="subtitle()">{{ subtitle() }}</p>
        </div>
      </div>

      <div class="path-info-container">
        <!-- Файл компонента (Код) -->
        @if (normalizedComponentPaths().length > 0) {
          <div class="path-group">
            <span class="path-label">Код:</span>
            <div class="paths-list">
              @for (path of normalizedComponentPaths(); track path) {
                <div class="path-item">
                  <code class="path-value">{{ path }}</code>
                  <av-help-path-actions [path]="path"></av-help-path-actions>
                </div>
              }
            </div>
          </div>
        }

        <!-- DAL / Модели -->
        @if (normalizedDalPaths().length > 0) {
          <div class="path-group">
            <span class="path-label">DAL:</span>
            <div class="paths-list">
              @for (path of normalizedDalPaths(); track path) {
                <div class="path-item">
                  <code class="path-value dal">{{ path }}</code>
                  <av-help-path-actions [path]="path"></av-help-path-actions>
                </div>
              }
            </div>
          </div>
        }

        <!-- Файл документации (Content) -->
        @if (normalizedDocPaths().length > 0) {
          <div class="path-group">
            <span class="path-label">Справка:</span>
            <div class="paths-list">
              @for (path of normalizedDocPaths(); track path) {
                <div class="path-item">
                  <code class="path-value doc">{{ path }}</code>
                  <av-help-path-actions [path]="path"></av-help-path-actions>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .help-header-wrapper {
      margin-bottom: 32px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      padding: 24px 32px;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }

    .help-header-main {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }

    .header-icon {
      font-size: 48px;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }

    .header-text {
      h1 { font-size: 32px; font-weight: 800; margin: 0; color: #0f172a; letter-spacing: -0.025em; }
      .subtitle { color: #64748b; font-size: 16px; margin: 4px 0 0 0; font-weight: 500; }
    }

    .path-info-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px dashed #cbd5e1;
    }

    .path-group {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 10px;
      border: 1px solid rgba(226, 232, 240, 0.8);
    }

    .path-label {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      min-width: 65px;
      padding-top: 6px;
    }

    .paths-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .path-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 28px;
    }

    .path-value {
      font-family: 'Fira Code', 'SFMono-Regular', Consolas, monospace;
      font-size: 12px;
      color: #334155;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 2px 0;
      
      &.doc { color: #0891b2; }
      &.dal { color: #7c3aed; }
    }
  `]
})
export class HelpPathHeaderComponent {
  private iconLabService = inject(IconLaboratoryService);

  title = input.required<string>();
  subtitle = input<string>();
  icon = input<string>();
  
  componentPath = input<string | string[]>();
  dalPath = input<string | string[]>();
  docPath = input<string | string[]>();
  hideHeader = input<boolean>(false);

  normalizedComponentPaths = computed(() => {
    const val = this.componentPath();
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  });

  normalizedDalPaths = computed(() => {
    const val = this.dalPath();
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  });

  normalizedDocPaths = computed(() => {
    const val = this.docPath();
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  });
}
