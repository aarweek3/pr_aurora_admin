import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, inject, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AvImageStudioModalComponent } from '@shared/components/av-image-studio-modal/av-image-studio-modal.component';
import { AvImageUploadResult } from '@shared/components/av-image-studio-modal/models/av-image-studio-modal.model';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'av-image-picker',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AvImagePickerComponent),
      multi: true,
    },
  ],
  template: `
    <div
      class="picker-container"
      [class.has-image]="!!value"
      [style.width]="fixedSide === 'width' ? size + (isNumber(size) ? 'px' : '') : 'auto'"
      [style.height]="fixedSide === 'height' ? size + (isNumber(size) ? 'px' : '') : 'auto'"
      [style.display]="fixedSide === 'width' ? 'block' : 'inline-block'"
    >
      <!-- 1. EMPTY STATE -->
      <div *ngIf="!value" class="empty-state" (click)="openStudio()">
        <div class="upload-icon">
          <span nz-icon nzType="cloud-upload" nzTheme="outline"></span>
        </div>
        <div class="text" style="text-align: center; padding: 0 10px;">{{ placeholder }}</div>
      </div>

      <!-- 2. IMAGE PREVIEW -->
      <div *ngIf="value" class="preview-state">
        <img [src]="value" class="image-preview" />

        <div class="actions-overlay">
          <button
            nz-button
            nzType="text"
            class="action-btn"
            (click)="openStudio()"
            title="Редактировать / Заменить"
          >
            <span nz-icon nzType="edit"></span>
          </button>
          <button
            nz-button
            nzType="text"
            class="action-btn danger"
            (click)="clear()"
            title="Удалить"
          >
            <span nz-icon nzType="delete"></span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .picker-container {
        /* Размеры через [style] */
        min-height: 120px;
        min-width: 120px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        background: #fafafa;
        transition: border-color 0.3s;
        overflow: hidden;
        position: relative;
        box-sizing: border-box;
      }

      .picker-container:hover {
        border-color: #1890ff;
      }

      .picker-container.has-image {
        border-style: solid;
        background: #fff;
        min-height: auto;
        min-width: auto;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        cursor: pointer;
        padding: 20px;
        color: #8c8c8c;
      }

      .upload-icon {
        font-size: 32px;
        margin-bottom: 8px;
        color: #40a9ff;
      }

      .image-preview {
        display: block;
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
        margin: 0 auto;
      }

      .preview-state {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .actions-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        opacity: 0;
        transition: opacity 0.2s;
      }

      .preview-state:hover .actions-overlay {
        opacity: 1;
      }

      .action-btn {
        color: #fff;
        font-size: 18px;
      }
      .action-btn:hover {
        color: #1890ff;
        background: rgba(255, 255, 255, 0.2);
      }
      .action-btn.danger:hover {
        color: #ff4d4f;
      }
    `,
  ],
})
export class AvImagePickerComponent implements ControlValueAccessor {
  @Input() aspectRatio: number | null = null; // Передаем в редактор
  @Input() fixedSide: 'width' | 'height' = 'width';
  @Input() size: string | number = 300;
  @Input() placeholder = 'Нажмите для загрузки';

  @Input() value: string | null = null;
  @Output() readonly valueChange = new EventEmitter<string | null>();
  isDisabled = false;

  onChange: (value: string | null) => void = () => {};
  onTouched: () => void = () => {};

  readonly #modal = inject(NzModalService);
  readonly #msg = inject(NzMessageService);

  // --- CVA Implementation ---
  writeValue(obj: string | null): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // --- Logic ---

  openStudio() {
    // Если у нас уже есть url, передаем его в студию для редактирования
    // Примечание: Studio должна уметь принимать imageUrl во входных данных (nzData)
    const modalRef = this.#modal.create({
      nzContent: AvImageStudioModalComponent,
      nzData: {
        imageUrl: this.value,
        aspectRatio: this.aspectRatio,
      },
      nzTitle: 'Aurora Image Studio',
      nzWidth: 900,
      nzFooter: null,
      nzDraggable: true,
      nzClosable: true,
      nzMaskClosable: false,
      nzStyle: { top: '40px' },
      nzBodyStyle: { padding: '0' },
    });

    modalRef.afterClose.subscribe((result: AvImageUploadResult | undefined) => {
      // Результат возвращается только если пользователь нажал 'Сохранить'
      if (result && result.dataUrl) {
        this.handleUpload(result);
      }
    });
  }

  handleUpload(result: AvImageUploadResult) {
    console.log('AvImagePicker: Studio result:', result);

    // Студия уже загрузила картинку на сервер и вернула относительный путь (dataUrl)
    this.value = result.dataUrl;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.onTouched();

    // Опционально: можно использовать result.metadata для сохранения alt/title,
    // но текущий компонент поддерживает только строку URL.
    // Если нужно сохранять метаданные, нужно менять ngModel на объект.

    this.#msg.success('Изображение успешно обновлено');
  }

  clear() {
    this.value = null;
    this.onChange(null);
    this.valueChange.emit(null);
    this.onTouched();
  }

  isNumber(val: any): boolean {
    return typeof val === 'number';
  }
}
