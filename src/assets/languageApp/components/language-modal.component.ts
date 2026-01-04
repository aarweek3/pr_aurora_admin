import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { AppLanguage } from '../models/appLanguage.model';
import { LanguageApiService } from '../services/language-api.service';

@Component({
  selector: 'app-language-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzCheckboxModule,
    NzInputNumberModule,
    NzButtonModule,
  ],
  template: `
    <form nz-form [formGroup]="validateForm" (ngSubmit)="submitForm()" nzLayout="vertical">
      <div class="form-row">
        <nz-form-item>
          <nz-form-label nzRequired>Код (BCP-47)</nz-form-label>
          <nz-form-control nzErrorTip="Пример: ru-RU или en-US">
            <input nz-input formControlName="code" placeholder="ru-RU" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>Краткий код</nz-form-label>
          <nz-form-control nzErrorTip="Пример: RU или EN">
            <input nz-input formControlName="shortCode" placeholder="RU" />
          </nz-form-control>
        </nz-form-item>
      </div>

      <div class="form-row">
        <nz-form-item>
          <nz-form-label nzRequired>Название (EN)</nz-form-label>
          <nz-form-control nzErrorTip="Введите название на английском">
            <input nz-input formControlName="title" placeholder="Russian" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>Название (Родное)</nz-form-label>
          <nz-form-control nzErrorTip="Введите название на родном языке">
            <input nz-input formControlName="nativeTitle" placeholder="Русский" />
          </nz-form-control>
        </nz-form-item>
      </div>

      <div class="form-row">
        <nz-form-item>
          <nz-form-label nzRequired>Направление</nz-form-label>
          <nz-form-control>
            <nz-select formControlName="direction">
              <nz-option nzValue="ltr" nzLabel="Слева направо (LTR)"></nz-option>
              <nz-option nzValue="rtl" nzLabel="Справа налево (RTL)"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>

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

      <nz-form-item>
        <nz-form-label>Иконка/Флаг (ключ)</nz-form-label>
        <nz-form-control>
          <input nz-input formControlName="iconKey" placeholder="flag_ru" />
        </nz-form-control>
      </nz-form-item>

      <div class="switches-row">
        <nz-form-item>
          <label nz-checkbox formControlName="enabled">Включен</label>
        </nz-form-item>
        <nz-form-item>
          <label nz-checkbox formControlName="isDefault">По умолчанию</label>
        </nz-form-item>
      </div>

      <div class="modal-footer">
        <button nz-button type="button" (click)="modalRef.destroy()">Отмена</button>
        <button nz-button nzType="primary" [nzLoading]="isLoading">Сохранить</button>
      </div>
    </form>
  `,
  styles: [
    `
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .switches-row {
        display: flex;
        gap: 24px;
        margin-bottom: 24px;
      }
      .modal-footer {
        text-align: right;
        border-top: 1px solid #f0f0f0;
        padding-top: 16px;
        margin: 0 -24px -24px -24px;
        padding-right: 24px;
        padding-bottom: 16px;
        button {
          margin-left: 8px;
        }
      }
    `,
  ],
})
export class LanguageModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(LanguageApiService);
  private message = inject(NzMessageService);
  modalRef = inject(NzModalRef);
  data = inject(NZ_MODAL_DATA);

  validateForm!: FormGroup;
  isLoading = false;
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.data?.language;
    this.initForm(this.data?.language);
  }

  private initForm(lang?: AppLanguage): void {
    this.validateForm = this.fb.group({
      code: [lang?.code || '', [Validators.required, Validators.maxLength(10)]],
      shortCode: [lang?.shortCode || '', [Validators.required, Validators.maxLength(5)]],
      title: [lang?.title || '', [Validators.required, Validators.maxLength(50)]],
      nativeTitle: [lang?.nativeTitle || '', [Validators.required, Validators.maxLength(50)]],
      direction: [lang?.direction || 'ltr', [Validators.required]],
      sortOrder: [lang?.sortOrder || 999],
      enabled: [lang?.enabled !== false],
      isDefault: [lang?.isDefault || false],
      iconKey: [lang?.iconKey || ''],
    });
  }

  submitForm(): void {
    if (this.validateForm.invalid) {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoading = true;
    const body = this.validateForm.value;

    if (this.isEdit) {
      this.apiService.update(this.data.language.id, body).subscribe({
        next: () => {
          this.message.success('Язык обновлен');
          this.modalRef.close(true);
        },
        error: (err) => {
          this.message.error('Ошибка при обновлении');
          this.isLoading = false;
        },
      });
    } else {
      this.apiService.create(body).subscribe({
        next: () => {
          this.message.success('Язык создан');
          this.modalRef.close(true);
        },
        error: (err) => {
          this.message.error('Ошибка при создании');
          this.isLoading = false;
        },
      });
    }
  }
}
