import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Ng-Zorro Modules
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzResultModule } from 'ng-zorro-antd/result';

// Core Services & Platform Components
import { PlatformOfAggregatorApiService } from '../SPRAVKA/PlatformOfAggregatorPage/services/platform-of-aggregator-api.service';
import { ProgramOfAggregatorApiService } from '../SPRAVKA/ProgramOfAggregatorPage/services/program-of-aggregator-api.service';
import {
  VersionOfAggregatorDetail,
  VersionOfAggregatorUpdate,
} from '../SPRAVKA/ProgramOfAggregatorPage/models/program-of-aggregator.model';
import { WindowsTechSpecFormComponent } from './windows-tech-spec-form.component';
import { MacOsTechSpecFormComponent } from './macos-tech-spec-form.component';
import { LinuxTechSpecFormComponent } from './linux-tech-spec-form.component';
import { AndroidTechSpecFormComponent } from './android-tech-spec-form.component';
import { IosTechSpecFormComponent } from './ios-tech-spec-form.component';

/** Допустимые ключи TechSpec в VersionOfAggregatorDetail/Update */
type VersionSpecKey = 'windowsSpec' | 'macOsSpec' | 'linuxSpec' | 'androidSpec' | 'iosSpec';

@Component({
  selector: 'app-tech-spec-container',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzSpinModule,
    NzButtonModule,
    NzIconModule,
    NzAlertModule,
    NzCardModule,
    NzResultModule,
    WindowsTechSpecFormComponent,
    MacOsTechSpecFormComponent,
    LinuxTechSpecFormComponent,
    AndroidTechSpecFormComponent,
    IosTechSpecFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tech-spec-container">
      @if (loading) {
        <div class="loading-wrapper">
          <nz-spin nzSimple nzSize="large" nzTip="Загрузка технических требований..."></nz-spin>
        </div>
      } @else if (platformCode) {
        <!-- Шапка контейнера требований -->
        <div class="spec-header-card">
          <div class="header-main">
            <div class="platform-info">
              <span class="platform-badge" [ngClass]="platformCode">
                <i nz-icon [nzType]="getPlatformIcon(platformCode)"></i>
              </span>
              <div>
                <h4 class="platform-title">Технические требования: {{ platformName }}</h4>
                <p class="platform-subtitle">Параметры будут сохранены в спецификацию версии</p>
              </div>
            </div>

            <!-- Кнопка клонирования из прошлой версии -->
            @if (versionId) {
              <button
                nz-button
                nzType="default"
                class="clone-btn"
                [nzLoading]="cloning"
                [disabled]="versionForm.disabled"
                (click)="cloneFromPrevious()"
              >
                <i nz-icon nzType="copy"></i>
                Скопировать требования из прошлой версии
              </button>
            }
          </div>
        </div>

        <!-- Динамическое переключение формы в зависимости от платформы -->
        <div class="spec-form-body">
          @if (activeFormGroup) {
            @switch (platformCode) {
              @case ('windows') {
                <app-windows-tech-spec-form
                  [formGroup]="activeFormGroup"
                  [platformId]="mainPlatformId"
                ></app-windows-tech-spec-form>
              }
              @case ('macos') {
                <app-macos-tech-spec-form
                  [formGroup]="activeFormGroup"
                  [platformId]="mainPlatformId"
                ></app-macos-tech-spec-form>
              }
              @case ('linux') {
                <app-linux-tech-spec-form
                  [formGroup]="activeFormGroup"
                ></app-linux-tech-spec-form>
              }
              @case ('android') {
                <app-android-tech-spec-form
                  [formGroup]="activeFormGroup"
                  [platformId]="mainPlatformId"
                ></app-android-tech-spec-form>
              }
              @case ('ios') {
                <app-ios-tech-spec-form
                  [formGroup]="activeFormGroup"
                  [platformId]="mainPlatformId"
                ></app-ios-tech-spec-form>
              }
              @default {
                <nz-result
                  nzStatus="warning"
                  nzTitle="Неподдерживаемая платформа"
                  [nzSubTitle]="'Форма технических требований для ' + platformName + ' временно недоступна.'"
                ></nz-result>
              }
            }
          }
        </div>
      } @else {
        <nz-alert
          nzType="info"
          nzMessage="Выберите платформу программы для настройки технических спецификаций"
          nzShowIcon
        ></nz-alert>
      }
    </div>
  `,
  styles: [
    `
      .tech-spec-container {
        padding: 0;
      }
      .loading-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 250px;
      }
      .spec-header-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px 20px;
        margin-bottom: 20px;
      }
      .header-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
      }
      .platform-info {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .platform-badge {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #fff;
      }
      .platform-badge.windows { background: #0078d4; }
      .platform-badge.macos { background: #000000; }
      .platform-badge.linux { background: #f0b400; color: #000; }
      .platform-badge.android { background: #3ddc84; }
      .platform-badge.ios { background: #000000; }

      .platform-title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #0f172a;
      }
      .platform-subtitle {
        margin: 2px 0 0 0;
        font-size: 13px;
        color: #64748b;
      }
      .clone-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        transition: all 0.2s;
      }
      .clone-btn:hover {
        border-color: #3b82f6;
        color: #3b82f6;
      }
      .spec-form-body {
        min-height: 200px;
      }
    `,
  ],
})
export class TechSpecContainerComponent implements OnInit, OnChanges {
  @Input({ required: true }) versionForm!: FormGroup;
  @Input({ required: true }) mainPlatformId!: number;
  @Input({ required: true }) programId!: number;
  @Input() versionId: number | null = null;
  @Input() initialData: VersionOfAggregatorDetail | null = null;

  private platApi = inject(PlatformOfAggregatorApiService);
  private progApi = inject(ProgramOfAggregatorApiService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);

  platformCode = '';
  platformName = '';
  loading = false;
  cloning = false;

  /**
   * Возвращает активный FormGroup спецификации
   */
  get activeFormGroup(): FormGroup | null {
    if (!this.platformCode) return null;
    const key = this.getSpecKey(this.platformCode);
    return this.versionForm.get(key) as FormGroup;
  }

  ngOnInit(): void {
    this.initPlatformSpec();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mainPlatformId'] || changes['versionForm']) {
      this.initPlatformSpec();
    }
    if (changes['initialData']) {
      this.applyInitialData();
    }
  }

  /**
   * Инициализирует и создает FormGroup под нужную платформу
   */
  private initPlatformSpec(): void {
    if (!this.mainPlatformId || !this.versionForm) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.platApi.getById(this.mainPlatformId).subscribe({
      next: (plat) => {
        this.platformCode = (plat.systemCode || '').toLowerCase();
        this.platformName = plat.name;

        const specKey = this.getSpecKey(this.platformCode);

        // Динамически инжектируем форму в родительскую группу
        if (!this.versionForm.contains(specKey)) {
          this.versionForm.addControl(specKey, this.createPlatformFormGroup(this.platformCode));
        }

        this.applyInitialData();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Применяет и десериализует полученные JSON-данные для UI
   */
  private applyInitialData(): void {
    if (!this.platformCode || !this.initialData) return;

    const specKey = this.getSpecKey(this.platformCode);
    const specData = this.initialData[specKey];
    if (!specData) return;

    // Клонируем и парсим JSON строки в массивы
    const preparedData: Record<string, unknown> = { ...specData };
    const jsonKeys = [
      'architecture',
      'supportedLanguages',
      'supportedDistributions',
      'desktopEnvironments',
      'dependencies',
      'permissionsRequired',
    ];

    jsonKeys.forEach((key) => {
      if (typeof preparedData[key] === 'string' && preparedData[key]) {
        try {
          preparedData[key] = JSON.parse(preparedData[key]);
        } catch {
          preparedData[key] = [];
        }
      }
    });

    const group = this.versionForm.get(specKey) as FormGroup;
    if (group) {
      group.patchValue(preparedData);
      this.cdr.markForCheck();
    }
  }

  /**
   * Метод клонирования из прошлой версии
   */
  cloneFromPrevious(): void {
    if (!this.versionId || !this.programId || !this.platformCode) return;

    this.cloning = true;
    this.cdr.markForCheck();

    this.progApi.getVersions(this.programId).subscribe({
      next: (versions) => {
        // Сортируем по ID по убыванию для поиска предыдущей версии по времени
        const sorted = [...versions].sort((a, b) => b.id - a.id);
        const currentIndex = sorted.findIndex((v) => v.id === this.versionId);

        if (currentIndex === -1) {
          this.message.warning('Текущая версия не найдена в списке для копирования');
          this.cloning = false;
          this.cdr.markForCheck();
          return;
        }

        const prevVersion = sorted[currentIndex + 1];
        if (!prevVersion) {
          this.message.warning('Предыдущая версия программы отсутствует');
          this.cloning = false;
          this.cdr.markForCheck();
          return;
        }

        // Загружаем полные спецификации предыдущей версии
        this.progApi.getVersionById(prevVersion.id).subscribe({
          next: (fullPrev) => {
            const specKey = this.getSpecKey(this.platformCode);
            const specToCopy = fullPrev[specKey];

            if (!specToCopy) {
              this.message.warning(
                `В предыдущей версии v${prevVersion.versionNumber} отсутствуют характеристики для ${this.platformName}`
              );
              this.cloning = false;
              this.cdr.markForCheck();
              return;
            }

            // Очищаем первичные ключи копируемой спецификации
            const cleanedSpec: Record<string, unknown> = { ...(specToCopy as unknown as Record<string, unknown>) };
            delete cleanedSpec['id'];
            delete cleanedSpec['versionId'];

            // Конвертируем обратно в массивы для UI
            const jsonKeys = [
              'architecture',
              'supportedLanguages',
              'supportedDistributions',
              'desktopEnvironments',
              'dependencies',
              'permissionsRequired',
            ];

            jsonKeys.forEach((key) => {
              if (typeof cleanedSpec[key] === 'string' && cleanedSpec[key]) {
                try {
                  cleanedSpec[key] = JSON.parse(cleanedSpec[key]);
                } catch {
                  cleanedSpec[key] = [];
                }
              }
            });

            // Накатываем в активную FormGroup
            if (this.activeFormGroup) {
              this.activeFormGroup.patchValue(cleanedSpec);
              this.message.success(
                `Технические требования успешно скопированы из версии v${prevVersion.versionNumber}`
              );
            }

            this.cloning = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.cloning = false;
            this.cdr.markForCheck();
          },
        });
      },
      error: () => {
        this.cloning = false;
        this.cdr.markForCheck();
      },
    });
  }

  private getSpecKey(code: string): VersionSpecKey {
    switch (code) {
      case 'windows': return 'windowsSpec';
      case 'macos': return 'macOsSpec';
      case 'linux': return 'linuxSpec';
      case 'android': return 'androidSpec';
      case 'ios': return 'iosSpec';
      default: return 'windowsSpec';
    }
  }

  private createPlatformFormGroup(code: string): FormGroup {
    switch (code) {
      case 'windows': return WindowsTechSpecFormComponent.createFormGroup(this.fb);
      case 'macos': return MacOsTechSpecFormComponent.createFormGroup(this.fb);
      case 'linux': return LinuxTechSpecFormComponent.createFormGroup(this.fb);
      case 'android': return AndroidTechSpecFormComponent.createFormGroup(this.fb);
      case 'ios': return IosTechSpecFormComponent.createFormGroup(this.fb);
      default: return WindowsTechSpecFormComponent.createFormGroup(this.fb);
    }
  }

  getPlatformIcon(code: string): string {
    switch (code) {
      case 'windows': return 'windows';
      case 'macos': return 'apple';
      case 'linux': return 'info-circle'; // fallback для Linux пиктограммы в Zorro
      case 'android': return 'android';
      case 'ios': return 'apple';
      default: return 'global';
    }
  }

  /**
   * Статический хелпер для подготовки payload версии к отправке на бэкенд
   * (сериализует массивы в JSON-строки в соответствии с C# DTO)
   */
  static prepareForSave(formValue: VersionOfAggregatorUpdate): VersionOfAggregatorUpdate {
    const output: VersionOfAggregatorUpdate = { ...formValue };
    const outputDyn = output as unknown as Record<string, unknown>;

    const specKeys: readonly (keyof VersionOfAggregatorUpdate)[] = [
      'windowsSpec', 'macOsSpec', 'linuxSpec', 'androidSpec', 'iosSpec',
    ];

    const arrayProps: readonly string[] = [
      'architecture',
      'supportedLanguages',
      'supportedDistributions',
      'desktopEnvironments',
      'dependencies',
      'permissionsRequired',
    ];

    specKeys.forEach((key) => {
      const specValue = output[key];
      if (specValue) {
        const spec = { ...(specValue as unknown as Record<string, unknown>) };

        arrayProps.forEach((prop) => {
          if (Array.isArray(spec[prop])) {
            spec[prop] = JSON.stringify(spec[prop]);
          }
        });

        outputDyn[key as string] = spec;
      }
    });

    return output;
  }
}
