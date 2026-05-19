import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { AppLanguage } from '@language-app/models/appLanguage.model';
import { SeoFormComponent } from '@shared-ui';
import { ProgramOfAggregatorUpdate } from '../../models/program-of-aggregator.model';

@Injectable({
  providedIn: 'root',
})
export class ProgramFormBuilderService {
  private fb = inject(FormBuilder);

  createProgramForm(): FormGroup {
    return this.fb.group({
      canonicalName: ['', [Validators.required, Validators.maxLength(255)]],
      slug: [
        '',
        [Validators.required, Validators.maxLength(255), Validators.pattern(/^[a-z0-9-]+$/)],
      ],
      mainPlatformId: [null, [Validators.required]],
      categoryOfAggregatorId: [null, [Validators.required]],
      categoryId: [null],
      subcategoryId: [null],
      developerOfAggregatorId: [null],
      iconPath: [''],
      website: [''],
      youtubeVideoUrl: [''],
      customVideoUrl: [''],
      status: [0], // Draft
      sortOrder: [0],
      isActive: [false],
      platformIds: [[]],
      tagIds: [[]],
      screenshots: [[]],
      localizations: this.fb.array([]),
    });
  }

  buildLocForm(form: FormGroup, languages: AppLanguage[]): void {
    const locs = form.get('localizations') as FormArray;
    locs.clear();
    languages.forEach((lang) => {
      locs.push(
        this.fb.group({
          languageOfAggregatorId: [lang.id],
          name: [''],
          shortDescription: [''],
          fullDescription: [''],
          pros: this.fb.array([]),
          cons: this.fb.array([]),
          youtubeVideoUrl: [''],
          customVideoUrl: [''],
          seoData: SeoFormComponent.createSeoForm(this.fb),
        }),
      );
    });
  }

  getLocGroup(form: FormGroup, langId: number): FormGroup | null {
    const locs = form.get('localizations') as FormArray;
    return locs.controls.find(
      (c) => c.value.languageOfAggregatorId === langId,
    ) as FormGroup;
  }

  getProsArray(form: FormGroup, langId: number): FormArray {
    return this.getLocGroup(form, langId)?.get('pros') as FormArray;
  }

  getConsArray(form: FormGroup, langId: number): FormArray {
    return this.getLocGroup(form, langId)?.get('cons') as FormArray;
  }

  addPro(form: FormGroup, langId: number): void {
    this.getProsArray(form, langId).push(this.fb.control(''));
  }

  removePro(form: FormGroup, langId: number, index: number): void {
    this.getProsArray(form, langId).removeAt(index);
  }

  addCons(form: FormGroup, langId: number): void {
    this.getConsArray(form, langId).push(this.fb.control(''));
  }

  removeCons(form: FormGroup, langId: number, index: number): void {
    this.getConsArray(form, langId).removeAt(index);
  }

  prepareSavePayload(
    form: FormGroup,
    languages: AppLanguage[],
    programId: string | null,
  ): ProgramOfAggregatorUpdate {
    const rawValue = { ...form.getRawValue() } as unknown as ProgramOfAggregatorUpdate;

    // Удаляем служебные/навигационные поля перед сохранением
    const fieldsToRemove = [
      'createdAt',
      'updatedAt',
      'versions',
      'screenshots',
      'tags',
      'totalDownloads',
      'averageRating',
      'averageRatingCount',
      'isSystem',
      'needsReview',
    ];
    fieldsToRemove.forEach((f) => delete (rawValue as unknown as Record<string, unknown>)[f]);

    const localizations = rawValue.localizations as unknown as {
      languageOfAggregatorId: number;
      name: string;
      shortDescription?: string;
      fullDescription?: string;
      pros?: string[] | string;
      cons?: string[] | string;
      seoData?: { metaTitle?: string; metaDescription?: string };
      metaTitle?: string;
      metaDescription?: string;
    }[];

    if (localizations && localizations.length > 0) {
      const enLoc =
        localizations.find(
          (l) =>
            languages.find((al) => al.id === l.languageOfAggregatorId)?.code?.toLowerCase() ===
            'en',
        ) || localizations[0];

      localizations.forEach((loc) => {
        // Fallback: если имя пустое, берем из EN или из канонического названия
        if (!loc.name) {
          loc.name = enLoc?.name || rawValue.canonicalName;
        }

        if (!loc.shortDescription) {
          loc.shortDescription = enLoc?.shortDescription || '';
        }

        // Конвертация массивов Pros/Cons в плоские строки
        if (Array.isArray(loc.pros)) {
          loc.pros = loc.pros.filter((p) => !!p).join('|');
        }
        if (Array.isArray(loc.cons)) {
          loc.cons = loc.cons.filter((c) => !!c).join('|');
        }

        // SEO Flattening (сглаживание вложенной формы)
        if (loc.seoData) {
          loc.metaTitle = loc.seoData.metaTitle || loc.name;
          loc.metaDescription = loc.seoData.metaDescription || loc.shortDescription;
          delete loc.seoData;
        }
      });
    }

    // Гарантируем обязательные числовые ID
    rawValue.categoryOfAggregatorId = rawValue.categoryOfAggregatorId || 1;
    rawValue.developerOfAggregatorId = rawValue.developerOfAggregatorId || 1;

    if (programId) {
      rawValue.id = Number(programId);
    }

    return rawValue;
  }

  getFormValidationErrors(
    form: FormGroup,
    languages: AppLanguage[],
  ): { label: string; message: string }[] {
    const errors: { label: string; message: string }[] = [];
    const labels: Record<string, string> = {
      canonicalName: 'Шаг 1: Каноническое название',
      slug: 'Шаг 1: Slug (URL)',
      mainPlatformId: 'Шаг 1: Основная платформа',
      categoryOfAggregatorId: 'Шаг 2: Категория',
      developerOfAggregatorId: 'Шаг 2: Разработчик',
      iconPath: 'Шаг 4: Иконка программы',
    };

    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key);
      if (control?.invalid) {
        let message = 'Некорректное значение';
        if (control.errors?.['required']) message = 'Обязательное поле';
        if (control.errors?.['pattern']) message = 'Неверный формат (только латиница и дефис)';
        if (control.errors?.['maxlength']) message = 'Превышена максимальная длина';

        errors.push({ label: labels[key] || key, message });
      }
    });

    // Проверка локализаций
    const locs = form.get('localizations') as FormArray;
    if (locs) {
      locs.controls.forEach((loc, index) => {
        if (loc.invalid) {
          const lang = languages[index]?.nativeTitle || `Язык ${index + 1}`;
          errors.push({
            label: `Шаг 3: Локализация (${lang})`,
            message: 'Проверьте обязательные поля (название и др.)',
          });
        }
      });
    }

    return errors;
  }
}
