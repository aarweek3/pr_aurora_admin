import { ChangeDetectionStrategy, Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { SystemRequirementStateService } from '../services/system-requirement-state.service';
import { RequirementArchitecture } from '../models/system-requirement.model';
import { IconComponent } from '@shared/components/ui/icon/icon.component';
import { LANGUAGE_ICONS_MAP } from '@assets/languageApp/config/language-icons.config';
import { AppLanguage } from '@assets/languageApp/models/appLanguage.model';

@Component({
  selector: 'app-system-requirement-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NzSwitchModule,
    NzTabsModule,
    NzInputModule,
    NzButtonModule,
    IconComponent
  ],
  template: `
    <nz-modal 
      [nzVisible]="state.modalVisible()" 
      [nzTitle]="state.modalMode() === 'add' ? 'Добавить требование' : 'Редактировать требование'"
      (nzOnCancel)="onCancel()"
      (nzOnOk)="onSave()"
      [nzOkLoading]="state.modalLoading()"
      nzWidth="700px">
      
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="validateForm" nzLayout="vertical">
          <div style="display: flex; gap: 16px;">
            <!-- Архитектура -->
            <nz-form-item style="flex: 1;">
              <nz-form-label>Архитектура</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="architecture">
                  <nz-option [nzValue]="0" nzLabel="Any"></nz-option>
                  <nz-option [nzValue]="1" nzLabel="x86 (32-bit)"></nz-option>
                  <nz-option [nzValue]="2" nzLabel="x64 (64-bit)"></nz-option>
                  <nz-option [nzValue]="3" nzLabel="ARM64 (Apple M1/M2, ARM Win)"></nz-option>
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <!-- Тип -->
            <nz-form-item style="width: 120px;">
              <nz-form-label>Рекомендуемое</nz-form-label>
              <nz-form-control>
                <nz-switch formControlName="isRecommended"></nz-switch>
              </nz-form-control>
            </nz-form-item>
          </div>

          <div style="display: flex; gap: 16px;">
            <!-- Мин ОС -->
            <nz-form-item style="flex: 1;">
              <nz-form-label>Минимальная ОС</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="minOsVersionId" nzShowSearch nzAllowClear nzPlaceHolder="Выберите версию">
                  @for (os of state.osVersions(); track os.id) {
                    <nz-option [nzValue]="os.id" [nzLabel]="os.name"></nz-option>
                  }
                </nz-select>
              </nz-form-control>
            </nz-form-item>

            <!-- Макс ОС -->
            <nz-form-item style="flex: 1;">
              <nz-form-label>Максимальная ОС</nz-form-label>
              <nz-form-control>
                <nz-select formControlName="maxOsVersionId" nzShowSearch nzAllowClear nzPlaceHolder="Любая">
                  @for (os of state.osVersions(); track os.id) {
                    <nz-option [nzValue]="os.id" [nzLabel]="os.name"></nz-option>
                  }
                </nz-select>
              </nz-form-control>
            </nz-form-item>
          </div>

          <!-- Локализации -->
          <nz-tabset nzType="card" style="margin-top: 16px;">
            @for (lang of state.languages(); track lang.id) {
              <nz-tab [nzTitle]="titleTpl">
                <ng-template #titleTpl>
                  <av-icon [type]="getIconName(lang)" [size]="16" style="margin-right: 8px;"></av-icon>
                  {{ lang.nativeTitle }}
                </ng-template>

                <nz-form-item>
                  <nz-form-label>Дополнительные примечания (например: 4GB RAM, DirectX 11)</nz-form-label>
                  <nz-form-control>
                    <textarea nz-input rows="3" [placeholder]="'Описание на ' + lang.nativeTitle" (input)="onLocChange(lang.id, $event)"></textarea>
                  </nz-form-control>
                </nz-form-item>
              </nz-tab>
            }
          </nz-tabset>
        </form>
      </ng-container>
    </nz-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemRequirementFormComponent {
  private fb = inject(FormBuilder);
  readonly state = inject(SystemRequirementStateService);

  validateForm: FormGroup = this.fb.group({
    id: [null],
    versionId: [null, [Validators.required]],
    platformId: [null, [Validators.required]],
    architecture: [0],
    minOsVersionId: [null],
    maxOsVersionId: [null],
    isRecommended: [false],
  });

  localizations: Map<number, string> = new Map();

  constructor() {
    effect(() => {
      const item = this.state.editingItem();
      if (item) {
        this.validateForm.patchValue(item);
        this.localizations.clear();
        item.localizations?.forEach(l => this.localizations.set(l.languageId, l.additionalNotes || ''));
      } else {
        this.validateForm.reset({ architecture: 0, isRecommended: false });
        this.localizations.clear();
      }
    });
  }

  ngOnInit() {
    // В Angular 17+ можно использовать effect() для синхронизации формы со стейтом
  }

  onLocChange(langId: number, event: any) {
    this.localizations.set(langId, event.target.value);
  }

  onSave() {
    if (this.validateForm.valid) {
      const formValue = this.validateForm.value;
      const locs = Array.from(this.localizations.entries()).map(([langId, notes]) => ({
        languageId: langId,
        additionalNotes: notes
      }));

      this.state.save({
        ...formValue,
        localizations: locs
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  onCancel() {
    this.state.closeModal();
  }

  getIconName(lang: AppLanguage): string {
    const { iconKey, code } = lang;
    let mapped = iconKey ? LANGUAGE_ICONS_MAP[iconKey] : null;
    if (!mapped && code) {
      mapped = LANGUAGE_ICONS_MAP[code];
    }
    return mapped || LANGUAGE_ICONS_MAP['default'];
  }
}
