import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AvTinymceControlComponent } from '@assets/controls/tinymce-control/tinymce-control.component';
import { AppLanguage } from '@assets/languageApp/models/appLanguage.model';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { AvImagePickerComponent } from '../../../../shared/components/av-image-uploader/av-image-picker.component';
import { SeoFormComponent } from '../../../../shared/components/ui/seo-form/seo-form.component';

@Component({
  selector: 'app-sample-main-seo-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzSwitchModule,
    NzButtonModule,
    NzSpinModule,
    NzGridModule,
    NzIconModule,
    NzDividerModule,
    NzCollapseModule,
    NzCollapseModule,
    SeoFormComponent,
    AvTinymceControlComponent,
    AvImagePickerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nz-spin [nzSpinning]="loading">
      <form
        nz-form
        *ngIf="form && languages.length > 0; else noLangs"
        [formGroup]="form"
        nzLayout="vertical"
      >
        <div nz-row [nzGutter]="[16, 24]">
          <!-- НОВЫЕ ВЕРХНИЕ БЛОКИ -->
          <div
            nz-col
            nzSpan="6"
            style="min-height: 280px; display: flex; flex-direction: column; background: #fff; padding: 12px 16px; border-radius: 8px;"
          >
            <div style="flex: 1; display: flex; flex-direction: column;">
              <av-image-picker
                style="width: 100%; height: 100%; min-height: 240px; display: block;"
                [size]="'100%'"
                [fixedSide]="'height'"
                placeholder="Нажмите для загрузки главного изображения по умолчанию"
                formControlName="urlPictureMain"
                [aspectRatio]="16 / 9"
              ></av-image-picker>
            </div>
          </div>
          <div
            nz-col
            nzSpan="18"
            style="min-height: 240px; padding: 12px 16px; background: #fff; border-radius: 8px; display: flex; align-items: flex-start;"
          >
            <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
              <!-- Статус записи -->
              <nz-form-item nz-row style="margin-bottom: 0;">
                <nz-form-label nz-col [nzSpan]="5">Статус записи</nz-form-label>
                <nz-form-control nz-col [nzSpan]="19">
                  <nz-switch
                    formControlName="isActive"
                    nzCheckedChildren="Активен"
                    nzUnCheckedChildren="Черновик"
                  ></nz-switch>
                </nz-form-control>
              </nz-form-item>

              <!-- Техническое название -->
              <nz-form-item nz-row style="margin-bottom: 0;">
                <nz-form-label nz-col [nzSpan]="5" style="overflow: visible;">
                  <div
                    style="display: flex; align-items: center; white-space: nowrap; justify-content: flex-start;"
                  >
                    Техническое название <span class="required-star">*</span>
                  </div>
                </nz-form-label>
                <nz-form-control nz-col [nzSpan]="19" nzErrorTip="Введите название">
                  <input nz-input formControlName="name" placeholder="Напр: Home Page" />
                </nz-form-control>
              </nz-form-item>

              <!-- Системный код -->
              <nz-form-item nz-row style="margin-bottom: 0;">
                <nz-form-label nz-col [nzSpan]="5">Системный код</nz-form-label>
                <nz-form-control nz-col [nzSpan]="19">
                  <input nz-input formControlName="systemCode" placeholder="Напр: HOME_PAGE" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <div nz-col nzSpan="24">
            <nz-divider nzText="Локализация и Контент" nzOrientation="left"></nz-divider>
          </div>

          <!-- ТАБЫ: Языки -->
          <div nz-col nzSpan="24">
            <nz-tabset [(nzSelectedIndex)]="selectedTabIndex" [nzAnimated]="false">
              <nz-tab *ngFor="let lang of languages; let i = index" [nzTitle]="langTemplate">
                <ng-template #langTemplate>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="mini-preview" *ngIf="getPreviewUrl(lang.id)">
                      <img [src]="getPreviewUrl(lang.id)" />
                    </span>
                    {{ lang.nativeTitle }}
                  </div>
                </ng-template>

                <!-- ЛЕНИВАЯ ЗАГРУЗКА КОНТЕНТА ТАБА -->
                <ng-template nz-tab>
                  <div
                    class="tab-content"
                    *ngIf="getDescFormGroup(lang.id) as descGroup"
                    [formGroup]="descGroup"
                  >
                    <div nz-row [nzGutter]="[16, 16]">
                      <!-- Картинка (6) и Заголовок (18) -->
                      <div nz-col nzSpan="6">
                        <av-image-picker
                          style="width: 100%; height: 240px; display: block;"
                          [size]="'100%'"
                          [fixedSide]="'height'"
                          placeholder="Нажмите для загрузки изображения для конкретного языка"
                          formControlName="urlPicture"
                          [aspectRatio]="16 / 9"
                        ></av-image-picker>
                      </div>

                      <div nz-col nzSpan="18">
                        <div
                          style="display: flex; flex-direction: column; gap: 12px; height: 100%; justify-content: flex-start; padding-top: 4px;"
                        >
                          <!-- Заголовок -->
                          <nz-form-item nz-row style="margin-bottom: 0;">
                            <nz-form-label nz-col [nzSpan]="5" style="overflow: visible;">
                              <div
                                style="display: flex; align-items: center; white-space: nowrap; justify-content: flex-start;"
                              >
                                Заголовок ({{ lang.nativeTitle }})
                                <span class="required-star">*</span>
                              </div>
                            </nz-form-label>
                            <nz-form-control nz-col [nzSpan]="19" nzErrorTip="Введите заголовок">
                              <input
                                nz-input
                                formControlName="name"
                                [placeholder]="'Название на ' + lang.nativeTitle"
                              />
                            </nz-form-control>
                          </nz-form-item>

                          <!-- Краткое описание (Intro) -->
                          <nz-form-item nz-row style="margin-bottom: 0;">
                            <nz-form-label nz-col [nzSpan]="5">Краткое описание</nz-form-label>
                            <nz-form-control nz-col [nzSpan]="19">
                              <textarea
                                nz-input
                                formControlName="description"
                                [nzAutosize]="{ minRows: 2, maxRows: 4 }"
                                placeholder="Пара предложений для превью..."
                              ></textarea>
                            </nz-form-control>
                          </nz-form-item>
                        </div>
                      </div>
                    </div>
                  </div>
                </ng-template>
              </nz-tab>
            </nz-tabset>
          </div>

          <!-- ЕДИНЫЙ РЕДАКТОР -->
          <div
            nz-col
            nzSpan="24"
            *ngIf="
              languages && languages.length > 0 && languages[selectedTabIndex] && currentHtmlControl
            "
          >
            <div class="shared-editor-section">
              <nz-divider
                [nzText]="'Основной контент: ' + (languages[selectedTabIndex].nativeTitle || '')"
                nzOrientation="left"
              ></nz-divider>
              <div class="editor-container">
                <av-tinymce-control
                  [formControl]="currentHtmlControl"
                  [height]="500"
                  placeholder="Введите текст статьи..."
                ></av-tinymce-control>
              </div>
            </div>
          </div>

          <!-- SEO БЛОК (СВОЯ ROW 24) -->
          <div
            nz-col
            nzSpan="24"
            *ngIf="languages && languages.length > 0 && languages[selectedTabIndex]"
          >
            <div class="seo-section" *ngIf="languages[selectedTabIndex] as currentLang">
              <div class="seo-collapse-container" style="margin-top: 16px;">
                <nz-collapse [nzBordered]="false">
                  <nz-collapse-panel
                    [nzHeader]="'SEO Настройки (' + currentLang.code + ')'"
                    [nzActive]="false"
                    [nzShowArrow]="true"
                  >
                    <app-seo-form
                      *ngIf="getSeoFormGroup(currentLang.id)"
                      [form]="getSeoFormGroup(currentLang.id)"
                      [sourceName]="getDescFormGroup(currentLang.id)?.get('name')?.value"
                      [sourceDescription]="
                        getDescFormGroup(currentLang.id)?.get('description')?.value
                      "
                    ></app-seo-form>
                  </nz-collapse-panel>
                </nz-collapse>
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div nz-col nzSpan="24" *ngIf="showInlineActions">
            <div class="form-actions">
              <nz-divider></nz-divider>
              <div class="buttons-row">
                <button nz-button nzType="default" (click)="cancel.emit()">Отмена</button>
                <button nz-button nzType="primary" (click)="submitForm()" [nzLoading]="loading">
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <ng-template #noLangs>
        <div class="no-langs-state">
          <nz-spin nzSimple nzTip="Загрузка языков..."></nz-spin>
        </div>
      </ng-template>
    </nz-spin>
  `,
  styles: [
    `
      .tab-content {
        padding: 12px 0 0 0;
        min-height: auto;
      }

      /* Стили для ручной звездочки */
      .required-star {
        color: #ff4d4f;
        margin-left: 4px;
        font-weight: bold;
      }

      .no-langs-state {
        padding: 40px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
      }
      .form-actions {
        margin-top: 24px;
      }
      .buttons-row {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
      .seo-collapse-container {
        margin-top: 24px;
        background: #fafafa;
        border-radius: 4px;
      }
      ::ng-deep .ant-collapse-header {
        align-items: center !important;
        font-weight: 500;
      }
      .image-preview img {
        max-height: 100px;
        max-width: 100%;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
      }
      .mini-preview img {
        width: 32px;
        height: 32px;
        object-fit: cover;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
      }
      .mini-preview img.fallback {
        opacity: 0.6;
        border-style: dashed;
      }
      .shared-editor-section {
        margin-top: 8px;
        background: #fff;
        padding: 4px 16px 12px 16px;
        border: 1px solid #f0f0f0;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      }
      .editor-container {
        min-height: auto;
      }
      .seo-collapse-container {
        margin-top: 0;
        background: #fafafa;
        border-radius: 4px;
      }
      ::ng-deep .ant-divider-horizontal {
        margin: 12px 0 !important;
      }
    `,
  ],
})
export class SampleMainSeoFormComponent implements OnInit {
  @Input() loading = false;
  @Input() showInlineActions = false;
  @Input() set initialData(item: any) {
    if (item) {
      this.patchForm(item);
    } else {
      this.resetForm();
    }
  }

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  selectedTabIndex = 0;
  languages: AppLanguage[] = [];

  constructor(
    private langService: LanguageService,
    private fb: FormBuilder,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      systemCode: [''],
      urlPictureMain: [''], // Главная картинка
      isActive: [true],
      descriptions: this.fb.array([]),
    });

    const availableLangs$ = toObservable(this.langService.availableLanguages);
    availableLangs$.subscribe((langs) => {
      if (langs && langs.length > 0) {
        this.languages = langs;
        this.initDescriptionTabs();
      }
    });
  }

  ngOnInit(): void {}

  private initDescriptionTabs(): void {
    const descs = this.form.get('descriptions') as FormArray;
    descs.clear();
    this.languages.forEach((lang) => {
      descs.push(
        this.fb.group({
          languageAppId: [lang.id],
          name: [''],
          description: [''],
          htmlContent: [''], // TinyMCE контент
          urlPicture: [''], // Локальная картинка
          seoData: SeoFormComponent.createSeoForm(this.fb),
        }),
      );
    });
    this.cdr.markForCheck();
  }

  get descriptionsArray(): FormArray {
    return this.form.get('descriptions') as FormArray;
  }

  getDescFormGroup(langId: string | number): FormGroup | null {
    const descs = this.descriptionsArray;
    if (!descs || !descs.controls) return null;
    const group = descs.controls.find((c) => c.value.languageAppId == langId) as FormGroup;
    return group || null;
  }

  getSeoFormGroup(langId: any): FormGroup {
    const descGroup = this.getDescFormGroup(langId);
    return (descGroup ? descGroup.get('seoData') : null) as FormGroup;
  }

  /** Получает контрол контента для текущего выбранного языка */
  get currentHtmlControl(): any {
    const descs = this.descriptionsArray;
    if (!descs || descs.length <= this.selectedTabIndex) return null;
    return descs.at(this.selectedTabIndex).get('htmlContent');
  }

  // Возвращает URL картинки для превью (с учетом фоллбека)
  getPreviewUrl(langId: any): string | null {
    const descGroup = this.getDescFormGroup(langId);
    const localUrl = descGroup?.get('urlPicture')?.value;
    const mainUrl = this.form.get('urlPictureMain')?.value;

    if (localUrl) return localUrl;
    if (mainUrl) return mainUrl;
    return null;
  }

  private patchForm(item: any): void {
    this.form.patchValue({
      id: item.id,
      name: item.name,
      systemCode: item.systemCode,
      urlPictureMain: item.urlPictureMain,
      isActive: item.isActive,
    });

    item.descriptions?.forEach((d: any) => {
      const group = this.getDescFormGroup(d.languageAppId);
      if (group) {
        group.patchValue({
          name: d.name,
          description: d.description,
          htmlContent: d.htmlContent,
          urlPicture: d.urlPicture,
        });
        if (d.seoData) {
          group.get('seoData')?.patchValue(d.seoData);
        }
      }
    });
  }

  resetForm(): void {
    this.form.reset({
      id: 0,
      name: '',
      systemCode: '',
      urlPictureMain: '',
      isActive: true,
    });
    this.initDescriptionTabs();
    this.selectedTabIndex = 0;
  }

  submitForm(): void {
    if (this.form.valid) {
      const formValue = { ...this.form.value };

      // Фильтруем пустые переводы перед сохранением
      if (formValue.descriptions) {
        formValue.descriptions = formValue.descriptions.filter((desc: any) => {
          const hasName = !!desc.name?.trim();
          const hasDescription = !!desc.description?.trim();
          const hasContent = !!desc.htmlContent?.trim();
          const hasSeo =
            desc.seoData &&
            (!!desc.seoData.metaTitle?.trim() ||
              !!desc.seoData.metaDescription?.trim() ||
              !!desc.seoData.urlSlug?.trim());
          return hasName || hasDescription || hasContent || hasSeo;
        });
      }

      this.save.emit(formValue);
    } else {
      this.markFormGroupDirty(this.form);
      this.message.warning('Пожалуйста, проверьте правильность заполнения полей');
    }
  }

  private markFormGroupDirty(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach((control) => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupDirty(control);
      } else {
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });
  }
}
