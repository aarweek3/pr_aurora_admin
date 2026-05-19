import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CategorySimplifiedStateService } from '../../services/category-simplified-state.service';
import { CategorySimplifiedApiService } from '../../services/category-simplified-api.service';
import { finalize } from 'rxjs';
import { ButtonDirective } from '@shared/components/ui/button/button.directive';

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSwitchModule,
    NzTabsModule,
    NzButtonModule,
    NzIconModule,
    NzSelectModule,
    NzDividerModule,
    ButtonDirective
  ],
  template: `
    <nz-modal
      [(nzVisible)]="isVisible"
      [nzTitle]="(isReadOnly ? 'Просмотр' : (state.selectedCategoryId() ? 'Редактирование' : 'Создание')) + ' категории'"
      (nzOnCancel)="modalClose.emit()"
      [nzFooter]="modalFooter"
      nzWidth="var(--av-modal-width-medium)"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="form" nzLayout="vertical">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <nz-form-item>
              <nz-form-label nzRequired>Техническое имя (Canonical)</nz-form-label>
              <nz-form-control nzErrorTip="*Обязательное поле">
                <input nz-input formControlName="canonicalName" placeholder="CAT_GAMES" [readOnly]="isReadOnly" />
              </nz-form-control>
            </nz-form-item>
 
            <nz-form-item>
              <nz-form-label nzRequired>Slug (ЧПУ)</nz-form-label>
              <nz-form-control nzErrorTip="*Обязательное поле">
                <input nz-input formControlName="slug" placeholder="games" [readOnly]="isReadOnly" />
              </nz-form-control>
            </nz-form-item>
          </div>
 
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
            <nz-form-item>
              <nz-form-label>Иконка</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="iconUrl" nzShowSearch nzAllowClear nzPlaceHolder="Выберите или введите...">
                  <nz-option-group nzLabel="Кастомные (SVG)">
                    @for (icon of state.customIcons(); track icon.name) {
                      <nz-option [nzValue]="icon.name" [nzLabel]="icon.name" nzCustomContent>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <div [innerHTML]="sanitizer.bypassSecurityTrustHtml(icon.svgCodIcon)" style="width: 16px; height: 16px; display: flex;"></div>
                          {{ icon.name }}
                        </div>
                      </nz-option>
                    }
                  </nz-option-group>
                  <nz-option-group nzLabel="Системные (Ant Design)">
                    <nz-option nzValue="folder" nzLabel="folder" nzCustomContent><i nz-icon nzType="folder"></i> folder</nz-option>
                    <nz-option nzValue="appstore" nzLabel="appstore" nzCustomContent><i nz-icon nzType="appstore"></i> appstore</nz-option>
                    <nz-option nzValue="setting" nzLabel="setting" nzCustomContent><i nz-icon nzType="setting"></i> setting</nz-option>
                  </nz-option-group>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
 
            <nz-form-item>
              <nz-form-label>Порядок сортировки</nz-form-label>
              <nz-form-control>
                <nz-input-number formControlName="sortOrder" [nzMin]="0" style="width: 100%;" [nzDisabled]="isReadOnly"></nz-input-number>
              </nz-form-control>
            </nz-form-item>
 
            <nz-form-item>
              <nz-form-label>Активность</nz-form-label>
              <nz-form-control>
                <nz-switch formControlName="isActive" [nzDisabled]="isReadOnly"></nz-switch>
              </nz-form-control>
            </nz-form-item>
          </div>
 
          <nz-divider nzText="Локализации"></nz-divider>
 
          <nz-tabset>
            @for (locGroup of localizations.controls; track locGroup; let i = $index) {
              <nz-tab [nzTitle]="getLangName(i)">
                <div [formGroup]="asFormGroup(locGroup)">
                  <nz-form-item>
                    <nz-form-label nzRequired>Название</nz-form-label>
                    <nz-form-control nzErrorTip="*Обязательное поле">
                      <input nz-input formControlName="name" placeholder="Введите название..." [readOnly]="isReadOnly" />
                    </nz-form-control>
                  </nz-form-item>
 
                  <nz-form-item>
                    <nz-form-label>Краткое описание</nz-form-label>
                    <nz-form-control>
                      <textarea nz-input formControlName="shortDescription" rows="2" [readOnly]="isReadOnly"></textarea>
                    </nz-form-control>
                  </nz-form-item>
 
                   <nz-form-item>
                    <nz-form-label>Полное описание</nz-form-label>
                    <nz-form-control>
                      <textarea nz-input formControlName="description" rows="4" [readOnly]="isReadOnly"></textarea>
                    </nz-form-control>
                  </nz-form-item>
                </div>
              </nz-tab>
            }
          </nz-tabset>
        </form>
      </ng-container>

      <ng-template #modalFooter>
        <button av-button avType="default" (click)="modalClose.emit()">{{ isReadOnly ? 'Закрыть' : 'Отмена' }}</button>
        @if (!isReadOnly) {
          <button av-button avType="primary" [avLoading]="loading()" (click)="submit()">Сохранить</button>
        }
      </ng-template>
    </nz-modal>
  `
})
export class CategoryModalComponent implements OnInit {
  @Input() isVisible = false;
  @Input() isReadOnly = false;
  @Output() modalClose = new EventEmitter<void>();

  state = inject(CategorySimplifiedStateService);
  private api = inject(CategorySimplifiedApiService);
  private fb = inject(FormBuilder);
  public sanitizer = inject(DomSanitizer);

  form!: FormGroup;
  loading = signal(false);

  ngOnInit(): void {
    this.initForm();
    const id = this.state.selectedCategoryId();
    if (id) {
      this.loadCategory(id);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [0],
      canonicalName: ['', Validators.required],
      slug: ['', Validators.required],
      iconUrl: [''],
      sortOrder: [0],
      isActive: [true],
      localizations: this.fb.array([])
    });

    // Добавляем поля для каждого доступного языка
    this.state.languages().forEach(lang => {
      this.localizations.push(this.fb.group({
        languageOfAggregatorId: [lang.id],
        name: ['', Validators.required],
        shortDescription: [''],
        description: [''],
        metaTitle: [''],
        metaDescription: ['']
      }));
    });
  }

  get localizations(): FormArray {
    return this.form.get('localizations') as FormArray;
  }

  asFormGroup(ctrl: AbstractControl): FormGroup {
    return ctrl as FormGroup;
  }

  getLangName(index: number): string {
    const langId = this.localizations.at(index).get('languageOfAggregatorId')?.value;
    const lang = this.state.languages().find(l => l.id === langId);
    return lang?.nativeTitle || 'Unknown';
  }

  loadCategory(id: number): void {
    this.loading.set(true);
    this.api.getById(id).pipe(finalize(() => this.loading.set(false))).subscribe(data => {
      this.form.patchValue({
        id: data.id,
        canonicalName: data.canonicalName,
        slug: data.slug,
        iconUrl: data.iconUrl,
        sortOrder: data.sortOrder,
        isActive: data.isActive
      });

      // Патчим локализации
      data.localizations.forEach(loc => {
        const index = this.localizations.controls.findIndex(
          c => c.get('languageOfAggregatorId')?.value === loc.languageOfAggregatorId
        );
        if (index !== -1) {
          this.localizations.at(index).patchValue(loc);
        }
      });
    });
  }

  submit(): void {
    console.log('[CategoryModal] Submit clicked. Form valid:', this.form.valid);
    
    // Применяем fallback-логику перед валидацией
    this.applyLocalFallbacks();
    
    if (this.form.invalid) {
      console.warn('[CategoryModal] Form is still invalid after fallbacks. Controls:', this.findInvalidControls());
      
      // Помечаем все поля как грязные для отображения ошибок
      this.markFormGroupDirty(this.form);
      return;
    }

    console.log('[CategoryModal] Form is valid. Saving...', this.form.value);
    this.loading.set(true);
    this.state.saveCategory(this.form.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => this.modalClose.emit());
  }

  private applyLocalFallbacks(): void {
    const canonical = this.form.get('canonicalName')?.value;
    const slug = this.form.get('slug')?.value;
    
    // Ищем английскую локализацию
    const enGroup = this.localizations.controls.find(c => {
      const langId = c.get('languageOfAggregatorId')?.value;
      return this.state.languages().find(l => l.id === langId)?.code === 'en-US';
    });

    const enName = enGroup?.get('name')?.value?.trim() || canonical || slug;

    this.localizations.controls.forEach(group => {
      const nameCtrl = group.get('name');
      if (nameCtrl && !nameCtrl.value?.trim() && enName) {
        nameCtrl.setValue(enName);
        nameCtrl.markAsDirty();
      }
    });
  }

  private markFormGroupDirty(formGroup: FormGroup | FormArray): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupDirty(control);
      } else {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  private findInvalidControls(): string[] {
    const invalid: string[] = [];
    const controls = this.form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    
    const locArray = this.form.get('localizations') as FormArray;
    locArray.controls.forEach((group, index) => {
      if (group.invalid) {
        invalid.push(`localization[${index}]`);
      }
    });

    return invalid;
  }
}
