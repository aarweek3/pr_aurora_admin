import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  effect,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { lastValueFrom } from 'rxjs';

import { ModalRef } from '@shared/components/ui/modal/models/modal-ref.model';
import { AvSpinnerComponent } from '@shared/components/ui/spinner/spinner.component';
import { CropCanvasComponent } from './crop-canvas/crop-canvas.component';
import { AvImageUploadResult, AvRect } from './models/av-image-studio-modal.model';
import { AvImageStudioIngestionService } from './services/av-image-studio-ingestion.service';
import { AvImageStudioPersistenceService } from './services/av-image-studio-persistence.service';

@Component({
  selector: 'app-av-image-studio-v2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzGridModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzSliderModule,
    NzSelectModule,
    NzRadioModule,
    NzCollapseModule,
    NzCheckboxModule,
    NzToolTipModule,
    NzDropDownModule,
    NzSwitchModule,
    DragDropModule,
    CropCanvasComponent,
    AvSpinnerComponent,
  ],
  templateUrl: './av-image-studio-v2.component.html',
  styleUrls: ['./av-image-studio-v2.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvImageStudioV2Component implements OnInit {
  public readonly modalRef = inject(ModalRef<AvImageUploadResult>);
  public readonly cdr = inject(ChangeDetectorRef);
  public readonly loader = inject(AvImageStudioIngestionService);
  public readonly persistence = inject(AvImageStudioPersistenceService);
  private readonly msg = inject(NzMessageService);

  // Конфиг для av-modal
  get modalConfig() {
    return this.modalRef.config;
  }

  // Состояние данных
  isModalOpen = true;
  imageUrl: string | null = null;
  fileName = 'Выберите файл...';
  estimatedSize = 0;
  originalWidth = 0;
  originalHeight = 0;
  targetWidth = 0;
  targetHeight = 0;
  targetLocked = true;

  // SEO
  seoAlt = '';
  seoTitle = '';
  seoCaption = '';
  seoDescription = '';

  // Link
  linkUrl = '';
  linkClickable = false;
  linkInNewWindow = false;

  // Настройки
  exportFormat: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg';
  quality = 85;
  cropShape: 'rectangle' | 'circle' = 'rectangle';
  align: 'left' | 'center' | 'right' = 'center';

  // Кроп
  isCropEnabled = true;
  isResizeManual = false;
  currentCrop: AvRect | null = null;
  externalCrop: AvRect | null = null;

  // Круговой кроп (из исходника)
  circleRadius = 100;
  circleX = 150;
  circleY = 150;

  isCanvasReady = false;

  constructor() {
    console.log('[StudioV2] Constructor called');
    // Реакция на загрузку изображения
    effect(() => {
      const result = this.loader.currentResult();
      if (result) {
        this.isCanvasReady = false; // Reset ready state for new image
        this.imageUrl = result.dataUrl;
        this.fileName = result.fileName;
        this.estimatedSize = result.fileSize;
        this.originalWidth = result.width;
        this.originalHeight = result.height;
        this.targetWidth = result.width;
        this.targetHeight = result.height;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit() {
    console.log('[StudioV2] ngOnInit called');
    const data = this.modalRef.config.data;
    if (data?.imageUrl) {
      this.loader.loadFromUrl(data.imageUrl);
    }
    if (data?.metadata) {
      this.seoAlt = data.metadata.altText || '';
      this.seoTitle = data.metadata.titleText || '';
      this.seoCaption = data.metadata.caption || '';
    }
  }

  presets = [
    { icon: '📷', label: 'Instagram Post', size: '1080 × 1080', ratio: 1 },
    { icon: '📱', label: 'Instagram Story', size: '1080 × 1920', ratio: 9 / 16 },
    { icon: '▶️', label: 'YouTube Thumb', size: '1280 × 720', ratio: 16 / 9 },
    { icon: '📺', label: 'Full HD', size: '1920 × 1080', ratio: 16 / 9 },
    { icon: '🎬', label: 'TikTok Video', size: '1080 × 1920', ratio: 9 / 16 },
    { icon: '👤', label: 'Facebook Post', size: '1200 × 630', ratio: 1.91 },
    { icon: '🐦', label: 'Twitter Post', size: '1200 × 675', ratio: 16 / 9 },
    { icon: '💼', label: 'LinkedIn Cover', size: '1584 × 396', ratio: 4 },
  ];

  // Image Resize State
  showResizePanel = false;
  resizeWidth = 0;
  resizeHeight = 0;
  resizeLocked = true;
  private resizeRatio = 1;

  toggleResizePanel() {
    this.showResizePanel = !this.showResizePanel;
    if (this.showResizePanel) {
      this.resizeWidth = this.targetWidth;
      this.resizeHeight = this.targetHeight;
      this.resizeRatio = this.targetHeight > 0 ? this.targetWidth / this.targetHeight : 1;
    }
  }

  onResizeWidthChange() {
    if (this.resizeLocked && this.resizeRatio > 0) {
      this.resizeHeight = Math.round(this.resizeWidth / this.resizeRatio);
    }
  }

  onResizeHeightChange() {
    if (this.resizeLocked && this.resizeRatio > 0) {
      this.resizeWidth = Math.round(this.resizeHeight * this.resizeRatio);
    }
  }

  applyResize() {
    this.targetWidth = this.resizeWidth;
    this.targetHeight = this.resizeHeight;
    this.showResizePanel = false;
    this.updateManualCrop();
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.loader.loadFromFile(file);
    }
  }

  // Drag-and-Drop Handlers
  isDragging = false;
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    this.loader.handleDrop(event);
  }

  setCropShape(shape: 'rectangle' | 'circle') {
    this.cropShape = shape;
    if (shape === 'circle') {
      // Для круга страхуем, чтобы был квадрат
      const side = Math.min(this.targetWidth, this.targetHeight);
      this.targetWidth = side;
      this.targetHeight = side;
      this.updateManualCrop();
    }
  }

  toggleTargetLock() {
    this.targetLocked = !this.targetLocked;
  }

  // Обновление кропа из инпутов (Прямоугольник)
  updateManualCrop(type?: 'width' | 'height', value?: number) {
    this.isResizeManual = true;

    // Логика Link (сохранение пропорций)
    if (
      this.targetLocked &&
      type &&
      value !== undefined &&
      this.targetWidth > 0 &&
      this.targetHeight > 0
    ) {
      // Текущее соотношение
      const ratio = this.targetWidth / this.targetHeight;
      if (type === 'width') {
        this.targetHeight = Math.round(value / ratio);
      } else {
        this.targetWidth = Math.round(value * ratio);
      }
    }

    // Если нет текущего кропа, берем центр
    let x = 0;
    let y = 0;
    if (this.currentCrop) {
      // Пытаемся сохранить центр текущего кропа
      const centerX = this.currentCrop.x + this.currentCrop.width / 2;
      const centerY = this.currentCrop.y + this.currentCrop.height / 2;
      x = centerX - this.targetWidth / 2;
      y = centerY - this.targetHeight / 2;
    } else {
      x = (this.originalWidth - this.targetWidth) / 2;
      y = (this.originalHeight - this.targetHeight) / 2;
    }

    // Отправляем в Canvas
    this.externalCrop = {
      x,
      y,
      width: this.targetWidth,
      height: this.targetHeight,
    };
    this.cdr.markForCheck();
  }

  // Обновление кропа из инпутов (Круг)
  updateCircleCrop() {
    this.isResizeManual = true;
    // Круг описывается квадратом
    const side = this.circleRadius * 2;
    const x = this.circleX - this.circleRadius;
    const y = this.circleY - this.circleRadius;

    this.externalCrop = {
      x,
      y,
      width: side,
      height: side,
    };

    // Синхронизируем width/height для старого api
    this.targetWidth = side;
    this.targetHeight = side;

    this.cdr.markForCheck();
  }

  onCanvasReady() {
    this.isCanvasReady = true;
    this.cdr.detectChanges();
  }

  toggleCrop(enabled: boolean) {
    this.isCropEnabled = enabled;
    if (enabled) {
      this.isCanvasReady = false; // Reset waiting for canvas
    }
    if (!enabled && !this.isResizeManual) {
      // Возвращаем размеры к оригиналу, если кроп выключен и нет ручного ресайза
      this.targetWidth = this.originalWidth;
      this.targetHeight = this.originalHeight;
    }
    this.cdr.markForCheck();
  }

  onCropChange(rect: AvRect) {
    this.currentCrop = rect;
    if (this.isCropEnabled && !this.isResizeManual) {
      if (this.cropShape === 'rectangle') {
        this.targetWidth = Math.round(rect.width);
        this.targetHeight = Math.round(rect.height);
      } else {
        // Синхронизируем круговой кроп из прямоугольного ректа
        this.circleRadius = Math.round(Math.min(rect.width, rect.height) / 2);
        this.circleX = Math.round(rect.x + rect.width / 2);
        this.circleY = Math.round(rect.y + rect.height / 2);
      }
    }
    this.cdr.markForCheck();
  }

  updateTargetSize(type: 'width' | 'height', value: number) {
    if (type === 'width') {
      this.targetWidth = value;
    } else {
      this.targetHeight = value;
    }
    this.updateManualCrop(type, value);
  }

  applyPreset(preset: any) {
    const [w, h] = preset.size.split(' × ').map(Number);
    this.targetWidth = w;
    this.targetHeight = h;
    this.targetLocked = true;
    this.isResizeManual = true;
    this.isCropEnabled = true;

    // Центрируем кроп под новый размер
    const ratio = w / h;
    let cropW = this.originalWidth;
    let cropH = this.originalWidth / ratio;

    if (cropH > this.originalHeight) {
      cropH = this.originalHeight;
      cropW = this.originalHeight * ratio;
    }

    const x = (this.originalWidth - cropW) / 2;
    const y = (this.originalHeight - cropH) / 2;

    this.externalCrop = {
      x,
      y,
      width: cropW,
      height: cropH,
    };
    this.setCropShape('rectangle');
    this.cdr.markForCheck();
  }

  cancel() {
    this.modalRef.close();
  }

  async save() {
    this.loader.isLoading.set(true);
    try {
      const processedDataUrl = await this.generateProcessedImage();
      const file = this.dataURLtoFile(processedDataUrl, this.fileName);

      const result: AvImageUploadResult = {
        dataUrl: processedDataUrl,
        file: file,
        name: this.fileName,
        width: this.targetWidth,
        height: this.targetHeight,
        size: file.size,
        metadata: {
          fileName: this.fileName,
          altText: this.seoAlt,
          titleText: this.seoTitle,
          caption: this.seoCaption,
          align: this.align,
        },
      };

      // Сохранение на сервер
      const uploadResponse = await lastValueFrom(this.persistence.saveImage(result));
      if (uploadResponse.success) {
        result.dataUrl = uploadResponse.url;
      }

      this.modalRef.close(result);
    } catch (err) {
      console.error('Save failed:', err);
      this.msg.error('Ошибка при сохранении изображения');
    } finally {
      this.loader.isLoading.set(false);
    }
  }

  private dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  private generateProcessedImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.imageUrl) {
        return resolve('');
      }

      // Если кроп выключен и размеры совпадают с оригиналом - отдаем как есть
      if (!this.isCropEnabled && !this.isResizeManual) {
        return resolve(this.imageUrl);
      }

      const img = new Image();
      if (this.imageUrl.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Could not get canvas context');

          canvas.width = this.targetWidth || img.width;
          canvas.height = this.targetHeight || img.height;

          if (this.isCropEnabled && this.currentCrop) {
            // Рисуем обрезанную часть
            ctx.drawImage(
              img,
              this.currentCrop.x,
              this.currentCrop.y,
              this.currentCrop.width,
              this.currentCrop.height,
              0,
              0,
              canvas.width,
              canvas.height,
            );
          } else {
            // Рисуем всё изображение (просто ресайз)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }

          resolve(canvas.toDataURL(this.exportFormat, this.quality / 100));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = this.imageUrl!;
    });
  }
}
