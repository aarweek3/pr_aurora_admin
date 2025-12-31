import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Subject, takeUntil } from 'rxjs';
import { UserSettingsService } from '../../services';
import { AccessibilityTabComponent } from '../accessibility-tab/accessibility-tab.component';
import { AppearanceTabComponent } from '../appearance-tab/appearance-tab.component';
import { LocalizationTabComponent } from '../localization-tab/localization-tab.component';
import { NavigationTabComponent } from '../navigation-tab/navigation-tab.component';
import { NotificationsTabComponent } from '../notifications-tab/notifications-tab.component';
import { SecurityTabComponent } from '../security-tab/security-tab.component';
import { TablesTabComponent } from '../tables-tab/tables-tab.component';

/**
 * Главный компонент страницы настроек пользователя
 *
 * Содержит вкладки для различных категорий настроек:
 * - Внешний вид
 * - Навигация
 * - Таблицы
 * - Локализация
 * - Доступность
 * - Уведомления
 * - Безопасность
 */
@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzTabsModule,
    NzButtonModule,
    NzSpinModule,
    NzAlertModule,
    AppearanceTabComponent,
    NavigationTabComponent,
    TablesTabComponent,
    LocalizationTabComponent,
    AccessibilityTabComponent,
    NotificationsTabComponent,
    SecurityTabComponent,
  ],
  template: `
    <div class="settings-container">
      <nz-card class="settings-card">
        <!-- Заголовок -->
        <div class="settings-header">
          <div class="header-content">
            <h1>
              <i nz-icon nzType="setting" nzTheme="outline"></i>
              Настройки профиля
            </h1>
            <p class="subtitle">Настройте интерфейс и поведение приложения под себя</p>
          </div>

          <div class="header-actions">
            <button
              nz-button
              nzType="default"
              nzDanger
              (click)="confirmReset()"
              [nzLoading]="settingsService.saving()"
              [disabled]="settingsService.loading()"
            >
              <i nz-icon nzType="undo" nzTheme="outline"></i>
              Сбросить всё
            </button>
          </div>
        </div>

        <!-- Индикатор загрузки -->
        <nz-spin [nzSpinning]="settingsService.loading()" nzTip="Загрузка настроек...">
          <!-- Ошибка -->
          <nz-alert
            *ngIf="settingsService.error()"
            nzType="error"
            [nzMessage]="settingsService.error()"
            nzShowIcon
            nzCloseable
            (nzOnClose)="settingsService.clearError()"
            class="error-alert"
          ></nz-alert>

          <!-- Индикатор несохранённых изменений -->
          <nz-alert
            *ngIf="settingsService.hasUnsavedChanges()"
            nzType="warning"
            nzMessage="У вас есть несохранённые изменения"
            nzDescription="Изменения применяются автоматически при изменении настроек"
            nzShowIcon
            class="unsaved-alert"
          ></nz-alert>

          <!-- Вкладки с настройками -->
          <nz-tabset nzType="card" [(nzSelectedIndex)]="selectedTabIndex" class="settings-tabs">
            <!-- Вкладка: Внешний вид -->
            <nz-tab nzTitle="Внешний вид">
              <ng-template nz-tab>
                <app-appearance-tab></app-appearance-tab>
              </ng-template>
            </nz-tab>

            <!-- Вкладка: Навигация -->
            <nz-tab nzTitle="Навигация">
              <ng-template nz-tab>
                <app-navigation-tab></app-navigation-tab>
              </ng-template>
            </nz-tab>

            <!-- Вкладка: Таблицы -->
            <nz-tab nzTitle="Таблицы">
              <ng-template nz-tab>
                <app-tables-tab></app-tables-tab>
              </ng-template>
            </nz-tab>

            <!-- Вкладка: Локализация -->
            <nz-tab nzTitle="Локализация">
              <ng-template nz-tab>
                <app-localization-tab></app-localization-tab>
              </ng-template>
            </nz-tab>

            <!-- Вкладка: Доступность -->
            <nz-tab nzTitle="Доступность">
              <ng-template nz-tab>
                <app-accessibility-tab></app-accessibility-tab>
              </ng-template>
            </nz-tab>

            <!-- Вкладка: Уведомления -->
            <nz-tab nzTitle="Уведомления">
              <ng-template nz-tab>
                <app-notifications-tab></app-notifications-tab>
              </ng-template>
            </nz-tab>

            <!-- Вкладка: Безопасность -->
            <nz-tab nzTitle="Безопасность">
              <ng-template nz-tab>
                <app-security-tab></app-security-tab>
              </ng-template>
            </nz-tab>
          </nz-tabset>
        </nz-spin>
      </nz-card>
    </div>
  `,
  styles: [
    `
      .settings-container {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .settings-card {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .settings-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
      }

      .header-content h1 {
        margin: 0 0 8px;
        font-size: 28px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-content h1 i {
        font-size: 28px;
        color: #1890ff;
      }

      .subtitle {
        margin: 0;
        color: #666;
        font-size: 14px;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }

      .error-alert,
      .unsaved-alert {
        margin-bottom: 16px;
      }

      .settings-tabs {
        margin-top: 16px;
      }

      :host ::ng-deep .settings-tabs .ant-tabs-nav {
        margin-bottom: 24px;
      }

      :host ::ng-deep .settings-tabs .ant-tabs-tab {
        padding: 12px 24px;
        font-size: 15px;
      }

      :host ::ng-deep .settings-tabs .ant-tabs-content {
        padding: 24px 0;
      }

      @media (max-width: 768px) {
        .settings-container {
          padding: 16px;
        }

        .settings-header {
          flex-direction: column;
          gap: 16px;
        }

        .header-actions {
          width: 100%;
        }

        .header-actions button {
          width: 100%;
        }
      }
    `,
  ],
})
export class SettingsPageComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);

  readonly settingsService = inject(UserSettingsService);

  selectedTabIndex = 0;

  ngOnInit(): void {
    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Загрузить настройки пользователя
   */
  private loadSettings(): void {
    this.settingsService
      .loadSettings()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Настройки загружены');
        },
        error: (error) => {
          this.message.error('Ошибка загрузки настроек');
          console.error('Settings load error:', error);
        },
      });
  }

  /**
   * Подтверждение сброса настроек
   */
  confirmReset(): void {
    this.modal.confirm({
      nzTitle: 'Сбросить все настройки?',
      nzContent:
        'Все ваши настройки будут сброшены к значениям по умолчанию. Это действие нельзя отменить.',
      nzOkText: 'Сбросить',
      nzOkDanger: true,
      nzCancelText: 'Отмена',
      nzOnOk: () => this.resetSettings(),
    });
  }

  /**
   * Сбросить настройки к дефолтным
   */
  private resetSettings(): void {
    this.settingsService
      .resetToDefaults()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.message.success('Настройки сброшены к значениям по умолчанию');
        },
        error: (error) => {
          this.message.error('Ошибка сброса настроек');
          console.error('Settings reset error:', error);
        },
      });
  }
}
