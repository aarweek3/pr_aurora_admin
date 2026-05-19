import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { catchError, filter, finalize, map, switchMap, takeUntil } from 'rxjs/operators';

import { ModalService } from '@shared/components/ui/modal/services/modal.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';

import { LanguageService } from '@language-app';
import { AppLanguage } from '@language-app/models/appLanguage.model';
import { AvUniversalUploadModalComponent } from '@shared/components/av-universal-upload-modal/av-universal-upload-modal.component';
import { ImageServiceUniversal } from '@shared/services/image-service-universal.service';
import { ProgramLocalizationFormComponent } from './components/program-localization-form/program-localization-form.component';

import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '@core/models/error-response.model';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import {
  CategoryItemDto,
  SubcategoryItemDto,
} from '../../../CategorySimplifiedPage/models/category-simplified.model';
import { DeveloperOfAggregatorItem } from '../../../DeveloperOfAggregatorPage/models/developer-of-aggregator.model';
import { PlatformOfAggregatorItemDto } from '../../../PlatformOfAggregatorPage/models/platform-of-aggregator.model';
import { ProgramOfAggregatorCreate } from '../../models/program-of-aggregator.model';
import { ScreenshotOfAggregator } from '../../models/screenshot-of-aggregator.model';
import { ProgramOfAggregatorApiService } from '../../services/program-of-aggregator-api.service';
import { ProgramScreenshotApiService } from '../../services/program-screenshot-api.service';
import { ProgramScreenshotManagerComponent } from '../program-screenshot-manager/program-screenshot-manager.component';
import { ProgramVersionManagerComponent } from '../program-version-manager/program-version-manager.component';
import { ProgramFormBuilderService } from './program-form-builder.service';
import { ProgramLookupService } from './program-lookup.service';
import tooltips from './program-tooltips.json';

@Component({
  selector: 'app-program-add-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NzFormModule,
    NzInputModule,
    NzSwitchModule,
    NzSpinModule,
    NzGridModule,
    NzDividerModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzPageHeaderModule,
    NzBreadCrumbModule,
    NzSpaceModule,
    NzAlertModule,
    NzCardModule,
    NzTagModule,
    NzBadgeModule,
    NzToolTipModule,
    NzModalModule,
    NzTreeSelectModule,
    ProgramVersionManagerComponent,
    ProgramScreenshotManagerComponent,
    ProgramLocalizationFormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './program-add-wizard.component.html',
  styleUrl: './program-add-wizard.component.scss',
})
export class ProgramAddWizardComponent implements OnInit, OnDestroy {
  public tooltips = tooltips;
  private formBuilderService = inject(ProgramFormBuilderService);
  private lookupService = inject(ProgramLookupService);
  private api = inject(ProgramOfAggregatorApiService);
  private langService = inject(LanguageService);
  public imgService = inject(ImageServiceUniversal);
  private cdr = inject(ChangeDetectorRef);
  private message = inject(NzMessageService);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private screenshotApi = inject(ProgramScreenshotApiService);

  private destroy$ = new Subject<void>();
  private languages$ = toObservable(this.langService.availableLanguages);

  form: FormGroup;
  languages: AppLanguage[] = [];
  loading = false;
  slugLocked = true;
  programId: string | null = null;

  // Options
  categoryTree: NzTreeNodeOptions[] = [];
  developers: DeveloperOfAggregatorItem[] = [];
  platforms: PlatformOfAggregatorItemDto[] = [];
  simplifiedCategories: CategoryItemDto[] = [];
  subcategories: SubcategoryItemDto[] = [];
  subcategoriesLoading = false;

  constructor() {
    this.form = this.formBuilderService.createProgramForm();
  }

  ngOnInit(): void {
    this.loadDictionaries();
    this.initLanguages();
    this.initFormSync();
  }

  private initFormSync(): void {
    this.form
      .get('canonicalName')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        // 1. Синхронизация Slug (если замок закрыт)
        if (this.slugLocked && val) {
          this.form.get('slug')?.setValue(this.generateSlug(val), { emitEvent: false });
        }
        // 2. Синхронизация имени в первой локализации (обычно English)
        this.syncPrimaryLanguageName(val);
      });

    this.form
      .get('slug')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((val) => {
        if (val) {
          const cleaned = this.generateSlug(val);
          if (cleaned !== val) {
            this.form.get('slug')?.setValue(cleaned, { emitEvent: false });
          }
        }
      });
  }

  private generateSlug(val: string): string {
    return val
      .toLowerCase()
      .replace(/_/g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  private syncPrimaryLanguageName(val: string): void {
    const locs = this.form.get('localizations') as FormArray;
    if (locs.length > 0) {
      const firstLoc = locs.at(0);
      // Обновляем только если пользователь сам там еще ничего не написал или если значение совпадает с предыдущим каноническим
      const currentLocName = firstLoc.get('name')?.value;
      if (!currentLocName || currentLocName === this.form.get('canonicalName')?.value) {
        // ВАЖНО: Мы не используем emitEvent: false, чтобы сработал input listener для SEO
      }

      // Для простоты: если поле пустое, всегда синхронизируем
      if (!currentLocName) {
        firstLoc.get('name')?.setValue(val);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initLanguages(): void {
    this.languages$
      .pipe(
        filter((langs) => !!langs && langs.length > 0),
        takeUntil(this.destroy$),
      )
      .subscribe((langs) => {
        this.languages = langs;
        this.buildLocForm();
        this.cdr.markForCheck();
      });
  }

  private buildLocForm(): void {
    this.formBuilderService.buildLocForm(this.form, this.languages);
  }

  private loadDictionaries(): void {
    this.loading = true;
    this.lookupService
      .loadAllLookups()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        this.categoryTree = res.categoryTree;
        this.developers = res.developers;
        this.platforms = res.platforms;
        this.simplifiedCategories = res.simplifiedCategories;
      });
  }

  onSimplifiedCategoryChange(categoryId: number): void {
    this.form.get('subcategoryId')?.setValue(null);
    this.subcategories = [];

    if (!categoryId) return;

    this.subcategoriesLoading = true;
    this.cdr.markForCheck();

    this.lookupService
      .getSubcategories(categoryId)
      .pipe(
        finalize(() => {
          this.subcategoriesLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res) => {
        this.subcategories = res;
      });
  }

  createBase(): void {
    if (this.form.get('canonicalName')?.invalid || this.form.get('slug')?.invalid) return;

    this.loading = true;
    this.cdr.markForCheck();

    const baseDto: ProgramOfAggregatorCreate = {
      canonicalName: this.form.get('canonicalName')?.value,
      slug: this.form.get('slug')?.value,
      mainPlatformId: this.form.get('mainPlatformId')?.value,
      categoryOfAggregatorId: this.form.get('categoryOfAggregatorId')?.value || 1,
      categoryId: this.form.get('categoryId')?.value,
      subcategoryId: this.form.get('subcategoryId')?.value,
      developerOfAggregatorId: this.form.get('developerOfAggregatorId')?.value || 1,
      website: this.form.get('website')?.value,
      youtubeVideoUrl: this.form.get('youtubeVideoUrl')?.value,
      customVideoUrl: this.form.get('customVideoUrl')?.value,
      status: this.form.get('status')?.value || 0,
      isActive: this.form.get('isActive')?.value || false,
      localizations: [],
      sortOrder: 0,
      platformIds: this.form.get('platformIds')?.value || [],
      tagIds: this.form.get('tagIds')?.value || [],
    };

    this.api.create(baseDto).subscribe({
      next: (id: number) => {
        this.programId = id.toString();
        this.loading = false;

        // Показываем красивое модальное окно по нашему шаблону
        this.modalService.success(
          `<div style="text-align: center; padding: 8px 0;">
             <div style="font-size: 1.15em; margin-bottom: 16px; color: #262626;">
               Программа <b style="color: #52c41a;">«${this.form.get('canonicalName')?.value}»</b> успешно создана.
             </div>
             <div style="display: inline-block; background: #f6ffed; border: 1px solid #b7eb8f; padding: 6px 20px; border-radius: 30px; color: #389e0d; font-weight: 800; font-family: SFMono-Regular, Consolas, monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
               ID: ${id}
             </div>
             <div style="margin-top: 16px; font-size: 0.9em; color: #8c8c8c;">
               Теперь вы можете продолжить заполнение справочников и локализаций.
             </div>
           </div>`,
          'Запись создана',
          true,
        );

        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        this.loading = false;
        this.cdr.markForCheck();

        // Извлекаем статус ошибки безопасным образом
        let status: number | undefined;
        if (err instanceof HttpErrorResponse || err instanceof ErrorResponse) {
          status = err.status;
        } else if (err && typeof err === 'object' && 'status' in err) {
          status = (err as { status: number }).status;
        }

        // Если это не 409 Conflict, показываем локальное сообщение об ошибке (как fallback)
        if (status !== 409) {
          let message = '';
          if (err instanceof ErrorResponse) {
            message = err.detail || err.userMessage || 'Неизвестная ошибка';
          } else if (err instanceof HttpErrorResponse) {
            message = err.error?.message || err.message;
          } else if (err instanceof Error) {
            message = err.message;
          } else {
            message = typeof err === 'string' ? err : 'Неизвестная ошибка';
          }

          this.modalService.error(
            `<div style="margin-top: 8px;">К сожалению, не удалось создать запись.</div>
             <div style="margin-top: 16px; padding: 12px; background: #fff1f0; border-radius: 8px; border: 1px solid #ffa39e;">
               <b style="color: #cf1322;">Причина:</b> ${message}
             </div>`,
            'Ошибка при создании',
          );
        }
      },
    });
  }

  toggleSlugLock(): void {
    this.slugLocked = !this.slugLocked;
  }

  onScreenshotsChanged(screenshots: ScreenshotOfAggregator[]): void {
    this.form.get('screenshots')?.setValue(screenshots);
    this.form.get('screenshots')?.markAsDirty();
    this.cdr.markForCheck();
  }

  isStep1Valid(): boolean {
    const canonicalName = this.form.get('canonicalName');
    const mainPlatformId = this.form.get('mainPlatformId');
    const slug = this.form.get('slug');
    return !!(canonicalName?.valid && mainPlatformId?.valid && slug?.valid);
  }

  openIconUploadModal(): void {
    const slug = (this.form.get('slug')?.value || '').trim();
    const firstChar = slug.charAt(0).toLowerCase();
    const folderSuffix = /^[a-z0-9]$/.test(firstChar) ? firstChar : 'a';
    const targetFolder = `programs/icons/${folderSuffix}`;

    const modalRef = this.modalService.open(AvUniversalUploadModalComponent, {
      data: {
        folder: targetFolder,
        title: 'Загрузка иконки программы',
        fileName: slug || undefined,
      },
      width: '700px',
    });

    modalRef.afterClosed().subscribe((result: unknown) => {
      const res = result as { relativePath?: string } | undefined;
      if (res?.relativePath) {
        this.form.patchValue({ iconPath: res.relativePath });
        this.cdr.markForCheck();
      }
    });
  }

  async save(): Promise<void> {
    if (this.form.invalid) {
      const errors = this.formBuilderService.getFormValidationErrors(this.form, this.languages);

      this.modalService.error(
        `<div style="margin-top: 8px; font-size: 1.05em;">Невозможно сохранить программу. Обнаружены ошибки в следующих полях:</div>
         <ul style="margin-top: 16px; padding-left: 20px; color: #cf1322; line-height: 1.6;">
           ${errors.map((err) => `<li><b>${err.label}</b>: <span style="font-size: 0.9em; opacity: 0.85;">${err.message}</span></li>`).join('')}
         </ul>
         <div style="margin-top: 16px; font-size: 0.85em; color: #8c8c8c;">Пожалуйста, проверьте Шаги 1-4 и исправьте указанные замечания.</div>`,
        'Ошибки в форме',
      );

      this.markAllAsDirty(this.form);
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    // 1. ПОДГОТОВКА ДАННЫХ через Form Builder Service
    const rawValue = this.formBuilderService.prepareSavePayload(
      this.form,
      this.languages,
      this.programId,
    );

    // 2. СОХРАНЕНИЕ
    let saveObservable: Observable<number | null>;

    if (this.programId) {
      // Если программа уже создана на Шаге 1 — просто обновляем её
      const id = Number(this.programId);
      saveObservable = this.api.update(id, rawValue).pipe(map(() => id));
    } else {
      // Если по какой-то причине программа еще не создана — делаем полный цикл (Create -> Update)
      const baseDto = {
        ...rawValue,
        categoryOfAggregatorId: rawValue.categoryOfAggregatorId || 1,
        developerOfAggregatorId: rawValue.developerOfAggregatorId || 1,
        localizations: [],
        platformIds: [],
        tagIds: [],
      };

      saveObservable = this.api.create(baseDto).pipe(
        switchMap((newId) => {
          rawValue.id = newId;
          return this.api.update(newId, rawValue).pipe(map(() => newId));
        }),
      );
    }

    saveObservable
      .pipe(
        switchMap((id) => {
          if (!id) return of(null);
          const screenshots = this.form.get('screenshots')?.value || [];
          return this.screenshotApi.syncScreenshots(id, screenshots).pipe(
            map(() => id),
            catchError((syncErr) => {
              console.error('Failed to sync screenshots:', syncErr);
              this.message.warning(
                'Основная информация сохранена, но возникла ошибка при сохранении скриншотов.',
              );
              return of(id);
            }),
          );
        }),
        catchError((err: unknown) => {
          this.handleBackendError(err);
          return of(null);
        }),
      )
      .subscribe((id) => {
        this.loading = false;
        if (id) {
          this.message.success('Все изменения успешно сохранены');
          this.router.navigate(['/agregator/pages/program']);
        }
        this.cdr.markForCheck();
      });
  }

  private markAllAsDirty(group: FormGroup | FormArray): void {
    Object.keys(group.controls).forEach((key) => {
      const control = group.get(key);
      if (control) {
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.markAllAsDirty(control);
        } else {
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      }
    });
  }

  private handleBackendError(err: unknown): void {
    this.loading = false;
    this.cdr.markForCheck();

    // Извлекаем статус ошибки безопасным образом
    let status: number | undefined;
    if (err instanceof HttpErrorResponse || err instanceof ErrorResponse) {
      status = err.status;
    } else if (err && typeof err === 'object' && 'status' in err) {
      status = (err as { status: number }).status;
    }

    // Если это 409 Conflict, то глобальный интерцептор уже показал модальное окно.
    // Нам не нужно показывать второе!
    if (status === 409) {
      return;
    }

    // Извлекаем тело ошибки в зависимости от класса ошибки
    let errorBody: ValidationErrorBody | null = null;
    let fallbackMessage = '';

    if (err instanceof HttpErrorResponse) {
      errorBody = err.error as ValidationErrorBody;
      fallbackMessage = err.message;
    } else if (err instanceof ErrorResponse) {
      fallbackMessage = err.detail || err.userMessage || '';
      // Если это FluentValidation ошибки, переданные в details
      if (err.details && err.details.length > 0) {
        errorBody = { errors: { Сервер: err.details } };
      }
    } else if (err instanceof Error) {
      fallbackMessage = err.message;
    } else {
      fallbackMessage = typeof err === 'string' ? err : 'Неизвестная ошибка';
    }

    let errorMessage = '<div style="margin-top: 8px;">Сервер отклонил запрос.</div>';

    if (errorBody?.errors) {
      // Формат FluentValidation или Identity
      const errorList = Object.entries(errorBody.errors)
        .map(
          ([field, msgs]) =>
            `<li><b>${field}</b>: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}</li>`,
        )
        .join('');

      errorMessage = `
        <div style="margin-top: 8px; font-weight: 600; color: #cf1322;">Ошибки валидации на сервере:</div>
        <ul style="margin-top: 12px; padding-left: 20px; line-height: 1.6;">
          ${errorList}
        </ul>
      `;
    } else {
      errorMessage = `<div style="margin-top: 16px; padding: 12px; background: #fff1f0; border-radius: 8px; border: 1px solid #ffa39e; color: #cf1322;">
        ${fallbackMessage}
      </div>`;
    }

    this.modalService.error(errorMessage, `Ошибка сервера (${status || 400})`);
  }

  fillTestData(): void {
    const canonical = this.form.get('canonicalName')?.value || 'Test Program';
    const mainPlat = this.form.get('mainPlatformId')?.value;

    this.form.patchValue({
      developerOfAggregatorId: this.developers[0]?.id || 1,
      categoryOfAggregatorId: this.categoryTree[0]?.key || 1,
      status: 1, // Опубликовано
      isActive: true,
      platformIds: mainPlat ? [mainPlat] : [],
    });

    // Заполняем первую локализацию
    const locs = this.form.get('localizations') as FormArray;
    if (locs.length > 0) {
      locs.at(0).patchValue({
        name: canonical + ' (Test)',
        shortDescription: '<p>Test short description</p>',
        fullDescription: '<p>Test full description with <b>rich text</b></p>',
      });
    }

    this.message.info('Тестовые данные заполнены');
    this.cdr.markForCheck();
  }

  private logInvalidControls(group: FormGroup | FormArray, path = ''): void {
    Object.keys(group.controls).forEach((key) => {
      const control = group.get(key);
      if (control) {
        const currentPath = path ? `${path}.${key}` : key;
        if (control instanceof FormGroup || control instanceof FormArray) {
          this.logInvalidControls(control, currentPath);
        } else if (control.invalid) {
          console.error(`Field "${currentPath}" is invalid:`, control.errors);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/agregator/pages/program']);
  }
}

interface ValidationErrorBody {
  errors?: Record<string, string | string[]>;
}
