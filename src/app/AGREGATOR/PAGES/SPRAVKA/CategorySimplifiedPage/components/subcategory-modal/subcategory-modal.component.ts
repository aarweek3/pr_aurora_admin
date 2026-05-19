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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { CategorySimplifiedStateService } from '../../services/category-simplified-state.service';
import { CategorySimplifiedApiService } from '../../services/category-simplified-api.service';
import { finalize } from 'rxjs';
import { ButtonDirective } from '@shared/components/ui/button/button.directive';

@Component({
  selector: 'app-subcategory-modal',
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
    NzSelectModule,
    NzDividerModule,
    ButtonDirective
  ],
  template: `
    <nz-modal
      [(nzVisible)]="isVisible"
      [nzTitle]="(isReadOnly ? 'Просмотр' : (state.selectedSubcategoryId() ? 'Редактирование' : 'Создание')) + ' подкатегории'"
      (nzOnCancel)="modalClose.emit()"
      [nzFooter]="modalFooter"
      nzWidth="var(--av-modal-width-medium)"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="form" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Мастер-категория</nz-form-label>
            <nz-form-control nzErrorTip="*Обязательное поле">
              <nz-select formControlName="categoryId" nzPlaceHolder="Выберите категорию">
                @for (cat of state.items(); track cat.id) {
                  <nz-option [nzValue]="cat.id" [nzLabel]="cat.localizedName || cat.canonicalName"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
 
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <nz-form-item>
              <nz-form-label nzRequired>Техническое имя (Canonical)</nz-form-label>
              <nz-form-control nzErrorTip="*Обязательное поле">
                <input nz-input formControlName="canonicalName" placeholder="SUB_RPG" />
              </nz-form-control>
            </nz-form-item>
 
            <nz-form-item>
              <nz-form-label nzRequired>Slug (ЧПУ)</nz-form-label>
              <nz-form-control nzErrorTip="*Обязательное поле">
                <input nz-input formControlName="slug" placeholder="rpg" />
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
                    <nz-option nzValue="file" nzLabel="file" nzCustomContent><i nz-icon nzType="file"></i> file</nz-option>
                    <nz-option nzValue="tag" nzLabel="tag" nzCustomContent><i nz-icon nzType="tag"></i> tag</nz-option>
                  </nz-option-group>
                </nz-select>
              </nz-form-control>
            </nz-form-item>
 
            <nz-form-item>
              <nz-form-label>Порядок</nz-form-label>
              <nz-form-control>
                <nz-input-number formControlName="sortOrder" [nzMin]="0" style="width: 100%;"></nz-input-number>
              </nz-form-control>
            </nz-form-item>
 
            <nz-form-item>
              <nz-form-label>Активность</nz-form-label>
              <nz-form-control>
                <nz-switch formControlName="isActive"></nz-switch>
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
                      <input nz-input formControlName="name" placeholder="Введите название..." />
                    </nz-form-control>
                  </nz-form-item>
 
                  <nz-form-item>
                    <nz-form-label>Краткое описание</nz-form-label>
                    <nz-form-control>
                      <textarea nz-input formControlName="shortDescription" rows="2"></textarea>
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
export class SubcategoryModalComponent implements OnInit {
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
    const id = this.state.selectedSubcategoryId();
    if (id) {
      this.loadSubcategory(id);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      id: [0],
      categoryId: [null, Validators.required],
      canonicalName: ['', Validators.required],
      slug: ['', Validators.required],
      iconUrl: [''],
      sortOrder: [0],
      isActive: [true],
      localizations: this.fb.array([])
    });

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

  loadSubcategory(id: number): void {
    this.loading.set(true);
    this.api.getSubcategoryById(id).pipe(finalize(() => this.loading.set(false))).subscribe(data => {
      this.form.patchValue({
        id: data.id,
        categoryId: data.categoryId,
        canonicalName: data.canonicalName,
        slug: data.slug,
        iconUrl: data.iconUrl,
        sortOrder: data.sortOrder,
        isActive: data.isActive
      });

      data.localizations.forEach(loc => {
        const index = this.localizations.controls.findIndex(
          c => c.get('languageOfAggregatorId')?.value === loc.languageOfAggregatorId
        );
        if (index !== -1) {
          this.localizations.at(index).patchValue(loc);
        }
      });

      if (this.isReadOnly) {
        this.form.disable();
      }
    });
  }

  submit(): void {
    this.applyLocalFallbacks();

    if (this.form.invalid) {
      this.markFormGroupDirty(this.form);
      return;
    }

    this.loading.set(true);
    this.state.saveSubcategory(this.form.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(() => this.modalClose.emit());
  }

  private applyLocalFallbacks(): void {
    const canonical = this.form.get('canonicalName')?.value;
    const slug = this.form.get('slug')?.value;
    
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
}
