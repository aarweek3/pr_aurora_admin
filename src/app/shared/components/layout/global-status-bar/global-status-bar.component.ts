import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ContextService } from '../../../../core/services/context/context.service';
import { ErrorRegistryService } from '../../../../core/services/error-registry/error-registry.service';
import { EventBusService } from '../../../../core/services/event-bus/event-bus.service';
import { HealthIndicatorComponent } from '../../../health/components/health-indicator/health-indicator.component';
import { HealthPanelDetailsComponent } from '../../../health/components/health-panel-details/health-panel-details.component';

/**
 * Status Indicator Interface
 */
export interface StatusIndicator {
  id: string;
  label: string;
  status: 'healthy' | 'warning' | 'error' | 'loading';
  message: string;
  icon: string;
}

/**
 * Global Status Bar Component
 *
 * Глобальная панель статуса системы.
 * Отображает:
 * - Состояние системы
 * - Статус backend
 * - Состояние данных
 * - Статус валидации
 * - Операции в процессе
 *
 * Согласно архитектуре (SOW ЧАСТЬ 4.5):
 * - Отвечает за системные состояния
 * - НЕ отвечает за ошибки форм и действия
 * - Получает данные из Context и ErrorRegistry
 */
@Component({
  selector: 'app-global-status-bar',
  standalone: true,
  imports: [
    CommonModule,
    NzIconModule,
    NzToolTipModule,
    NzPopoverModule,
    HealthIndicatorComponent,
    HealthPanelDetailsComponent,
  ],
  template: `
    <div class="global-status-bar">
      <div class="global-status-bar__indicators">
        @for (indicator of indicators(); track indicator.id) {
        <div
          class="status-indicator"
          [class]="'status-indicator--' + indicator.status"
          nz-tooltip
          [nzTooltipTitle]="indicator.message"
          nzTooltipPlacement="top"
        >
          <span nz-icon [nzType]="indicator.icon" [nzSpin]="indicator.status === 'loading'"></span>
          <span class="status-indicator__label">{{ indicator.label }}</span>
        </div>
        }
      </div>

      <!-- Дополнительная информация -->
      <div class="global-status-bar__info">
        @if (hasActiveLocks()) {
        <div class="status-info-item status-info-item--warning">
          <span nz-icon nzType="lock"></span>
          <span>Заблокировано: {{ activeLocks() }}</span>
        </div>
        } @if (backgroundTasks() > 0) {
        <div class="status-info-item">
          <span nz-icon nzType="loading" nzSpin></span>
          <span>Задач в фоне: {{ backgroundTasks() }}</span>
        </div>
        }

        <!-- Мониторинг здоровья -->
        <div
          class="health-wrapper"
          nz-popover
          nzPopoverTrigger="click"
          [nzPopoverContent]="healthDetails"
          nzPopoverPlacement="topRight"
          nzPopoverOverlayClassName="health-popover"
        >
          <app-health-indicator></app-health-indicator>
        </div>

        <ng-template #healthDetails>
          <app-health-panel-details></app-health-panel-details>
        </ng-template>

        <button
          class="console-trigger"
          (click)="openConsole()"
          nz-tooltip
          nzTooltipTitle="Открыть консоль отладки"
        >
          <span nz-icon nzType="code"></span>
          <span>Console</span>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .global-status-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 32px;
        padding: 0 24px;
        background: #fafafa;
        border-top: 1px solid #f0f0f0;
        font-size: 12px;
      }

      .global-status-bar__indicators {
        display: flex;
        gap: 24px;
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: default;
        transition: all 0.3s;
      }

      .status-indicator--healthy {
        color: #52c41a;
      }

      .status-indicator--warning {
        color: #faad14;
      }

      .status-indicator--error {
        color: #ff4d4f;
      }

      .status-indicator--loading {
        color: #1890ff;
      }

      .status-indicator__label {
        font-weight: 500;
      }

      .global-status-bar__info {
        display: flex;
        gap: 16px;
        color: #8c8c8c;
      }

      .status-info-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .status-info-item--warning {
        color: #faad14;
      }

      .console-trigger {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 12px;
        height: 24px;
        background: #f0f2f5;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        color: #595959;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
        transition: all 0.2s;
        margin-left: 8px;

        &:hover {
          background: #1890ff;
          color: #fff;
          border-color: #1890ff;
        }

        &:active {
          transform: translateY(1px);
        }

        span[nz-icon] {
          font-size: 14px;
        }
      }
    `,
  ],
})
export class GlobalStatusBarComponent implements OnInit {
  private readonly contextService = inject(ContextService);
  private readonly errorRegistry = inject(ErrorRegistryService);
  private readonly eventBus = inject(EventBusService);

  indicators = signal<StatusIndicator[]>([]);
  activeLocks = signal(0);
  backgroundTasks = signal(0);

  ngOnInit(): void {
    // Начальная инициализация индикаторов
    const initialContext = this.contextService.getContext();
    this.updateIndicators(initialContext);
    this.activeLocks.set(initialContext.operationalState.locks.length);
    this.backgroundTasks.set(initialContext.operationalState.backgroundTasks.length);

    // Подписка на изменения контекста
    this.contextService.context$.subscribe((context) => {
      this.updateIndicators(context);
      this.activeLocks.set(context.operationalState.locks.length);
      this.backgroundTasks.set(context.operationalState.backgroundTasks.length);
    });

    // Подписка на ошибки
    this.errorRegistry.summary$.subscribe((summary) => {
      this.updateErrorIndicator(summary);
    });
  }

  private updateIndicators(context: any): void {
    const indicators: StatusIndicator[] = [
      {
        id: 'system',
        label: 'Система',
        status: context.operationalState.healthy ? 'healthy' : 'error',
        message: context.operationalState.healthy ? 'Все системы работают' : 'Проблемы с системой',
        icon: context.operationalState.healthy ? 'check-circle' : 'close-circle',
      },
      {
        id: 'backend',
        label: 'Backend',
        status: context.operationalState.backendAvailable ? 'healthy' : 'error',
        message: context.operationalState.backendAvailable
          ? 'Связь установлена'
          : 'Нет связи с сервером',
        icon: context.operationalState.backendAvailable ? 'cloud' : 'disconnect',
      },
      {
        id: 'data',
        label: 'Данные',
        status: this.getDataStatus(context),
        message: this.getDataMessage(context),
        icon: context.dataState.loading ? 'loading' : context.dataState.dirty ? 'edit' : 'database',
      },
      {
        id: 'validation',
        label: 'Валидация',
        status: context.dataState.valid ? 'healthy' : 'warning',
        message: context.dataState.valid ? 'Все поля валидны' : 'Есть ошибки валидации',
        icon: context.dataState.valid ? 'check' : 'warning',
      },
    ];

    this.indicators.set(indicators);
  }

  private updateErrorIndicator(summary: any): void {
    if (summary.totalCount > 0) {
      const currentIndicators = this.indicators();
      const operationsIndicator: StatusIndicator = {
        id: 'operations',
        label: 'Операции',
        status: 'error',
        message: `Ошибок: ${summary.totalCount}`,
        icon: 'exclamation-circle',
      };

      // Обновляем или добавляем индикатор операций
      const filtered = currentIndicators.filter((i) => i.id !== 'operations');
      this.indicators.set([...filtered, operationsIndicator]);
    }
  }

  private getDataStatus(context: any): 'healthy' | 'warning' | 'loading' {
    if (context.dataState.loading) return 'loading';
    if (context.dataState.dirty) return 'warning';
    return 'healthy';
  }

  private getDataMessage(context: any): string {
    if (context.dataState.loading) return 'Загрузка данных...';
    if (context.dataState.dirty) return 'Есть несохраненные изменения';
    return 'Данные актуальны';
  }

  hasActiveLocks(): boolean {
    return this.activeLocks() > 0;
  }

  openConsole(): void {
    this.eventBus.publish({
      type: 'openConsole',
      payload: null,
    });
  }
}
