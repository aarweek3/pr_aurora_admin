import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VS_MODAL_DATA, VSModalRef } from '@shared/components/ui/vs-modal-compromise';
import { ImageEditorConfig } from '../../models/editor-config.model';
import { ImageCanvasService } from '../../services/image-canvas.service';
import { ImageEditorStateService } from '../../services/image-editor-state.service';
import { EditorCanvasComponent } from '../editor-canvas/editor-canvas.component';

@Component({
  selector: 'av-image-editor-main',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorCanvasComponent],
  providers: [ImageEditorStateService, ImageCanvasService], // Сервисы живут пока открыта модалка
  templateUrl: './image-editor-main.component.html',
  styleUrl: './image-editor-main.component.scss',
})
export class ImageEditorMainComponent implements OnInit {
  private readonly modalData = inject<ImageEditorConfig>(VS_MODAL_DATA);
  private readonly modalRef = inject(VSModalRef);
  protected readonly stateService = inject(ImageEditorStateService);
  protected readonly canvasService = inject(ImageCanvasService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** URL для загрузки из инпута */
  protected urlInput = signal<string>('');
  /** Состояние перетаскивания для UI */
  protected isDragging = signal<boolean>(false);

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

      // Загружаем в Canvas
      this.canvasService.loadImage(url).then((img) => {
        this.stateService.updateState({
          metadata: {
            ...this.stateService.state().metadata,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
          },
        });
      });
    }
  }

  /**
   * Смена инструмента
   */
  setTool(tool: 'open' | 'crop' | 'rotate' | 'filters' | 'export'): void {
    this.stateService.updateState({ activeTool: tool });
  }

  /**
   * Загрузка через системный проводник
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  /**
   * Загрузка по URL
   */
  loadFromUrl(): void {
    const url = this.urlInput();
    if (url) {
      this.doLoad(url);
    }
  }

  /**
   * Drag & Drop
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    const url = URL.createObjectURL(file);
    this.doLoad(url, file.name);
  }

  private doLoad(url: string, fileName?: string): void {
    this.canvasService.loadImage(url).then((img) => {
      this.stateService.updateState({
        originalUrl: url,
        activeTool: 'crop', // После загрузки переключаемся на основной инструмент
      });
      this.stateService.updateExport({ fileName: fileName || 'edited_image' });
      this.stateService.updateState({
        metadata: {
          ...this.state().metadata,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
        },
      });
    });
  }

  /**
   * Завершить редактирование
   */
  finish(): void {
    // В будущем здесь будет вызов экспорта
    this.modalRef.close({ action: 'saved', data: 'empty_for_now' });
  }

  @ViewChild('qualitySlider') qualitySlider!: ElementRef<HTMLDivElement>;
  private isSlidingQuality = false;

  onQualitySliderMouseDown(event: MouseEvent): void {
    this.isSlidingQuality = true;
    this.updateQualityFromEvent(event);
    document.addEventListener('mousemove', this.onQualitySliderMove);
    document.addEventListener('mouseup', this.onQualitySliderUp);
  }

  private onQualitySliderMove = (event: MouseEvent): void => {
    if (this.isSlidingQuality) {
      this.updateQualityFromEvent(event);
    }
  };

  private onQualitySliderUp = (): void => {
    this.isSlidingQuality = false;
    document.removeEventListener('mousemove', this.onQualitySliderMove);
    document.removeEventListener('mouseup', this.onQualitySliderUp);
  };

  private updateQualityFromEvent(event: MouseEvent): void {
    const slider = this.qualitySlider.nativeElement;
    const rect = slider.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;

    // Вычисляем процент от 1 до 100
    let percentage = Math.round((x / width) * 100);
    percentage = Math.max(1, Math.min(100, percentage));

    this.stateService.updateExport({ quality: percentage });
  }

  /**
   * Отмена
   */
  cancel(): void {
    this.modalRef.close();
  }
}
