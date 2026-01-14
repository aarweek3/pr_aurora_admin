import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';

import { VS_MODAL_DATA, VSModalRef } from '@shared/components/ui/vs-modal-compromise';
import { ImageEditorConfig } from '../../models/editor-config.model';
import { ImageEditorStateService } from '../../services/image-editor-state.service';

@Component({
  selector: 'av-image-editor-main',
  standalone: true,
  imports: [CommonModule],
  providers: [ImageEditorStateService], // Сервис живет пока открыта модалка
  templateUrl: './image-editor-main.component.html',
  styleUrl: './image-editor-main.component.scss',
})
export class ImageEditorMainComponent implements OnInit {
  private readonly modalData = inject<ImageEditorConfig>(VS_MODAL_DATA);
  private readonly modalRef = inject(VSModalRef);
  protected readonly stateService = inject(ImageEditorStateService);

  /** Сигнал состояния для шаблона */
  protected readonly state = this.stateService.state;

  ngOnInit(): void {
    console.log('🖼️ Image Editor VS Initialized with:', this.modalData);

    // Инициализируем состояние стартовыми данными
    if (this.modalData?.image) {
      const url =
        typeof this.modalData.image === 'string'
          ? this.modalData.image
          : URL.createObjectURL(this.modalData.image);

      this.stateService.updateState({ originalUrl: url });
    }
  }

  /**
   * Завершить редактирование
   */
  finish(): void {
    // В будущем здесь будет вызов экспорта
    this.modalRef.close({ action: 'saved', data: 'empty_for_now' });
  }

  /**
   * Отмена
   */
  cancel(): void {
    this.modalRef.close();
  }
}
