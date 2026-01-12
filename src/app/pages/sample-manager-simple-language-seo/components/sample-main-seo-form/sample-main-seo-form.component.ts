import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { TinymceEditorComponent } from '../../../../shared/components/ui/tinymce-editor/tinymce-editor.component';

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
    TinymceEditorComponent,
    AvImagePickerComponent,
  ],
  template: `
    <nz-spin [nzSpinning]="loading">
      <form nz-form *ngIf="form" [formGroup]="form" nzLayout="vertical">
        <!-- ОБЩИЕ НАСТРОЙКИ (Всегда сверху) -->
        <div class="general-section">
          <div nz-row [nzGutter]="16">
            <div nz-col nzSpan="10">
              <nz-form-item>
                <nz-form-label nzRequired>Техническое название</nz-form-label>
                <nz-form-control nzErrorTip="Введите название">
                  <input nz-input formControlName="name" placeholder="Напр: Home Page" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col nzSpan="10">
              <nz-form-item>
                <nz-form-label>Системный код</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="systemCode" placeholder="Напр: HOME_PAGE" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col nzSpan="4">
              <nz-form-item>
                <nz-form-label>Статус записи</nz-form-label>
                <nz-form-control>
                  <nz-switch
                    formControlName="isActive"
                    nzCheckedChildren="Активен"
                    nzUnCheckedChildren="Черновик"
                  ></nz-switch>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <!-- Главная картинка -->
          <div nz-row [nzGutter]="16">
            <div nz-col nzSpan="24">
              <nz-form-item>
                <nz-form-label>Главное изображение (по умолчанию)</nz-form-label>
                <nz-form-control>
                  <app-av-image-picker
                    formControlName="urlPictureMain"
                    [aspectRatio]="16 / 9"
                  ></app-av-image-picker>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
        </div>

        <nz-divider nzText="Локализация и Контент"></nz-divider>

        <!-- ТАБЫ: Языки -->
        <nz-tabset [(nzSelectedIndex)]="selectedTabIndex">
          <nz-tab *ngFor="let lang of languages; let i = index" [nzTitle]="langTemplate">
            <ng-template #langTemplate>
              {{ lang.nativeTitle }}
            </ng-template>

            <div
              class="tab-content"
              *ngIf="getDescFormGroup(lang.id) as descGroup"
              [formGroup]="descGroup"
            >
              <!-- Заголовок и Картинка в одном ряду -->
              <div nz-row [nzGutter]="16">
                <div nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label nzRequired>Заголовок ({{ lang.code }})</nz-form-label>
                    <nz-form-control nzErrorTip="Введите заголовок">
                      <input
                        nz-input
                        formControlName="name"
                        [placeholder]="'Название на ' + lang.nativeTitle"
                      />
                    </nz-form-control>
                  </nz-form-item>
                </div>
                <div nz-col nzSpan="12">
                  <nz-form-item>
                    <nz-form-label>Изображение ({{ lang.code }})</nz-form-label>
                    <nz-form-control nzExtra="Если пусто — используется главное">
                      <app-av-image-picker
                        formControlName="urlPicture"
                        [aspectRatio]="16 / 9"
                      ></app-av-image-picker>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </div>

              <nz-form-item>
                <nz-form-label>Краткое описание (Intro)</nz-form-label>
                <nz-form-control>
                  <textarea
                    nz-input
                    formControlName="description"
                    [nzAutosize]="{ minRows: 2, maxRows: 4 }"
                    placeholder="Пара предложений для превью..."
                  ></textarea>
                </nz-form-control>
              </nz-form-item>

              <nz-form-item>
                <nz-form-label>Полный текст статьи</nz-form-label>
                <nz-form-control>
                  <app-tinymce-editor
                    formControlName="htmlContent"
                    [height]="400"
                  ></app-tinymce-editor>
                </nz-form-control>
              </nz-form-item>

              <!-- SEO БЛОК С ВОЗМОЖНОСТЬЮ СВОРАЧИВАНИЯ -->
              <div class="seo-collapse-container">
                <nz-collapse [nzBordered]="false">
                  <nz-collapse-panel
                    [nzHeader]="'SEO Настройки (' + lang.code + ')'"
                    [nzActive]="false"
                    [nzShowArrow]="true"
                  >
                    <!-- УНИВЕРСАЛЬНЫЙ SEO КОМПОНЕНТ -->
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
          </nz-tab>
        </nz-tabset>

        <!-- Кнопки действий (показываем только если не в модалке) -->
        <div class="form-actions" *ngIf="showInlineActions">
          <nz-divider></nz-divider>
          <div class="buttons-row">
            <button nz-button nzType="default" (click)="cancel.emit()">Отмена</button>
            <button nz-button nzType="primary" (click)="submitForm()" [nzLoading]="loading">
              Сохранить
            </button>
          </div>
        </div>
      </form>
    </nz-spin>
  `,
  styles: [
    `
      .tab-content {
        padding: 24px 0;
        min-height: 400px;
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
  }

  get descriptionsArray(): FormArray {
    return this.form.get('descriptions') as FormArray;
  }

  getDescFormGroup(langId: number): FormGroup | null {
    const descs = this.descriptionsArray;
    if (!descs) return null;
    return descs.controls.find((c) => c.value.languageAppId === langId) as FormGroup;
  }

  getSeoFormGroup(langId: number): FormGroup {
    const descGroup = this.getDescFormGroup(langId);
    return (descGroup ? descGroup.get('seoData') : null) as FormGroup;
  }

  // Возвращает URL картинки для превью (с учетом фоллбека)
  getPreviewUrl(langId: number): string | null {
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
