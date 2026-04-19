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
import { environment } from '@environments/environment';
import { ImageEditorMainComponent } from '@shared/components/av-image-editor-vs/components/image-editor-main/image-editor-main.component';
import { ImageEditorConfig } from '@shared/components/av-image-editor-vs/models/editor-config.model';
import { SeoFormComponent } from '@shared/components/ui/seo-form/seo-form.component';
import { VSModalService } from '@shared/components/ui/vs-modal-compromise';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-platform-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTabsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzButtonModule,
    NzSpinModule,
    NzGridModule,
    NzIconModule,
    NzDividerModule,
    NzCollapseModule,
    NzSelectModule,
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
        <div nz-row [nzGutter]="24">
          <!-- Технические настройки -->
          <div nz-col nzSpan="24">
            <nz-divider nzText="Технические настройки" nzOrientation="left"></nz-divider>
            <div nz-row [nzGutter]="16">
              <!-- Главное изображение -->
              <div nz-col nzSpan="6">
                <nz-form-item>
                  <nz-form-label>Главное изображение</nz-form-label>
                  <nz-form-control>
                    <div
                      class="custom-image-uploader"
                      [class.has-image]="!!form.get('urlPictureMain')?.value"
                      (click)="openVsEditorForMain()"
                      style="width: 100%; height: 160px; cursor: pointer;"
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
                  </nz-form-control>
                </nz-form-item>
              </div>
              <div nz-col nzSpan="18">
                <div nz-row [nzGutter]="16">
                  <div nz-col nzSpan="8">
                    <nz-form-item>
                      <nz-form-label nzRequired>Техническое название</nz-form-label>
                      <nz-form-control nzErrorTip="Введите название">
                        <input
                          nz-input
                          formControlName="name"
                          placeholder="Напр: Windows Desktop"
                        />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col nzSpan="8">
                    <nz-form-item>
                      <nz-form-label nzRequired>Системный код</nz-form-label>
                      <nz-form-control nzErrorTip="Введите код">
                        <input nz-input formControlName="code" placeholder="windows, macos, etc." />
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col nzSpan="8">
                    <nz-form-item>
                      <nz-form-label>Семейство</nz-form-label>
                      <nz-form-control>
                        <nz-select formControlName="family" nzPlaceHolder="Выберите семейство">
                          <nz-option nzValue="desktop" nzLabel="Desktop"></nz-option>
                          <nz-option nzValue="mobile" nzLabel="Mobile"></nz-option>
                          <nz-option nzValue="web" nzLabel="Web"></nz-option>
                        </nz-select>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col nzSpan="6">
                    <nz-form-item>
                      <nz-form-label>Порядок сортировки</nz-form-label>
                      <nz-form-control>
                        <nz-input-number
                          formControlName="sortOrder"
                          [nzMin]="0"
                          style="width: 100%"
                        ></nz-input-number>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                  <div nz-col nzSpan="6">
                    <nz-form-item>
                      <nz-form-label>Активность</nz-form-label>
                      <nz-form-control>
                        <nz-switch
                          formControlName="isActive"
                          nzCheckedChildren="Да"
                          nzUnCheckedChildren="Нет"
                        ></nz-switch>
                      </nz-form-control>
                    </nz-form-item>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div nz-col nzSpan="24">
            <nz-divider nzText="Локализация и SEO" nzOrientation="left"></nz-divider>
          </div>

          <!-- Табы по языкам -->
          <div nz-col nzSpan="24">
            <nz-tabset [(nzSelectedIndex)]="selectedTabIndex" [nzAnimated]="false">
              <nz-tab *ngFor="let lang of languages; let i = index" [nzTitle]="lang.nativeTitle">
                <ng-template nz-tab>
                  <div
                    class="tab-content"
                    *ngIf="getDescFormGroup(lang.id) as descGroup"
                    [formGroup]="descGroup"
                  >
                    <div nz-row [nzGutter]="16">
                      <!-- Локализованное изображение -->
                      <div nz-col nzSpan="6">
                        <nz-form-item>
                          <nz-form-label>Изображение ({{ lang.code }})</nz-form-label>
                          <nz-form-control>
                            <div
                              class="custom-image-uploader"
                              style="width: 100%; height: 200px; cursor: pointer;"
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
                                  style="font-size: 28px; color: #40a9ff; margin-bottom: 8px;"
                                ></span>
                                <div style="text-align: center; color: #8c8c8c; font-size: 12px;">
                                  Загрузить фото<br />({{ lang.nativeTitle }})
                                </div>
                              </div>

                              <!-- PREVIEW STATE -->
                              <div
                                class="image-preview-wrapper"
                                *ngIf="getDisplayLangImage(lang.id) as langImgUrl"
                              >
                                <img [src]="getImageUrl(langImgUrl)" class="main-preview-img" />
                                <div class="overlay-actions">
                                  <span nz-icon nzType="edit" nzTheme="outline"></span>
                                </div>
                                <!-- Индикатор наследования -->
                                <div class="inherited-badge" *ngIf="isLangImageInherited(lang.id)">
                                  <span nz-icon nzType="link" nzTheme="outline"></span>
                                  Главное
                                </div>
                              </div>
                            </div>
                          </nz-form-control>
                        </nz-form-item>
                      </div>
                      <div nz-col nzSpan="18">
                        <div nz-row [nzGutter]="16">
                          <div nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="lang.code.toLowerCase().startsWith('en')"
                                >Локализованное название ({{ lang.nativeTitle }})</nz-form-label
                              >
                              <nz-form-control nzErrorTip="Введите название">
                                <input
                                  nz-input
                                  formControlName="name"
                                  [placeholder]="'Название на ' + lang.nativeTitle"
                                />
                              </nz-form-control>
                            </nz-form-item>
                          </div>
                          <div nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-label>Описание</nz-form-label>
                              <nz-form-control>
                                <textarea
                                  nz-input
                                  formControlName="description"
                                  [nzAutosize]="{ minRows: 2, maxRows: 6 }"
                                ></textarea>
                              </nz-form-control>
                            </nz-form-item>
                          </div>
                        </div>
                      </div>

                      <!-- HTML Контент (TinyMCE) -->
                      <div nz-col nzSpan="24">
                        <nz-form-item>
                          <nz-form-label>Основной контент ({{ lang.code }})</nz-form-label>
                          <nz-form-control>
                            <av-tinymce-control
                              formControlName="descriptionFull"
                              [height]="400"
                              placeholder="Введите подробное описание платформы..."
                            ></av-tinymce-control>
                          </nz-form-control>
                        </nz-form-item>
                      </div>

                      <!-- SEO для каждого языка -->
                      <div nz-col nzSpan="24" style="margin-top: 16px;">
                        <nz-collapse [nzBordered]="false">
                          <nz-collapse-panel [nzHeader]="'SEO Параметры (' + lang.code + ')'">
                            <app-seo-form
                              *ngIf="getSeoFormGroup(lang.id)"
                              [form]="getSeoFormGroup(lang.id)"
                              [sourceName]="descGroup.get('name')?.value"
                              [sourceDescription]="descGroup.get('description')?.value"
                            ></app-seo-form>
                          </nz-collapse-panel>
                        </nz-collapse>
                      </div>
                    </div>
                  </div>
                </ng-template>
              </nz-tab>
            </nz-tabset>
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
        padding: 16px 0;
      }
      .no-langs-state {
        padding: 40px;
        text-align: center;
      }
      ::ng-deep .ant-collapse-header {
        font-weight: 500;
      }

      /* Image Uploader Styles */
      .custom-image-uploader {
        position: relative;
        border: 2px dashed #d9d9d9;
        border-radius: 8px;
        background: #fafafa;
        transition: all 0.3s;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: #40a9ff;
          background: #e6f7ff;
        }

        &.has-image {
          border-style: solid;
          border-color: #1890ff;
          background: #fff;
        }

        &.is-inherited {
          border-color: #52c41a;
        }
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }

      .image-preview-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

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
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
          color: #fff;
          font-size: 24px;

          &:hover {
            opacity: 1;
          }
        }

        .inherited-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #52c41a;
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    `,
  ],
})
export class PlatformFormComponent implements OnInit {
  @Input() loading = false;
  @Input() set initialData(item: any) {
    if (item) this.patchForm(item);
    else this.resetForm();
  }

  @Output() save = new EventEmitter<any>();

  form: FormGroup;
  selectedTabIndex = 0;
  languages: AppLanguage[] = [];

  constructor(
    private fb: FormBuilder,
    private langService: LanguageService,
    private cdr: ChangeDetectorRef,
    private message: NzMessageService,
    private vsModal: VSModalService,
  ) {
    this.form = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      code: ['', Validators.required],
      family: [null],
      urlPictureMain: [null],
      sortOrder: [100],
      isActive: [true],
      translations: this.fb.array([]),
    });

    toObservable(this.langService.availableLanguages).subscribe((langs) => {
      if (langs?.length) {
        this.languages = langs;
        this.initTranslationTabs();
      }
    });
  }

  ngOnInit(): void {}

  private initTranslationTabs(): void {
    const translations = this.form.get('translations') as FormArray;
    translations.clear();
    this.languages.forEach((lang) => {
      translations.push(
        this.fb.group({
          languageId: [lang.id],
          name: ['', lang.code.toLowerCase().startsWith('en') ? Validators.required : []],
          description: [''],
          descriptionFull: [''],
          urlPicture: [null],
          seoData: SeoFormComponent.createSeoForm(this.fb),
        }),
      );
    });
    this.cdr.markForCheck();
  }

  get translationsArray(): FormArray {
    return this.form.get('translations') as FormArray;
  }

  getDescFormGroup(langId: number): FormGroup | null {
    return (
      (this.translationsArray.controls.find((c) => c.value.languageId === langId) as FormGroup) ||
      null
    );
  }

  getSeoFormGroup(langId: number): FormGroup {
    return this.getDescFormGroup(langId)?.get('seoData') as FormGroup;
  }

  /** Получить контрол HTML контента для текущей вкладки */
  get currentHtmlControl(): any {
    const translations = this.translationsArray;
    if (!translations || translations.length <= this.selectedTabIndex) return null;
    return translations.at(this.selectedTabIndex).get('descriptionFull');
  }

  patchForm(item: any): void {
    this.form.patchValue({
      id: item.id,
      name: item.name,
      code: item.code,
      family: item.family,
      urlPictureMain: item.urlPictureMain,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });

    item.translations?.forEach((t: any) => {
      const group = this.getDescFormGroup(t.languageId);
      if (group) {
        group.patchValue({
          name: t.name,
          description: t.description,
          descriptionFull: t.descriptionFull,
          urlPicture: t.urlPicture,
        });
        if (t.seoData) group.get('seoData')?.patchValue(t.seoData);
      }
    });
    this.cdr.markForCheck();
  }

  resetForm(): void {
    this.form.reset({ sortOrder: 100, isActive: true });
    this.initTranslationTabs();
    this.selectedTabIndex = 0;
  }

  private getInvalidFieldsLabels(): string[] {
    const labels: string[] = [];

    // Проверка основных полей
    if (this.form.get('name')?.invalid) labels.push('Техническое название');
    if (this.form.get('code')?.invalid) labels.push('Системный код');

    // Проверка полей в переводах
    this.translationsArray.controls.forEach((ctrl, index) => {
      const lang = this.languages[index];
      const isEnglish = lang?.code.toLowerCase().startsWith('en');
      const hasName = !!ctrl.get('name')?.value;

      // Проверяем ошибки только если это обязательный английский или если пользователь начал заполнять другой язык
      if ((isEnglish || hasName) && ctrl.invalid) {
        const langSuffix = lang ? ` (${lang.nativeTitle})` : ` (Вкладка ${index + 1})`;
        const group = ctrl as FormGroup;

        if (group.get('name')?.invalid) {
          labels.push(`Локализованное название${langSuffix}`);
        }

        // Проверка SEO полей
        const seo = group.get('seoData') as FormGroup;
        if (seo?.invalid) {
          if (seo.get('metaTitle')?.invalid) labels.push(`SEO Title${langSuffix}`);
          if (seo.get('metaDescription')?.invalid) labels.push(`SEO Description${langSuffix}`);
          if (seo.get('urlSlug')?.invalid) labels.push(`URL Slug${langSuffix}`);
        }
      }
    });

    return labels;
  }

  submitForm(): void {
    const invalidFields = this.getInvalidFieldsLabels();

    if (invalidFields.length === 0) {
      const rawValue = this.form.getRawValue();

      // Фильтруем: оставляем английский (обязательный) И те языки, где введено название
      const filteredTranslations = rawValue.translations.filter((t: any, index: number) => {
        const lang = this.languages[index];
        const isEnglish = lang?.code.toLowerCase().startsWith('en');
        const hasName = !!t.name?.trim();
        return isEnglish || hasName;
      });

      this.save.emit({
        ...rawValue,
        translations: filteredTranslations,
      });
    } else {
      this.markFormGroupDirty(this.form);
      const message = `Не заполнены или некорректны поля: ${invalidFields.join(', ')}`;
      this.message.warning(message, { nzDuration: 6000 });
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
   * Получить URL изображения (с преобразованием относительных путей)
   */
  getImageUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    return `${environment.apiUrl}${url}`;
  }

  /**
   * Получить отображаемое изображение для языка (локализованное или главное)
   */
  getDisplayLangImage(langId: number): string | null {
    const group = this.getDescFormGroup(langId);
    const localUrl = group?.get('urlPicture')?.value;
    const mainUrl = this.form.get('urlPictureMain')?.value;
    return localUrl || mainUrl;
  }

  /**
   * Проверить, наследуется ли изображение от главного
   */
  isLangImageInherited(langId: number): boolean {
    const group = this.getDescFormGroup(langId);
    const localUrl = group?.get('urlPicture')?.value;
    return !localUrl && !!this.form.get('urlPictureMain')?.value;
  }

  /**
   * Открыть VS Editor для главного изображения
   */
  openVsEditorForMain(): void {
    const config: ImageEditorConfig = {
      title: 'Главное изображение платформы',
      defaultQuality: 90,
      defaultFormat: 'image/jpeg',
    };

    const ref = this.vsModal.open(ImageEditorMainComponent, {
      title: 'Aurora Studio VS - Обложка платформы',
      width: '85vw',
      height: '95vh',
      data: config,
      draggable: true,
      resizable: true,
    });

    ref.afterClosed().subscribe((result: any) => {
      if (result && result.url) {
        this.form.patchValue({ urlPictureMain: result.url });
        this.cdr.markForCheck();
        this.message.success('Главное изображение обновлено');
      }
    });
  }

  /**
   * Открыть VS Editor для локализованного изображения
   */
  openVsEditorForLang(langId: number): void {
    const group = this.getDescFormGroup(langId);
    if (!group) return;

    const lang = this.languages.find((l) => l.id === langId);

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
        group.patchValue({ urlPicture: result.url });
        this.cdr.markForCheck();
        this.message.success(`Изображение для ${lang?.nativeTitle} обновлено`);
      }
    });
  }
}
