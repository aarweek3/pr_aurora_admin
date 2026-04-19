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
import { ImageEditorMainComponent } from '@shared/components/av-image-editor-vs/components/image-editor-main/image-editor-main.component';
import { ImageEditorConfig } from '@shared/components/av-image-editor-vs/models/editor-config.model';
import { VSModalService } from '@shared/components/ui/vs-modal-compromise';
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

import { environment } from '@environments/environment';
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
            <div style="flex: 1; display: flex; flex-direction: column; height: 100%;">
              <!-- CUSTOM MAIN IMAGE UPLOADER -->
              <div
                class="custom-image-uploader"
                [class.has-image]="!!form.get('urlPictureMain')?.value"
                (click)="openVsEditorForMain()"
              >
                <!-- EMPTY STATE -->
                <div class="upload-placeholder" *ngIf="!form.get('urlPictureMain')?.value">
                  <span
                    nz-icon
                    nzType="cloud-upload"
                    nzTheme="outline"
                    style="font-size: 32px; color: #40a9ff; margin-bottom: 8px;"
                  ></span>
                  <div style="text-align: center; color: #8c8c8c; font-size: 13px;">
                    Загрузить обложку<br />(VS Editor)
                  </div>
                </div>

                <!-- PREVIEW STATE -->
                <div
                  class="image-preview-wrapper"
                  *ngIf="form.get('urlPictureMain')?.value as mainImgUrl"
                >
                  <img [src]="getImageUrl(mainImgUrl)" class="main-preview-img" />
                  <div class="overlay-actions">
                    <span nz-icon nzType="edit" nzTheme="outline"></span>
                  </div>
                </div>
              </div>
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
                      <img [src]="getImageUrl(getPreviewUrl(lang.id))" />
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
                        <!-- CUSTOM LOCAL IMAGE UPLOADER (FOR LANG) -->
                        <div
                          class="custom-image-uploader"
                          style="width: 100%; height: 240px;"
                          [class.has-image]="!!getDisplayLangImage(lang.id)"
                          [class.is-inherited]="isLangImageInherited(lang.id)"
                          (click)="openVsEditorForLang(lang.id)"
                        >
                          <!-- EMPTY STATE -->
                          <div class="upload-placeholder" *ngIf="!getDisplayLangImage(lang.id)">
                            <span
                              nz-icon
                              nzType="picture"
                              nzTheme="outline"
                              style="font-size: 32px; color: #40a9ff; margin-bottom: 8px;"
                            ></span>
                            <div style="text-align: center; color: #8c8c8c; font-size: 13px;">
                              Загрузить фото<br />({{ lang.nativeTitle }})
                            </div>
                          </div>

                          <!-- PREVIEW STATE -->
                          <div
                            class="image-preview-wrapper"
                            *ngIf="getDisplayLangImage(lang.id) as displayImgUrl"
                          >
                            <img [src]="getImageUrl(displayImgUrl)" class="main-preview-img" />

                            <!-- Badge if inherited -->
                            <div class="inherited-badge" *ngIf="isLangImageInherited(lang.id)">
                              Общая обложка
                            </div>

                            <!-- Reset button if HAS own image -->
                            <div
                              class="reset-local-btn"
                              *ngIf="!isLangImageInherited(lang.id)"
                              (click)="resetLangImage($event, lang.id)"
                              title="Вернуть общую обложку"
                            >
                              <span nz-icon nzType="rollback" nzTheme="outline"></span>
                            </div>

                            <div class="overlay-actions">
                              <span nz-icon nzType="edit" nzTheme="outline"></span>
                            </div>
                          </div>
                        </div>
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

      /* Custom Uploader Styles */
      .custom-image-uploader {
        width: 100%;
        height: 100%;
        min-height: 240px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        background: #fafafa;
        cursor: pointer;
        position: relative;
        transition: border-color 0.3s;
        overflow: hidden;
      }
      .custom-image-uploader:hover {
        border-color: #1890ff;
      }
      .custom-image-uploader.has-image {
        border-style: solid;
        background: #fff;
      }
      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        padding: 20px;
      }
      .image-preview-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }
      .main-preview-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      .overlay-actions {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
        color: #fff;
        font-size: 24px;
      }
      .custom-image-uploader:hover .overlay-actions {
        opacity: 1;
      }
      .custom-image-uploader.is-inherited .main-preview-img {
        opacity: 0.6;
        filter: grayscale(0.5);
      }
      .inherited-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        pointer-events: none;
        backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 5;
      }
      .reset-local-btn {
        position: absolute;
        bottom: 8px;
        left: 8px;
        background: #ff4d4f;
        color: #fff;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s;
        z-index: 10;
      }
      .custom-image-uploader:hover .reset-local-btn {
        opacity: 1;
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
    private vsModal: VSModalService,
  ) {
    console.log('[FormComponent] Конструктор вызван');

    this.form = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      systemCode: [''],
      urlPictureMain: [''], // Главная картинка
      isActive: [true],
      descriptions: this.fb.array([]),
    });
    console.log('[FormComponent] Форма создана');

    const availableLangs$ = toObservable(this.langService.availableLanguages);
    availableLangs$.subscribe((langs) => {
      console.log('[FormComponent] Языки получены:', langs);
      if (langs && langs.length > 0) {
        this.languages = langs;
        console.log('[FormComponent] Инициализация табов для', langs.length, 'языков');
        this.initDescriptionTabs();
      } else {
        console.warn('[FormComponent] Нет доступных языков!');
      }
    });
  }

  ngOnInit(): void {
    console.log('[FormComponent] ngOnInit - компонент инициализирован');
    console.log('[FormComponent] Текущее состояние:', {
      loading: this.loading,
      languages: this.languages.length,
      formValid: this.form?.valid,
    });
  }

  private initDescriptionTabs(): void {
    console.log('[FormComponent] initDescriptionTabs - начало');
    const descs = this.form.get('descriptions') as FormArray;
    descs.clear();
    console.log(
      '[FormComponent] Создание табов для языков:',
      this.languages.map((l) => l.code),
    );

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

    console.log('[FormComponent] Табы созданы, количество:', descs.length);
    this.cdr.markForCheck();
    console.log('[FormComponent] ChangeDetection отмечен');
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

  /**
   * Приводит URL к абсолютному виду, если это относительный путь
   */
  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
  }

  /**
   * Открывает VS Editor для редактирования главного изображения
   */
  openVsEditorForMain(): void {
    const currentUrl = this.form.get('urlPictureMain')?.value;

    const config: ImageEditorConfig = {
      title: 'Главное изображение (Обложка)',
      defaultQuality: 90,
      defaultFormat: 'image/jpeg',
      // Если нужно принудительно 16:9, можно настроить пресеты или логику в самом редакторе,
      // но пока даем свободу или используем дефолты.
    };

    const ref = this.vsModal.open(ImageEditorMainComponent, {
      title: 'Aurora Studio VS - Обложка',
      width: '85vw',
      height: '95vh',
      data: config,
      draggable: true,
      resizable: true,
    });

    // Если уже есть картинка, можно было бы передать её в редактор (todo: поддержка initialImage в config)
    // Сейчас редактор откроется пустым или предложит загрузить.
    if (currentUrl) {
      // В будущем: передать currentUrl чтобы открыть его сразу
      // config.initialImage = currentUrl;
    }

    ref.afterClosed().subscribe((result: any) => {
      console.log('🖼️ VS Editor Closed. Raw Result:', result);

      // result - это объект типа AvImageEditorOutput { imageUrl, htmlSnippet, ... }
      if (result && result.url) {
        console.log('✅ Main Image Updated:', result.url);

        // 1. Обновляем значение формы (URL)
        this.form.patchValue({ urlPictureMain: result.url });
        this.cdr.markForCheck();

        console.log('📝 Form Control Value:', this.form.get('urlPictureMain')?.value);
        this.message.success('Главное изображение обновлено');
      } else {
        console.warn('⚠️ No image URL returned from editor');
      }
    });
  }

  /**
   * Открывает VS Editor для редактирования изображения конкретного языка
   */
  openVsEditorForLang(langId: string | number): void {
    const group = this.getDescFormGroup(langId);
    if (!group) return;

    const lang = this.languages.find((l) => l.id == langId);

    const config: ImageEditorConfig = {
      title: `Изображение для языка: ${lang?.nativeTitle || langId}`,
      defaultQuality: 90,
      defaultFormat: 'image/jpeg',
    };

    const ref = this.vsModal.open(ImageEditorMainComponent, {
      title: `Aurora Studio VS - ${lang?.nativeTitle || 'Локализация'}`,
      width: '85vw',
      height: '95vh',
      data: config,
      draggable: true,
      resizable: true,
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result && result.url) {
        console.log(`✅ Image Updated for Lang [${langId}]:`, result.url);

        // Обновляем значение в конкретной группе FormArray
        group.patchValue({ urlPicture: result.url });
        this.cdr.markForCheck();

        this.message.success(`Изображение для языка ${lang?.nativeTitle} обновлено`);
      }
    });
  }

  /**
   * Возвращает URL изображения для отображения в табе языка (свой или fallback на общий)
   */
  getDisplayLangImage(langId: string | number): string | null {
    const group = this.getDescFormGroup(langId);
    const localUrl = group?.get('urlPicture')?.value;
    if (localUrl) return localUrl;

    return this.form.get('urlPictureMain')?.value || null;
  }

  /**
   * Проверяет, является ли отображаемое изображение унаследованным от главной обложки
   */
  isLangImageInherited(langId: string | number): boolean {
    const group = this.getDescFormGroup(langId);
    const localUrl = group?.get('urlPicture')?.value;
    if (localUrl) return false;

    return !!this.form.get('urlPictureMain')?.value;
  }

  /**
   * Сбрасывает локальное изображение языка, возвращаясь к общей обложке
   */
  resetLangImage(event: MouseEvent, langId: string | number): void {
    event.stopPropagation(); // Чтобы не открылся редактор
    const group = this.getDescFormGroup(langId);
    if (group) {
      group.patchValue({ urlPicture: null });
      this.cdr.markForCheck();
      this.message.info('Возвращена общая обложка');
    }
  }
}
