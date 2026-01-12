import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppLanguage } from '@assets/languageApp/models/appLanguage.model';
import { LanguageService } from '@assets/languageApp/services/language.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Subject, takeUntil } from 'rxjs';
import { SeoFormComponent } from '../../../../shared/components/ui/seo-form/seo-form.component';
import {
  SampleMainCreateRequestDto,
  SampleMainDetailDto,
  SampleMainUpdateRequestDto,
} from '../../models/sample-main.model';

@Component({
  selector: 'app-sample-main-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
    NzTabsModule,
    NzGridModule,
    NzSwitchModule,
    SeoFormComponent,
  ],
  template: `
    <nz-modal
      [nzVisible]="visible"
      [nzTitle]="title"
      [nzFooter]="modalFooter"
      (nzOnCancel)="cancel.emit()"
      nzWidth="800px"
    >
      <ng-container *nzModalContent>
        <nz-alert
          *ngIf="error"
          nzType="error"
          [nzMessage]="error"
          nzShowIcon
          style="margin-bottom: 16px;"
        ></nz-alert>

        <form nz-form [formGroup]="form" nzLayout="vertical">
          <div nz-row [nzGutter]="16">
            <div nz-col nzSpan="12">
              <nz-form-item>
                <nz-form-label nzRequired>Техническое название</nz-form-label>
                <nz-form-control nzErrorTip="Введите техническое название">
                  <input
                    nz-input
                    formControlName="name"
                    placeholder="Напр: PROJECT_ALPHA"
                    [readonly]="mode === 'view'"
                  />
                </nz-form-control>
              </nz-form-item>
            </div>
            <div nz-col nzSpan="12">
              <nz-form-item>
                <nz-form-label>Системный код</nz-form-label>
                <nz-form-control>
                  <input
                    nz-input
                    formControlName="systemCode"
                    placeholder="Напр: PRJ-A"
                    [readonly]="mode === 'view'"
                  />
                </nz-form-control>
              </nz-form-item>
            </div>
          </div>

          <nz-form-item>
            <nz-form-label>Статус активности</nz-form-label>
            <nz-form-control>
              <nz-switch formControlName="isActive" [nzDisabled]="mode === 'view'"></nz-switch>
              <span style="margin-left: 8px;">{{
                form.get('isActive')?.value ? 'Активен' : 'Архив'
              }}</span>
            </nz-form-control>
          </nz-form-item>

          <h3 style="margin: 24px 0 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
            Переводы (Локализация)
          </h3>

          <nz-tabset [nzType]="'card'" [(nzSelectedIndex)]="selectedTabIndex">
            @for (lang of languages; track lang.id; let i = $index) {
            <nz-tab [nzTitle]="lang.title">
              <div [formGroup]="getDescGroup(i)">
                <nz-form-item>
                  <nz-form-label nzRequired>Имя ({{ lang.code }})</nz-form-label>
                  <nz-form-control nzErrorTip="Введите имя на данном языке">
                    <input
                      nz-input
                      formControlName="name"
                      [placeholder]="'Название на ' + lang.title"
                      [readonly]="mode === 'view'"
                    />
                  </nz-form-control>
                </nz-form-item>

                <nz-form-item>
                  <nz-form-label>Описание ({{ lang.code }})</nz-form-label>
                  <nz-form-control>
                    <textarea
                      nz-input
                      formControlName="description"
                      [nzAutosize]="{ minRows: 3 }"
                      [placeholder]="'Описание на ' + lang.title"
                      [readonly]="mode === 'view'"
                    ></textarea>
                  </nz-form-control>
                </nz-form-item>

                <h4
                  style="margin: 24px 0 12px; border-bottom: 1px dashed #e8e8e8; padding-bottom: 4px; font-weight: 500;"
                >
                  Разширенные SEO настройки
                </h4>
                <app-seo-form [form]="getSeoGroup(i)" [readonly]="mode === 'view'"></app-seo-form>
              </div>
            </nz-tab>
            }
          </nz-tabset>
        </form>
      </ng-container>

      <ng-template #modalFooter>
        <button nz-button nzType="default" (click)="cancel.emit()" [disabled]="loading">
          Закрыть
        </button>
        <button
          *ngIf="mode !== 'view'"
          nz-button
          nzType="primary"
          (click)="submit()"
          [nzLoading]="loading"
          [disabled]="form.invalid"
        >
          {{ mode === 'add' ? 'Создать' : 'Сохранить' }}
        </button>
      </ng-template>
    </nz-modal>
  `,
})
export class SampleMainModalComponent implements OnChanges, OnDestroy {
  @Input() visible = false;
  @Input() mode: 'add' | 'edit' | 'view' = 'add';
  @Input() item: SampleMainDetailDto | null = null;
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() selectedLanguageId: number | null = null;

  @Output() save = new EventEmitter<SampleMainCreateRequestDto | SampleMainUpdateRequestDto>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private langService = inject(LanguageService);
  private destroy$ = new Subject<void>();

  languages: AppLanguage[] = [];
  form: FormGroup;
  selectedTabIndex = 0;

  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      systemCode: [''],
      isActive: [true],
      descriptions: this.fb.array([]),
    });

    // Конвертируем signal в observable для совместимости с текущим кодом
    toObservable(this.langService.allLanguages)
      .pipe(takeUntil(this.destroy$))
      .subscribe((langs) => {
        if (langs.length === 0) {
          this.langService.refreshAdminList();
          return;
        }
        this.languages = langs;
        this.initDescriptionsForm();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get descriptions(): FormArray {
    return this.form.get('descriptions') as FormArray;
  }

  getDescGroup(index: number): FormGroup {
    return this.descriptions.at(index) as FormGroup;
  }

  getSeoGroup(index: number): FormGroup {
    return this.getDescGroup(index).get('seoData') as FormGroup;
  }

  get title(): string {
    if (this.mode === 'view') return 'Просмотр записи';
    return this.mode === 'add' ? 'Новая многоязычная запись' : 'Редактирование записи';
  }

  private initDescriptionsForm(): void {
    const arr = this.descriptions;
    arr.clear();
    this.languages.forEach((lang) => {
      arr.push(
        this.fb.group({
          languageAppId: [lang.id],
          name: [''], // Убираем Validators.required здесь
          description: [''],
          seoData: SeoFormComponent.createSeoForm(this.fb),
        }),
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const visibleChanged = changes['visible'] && this.visible;
    const itemChanged = changes['item'] && this.item;

    if (visibleChanged || (this.visible && itemChanged)) {
      if (visibleChanged) {
        this.error = null;
        this.form.reset({ isActive: true });
      }

      // Если есть языки, инициализируем структуру (если еще не была в этом цикле)
      if (this.languages.length > 0) {
        this.initDescriptionsForm();
      }

      if (this.mode !== 'add' && this.item) {
        console.debug('SampleMainModalComponent: Patching form with item', this.item);
        // Заполняем основные поля
        this.form.patchValue({
          name: this.item.name,
          systemCode: this.item.systemCode,
          isActive: this.item.isActive,
        });

        // Заполняем переводы
        this.languages.forEach((lang, index) => {
          const storedDesc = this.item?.descriptions?.find((d) => d.languageAppId === lang.id);
          if (storedDesc) {
            this.getDescGroup(index).patchValue({
              name: storedDesc.name,
              description: storedDesc.description,
            });

            if (storedDesc.seoData) {
              this.getSeoGroup(index).patchValue(storedDesc.seoData);
            }
          }
        });
      }

      // Установка активного таба
      this.updateSelectedTab();
    }
  }

  private updateSelectedTab(): void {
    if (this.selectedLanguageId && this.languages.length > 0) {
      const index = this.languages.findIndex((l) => l.id === this.selectedLanguageId);
      if (index !== -1) {
        this.selectedTabIndex = index;
      } else {
        // Если язык не найден, ставим дефолтный (где isDefault === true)
        const defaultIdx = this.languages.findIndex((l) => l.isDefault);
        this.selectedTabIndex = defaultIdx !== -1 ? defaultIdx : 0;
      }
    } else {
      // Таб по умолчанию (системный или первый)
      const defaultIdx = this.languages.findIndex((l) => l.isDefault);
      this.selectedTabIndex = defaultIdx !== -1 ? defaultIdx : 0;
    }
  }

  submit(): void {
    console.debug('SampleMainModalComponent: submit called', {
      valid: this.form.valid,
      errors: this.form.errors,
      value: this.form.value,
    });

    if (this.form.valid) {
      const val = this.form.getRawValue();

      // Фильтруем пустые описания: оставляем только те, где заполнено имя
      val.descriptions = val.descriptions.filter((d: any) => d.name && d.name.trim() !== '');

      if (val.descriptions.length === 0) {
        this.error = 'Необходимо заполнить имя хотя бы на одном языке';
        return;
      }

      console.log('SampleMainModalComponent: emitting save', val);
      this.save.emit(this.mode === 'add' ? val : { ...val, id: this.item?.id });
    } else {
      console.warn('SampleMainModalComponent: form is invalid', this.findInvalidControls());
      // Помечаем все поля как touched, чтобы показать ошибки
      this.form.markAllAsTouched();
      Object.values((this.form.get('descriptions') as FormArray).controls).forEach((control) => {
        (control as FormGroup).markAllAsTouched();
      });
    }
  }

  private findInvalidControls(): string[] {
    const invalid = [];
    const controls = this.form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    const descriptions = this.form.get('descriptions') as FormArray;
    descriptions.controls.forEach((group, index) => {
      if (group.invalid) {
        invalid.push(`description[${index}] (${this.languages[index]?.title})`);
      }
    });

    return invalid;
  }
}
