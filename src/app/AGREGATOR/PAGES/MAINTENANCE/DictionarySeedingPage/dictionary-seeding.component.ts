import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { LanguageApiService } from '@assets/languageApp/services/language-api.service';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { CategoryOfAggregatorStateService } from '../../SPRAVKA/CategoryOfAggregatorPage/services/category-of-aggregator-state.service';
import { CategoryTagOfAggregatorStateService } from '../../SPRAVKA/CategoryTagOfAggregatorPage/services/category-tag-of-aggregator-state.service';
import { DeveloperOfAggregatorStateService } from '../../SPRAVKA/DeveloperOfAggregatorPage/services/developer-of-aggregator-state.service';
import { LanguageAggregatorApiService } from '../../SPRAVKA/LanguageOfAggregator/services/language-aggregator-api.service';
import { LanguageAggregatorService } from '../../SPRAVKA/LanguageOfAggregator/services/language-aggregator.service';
import { LicenseTypeOfAggregatorStateService } from '../../SPRAVKA/LicenseTypeOfAggregatorPage/services/license-type-of-aggregator-state.service';
import { PlatformOfAggregatorStateService } from '../../SPRAVKA/PlatformOfAggregatorPage/services/platform-of-aggregator-state.service';
import { SystemRequirementStateService } from '../../SPRAVKA/SystemRequirementPage/services/system-requirement-state.service';
import { TagOfAggregatorStateService } from '../../SPRAVKA/TagOfAggregatorPage/services/tag-of-aggregator-state.service';
// import { LanguageService } from '../../../../assets/languageApp/services/language.service';
// import { LanguageApiService } from '../../../../assets/languageApp/services/language-api.service';

interface DictionaryInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: () => number;
  isLoading: () => boolean;
  onSeed: () => void;
  onClear: () => void;
  color: string;
}

@Component({
  selector: 'app-dictionary-seeding',
  standalone: true,
  imports: [
    CommonModule,
    NzCardModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzBadgeModule,
    NzTypographyModule,
    NzDividerModule,
    NzSpaceModule,
    NzTableModule,
    NzProgressModule,
  ],
  template: `
    <div class="maintenance-container">
      <div class="header-section">
        <h1 nz-typography>Управление наполнением справочников</h1>
        <p nz-typography nzType="secondary">
          Инициализация и обслуживание базовых данных системы из JSON-файлов (Seeding).
        </p>
      </div>

      <div class="bulk-actions-card">
        <nz-card class="glass-card">
          <div class="bulk-header">
            <div class="bulk-info">
              <span class="label">Общий прогресс наполнения</span>
              <nz-progress
                [nzPercent]="overallProgress"
                [nzStatus]="overallProgress === 100 ? 'success' : 'active'"
              ></nz-progress>
            </div>
            <div class="bulk-buttons">
              <button
                nz-button
                nzType="primary"
                nzSize="large"
                (click)="seedAll()"
                [nzLoading]="isBulkLoading"
              >
                <i nz-icon nzType="rocket"></i>
                Заполнить ВСЕ (Seeding)
              </button>
              <button
                nz-button
                nzType="default"
                nzDanger
                (click)="confirmClearAll()"
                [disabled]="isBulkLoading"
              >
                <i nz-icon nzType="delete"></i>
                Очистить всё
              </button>
            </div>
          </div>
        </nz-card>
      </div>

      <div nz-row [nzGutter]="[24, 24]" class="dictionaries-grid">
        @for (dict of dictionaries; track dict.id) {
          <div nz-col [nzXs]="24" [nzSm]="24" [nzMd]="12" [nzLg]="8" [nzXl]="6">
            <nz-card class="dict-card glass-card" [nzHoverable]="true">
              <div class="card-content">
                <div class="icon-wrapper" [style.background-color]="dict.color + '15'">
                  <i nz-icon [nzType]="dict.icon" [style.color]="dict.color"></i>
                </div>

                <div class="info-wrapper">
                  <h3 nz-typography>{{ dict.name }}</h3>
                  <p class="description">{{ dict.description }}</p>
                </div>

                <div class="stats-row">
                  <span class="stat-label">Записей:</span>
                  <nz-badge
                    [nzCount]="dict.count()"
                    [nzStyle]="{ backgroundColor: dict.count() > 0 ? '#52c41a' : '#faad14' }"
                  ></nz-badge>
                </div>

                <nz-divider></nz-divider>

                <div class="card-actions">
                  <button
                    nz-button
                    nzType="primary"
                    nzBlock
                    (click)="dict.onSeed()"
                    [nzLoading]="dict.isLoading()"
                    [disabled]="dict.count() > 0"
                  >
                    <i nz-icon nzType="import"></i>
                    Импорт JSON
                  </button>
                  <button
                    nz-button
                    nzType="text"
                    nzDanger
                    nzBlock
                    (click)="dict.onClear()"
                    [nzLoading]="dict.isLoading()"
                    [disabled]="dict.count() === 0"
                  >
                    <i nz-icon nzType="delete"></i>
                    Очистить
                  </button>
                </div>
              </div>
            </nz-card>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .maintenance-container {
        padding: 24px;
        min-height: 100vh;
        background: linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%);
      }

      .header-section {
        margin-bottom: 32px;
        text-align: center;
      }

      .bulk-actions-card {
        margin-bottom: 32px;
      }

      .glass-card {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 16px;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
      }

      .bulk-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
      }

      .bulk-info {
        flex: 1;
        .label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #1f2937;
        }
      }

      .bulk-buttons {
        display: flex;
        gap: 12px;
      }

      .dict-card {
        height: 100%;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 48px 0 rgba(31, 38, 135, 0.12);
        }
      }

      .card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .icon-wrapper {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;

        i {
          font-size: 32px;
        }
      }

      .info-wrapper {
        margin-bottom: 16px;
        h3 {
          margin-bottom: 4px;
        }
        .description {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
        }
      }

      .stats-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-weight: 600;
      }

      .card-actions {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      ::ng-deep .ant-card-body {
        padding: 24px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionarySeedingComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  // Services
  private langState = inject(LanguageAggregatorService);
  private langApi = inject(LanguageAggregatorApiService);
  private catState = inject(CategoryOfAggregatorStateService);
  private devState = inject(DeveloperOfAggregatorStateService);
  private platState = inject(PlatformOfAggregatorStateService);
  private tagState = inject(TagOfAggregatorStateService);
  private tagCatState = inject(CategoryTagOfAggregatorStateService);
  private sysReqState = inject(SystemRequirementStateService);
  private licState = inject(LicenseTypeOfAggregatorStateService);

  // System Services
  private sysLangState = inject(LanguageService);
  private sysLangApi = inject(LanguageApiService);

  dictionaries: DictionaryInfo[] = [];
  isBulkLoading = false;
  overallProgress = 0;

  ngOnInit(): void {
    this.initDictionaries();
    this.loadAllCounts();
  }

  private initDictionaries(): void {
    this.dictionaries = [
      {
        id: 'system-languages',
        name: 'Системные языки',
        icon: 'setting',
        description: 'Основные языки приложения (LanguageApp). Нужны для работы всех модулей.',
        count: () => this.sysLangState.allLanguages().length,
        isLoading: () => this.sysLangState.isLoading(),
        onSeed: () =>
          this.sysLangApi.initialize().subscribe(() => {
            this.message.success('Системные языки инициализированы');
            this.sysLangState.refreshAdminList();
          }),
        onClear: () =>
          this.sysLangApi.hardReset().subscribe(() => {
            this.message.success('Системные языки сброшены');
            this.sysLangState.refreshAdminList();
          }),
        color: '#ff4d4f',
      },
      {
        id: 'languages',
        name: 'Языки Агрегатора',
        icon: 'global',
        description: 'Базовые языки агрегатора (en, ru и др.)',
        count: () => this.langState.allLanguages().length,
        isLoading: () => this.langState.isLoading(),
        onSeed: () =>
          this.langApi.initialize().subscribe(() => {
            this.message.success('Языки агрегатора инициализированы');
            this.langState.refreshList();
          }),
        onClear: () =>
          this.langApi.hardReset().subscribe(() => {
            this.message.success('Языки агрегатора сброшены');
            this.langState.refreshList();
          }),
        color: '#1890ff',
      },
      {
        id: 'platforms',
        name: 'Платформы (OS)',
        icon: 'windows',
        description: 'Операционные системы (Windows, Android и т.д.)',
        count: () => this.platState.total() || 0,
        isLoading: () => this.platState.loading(),
        onSeed: () => this.platState.seedFromJson(),
        onClear: () => this.platState.clearDatabase(),
        color: '#722ed1',
      },
      {
        id: 'categories',
        name: 'Категории',
        icon: 'folder',
        description: 'Дерево категорий программ',
        count: () => this.catState.total() || 0,
        isLoading: () => this.catState.loading(),
        onSeed: () => this.catState.seedFromJson(),
        onClear: () => this.catState.clearDatabase(),
        color: '#eb2f96',
      },
      {
        id: 'developers',
        name: 'Разработчики',
        icon: 'team',
        description: 'Компании-разработчики ПО',
        count: () => this.devState.total() || 0,
        isLoading: () => this.devState.loading(),
        onSeed: () => this.devState.seedFromJson(),
        onClear: () => this.devState.clearDatabase(),
        color: '#52c41a',
      },
      {
        id: 'license-types',
        name: 'Типы лицензий',
        icon: 'audit',
        description: 'Freeware, Shareware, Open Source и др.',
        count: () => this.licState.total() || 0,
        isLoading: () => this.licState.loading(),
        onSeed: () => this.licState.seedFromJson(),
        onClear: () => this.licState.clearDatabase(),
        color: '#fa8c16',
      },
      {
        id: 'tag-categories',
        name: 'Категории тегов',
        icon: 'folder-open',
        description: 'Группировка тегов по смыслу',
        count: () => this.tagCatState.total() || 0,
        isLoading: () => this.tagCatState.loading(),
        onSeed: () => this.tagCatState.seedFromJson(),
        onClear: () => this.tagCatState.clearDatabase(),
        color: '#13c2c2',
      },
      {
        id: 'tags',
        name: 'Теги',
        icon: 'tags',
        description: 'Облако тегов и ключевых слов',
        count: () => this.tagState.total() || 0,
        isLoading: () => this.tagState.loading(),
        onSeed: () => this.tagState.seedFromJson(),
        onClear: () => this.tagState.clearDatabase(),
        color: '#fa541c',
      },
      {
        id: 'os-versions',
        name: 'Версии ОС',
        icon: 'ordered-list',
        description: 'Конкретные билды и версии систем',
        count: () => this.sysReqState.osVersionsTotal() || 0,
        isLoading: () => this.sysReqState.osVersionsLoading(),
        onSeed: () => this.sysReqState.seedOsVersions(),
        onClear: () => this.sysReqState.clearOsVersions(),
        color: '#2f54eb',
      },
    ];
  }

  private loadAllCounts(): void {
    this.sysLangState.refreshAdminList();
    this.langState.refreshList();
    this.platState.loadItems();
    this.catState.loadItems();
    this.devState.loadItems();
    this.licState.loadItems();
    this.tagCatState.loadItems();
    this.tagState.loadItems();
    this.sysReqState.loadOsVersions();
  }

  seedAll(): void {
    this.modal.confirm({
      nzTitle: 'Запустить полное наполнение?',
      nzContent:
        'Система последовательно заполнит все справочники из JSON-файлов. Существующие данные не будут затронуты, но новые записи добавятся только если база пуста.',
      nzOkText: 'Да, заполнить всё',
      nzCancelText: 'Отмена',
      nzOnOk: async () => {
        this.isBulkLoading = true;
        this.overallProgress = 0;
        this.cdr.markForCheck();

        const totalSteps = this.dictionaries.length;
        for (let i = 0; i < this.dictionaries.length; i++) {
          const dict = this.dictionaries[i];
          if (dict.count() === 0) {
            await dict.onSeed();
          }
          this.overallProgress = Math.round(((i + 1) / totalSteps) * 100);
          this.cdr.markForCheck();
          // Небольшая задержка между шагами
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        this.isBulkLoading = false;
        this.message.success('Процесс массового наполнения завершен');
        this.loadAllCounts();
        this.cdr.markForCheck();
      },
    });
  }

  confirmClearAll(): void {
    this.modal.confirm({
      nzTitle: 'ОЧИСТИТЬ ВСЕ СПРАВОЧНИКИ?',
      nzContent:
        '<b style="color: red;">ВНИМАНИЕ: Все данные в справочниках будут безвозвратно удалены!</b> Это действие нельзя отменить.',
      nzOkText: 'УДАЛИТЬ ВСЁ',
      nzOkDanger: true,
      nzCancelText: 'Отмена',
      nzOnOk: async () => {
        this.isBulkLoading = true;
        this.cdr.markForCheck();

        for (const dict of this.dictionaries) {
          if (dict.count() > 0) {
            await dict.onClear();
          }
        }

        this.isBulkLoading = false;
        this.overallProgress = 0;
        this.message.success('Все справочники очищены');
        this.loadAllCounts();
        this.cdr.markForCheck();
      },
    });
  }
}
