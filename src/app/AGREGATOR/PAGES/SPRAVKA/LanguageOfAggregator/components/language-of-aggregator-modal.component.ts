import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LANGUAGE_ICONS_MAP } from '@language-app/config/language-icons.config';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { LanguageAggregator } from '../models/language-aggregator.model';
import { LanguageAggregatorApiService } from '../services/language-aggregator-api.service';

@Component({
  selector: 'app-language-of-aggregator-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzCheckboxModule,
    NzInputNumberModule,
    NzButtonModule,
    NzAlertModule,
  ],
  template: `
    @if (data.language?.isDeleted) {
      <nz-alert
        nzType="warning"
        nzMessage="Внимание! Вы редактируете удаленную запись."
        nzDescription="Чтобы она появилась на сайте, нажмите кнопку 'Восстановить'."
        nzShowIcon
        style="margin-bottom: 24px;"
        [nzAction]="restoreAction"
      ></nz-alert>
      <ng-template #restoreAction>
        <button nz-button nzSize="small" nzType="primary" (click)="restore()" [nzLoading]="isLoading">
          Восстановить
        </button>
      </ng-template>
    }

    <form nz-form [formGroup]="validateForm" (ngSubmit)="submitForm()" nzLayout="vertical">
      <div class="form-row">
        <nz-form-item>
          <nz-form-label nzRequired>Код (BCP-47)</nz-form-label>
          <nz-form-control nzErrorTip="Пример: ru-RU">
            <input nz-input formControlName="code" placeholder="ru-RU" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>Краткий код</nz-form-label>
          <nz-form-control nzErrorTip="Пример: ru">
            <input nz-input formControlName="shortCode" placeholder="ru" />
          </nz-form-control>
        </nz-form-item>
      </div>

      <div class="form-row">
        <nz-form-item>
          <nz-form-label nzRequired>Название (EN)</nz-form-label>
          <nz-form-control nzErrorTip="Введите название">
            <input nz-input formControlName="title" placeholder="Russian" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>Название (Родное)</nz-form-label>
          <nz-form-control nzErrorTip="Введите название">
            <input nz-input formControlName="nativeTitle" placeholder="Русский" />
          </nz-form-control>
        </nz-form-item>
      </div>

      <div class="form-row">
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

        <nz-form-item>
          <nz-form-label>Ключ иконки</nz-form-label>
          <nz-form-control nzErrorTip="Максимум 20 символов, например: flag_ru">
            <input nz-input formControlName="iconKey" placeholder="flag_ru" />
          </nz-form-control>
        </nz-form-item>
      </div>

      <div class="switches-row">
        <nz-form-item>
          <label nz-checkbox formControlName="enabled">Включен</label>
        </nz-form-item>
        <nz-form-item>
          <label nz-checkbox formControlName="isDefault">По умолчанию</label>
        </nz-form-item>
        <nz-form-item>
          <label nz-checkbox formControlName="isRtl">RTL (справа налево)</label>
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
      .icon-input-group {
        display: flex;
        gap: 12px;
        align-items: flex-start;
      }
      .icon-preview {
        width: 48px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
      }
      .modal-footer {
        text-align: right;
        margin: 0 -24px -24px -24px;
        padding: 16px 24px;
        border-top: 1px solid #f0f0f0;
        button {
          margin-left: 8px;
        }
      }
    `,
  ],
})
export class LanguageOfAggregatorModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(LanguageAggregatorApiService);
  private message = inject(NzMessageService);
  private modalService = inject(NzModalService);
  modalRef = inject(NzModalRef);
  data = inject(NZ_MODAL_DATA);

  validateForm!: FormGroup;
  isLoading = false;
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.data?.language;
    this.initForm(this.data?.language);
  }

  getIconName(iconKey?: string): string {
    const code = this.validateForm?.get('code')?.value;

    // 1. По ключу
    let mapped = iconKey ? LANGUAGE_ICONS_MAP[iconKey] : null;

    // 2. По коду
    if (!mapped && code) {
      mapped = LANGUAGE_ICONS_MAP[code];
    }

    const final = mapped || LANGUAGE_ICONS_MAP['default'];
    console.log(
      `[LanguageAggregator Modal] Preview Mapping: "${iconKey}" (code: ${code}) -> "${final}"`,
    );
    return final;
  }

  private initForm(lang?: LanguageAggregator): void {
    this.validateForm = this.fb.group({
      code: [lang?.code || '', [Validators.required, Validators.maxLength(10)]],
      shortCode: [lang?.shortCode || '', [Validators.required, Validators.maxLength(10)]],
      title: [lang?.title || '', [Validators.required, Validators.maxLength(100)]],
      nativeTitle: [lang?.nativeTitle || '', [Validators.required, Validators.maxLength(100)]],
      sortOrder: [lang?.sortOrder || 0],
      enabled: [lang?.enabled !== false],
      isDefault: [lang?.isDefault || false],
      isRtl: [lang?.isRtl || false],
      iconKey: [lang?.iconKey || '', [Validators.maxLength(20)]],
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
          this.message.success('Обновлено');
          this.modalRef.close(true);
        },
        error: (err) => {
          if (err.status === 409) {
            this.message.error('Язык с таким кодом уже существует');
          } else {
            this.message.error('Ошибка при обновлении');
          }
          this.isLoading = false;
        },
      });
    } else {
      this.apiService.create(body).subscribe({
        next: () => {
          this.message.success('Создано');
          this.modalRef.close(true);
        },
        error: (err) => {
          if (err.status === 409) {
            this.showRestoreModal(body.code);
          } else {
            this.message.error('Ошибка при создании');
          }
          this.isLoading = false;
        },
      });
    }
  }

  restore(): void {
    this.isLoading = true;
    this.apiService.restore(this.data.language.id).subscribe({
      next: () => {
        this.message.success('Язык успешно восстановлен');
        this.modalRef.close(true);
      },
      error: () => {
        this.message.error('Ошибка при восстановлении');
        this.isLoading = false;
      },
    });
  }

  private showRestoreModal(code: string): void {
    this.modalService.confirm({
      nzTitle: 'Язык уже существует',
      nzContent: `Язык с кодом "${code}" уже был создан ранее, но сейчас находится в корзине. Восстановить его?`,
      nzOkText: 'Да, восстановить и открыть',
      nzCancelText: 'Отмена',
      nzOnOk: () => {
        // Здесь нужно найти ID по коду, или сервер должен возвращать ID в ошибке 409.
        // Поскольку у нас поиск по коду может быть долгим, 
        // предположим, что мы можем просто получить список и найти.
        this.apiService.getAll(true, true).subscribe(langs => {
          const lang = langs.find(l => l.code === code);
          if (lang) {
            this.apiService.restore(lang.id).subscribe(() => {
              this.message.success('Язык восстановлен');
              this.modalRef.close(true);
            });
          }
        });
      }
    });
  }
}
