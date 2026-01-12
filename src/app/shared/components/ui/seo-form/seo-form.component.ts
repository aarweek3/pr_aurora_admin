import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';

@Component({
  selector: 'app-seo-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzTabsModule,
    NzCollapseModule,
    NzSwitchModule,
    NzInputNumberModule,
    NzGridModule,
  ],
  template: `
    <div *ngIf="form" [formGroup]="form" class="seo-form-container">
      <!-- GOOGLE SNIPPET PREVIEW -->
      <div class="google-preview-box">
        <div class="preview-header">
          <span>Google Search Preview</span>
          <button nz-button nzType="link" nzSize="small" (click)="autoFill()" *ngIf="!readonly">
            <i nz-icon nzType="magic" nzTheme="outline"></i> Волшебная палочка
          </button>
        </div>
        <div class="google-preview">
          <div class="preview-url">
            https://example.com › {{ form.get('urlSlug')?.value || 'page-url' }}
          </div>
          <div class="preview-title">
            {{ form.get('metaTitle')?.value || 'Заголовок страницы в результатах поиска' }}
          </div>
          <div class="preview-description">
            {{
              form.get('metaDescription')?.value ||
                'Здесь будет отображаться описание страницы в поисковой выдаче Google. Рекомендуется заполнять этот тег для повышения кликабельности.'
            }}
          </div>
        </div>
      </div>

      <nz-collapse nzAccordion>
        <nz-collapse-panel nzHeader="Основные SEO-теги" [nzActive]="true">
          <div nz-row [nzGutter]="16">
            <div nz-col nzSpan="24">
              <nz-form-item>
                <nz-form-label [nzNoColon]="true">
                  Meta Title
                  <span
                    class="char-counter"
                    [class.warning]="
                      (form.get('metaTitle')?.value?.length || 0) > 70 ||
                      ((form.get('metaTitle')?.value?.length || 0) > 0 &&
                        (form.get('metaTitle')?.value?.length || 0) < 5)
                    "
                  >
                    {{ form.get('metaTitle')?.value?.length || 0 }}/70
                  </span>
                </nz-form-label>
                <nz-form-control [nzErrorTip]="metaTitleError">
                  <ng-template #metaTitleError>
                    <span *ngIf="form.get('metaTitle')?.hasError('minlength')"
                      >Заголовок слишком короткий (мин. 5 симв.)</span
                    >
                    <span *ngIf="form.get('metaTitle')?.hasError('maxlength')"
                      >Заголовок слишком длинный (макс. 70 симв.)</span
                    >
                  </ng-template>
                  <input
                    nz-input
                    formControlName="metaTitle"
                    placeholder="Тег Title"
                    [readonly]="readonly"
                  />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col nzSpan="24">
              <nz-form-item>
                <nz-form-label [nzNoColon]="true">
                  Meta Description
                  <span
                    class="char-counter"
                    [class.warning]="
                      (form.get('metaDescription')?.value?.length || 0) > 160 ||
                      ((form.get('metaDescription')?.value?.length || 0) > 0 &&
                        (form.get('metaDescription')?.value?.length || 0) < 10)
                    "
                  >
                    {{ form.get('metaDescription')?.value?.length || 0 }}/160
                  </span>
                </nz-form-label>
                <nz-form-control [nzErrorTip]="metaDescriptionError">
                  <ng-template #metaDescriptionError>
                    <span *ngIf="form.get('metaDescription')?.hasError('minlength')"
                      >META описание слишком короткое (мин. 10 симв.)</span
                    >
                    <span *ngIf="form.get('metaDescription')?.hasError('maxlength')"
                      >META описание слишком длинное (макс. 160 симв.)</span
                    >
                  </ng-template>
                  <textarea
                    nz-input
                    formControlName="metaDescription"
                    [nzAutosize]="{ minRows: 2 }"
                    placeholder="Тег Description"
                    [readonly]="readonly"
                  ></textarea>
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col nzSpan="24">
              <nz-form-item>
                <nz-form-label>Url Slug (ЧПУ)</nz-form-label>
                <nz-form-control [nzErrorTip]="urlSlugError">
                  <ng-template #urlSlugError>
                    <span *ngIf="form.get('urlSlug')?.hasError('pattern')"
                      >Только строчные латинские буквы, цифры и дефис</span
                    >
                    <span *ngIf="form.get('urlSlug')?.hasError('maxlength')"
                      >Slug слишком длинный (макс. 200 симв.)</span
                    >
                  </ng-template>
                  <input
                    nz-input
                    formControlName="urlSlug"
                    placeholder="my-awesome-url"
                    [readonly]="readonly"
                  />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
        </nz-collapse-panel>

        <nz-collapse-panel nzHeader="Social Media (Open Graph & Twitter)">
          <nz-tabset nzSize="small">
            <nz-tab nzTitle="Open Graph (FB/VK)">
              <nz-form-item>
                <nz-form-label>OG Title</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="ogTitle" [readonly]="readonly" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>OG Description</nz-form-label>
                <nz-form-control>
                  <textarea
                    nz-input
                    formControlName="ogDescription"
                    [nzAutosize]="{ minRows: 2 }"
                    [readonly]="readonly"
                  ></textarea>
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>OG Image URL</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="ogImage" [readonly]="readonly" />
                </nz-form-control>
              </nz-form-item>
            </nz-tab>
            <nz-tab nzTitle="Twitter Card">
              <nz-form-item>
                <nz-form-label>Twitter Title</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="twitterTitle" [readonly]="readonly" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>Twitter Description</nz-form-label>
                <nz-form-control>
                  <textarea
                    nz-input
                    formControlName="twitterDescription"
                    [nzAutosize]="{ minRows: 2 }"
                    [readonly]="readonly"
                  ></textarea>
                </nz-form-control>
              </nz-form-item>
            </nz-tab>
          </nz-tabset>
        </nz-collapse-panel>

        <nz-collapse-panel nzHeader="Изображения & Alt">
          <div nz-row [nzGutter]="16">
            <div nz-col nzSpan="24">
              <nz-form-item>
                <nz-form-label>Image Alt Text</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="imageAltText" [readonly]="readonly" />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col nzSpan="24">
              <nz-form-item>
                <nz-form-label>Image Caption</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="imageCaption" [readonly]="readonly" />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
        </nz-collapse-panel>

        <nz-collapse-panel nzHeader="Настройки индексации & Robots">
          <div nz-row [nzGutter]="16">
            <div nz-col nzSpan="8">
              <nz-form-item>
                <nz-form-label>Не индексировать</nz-form-label>
                <nz-form-control>
                  <nz-switch formControlName="noIndex" [nzDisabled]="readonly"></nz-switch>
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col nzSpan="8">
              <nz-form-item>
                <nz-form-label>Не переходить</nz-form-label>
                <nz-form-control>
                  <nz-switch formControlName="noFollow" [nzDisabled]="readonly"></nz-switch>
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col nzSpan="8">
              <nz-form-item>
                <nz-form-label>Приоритет (0-10)</nz-form-label>
                <nz-form-control>
                  <nz-input-number
                    formControlName="priority"
                    [nzMin]="0"
                    [nzMax]="10"
                    [nzStep]="1"
                    [nzDisabled]="readonly"
                  ></nz-input-number>
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>
        </nz-collapse-panel>
      </nz-collapse>
    </div>
  `,
  styles: [
    `
      .seo-form-container {
        display: block;
        margin-top: 16px;
      }
      .google-preview-box {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
      }
      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 600;
        font-size: 12px;
        color: #6c757d;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .google-preview {
        background: white;
        padding: 12px 16px;
        border-radius: 4px;
        border: 1px solid #dfe1e5;
        font-family: arial, sans-serif;
      }
      .preview-url {
        color: #202124;
        font-size: 14px;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .preview-title {
        color: #1a0dab;
        font-size: 18px;
        line-height: 1.3;
        margin-bottom: 4px;
        cursor: pointer;
      }
      .preview-title:hover {
        text-decoration: underline;
      }
      .preview-description {
        color: #4d5156;
        font-size: 14px;
        line-height: 1.58;
        word-wrap: break-word;
      }
      .char-counter {
        float: right;
        font-weight: normal;
        font-size: 11px;
        color: #8c8c8c;
      }
      .char-counter.warning {
        color: #ff4d4f;
      }
    `,
  ],
})
export class SeoFormComponent {
  @Input() form!: FormGroup;
  @Input() readonly = false;
  @Input() sourceName = '';
  @Input() sourceDescription = '';

  autoFill(): void {
    if (this.sourceName && !this.form.get('metaTitle')?.value) {
      this.form.get('metaTitle')?.setValue(this.sourceName);
    }
    if (this.sourceDescription && !this.form.get('metaDescription')?.value) {
      this.form.get('metaDescription')?.setValue(this.sourceDescription);
    }

    // OG/Twitter fallbacks if empty
    if (this.form.get('metaTitle')?.value) {
      if (!this.form.get('ogTitle')?.value)
        this.form.get('ogTitle')?.setValue(this.form.get('metaTitle')?.value);
      if (!this.form.get('twitterTitle')?.value)
        this.form.get('twitterTitle')?.setValue(this.form.get('metaTitle')?.value);
    }

    if (this.form.get('metaDescription')?.value) {
      if (!this.form.get('ogDescription')?.value)
        this.form.get('ogDescription')?.setValue(this.form.get('metaDescription')?.value);
      if (!this.form.get('twitterDescription')?.value)
        this.form.get('twitterDescription')?.setValue(this.form.get('metaDescription')?.value);
    }

    // Slug generation
    if (this.sourceName && !this.form.get('urlSlug')?.value) {
      const slug = this.sourceName
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.form.get('urlSlug')?.setValue(slug);
    }
  }

  static createSeoForm(fb: FormBuilder): FormGroup {
    return fb.group({
      metaTitle: ['', [Validators.minLength(5), Validators.maxLength(70)]],
      metaDescription: ['', [Validators.minLength(10), Validators.maxLength(160)]],
      metaKeywords: [''],
      urlSlug: ['', [Validators.maxLength(200), Validators.pattern(/^[a-z0-9-]+$/)]],
      canonicalUrl: [''],
      ogTitle: [''],
      ogDescription: [''],
      ogImage: [''],
      ogType: ['article'],
      ogUrl: [''],
      twitterCard: ['summary_large_image'],
      twitterTitle: [''],
      twitterDescription: [''],
      twitterImage: [''],
      imageUrl: [''],
      imageAltText: [''],
      imageCaption: [''],
      schemaType: ['Article'],
      schemaJsonLd: [null],
      authorName: [''],
      publisherName: [''],
      publishedDate: [null],
      noIndex: [false],
      noFollow: [false],
      priority: [5],
      region: [''],
    });
  }
}
