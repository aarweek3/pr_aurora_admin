import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { filter, take } from 'rxjs';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { CommonModule } from '@angular/common';
import { AvUniversalUploadModalComponent } from '@shared/components/av-universal-upload-modal/av-universal-upload-modal.component';
import { SeoFormComponent } from '@shared/components/ui/seo-form/seo-form.component';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { NzColorPickerModule } from 'ng-zorro-antd/color-picker';
import { CategoryTagOfAggregatorStateService } from '../../../CategoryTagOfAggregatorPage/services/category-tag-of-aggregator-state.service';
import { LanguageAggregatorService } from '../../../LanguageOfAggregator/services/language-aggregator.service';
import { TagOfAggregatorApiService } from '../../services/tag-of-aggregator-api.service';

@Component({
  selector: 'app-tag-of-aggregator-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzTabsModule,
    NzSelectModule,
    NzSwitchModule,
    NzIconModule,
    NzToolTipModule,
    NzTagModule,
    NzCheckboxModule,
    NzSpinModule,
    NzGridModule,
    NzDividerModule,
    NzCollapseModule,
    NzColorPickerModule,
    SeoFormComponent,
  ],
  template: `
    <nz-spin [nzSpinning]="loading">
      <form
        nz-form
        [formGroup]="form"
        nzLayout="vertical"
        *ngIf="form && languages.length > 0; else noLangs"
        class="aurora-form"
      >
        <div nz-row [nzGutter]="[16, 0]">
          <!-- 1. ОСНОВНЫЕ ПАРАМЕТРЫ -->
          <div nz-col nzSpan="12">
            <nz-form-item>
              <nz-form-label nzRequired>Категория</nz-form-label>
              <nz-form-control nzErrorTip="Выберите категорию">
                <nz-select
                  formControlName="categoryTagId"
                  nzPlaceHolder="Выберите родительскую категорию"
                  nzShowSearch
                >
                  <nz-option
                    *ngFor="let cat of categoryState.items()"
                    [nzValue]="cat.id"
                    [nzLabel]="cat.localizedName || cat.slug"
                  ></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="12">
            <nz-form-item>
              <nz-form-label nzRequired>Системный код (Slug)</nz-form-label>
              <nz-form-control nzErrorTip="Введите уникальный код">
                <input nz-input formControlName="slug" placeholder="e.g. windows-11" />
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="8">
            <nz-form-item>
              <nz-form-label>Тип тега</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="type">
                  <nz-option [nzValue]="0" nzLabel="Functional"></nz-option>
                  <nz-option [nzValue]="1" nzLabel="Technical"></nz-option>
                  <nz-option [nzValue]="2" nzLabel="OS"></nz-option>
                  <nz-option [nzValue]="3" nzLabel="Hardware"></nz-option>
                  <nz-option [nzValue]="4" nzLabel="License"></nz-option>
                </nz-select>
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

          <div nz-col nzSpan="4">
            <nz-form-item>
              <nz-form-label>Статус</nz-form-label>
              <nz-form-control>
                <nz-switch
                  formControlName="isActive"
                  nzCheckedChildren="Вкл"
                  nzUnCheckedChildren="Выкл"
                ></nz-switch>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div nz-col nzSpan="4">
            <nz-form-item>
              <nz-form-label>Feature</nz-form-label>
              <nz-form-control>
                <nz-switch
                  formControlName="isFeature"
                  nzCheckedChildren="Да"
                  nzUnCheckedChildren="Нет"
                ></nz-switch>
              </nz-form-control>
            </nz-form-item>
          </div>

          <!-- 2. БРЕНДИНГ (ИКОНКА И ЦВЕТ) -->
          <div nz-col nzSpan="24">
            <div class="branding-section">
              <div nz-row [nzGutter]="16">
                <div nz-col nzSpan="16">
                  <nz-form-item>
                    <nz-form-label>Иконка тега</nz-form-label>
                    <nz-form-control>
                      <div class="icon-management-wrapper">
                        <div class="icon-preview-box">
                          @if (isCustomIcon(form.get('iconPath')?.value)) {
                            <img
                              [src]="imgService.getAssetUrl(form.get('iconPath')?.value)"
                              alt="Preview"
                              class="preview-img"
                              (error)="imgService.getPlaceholder()"
                              [style.background-color]="
                                form.get('color')?.value !== 'inherit'
                                  ? form.get('color')?.value
                                  : 'transparent'
                              "
                            />
                          } @else if (form.get('iconPath')?.value) {
                            <i
                              nz-icon
                              [nzType]="getStandardIcon(form.get('iconPath')?.value)"
                              [style.color]="
                                form.get('color')?.value !== 'inherit'
                                  ? form.get('color')?.value
                                  : '#1890ff'
                              "
                              style="font-size: 32px;"
                            ></i>
                          } @else {
                            <i nz-icon nzType="tag" style="font-size: 32px; color: #cbd5e1;"></i>
                          }
                        </div>
                        <div class="icon-controls">
                          <nz-input-group nzSearch [nzAddOnAfter]="suffixButton">
                            <input
                              type="text"
                              nz-input
                              formControlName="iconPath"
                              placeholder="path/to/icon.svg или nz-icon type"
                            />
                          </nz-input-group>
                          <ng-template #suffixButton>
                            <button
                              nz-button
                              nzType="primary"
                              (click)="openIconUploadModal()"
                              type="button"
                            >
                              <i nz-icon nzType="picture"></i>
                              Загрузить
                            </button>
                          </ng-template>
                        </div>
                      </div>
                    </nz-form-control>
                  </nz-form-item>
                </div>
                <div nz-col nzSpan="8">
                  <nz-form-item>
                    <nz-form-label>
                      Цвет (Heritage)
                      <i
                        nz-icon
                        nzType="info-circle"
                        nz-tooltip
                        nzTooltipTitle="'inherit' для наследования от категории"
                      ></i>
                    </nz-form-label>
                    <nz-form-control>
                      <div class="color-picker-container">
                        <nz-input-group [nzAddOnBefore]="colorPickerTpl">
                          <input nz-input formControlName="color" placeholder="Hex или 'inherit'" />
                        </nz-input-group>
                        <ng-template #colorPickerTpl>
                          <nz-color-picker
                            [nzValue]="getInheritedColor()"
                            (nzOnChange)="onColorPickerChange($event)"
                          ></nz-color-picker>
                        </ng-template>
                        <button
                          nz-button
                          nzType="text"
                          nz-tooltip
                          nzTooltipTitle="Сбросить на наследование (inherit)"
                          (click)="setInheritColor()"
                          type="button"
                          class="inherit-btn"
                          [class.active]="form.get('color')?.value === 'inherit'"
                        >
                          <i nz-icon nzType="api"></i>
                        </button>
                      </div>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>
            </div>
          </div>

          <div nz-col nzSpan="24">
            <nz-divider nzText="Локализация и SEO" nzOrientation="left"></nz-divider>
          </div>

          <!-- 3. ЛОКАЛИЗАЦИИ И SEO -->
          <div nz-col nzSpan="24">
            <nz-tabset [(nzSelectedIndex)]="selectedTabIndex" [nzAnimated]="false">
              @for (lang of languages; track lang.id; let i = $index) {
                <nz-tab [nzTitle]="lang.title">
                  <ng-template nz-tab>
                    @if (getLocGroup(lang.id); as locGroup) {
                      <div class="tab-content" [formGroup]="locGroup">
                        <div nz-row [nzGutter]="[16, 16]">
                          <div nz-col nzSpan="12">
                            <nz-form-item>
                              <nz-form-label
                                [nzRequired]="lang.code === 'en-US' || lang.code === 'en'"
                                >Отображаемое название ({{ lang.code }})</nz-form-label
                              >
                              <nz-form-control nzErrorTip="Название обязательно">
                                <input nz-input formControlName="name" />
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <div nz-col nzSpan="12">
                            <nz-form-item>
                              <nz-form-label>H1 Заголовок</nz-form-label>
                              <nz-form-control>
                                <input nz-input formControlName="h1Title" />
                              </nz-form-control>
                            </nz-form-item>
                          </div>

                          <div nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-label>Описание (SEO)</nz-form-label>
                              <nz-form-control>
                                <textarea
                                  nz-input
                                  formControlName="description"
                                  [nzAutosize]="{ minRows: 2, maxRows: 4 }"
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
                                    [sourceDescription]="locGroup.get('description')?.value"
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
      .aurora-form {
        padding: 0;
      }
      .branding-section {
        background: #f8fafc;
        padding: 16px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-bottom: 8px;
        margin-top: 8px;
      }

      .icon-management-wrapper {
        display: flex;
        gap: 16px;
        align-items: flex-start;
      }
      .icon-preview-box {
        width: 64px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border: 1px dashed #cbd5e1;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
      }
      .preview-img {
        max-width: 80%;
        max-height: 80%;
        object-fit: contain;
      }
      .icon-controls {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .color-picker-container {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .inherit-btn {
        color: #94a3b8;
      }
      .inherit-btn.active {
        color: #1890ff;
        background: #e6f7ff;
      }

      .tab-content {
        padding-top: 16px;
        min-height: 350px;
      }
      .no-langs-container {
        padding: 40px;
        text-align: center;
        color: #8c8c8c;
      }

      ::ng-deep .ant-form-item-label > label {
        font-weight: 700;
        color: #475569;
        font-size: 13px;
      }
    `,
  ],
})
export class TagOfAggregatorFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);
  private api = inject(TagOfAggregatorApiService);
  public categoryState = inject(CategoryTagOfAggregatorStateService);
  private langService = inject(LanguageAggregatorService);
  public imgService = inject(ImageServiceUniversal);

  tag = input<number | null>(null);
  save = output<any>();
  cancel = output<void>();

  form: FormGroup;
  languages: any[] = [];
  loading = false;
  selectedTabIndex = 0;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      slug: ['', [Validators.required]],
      categoryTagId: [null, [Validators.required]],
      type: [0],
      color: ['inherit'],
      iconPath: [''],
      isActive: [true],
      sortOrder: [0],
      isFeature: [false],
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

        if (this.tag()) {
          this.loadData(this.tag()!);
        }
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    if (this.categoryState.items().length === 0) {
      this.categoryState.loadItems();
    }
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
          h1Title: [''],
          seoData: SeoFormComponent.createSeoForm(this.fb),
        }),
      );
    });
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
            slug: data.slug,
            categoryTagId: data.categoryTagId,
            type: data.type,
            color: data.color,
            iconPath: data.iconPath,
            isActive: data.isActive,
            sortOrder: data.sortOrder,
            isFeature: data.isFeature,
          });

          data.localizations?.forEach((loc: any) => {
            const group = this.getLocGroup(loc.languageOfAggregatorId);
            if (group) {
              group.patchValue({
                name: loc.name,
                description: loc.description,
                h1Title: loc.h1Title,
              });
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

  openIconUploadModal(): void {
    const modalRef = this.modal.create({
      nzContent: AvUniversalUploadModalComponent,
      nzData: {
        folder: 'tags',
        title: 'Загрузка иконки тега',
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

  submit(): void {
    // 1. Подстановка английского имени в пустые поля (English Fallback)
    const locs = this.form.get('localizations') as FormArray;
    const enControl = locs.controls.find((c) => {
      const langId = c.get('languageOfAggregatorId')?.value;
      const lang = this.languages.find((l) => l.id === langId);
      return lang?.code === 'en-US' || lang?.code === 'en';
    });

    const enName = enControl?.get('name')?.value;

    if (enName) {
      locs.controls.forEach((group) => {
        const nameCtrl = group.get('name');
        if (!nameCtrl?.value || nameCtrl.value.trim() === '') {
          nameCtrl?.setValue(enName);
        }
      });
    }

    if (this.form.valid) {
      const val = JSON.parse(JSON.stringify(this.form.value));

      val.localizations.forEach((loc: any) => {
        if (loc.seoData) {
          loc.metaTitle = loc.seoData.metaTitle;
          loc.metaDescription = loc.seoData.metaDescription;
          delete loc.seoData;
        }
      });

      this.save.emit(val);
    } else {
      this.message.warning('Проверьте обязательные поля');
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control?.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  isCustomIcon(icon: string | undefined): boolean {
    if (!icon) return false;
    return icon.includes('.') || icon.includes('/');
  }

  getStandardIcon(icon: string | undefined): string {
    if (!icon) return 'tag';
    if (icon.startsWith('nz-icon:')) {
      return icon.replace('nz-icon:', '');
    }
    return icon;
  }

  getInheritedColor(): string {
    const color = this.form.get('color')?.value;
    if (color && color !== 'inherit') return color;

    const catId = this.form.get('categoryTagId')?.value;
    if (catId) {
      const cat = this.categoryState.items().find((c) => c.id === catId);
      if (cat?.color && cat.color !== 'inherit') return cat.color;
    }
    return '#1890ff'; // Default primary
  }

  onColorPickerChange(event: any): void {
    const color = typeof event === 'string' ? event : event.color.toHexString();
    this.form.patchValue({ color: color });
    this.cdr.markForCheck();
  }

  setInheritColor(): void {
    this.form.patchValue({ color: 'inherit' });
    this.cdr.markForCheck();
  }
}
