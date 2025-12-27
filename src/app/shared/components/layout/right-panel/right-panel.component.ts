import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ContextService } from '../../../../core/services/context/context.service';
import { ErrorRegistryService } from '../../../../core/services/error-registry/error-registry.service';
import { EventBusService } from '../../../../core/services/event-bus/event-bus.service';

/**
 * Right Panel Component
 *
 * Гибридная правая панель с двумя зонами:
 * 1. Context Zone (динамическая) - контекстные данные из выбранной записи
 * 2. Menu Zone (статическая) - вкладки: Действия, Ошибки, История, Debug
 */
@Component({
  selector: 'app-right-panel',
  standalone: true,
  imports: [CommonModule, NzIconModule, NzTabsModule, NzEmptyModule],
  template: `
    <aside class="right-panel" [class.is-open]="isOpen()">
      <!-- Trigger для открытия/закрытия -->
      <div class="right-panel__trigger" (click)="togglePanel()">
        <span nz-icon [nzType]="isOpen() ? 'right' : 'left'"></span>
      </div>

      <div class="right-panel__content">
        <!-- Context Zone (динамическая зона) -->
        <div class="right-panel__context-zone">
          @if (hasContextData()) {
          <div class="context-properties">
            <h3 class="context-properties__title">{{ contextTitle() }}</h3>
            <div class="context-properties__content">
              <p>Детали записи: {{ contextTitle() }}</p>
            </div>
          </div>
          } @else {
          <nz-empty
            nzNotFoundContent="Выберите элемент для просмотра деталей"
            [nzNotFoundImage]="'simple'"
          >
          </nz-empty>
          }
        </div>

        <!-- Menu Zone (статические вкладки) -->
        <div class="right-panel__menu-zone">
          <nz-tabset nzSize="small">
            <nz-tab nzTitle="Действия">
              <div class="panel-tab-content">
                @if (availableActions().length > 0) {
                <div class="actions-list">
                  @for (action of availableActions(); track action.id) {
                  <button class="action-btn" (click)="executeAction(action.id)">
                    <span nz-icon [nzType]="action.icon"></span>
                    {{ action.label }}
                  </button>
                  }
                </div>
                } @else {
                <nz-empty
                  nzNotFoundContent="Нет доступных действий"
                  [nzNotFoundImage]="'simple'"
                ></nz-empty>
                }
              </div>
            </nz-tab>

            <nz-tab [nzTitle]="errorsTabTitle()">
              <div class="panel-tab-content">
                @if (errors().length > 0) {
                <div class="errors-list">
                  @for (error of errors(); track error.id) {
                  <div class="error-item" [class]="'error-item--' + error.level">
                    <div class="error-item__header">
                      <span class="error-item__level">{{ getLevelLabel(error.level) }}</span>
                      <span class="error-item__time">{{ formatTime(error.timestamp) }}</span>
                    </div>
                    <div class="error-item__message">{{ error.title }}</div>
                  </div>
                  }
                </div>
                } @else {
                <nz-empty nzNotFoundContent="Ошибок нет" [nzNotFoundImage]="'simple'"></nz-empty>
                }
              </div>
            </nz-tab>

            <nz-tab nzTitle="История">
              <div class="panel-tab-content">
                <nz-empty nzNotFoundContent="История пуста" [nzNotFoundImage]="'simple'"></nz-empty>
              </div>
            </nz-tab>

            @if (isDevMode()) {
            <nz-tab nzTitle="Debug">
              <div class="panel-tab-content">
                <pre class="debug-info">{{ getDebugInfo() }}</pre>
              </div>
            </nz-tab>
            }
          </nz-tabset>
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      .right-panel {
        position: relative;
        width: 32px;
        height: 100%;
        background: transparent;
        transition: width 0.3s;
      }

      .right-panel.is-open {
        width: 352px;
        background: #fff;
      }

      .right-panel__trigger {
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 64px;
        background: #1890ff;
        color: #fff;
        border: 1px solid #1890ff;
        border-radius: 8px 0 0 8px;
        cursor: pointer;
        transition: all 0.3s;
        z-index: 100;
        box-shadow: -2px 2px 8px rgba(0, 0, 0, 0.15);
      }

      .right-panel.is-open .right-panel__trigger {
        left: 0;
        border-radius: 0;
      }

      .right-panel__trigger:hover {
        background: #40a9ff;
        color: #fff;
        box-shadow: -2px 2px 12px rgba(0, 0, 0, 0.25);
      }

      .right-panel__content {
        display: flex;
        flex-direction: column;
        height: 100%;
        margin-left: 32px;
        background: #fff;
        border-left: 1px solid #f0f0f0;
        overflow: hidden;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
      }

      .right-panel.is-open .right-panel__content {
        opacity: 1;
        pointer-events: auto;
      }

      .right-panel__context-zone {
        flex: 0 0 auto;
        max-height: 40%;
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;
        overflow-y: auto;
      }

      .context-properties__title {
        margin: 0 0 16px;
        font-size: 16px;
        font-weight: 600;
        color: #262626;
      }

      .right-panel__menu-zone {
        flex: 1 1 auto;
        overflow: hidden;
      }

      .panel-tab-content {
        padding: 16px;
        height: 100%;
        overflow-y: auto;
      }

      .actions-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border: 1px solid #d9d9d9;
        background: #fff;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        color: #262626;
        transition: all 0.3s;
        text-align: left;
      }

      .action-btn:hover {
        border-color: #1890ff;
        color: #1890ff;
        background: #f0f8ff;
      }

      .errors-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .error-item {
        padding: 12px;
        border-radius: 6px;
        border-left: 4px solid;
      }

      .error-item--global {
        background: #fff2f0;
        border-left-color: #ff4d4f;
      }

      .error-item--contextual {
        background: #fff7e6;
        border-left-color: #fa8c16;
      }

      .error-item--local {
        background: #fffbe6;
        border-left-color: #faad14;
      }

      .error-item__header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        font-size: 12px;
      }

      .error-item__level {
        font-weight: 600;
        text-transform: uppercase;
      }

      .error-item__time {
        color: #8c8c8c;
      }

      .error-item__message {
        font-size: 14px;
        color: #262626;
      }

      .debug-info {
        font-size: 12px;
        background: #f5f5f5;
        padding: 12px;
        border-radius: 4px;
        overflow-x: auto;
      }
    `,
  ],
})
export class RightPanelComponent implements OnInit {
  private readonly eventBus = inject(EventBusService);
  private readonly contextService = inject(ContextService);
  private readonly errorRegistry = inject(ErrorRegistryService);

  isOpen = signal(false);
  hasContextData = signal(false);
  contextTitle = signal('');
  errors = signal<any[]>([]);

  availableActions = signal<Array<{ id: string; label: string; icon: string }>>([
    { id: 'edit', label: 'Редактировать', icon: 'edit' },
    { id: 'delete', label: 'Удалить', icon: 'delete' },
    { id: 'duplicate', label: 'Дублировать', icon: 'copy' },
  ]);

  ngOnInit(): void {
    this.eventBus.subscribe('openRightPanel', (event) => {
      this.isOpen.set(true);
      this.hasContextData.set(true);
      this.contextTitle.set(event.payload?.title || 'Детали');
    });

    this.errorRegistry.errors$.subscribe((errors) => {
      this.errors.set(errors);
    });
  }

  togglePanel(): void {
    this.isOpen.update((open) => !open);
  }

  executeAction(actionId: string): void {
    this.eventBus.publish({
      type: 'actionRequested',
      payload: { actionId },
    });
  }

  errorsTabTitle(): string {
    const count = this.errors().length;
    return count > 0 ? `Ошибки (${count})` : 'Ошибки';
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      global: 'Критическая',
      contextual: 'Предупреждение',
      local: 'Локальная',
    };
    return labels[level] || level;
  }

  formatTime(timestamp: Date): string {
    return new Date(timestamp).toLocaleTimeString('ru-RU');
  }

  isDevMode(): boolean {
    return true;
  }

  getDebugInfo(): string {
    const context = this.contextService.getContext();
    return JSON.stringify(context, null, 2);
  }
}
