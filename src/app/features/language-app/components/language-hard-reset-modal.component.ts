import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-language-hard-reset-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NzInputModule, NzButtonModule, NzTypographyModule],
  template: `
    <div class="hard-reset-confirm">
      <p nz-paragraph>
        <span nz-typography nzType="danger"><strong>ВНИМАНИЕ!</strong></span> Это действие удалит
        <strong>ВСЕ</strong> языки из базы данных и сбросит счетчик ID. Это действие необратимо.
      </p>

      <p nz-paragraph>Введите <strong>Удалить</strong> для очистки Базы данных языков</p>

      <input
        nz-input
        placeholder="Введите 'Удалить'"
        [(ngModel)]="confirmText"
        (keyup.enter)="confirmText === 'Удалить' && onConfirm()"
      />

      <div class="footer-actions">
        <button nz-button nzType="default" (click)="onCancel()" [nzLoading]="isLoading">
          Отмена
        </button>
        <button
          nz-button
          nzType="primary"
          nzDanger
          [disabled]="confirmText !== 'Удалить'"
          [nzLoading]="isLoading"
          (click)="onConfirm()"
        >
          Подтвердить
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .hard-reset-confirm {
        padding: 8px 0;
      }
      .footer-actions {
        margin-top: 24px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }
    `,
  ],
})
export class LanguageHardResetModalComponent {
  private modal = inject(NzModalRef);
  confirmText = '';
  isLoading = false;

  onCancel(): void {
    this.modal.destroy(false);
  }

  onConfirm(): void {
    if (this.confirmText === 'Удалить') {
      this.modal.destroy(true);
    }
  }
}
