import {
  Component,
  OnInit,
  inject,
  input,
  output,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AvUniversalUploadModalComponent } from '@shared/components/av-universal-upload-modal/av-universal-upload-modal.component';

import { DeveloperOfAggregatorApiService } from '../../services/developer-of-aggregator-api.service';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { LanguageService } from '@language-app/services/language.service';
import { SeoFormComponent } from '@shared/components/ui/seo-form/seo-form.component';
import { AppLanguage } from '@language-app/models/appLanguage.model';

@Component({
  selector: 'app-developer-of-aggregator-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzTabsModule,
    NzSwitchModule,
    NzSpinModule,
    NzGridModule,
    NzDividerModule,
    NzCollapseModule,
    NzButtonModule,
    NzIconModule,
    SeoFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-spin [nzSpinning]="loading">
      <form
        nz-form
        [formGroup]="form"
        nzLayout="vertical"
        *ngIf="form && languages.length > 0; else noLangs"
      >
        <div nz-row [nzGutter]="[16, 16]">
          <!-- Основные настройки -->
          <div nz-col nzSpan="8">
            <nz-form-item>
              <nz-form-label nzRequired>Название (Техническое)</nz-form-label>
              <nz-form-control nzErrorTip="Введите техническое имя">
                <input nz-input formControlName="name" placeholder="Напр: Microsoft" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="8">
            <nz-form-item>
              <nz-form-label nzRequired>Системный код (Code)</nz-form-label>
              <nz-form-control nzErrorTip="Введите SystemCode">
                <input nz-input formControlName="systemCode" placeholder="Напр: microsoft" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="8">
            <nz-form-item>
              <nz-form-label>Порядок сортировки</nz-form-label>
              <nz-form-control>
                <input nz-input type="number" formControlName="sortOrder" placeholder="0" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="18">
            <nz-form-item>
              <nz-form-label>Официальный сайт</nz-form-label>
              <nz-form-control>
                <input nz-input formControlName="website" placeholder="https://www.microsoft.com" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="6">
            <nz-form-item>
              <nz-form-label>Активность</nz-form-label>
              <nz-form-control>
                <nz-switch formControlName="isActive"></nz-switch>
              </nz-form-control>
            </nz-form-item>
          </div>

          <!-- Управление Иконкой -->
          <div nz-col nzSpan="24">
            <nz-form-item>
              <nz-form-label>Брендинг (Иконка разработчика)</nz-form-label>
              <nz-form-control>
                <div class="icon-management-wrapper">
                  <div class="icon-preview-box">
                    <img
                      [src]="imgService.getAssetUrl(form.get('iconPath')?.value)"
                      alt="Preview"
                      class="preview-img"
                      (error)="imgService.getPlaceholder()"
                    />
                  </div>
                  <div class="icon-controls">
                    <nz-input-group nzSearch [nzAddOnAfter]="suffixButton">
                      <input
                        type="text"
                        nz-input
                        formControlName="iconPath"
                        placeholder="path/to/icon.svg или прямая ссылка"
                      />
                    </nz-input-group>
                    <ng-template #suffixButton>
                      <button nz-button nzType="primary" (click)="openIconUploadModal()">
                        <i nz-icon nzType="picture"></i>
                        Выбрать/Загрузить
                      </button>
                    </ng-template>
                    <span class="hint-text"
                      >Используйте наш универсальный загрузчик для автоматической обработки.</span
                    >
                  </div>
                </div>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="24">
            <nz-divider nzText="Локализация и SEO" nzOrientation="left"></nz-divider>
          </div>

          <!-- Вкладки языков -->
          <div nz-col nzSpan="24">
            <nz-tabset [(nzSelectedIndex)]="selectedTabIndex" [nzAnimated]="false">
              @for (lang of languages; track lang.id; let i = $index) {
                <nz-tab [nzTitle]="lang.nativeTitle">
                  <ng-template nz-tab>
                    @if (getLocGroup(lang.id); as locGroup) {
                      <div class="tab-content" [formGroup]="locGroup">
                        <div nz-row [nzGutter]="[16, 16]">
                          <div nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-label>Отображаемое название ({{ lang.code }})</nz-form-label>
                              <nz-form-control>
                                <input nz-input formControlName="name" />
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <div nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-label>Описание разработчика</nz-form-label>
                              <nz-form-control>
                                <textarea
                                  nz-input
                                  formControlName="description"
                                  [nzAutosize]="{ minRows: 3, maxRows: 5 }"
                                ></textarea>
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <!-- SEO Блок -->
                          <div nz-col nzSpan="24">
                            <nz-collapse [nzBordered]="false">
                              <nz-collapse-panel [nzHeader]="'SEO Настройки (' + lang.code + ')'">
                                @if (getSeoGroup(lang.id); as seoGroup) {
                                  <app-seo-form
                                    [form]="seoGroup"
                                    [sourceName]="locGroup.get('name')?.value"
                                  >
                                  </app-seo-form>
                                }
                              </nz-collapse-panel>
                            </nz-collapse>
                          </div>
                        </div>
                      </div>
                    }
                  </ng-template>
                </nz-tab>
              }
            </nz-tabset>
          </div>
        </div>
      </form>

      <ng-template #noLangs>
        <div class="no-langs-container">
          Для работы формы необходимо инициализировать языки системы.
        </div>
      </ng-template>
    </nz-spin>
  `,
  styles: [
    `
      .tab-content {
        padding-top: 16px;
        min-height: 400px;
      }
      .no-langs-container {
        padding: 40px;
        text-align: center;
        color: #8c8c8c;
      }

      .icon-management-wrapper {
        display: flex;
        gap: 20px;
        align-items: flex-start;
        padding: 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
      }

      .icon-preview-box {
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;

        .preview-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      }

      .icon-controls {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .hint-text {
        font-size: 12px;
        color: #64748b;
      }
    `,
  ],
})
export class DeveloperOfAggregatorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(DeveloperOfAggregatorApiService);
  private langService = inject(LanguageService);
  public imgService = inject(ImageServiceUniversal);
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  id = input<number | null>(null);
  save = output<any>();

  form: FormGroup;
  languages: AppLanguage[] = [];
  loading = false;
  selectedTabIndex = 0;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      systemCode: ['', [Validators.required, Validators.maxLength(100)]],
      website: [''],
      iconPath: [''],
      isActive: [true],
      sortOrder: [0],
      localizations: this.fb.array([]),
    });

    toObservable(this.langService.availableLanguages)
      .pipe(
        filter((langs) => !!langs && langs.length > 0),
        takeUntilDestroyed(),
      )
      .subscribe((langs) => {
        this.languages = langs;
        this.initLocTabs();

        if (this.id()) {
          this.loadData(this.id()!);
        }
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {}

  /**
   * Открывает универсальное модальное окно для загрузки иконки
   */
  openIconUploadModal(): void {
    const modalRef = this.modal.create({
      nzContent: AvUniversalUploadModalComponent,
      nzData: {
        folder: 'developers',
        title: 'Загрузка иконки разработчика',
      },
      nzFooter: null,
      nzWidth: 700,
      nzClassName: 'aurora-modal-glass',
    });

    modalRef.afterClose.subscribe((result: any) => {
      if (result && result.relativePath) {
        this.form.patchValue({ iconPath: result.relativePath });
        this.cdr.markForCheck();
      }
    });
  }

  private initLocTabs(): void {
    const locs = this.form.get('localizations') as FormArray;
    locs.clear();
    this.languages.forEach((lang) => {
      locs.push(
        this.fb.group({
          languageOfAggregatorId: [lang.id],
          name: ['', [Validators.maxLength(255)]],
          description: [''],
          seoData: SeoFormComponent.createSeoForm(this.fb),
        }),
      );
    });
  }

  get locsArray(): FormArray {
    return this.form.get('localizations') as FormArray;
  }

  getLocGroup(langId: number): FormGroup | null {
    return this.locsArray.controls.find(
      (c) => c.value.languageOfAggregatorId === langId,
    ) as FormGroup;
  }

  getSeoGroup(langId: number): FormGroup | null {
    const loc = this.getLocGroup(langId);
    return loc ? (loc.get('seoData') as FormGroup) : null;
  }

  private loadData(id: number): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.api
      .getById(id)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.form.patchValue({
            id: data.id,
            name: data.name,
            systemCode: data.systemCode,
            website: data.website,
            iconPath: data.iconPath,
            isActive: data.isActive,
            sortOrder: data.sortOrder,
          });

          data.localizations?.forEach((loc: any) => {
            const group = this.getLocGroup(loc.languageOfAggregatorId);
            if (group) {
              group.patchValue({
                name: loc.name,
                description: loc.description,
              });
              // Маппинг плоских полей из БД в структуру SeoForm
              group.get('seoData')?.patchValue({
                metaTitle: loc.metaTitle,
                metaDescription: loc.metaDescription,
              });
            }
          });

          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  submit(): void {
    if (this.form.valid) {
      const val = JSON.parse(JSON.stringify(this.form.value));

      // Плоское маппирование SEO данных перед отправкой на сервер
      val.localizations.forEach((loc: any) => {
        if (loc.seoData) {
          loc.metaTitle = loc.seoData.metaTitle;
          loc.metaDescription = loc.seoData.metaDescription;
          delete loc.seoData;
        }
      });

      this.save.emit(val);
    } else {
      this.message.warning('Проверьте обязательные поля (Название и Код)');
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control?.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.cdr.markForCheck();
    }
  }
}
