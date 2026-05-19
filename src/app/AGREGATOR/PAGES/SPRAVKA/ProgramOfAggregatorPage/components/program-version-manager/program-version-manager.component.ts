import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { filter, Observable, tap } from 'rxjs';

import { Component, inject, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AppLanguage } from '@language-app/models/appLanguage.model';
import { LanguageService } from '@language-app/services/language.service';
import { TechSpecContainerComponent } from '../../../../TechSpec/tech-spec-container.component';
import {
  VersionOfAggregatorCreate,
  VersionOfAggregatorDetail,
  VersionOfAggregatorItem,
  VersionOfAggregatorUpdate,
  VersionOfAggregatorLocalization,
} from '../../models/program-of-aggregator.model';
import { VersionStatus } from '../../models/version-status.enum';
import { ProgramOfAggregatorApiService } from '../../services/program-of-aggregator-api.service';

@Component({
  selector: 'app-program-version-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzSwitchModule,
    NzSelectModule,
    NzTabsModule,
    NzSpaceModule,
    NzTagModule,
    NzDividerModule,
    NzEmptyModule,
    NzPopconfirmModule,
    NzResultModule,
    TechSpecContainerComponent,
  ],
  template: `
    <div class="version-manager-container">
      <div class="header-actions">
        <h3>Управление версиями</h3>
        <button nz-button nzType="primary" (click)="openAddModal()">
          <i nz-icon nzType="plus"></i> Добавить версию
        </button>
      </div>

      <nz-table #basicTable [nzData]="versions" [nzLoading]="loading" [nzSize]="'middle'">
        <thead>
          <tr>
            <th>Версия</th>
            <th>Дата выхода</th>
            <th>Статус</th>
            <th>Последняя</th>
            <th>Ссылки</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          @for (data of basicTable.data; track data.id) {
            <tr>
              <td>
                <span class="version-number">{{ data.versionNumber }}</span>
              </td>
              <td>{{ data.releasedAt | date: 'dd.MM.yyyy' }}</td>
              <td>
                <nz-tag [nzColor]="getStatusColor(data.status)">
                  {{ data.status }}
                </nz-tag>
              </td>
              <td>
                @if (data.isLatest) {
                  <nz-tag nzColor="gold">LATEST</nz-tag>
                }
              </td>
              <td>
                <nz-tag nzColor="blue">{{ data.downloadLinksCount }} links</nz-tag>
              </td>
              <td>
                <nz-space>
                  <button
                    *nzSpaceItem
                    nz-button
                    nzType="default"
                    nzSize="small"
                    (click)="viewVersion(data.id)"
                  >
                    <i nz-icon nzType="eye"></i>
                  </button>
                  <button
                    *nzSpaceItem
                    nz-button
                    nzType="default"
                    nzSize="small"
                    (click)="editVersion(data.id)"
                  >
                    <i nz-icon nzType="edit"></i>
                  </button>
                  <button
                    *nzSpaceItem
                    nz-button
                    nzType="default"
                    nzSize="small"
                    nzDanger
                    nz-popconfirm
                    nzPopconfirmTitle="Вы уверены, что хотите удалить эту версию?"
                    (nzOnConfirm)="deleteVersion(data.id)"
                  >
                    <i nz-icon nzType="delete"></i>
                  </button>
                </nz-space>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>

      <!-- Модальное окно редактирования/добавления -->
      <nz-modal
        [(nzVisible)]="modalVisible"
        [nzTitle]="modalTitle"
        (nzOnCancel)="closeModal()"
        [nzFooter]="modalFooter"
        nzWidth="900px"
      >
        <ng-container *nzModalContent>
          <form nz-form [formGroup]="versionForm" nzLayout="vertical">
            <nz-tabset [nzAnimated]="false">
              <!-- ОСНОВНОЕ -->
              <nz-tab nzTitle="Основные сведения">
                <ng-template nz-tab>
                  <div class="modal-tab-content">
                    <div nz-row [nzGutter]="16">
                      <div nz-col nzSpan="12">
                        <nz-form-item>
                          <nz-form-label nzRequired>Номер версии</nz-form-label>
                          <nz-form-control nzErrorTip="Введите номер версии">
                            <input
                              nz-input
                              formControlName="versionNumber"
                              placeholder="Напр: 1.0.5"
                            />
                          </nz-form-control>
                        </nz-form-item>
                      </div>
                      <div nz-col nzSpan="12">
                        <nz-form-item>
                          <nz-form-label>Дата выхода</nz-form-label>
                          <nz-form-control>
                            <nz-date-picker
                              formControlName="releasedAt"
                              style="width: 100%"
                            ></nz-date-picker>
                          </nz-form-control>
                        </nz-form-item>
                      </div>
                      <div nz-col nzSpan="8">
                        <nz-form-item>
                          <nz-form-label>Статус</nz-form-label>
                          <nz-form-control>
                            <nz-select formControlName="status">
                              <nz-option [nzValue]="0" nzLabel="Stable"></nz-option>
                              <nz-option [nzValue]="1" nzLabel="Beta"></nz-option>
                              <nz-option [nzValue]="2" nzLabel="Alpha"></nz-option>
                              <nz-option [nzValue]="3" nzLabel="LTS"></nz-option>
                            </nz-select>
                          </nz-form-control>
                        </nz-form-item>
                      </div>
                      <div nz-col nzSpan="8">
                        <nz-form-item>
                          <nz-form-label>Последняя версия</nz-form-label>
                          <nz-form-control>
                            <nz-switch formControlName="isLatest"></nz-switch>
                          </nz-form-control>
                        </nz-form-item>
                      </div>
                      <div nz-col nzSpan="8">
                        <nz-form-item>
                          <nz-form-label>Порядок</nz-form-label>
                          <nz-form-control>
                            <input nz-input type="number" formControlName="sortOrder" />
                          </nz-form-control>
                        </nz-form-item>
                      </div>
                      <div nz-col nzSpan="24">
                        <nz-form-item>
                          <nz-form-label>URL Changelog (внешний)</nz-form-label>
                          <nz-form-control>
                            <input
                              nz-input
                              formControlName="externalChangelogUrl"
                              placeholder="https://..."
                            />
                          </nz-form-control>
                        </nz-form-item>
                      </div>
                    </div>
                  </div>
                </ng-template>
              </nz-tab>

              <!-- ЛОКАЛИЗАЦИЯ -->
              <nz-tab nzTitle="Локализация">
                <ng-template nz-tab>
                  <div class="modal-tab-content">
                    @if (languages && languages.length > 0) {
                      <nz-tabset
                        [nzSelectedIndex]="selectedLangIndex"
                        [nzAnimated]="false"
                        nzSize="large"
                        class="premium-tabs"
                      >
                        @for (lang of languages; track lang.id; let i = $index) {
                          <nz-tab [nzTitle]="tabTitleTpl" (nzClick)="onTabClick(lang.id)">
                            <ng-template #tabTitleTpl>
                              <span>
                                {{ lang.nativeTitle || lang.code }}
                              </span>
                            </ng-template>
                            <ng-template nz-tab>
                              @if (getLocGroup(lang.id); as locGroup) {
                                <div [formGroup]="locGroup">
                                  <nz-form-item>
                                    <nz-form-label>Список изменений ({{ lang.code }})</nz-form-label>
                                    <nz-form-control>
                                      <textarea
                                        nz-input
                                        formControlName="changelog"
                                        [nzAutosize]="{ minRows: 4, maxRows: 8 }"
                                      ></textarea>
                                    </nz-form-control>
                                  </nz-form-item>
                                  <nz-form-item>
                                    <nz-form-label>Описание версии</nz-form-label>
                                    <nz-form-control>
                                      <textarea
                                        nz-input
                                        formControlName="description"
                                        [nzAutosize]="{ minRows: 2, maxRows: 4 }"
                                      ></textarea>
                                    </nz-form-control>
                                  </nz-form-item>
                                </div>
                              }
                            </ng-template>
                          </nz-tab>
                        }
                      </nz-tabset>
                    } @else {
                      <nz-empty nzNotFoundContent="Нет доступных языков для локализации. Пожалуйста, инициализируйте языки в настройках."></nz-empty>
                    }
                  </div>
                </ng-template>
              </nz-tab>

              <!-- ТРЕБОВАНИЯ -->
              <nz-tab nzTitle="Технические характеристики" [nzDisabled]="!currentVersionId">
                <ng-template nz-tab>
                  <div class="modal-tab-content">
                    @if (currentVersionId) {
                      <app-tech-spec-container
                        [versionForm]="versionForm"
                        [mainPlatformId]="mainPlatformId"
                        [programId]="programId"
                        [versionId]="currentVersionId"
                        [initialData]="versionDetail"
                      >
                      </app-tech-spec-container>
                    } @else {
                      <nz-empty
                        nzNotFoundContent="Сохраните версию, чтобы настроить технические характеристики"
                      ></nz-empty>
                    }
                  </div>
                </ng-template>
              </nz-tab>

              <!-- ССЫЛКИ -->
              <nz-tab nzTitle="Ссылки на скачивание" [nzDisabled]="!currentVersionId">
                <ng-template nz-tab>
                  <div class="modal-tab-content">
                    <nz-result
                      nzStatus="info"
                      nzTitle="Менеджер ссылок"
                      nzSubTitle="Управление ссылками будет доступно в следующем обновлении (Шаг 4.1)"
                    >
                    </nz-result>
                  </div>
                </ng-template>
              </nz-tab>
            </nz-tabset>
          </form>
        </ng-container>
        <ng-template #modalFooter>
          @if (isViewOnly) {
            <button nz-button nzType="default" (click)="closeModal()">Закрыть</button>
          } @else {
            <button nz-button nzType="default" (click)="closeModal()">Отмена</button>
            <button nz-button nzType="primary" [nzLoading]="saving" (click)="saveVersion()">
              {{ currentVersionId ? 'Сохранить' : 'Создать и продолжить' }}
            </button>
          }
        </ng-template>
      </nz-modal>
    </div>
  `,
  styles: [
    `
      .version-manager-container {
        padding: 0;
      }
      .header-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }
      .header-actions h3 {
        margin: 0;
      }
      .version-number {
        font-weight: bold;
        font-family: monospace;
      }
      .modal-tab-content {
        padding-top: 16px;
        min-height: 350px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramVersionManagerComponent implements OnInit {
  @Input({ required: true }) programId!: number;
  @Input({ required: true }) mainPlatformId!: number;

  private api = inject(ProgramOfAggregatorApiService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);
  private langService = inject(LanguageService);
  private modalService = inject(NzModalService);

  versions: VersionOfAggregatorItem[] = [];
  loading = false;
  saving = false;

  modalVisible = false;
  modalTitle = 'Добавить версию';
  isViewOnly = false;
  versionForm: FormGroup;
  currentVersionId: number | null = null;
  versionDetail: VersionOfAggregatorDetail | null = null;
  languages: AppLanguage[] = [];
  selectedLangIndex = 0;

  private languages$ = toObservable(this.langService.availableLanguages);

  onTabClick(langId: number): void {
    const index = this.languages.findIndex((l) => l.id === langId);
    if (index !== -1) {
      this.selectedLangIndex = index;
      this.cdr.markForCheck();
    }
  }

  constructor() {
    this.versionForm = this.fb.group({
      id: [null],
      programOfAggregatorId: [null],
      versionNumber: ['', [Validators.required]],
      releasedAt: [null],
      isLatest: [false],
      sortOrder: [0],
      externalChangelogUrl: [''],
      status: [0],
      localizations: this.fb.array([]),
    });

    this.initLanguages();
  }

  ngOnInit(): void {
    this.loadVersions();
  }

  loadVersions(): void {
    this.loading = true;
    this.api.getVersions(this.programId).subscribe({
      next: (data) => {
        this.versions = data;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => (this.loading = false),
    });
  }

  private initLanguages(): void {
    this.languages$
      .pipe(
        filter((langs) => !!langs && langs.length > 0),
        takeUntilDestroyed(),
      )
      .subscribe((langs) => {
        const prevLanguages = this.languages;
        this.languages = langs;
        
        const locs = this.locsArray;
        if (locs.length === 0 || prevLanguages.length !== langs.length) {
          this.initLocTabs();
          
          if (this.versionDetail && this.versionDetail.localizations) {
            this.patchLocalizations(this.versionDetail.localizations);
          }
        }
        this.cdr.markForCheck();
      });
  }

  private initLocTabs(): void {
    const locs = this.versionForm.get('localizations') as FormArray;
    locs.clear();
    this.languages.forEach((lang) => {
      locs.push(
        this.fb.group({
          languageOfAggregatorId: [lang.id],
          changelog: [''],
          description: [''],
        }),
      );
    });
  }

  get locsArray(): FormArray {
    return this.versionForm.get('localizations') as FormArray;
  }

  getLocGroup(langId: number): FormGroup | null {
    return this.locsArray.controls.find(
      (c) => c.value.languageOfAggregatorId === langId,
    ) as FormGroup;
  }

  private patchLocalizations(localizations: VersionOfAggregatorLocalization[]): void {
    localizations.forEach((loc) => {
      const group = this.getLocGroup(loc.languageOfAggregatorId);
      if (group) {
        group.patchValue({
          changelog: loc.changelog,
          description: loc.description,
        });
      }
    });
  }

  openAddModal(): void {
    this.isViewOnly = false;
    this.versionForm.enable();
    this.selectedLangIndex = 0;

    // Удаляем динамически добавленные spec-контролы, оставшиеся от предыдущего Edit
    const specKeys = ['windowsSpec', 'macOsSpec', 'linuxSpec', 'androidSpec', 'iosSpec'];
    specKeys.forEach((key) => {
      if (this.versionForm.contains(key)) {
        this.versionForm.removeControl(key);
      }
    });

    this.currentVersionId = null;
    this.versionDetail = null;
    this.modalTitle = 'Добавить версию';
    this.versionForm.reset({
      programOfAggregatorId: this.programId,
      versionNumber: '',
      isLatest: false,
      sortOrder: 0,
      status: 0,
      releasedAt: new Date(),
    });
    
    this.initLocTabs();
    this.modalVisible = true;
  }

  editVersion(id: number): void {
    this.isViewOnly = false;
    this.versionForm.enable();
    this.loading = true;
    this.selectedLangIndex = 0;
    
    this.api.getVersionById(id).subscribe({
      next: (data) => {
        this.currentVersionId = data.id;
        this.versionDetail = data;
        this.modalTitle = `Редактировать версию ${data.versionNumber}`;
        this.versionForm.patchValue({
          id: data.id,
          programOfAggregatorId: data.programOfAggregatorId,
          versionNumber: data.versionNumber,
          releasedAt: data.releasedAt,
          isLatest: data.isLatest,
          sortOrder: data.sortOrder,
          externalChangelogUrl: data.externalChangelogUrl,
          status: data.status,
        });

        if (this.locsArray.length === 0) {
          this.initLocTabs();
        }

        this.patchLocalizations(data.localizations);

        this.loading = false;
        this.modalVisible = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  viewVersion(id: number): void {
    this.isViewOnly = true;
    this.loading = true;
    this.selectedLangIndex = 0;
    
    this.api.getVersionById(id).subscribe({
      next: (data) => {
        this.currentVersionId = data.id;
        this.versionDetail = data;
        this.modalTitle = `Просмотр версии ${data.versionNumber}`;
        this.versionForm.patchValue({
          id: data.id,
          programOfAggregatorId: data.programOfAggregatorId,
          versionNumber: data.versionNumber,
          releasedAt: data.releasedAt,
          isLatest: data.isLatest,
          sortOrder: data.sortOrder,
          externalChangelogUrl: data.externalChangelogUrl,
          status: data.status,
        });

        if (this.locsArray.length === 0) {
          this.initLocTabs();
        }

        this.patchLocalizations(data.localizations);

        // Disable all form fields
        this.versionForm.disable();

        this.loading = false;
        this.modalVisible = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  closeModal(): void {
    this.modalVisible = false;
    this.versionForm.enable(); // Clean up state
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  private getFormValidationErrors(): { label: string; message: string }[] {
    const errors: { label: string; message: string }[] = [];
    const labels: Record<string, string> = {
      versionNumber: 'Основные сведения: Номер версии',
    };

    Object.keys(this.versionForm.controls).forEach((key) => {
      const control = this.versionForm.get(key);
      if (control?.invalid) {
        let message = 'Обязательное поле';
        if (control.errors?.['required']) message = 'Обязательное поле';
        errors.push({ label: labels[key] || key, message });
      }
    });

    return errors;
  }

  saveVersion(): void {
    if (this.versionForm.invalid) {
      const errors = this.getFormValidationErrors();

      this.modalService.error({
        nzTitle: 'Ошибки в форме',
        nzContent: `
          <div style="margin-top: 8px; font-size: 1.05em;">Невозможно сохранить версию. Обнаружены ошибки в следующих полях:</div>
          <ul style="margin-top: 16px; padding-left: 20px; color: #cf1322; line-height: 1.6;">
            ${errors.map((err) => `<li><b>${err.label}</b>: <span style="font-size: 0.9em; opacity: 0.85;">${err.message}</span></li>`).join('')}
          </ul>
          <div style="margin-top: 16px; font-size: 0.85em; color: #8c8c8c;">Пожалуйста, проверьте вкладки формы и исправьте указанные замечания.</div>
        `,
        nzMaskClosable: true,
      });

      this.markFormGroupTouched(this.versionForm);
      this.cdr.markForCheck();
      return;
    }

    this.saving = true;
    const val = TechSpecContainerComponent.prepareForSave(this.versionForm.value);

    const request: Observable<number | void> = this.currentVersionId
      ? this.api.updateVersion(this.currentVersionId, val as VersionOfAggregatorUpdate)
      : this.api.createVersion(val as VersionOfAggregatorCreate);

    request.subscribe({
      next: (res: number | void) => {
        const msg = this.currentVersionId
          ? `Версия ${val.versionNumber} успешно обновлена`
          : `Новая версия ${val.versionNumber} создана (ID: ${res})`;

        this.message.success(msg);
        this.saving = false;
        this.loadVersions();
        this.closeModal();
        this.cdr.markForCheck();
      },
      error: () => (this.saving = false),
    });
  }

  deleteVersion(id: number): void {
    this.api.deleteVersion(id).subscribe({
      next: () => {
        this.message.success('Версия удалена');
        this.loadVersions();
      },
    });
  }

  getStatusColor(status: VersionStatus): string {
    switch (status) {
      case VersionStatus.Stable:
        return 'green';
      case VersionStatus.Beta:
        return 'orange';
      case VersionStatus.Alpha:
        return 'red';
      case VersionStatus.Lts:
        return 'purple';
      default:
        return 'default';
    }
  }
}
