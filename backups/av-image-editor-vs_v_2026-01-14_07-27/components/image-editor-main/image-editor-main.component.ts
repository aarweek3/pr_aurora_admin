import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  VS_MODAL_DATA,
  VSModalRef,
} from '@shared/components/ui/vs-modal-compromise';
import { ImageEditorConfig } from '../../models/editor-config.model';
import { ImageCanvasService } from '../../services/image-canvas.service';
import { ImageEditorStateService } from '../../services/image-editor-state.service';
import { ImageExportService } from '../../services/image-export.service';
import {
  AvCropCanvasComponent,
  AvRect,
} from '../crop-canvas/crop-canvas.component';
import { EditorCanvasComponent } from '../editor-canvas/editor-canvas.component';

@Component({
  selector: 'av-image-editor-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditorCanvasComponent,
    AvCropCanvasComponent,
  ],
  providers: [ImageEditorStateService, ImageCanvasService, ImageExportService],
  templateUrl: './image-editor-main.component.html',
  styleUrl: './image-editor-main.component.scss',
})
export class ImageEditorMainComponent implements OnInit {
  private readonly modalData = inject<ImageEditorConfig>(VS_MODAL_DATA);
  private readonly modalRef = inject(VSModalRef);
  protected readonly stateService = inject(ImageEditorStateService);
  protected readonly canvasService = inject(ImageCanvasService);
  protected readonly exportService = inject(ImageExportService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // UI Signals
  readonly editorTitle = signal('Image Editor');
  readonly isDragging = signal(false);

  // Inputs
  readonly urlInput = signal('');
  readonly cropWidthInput = signal<number>(0);
  readonly cropHeightInput = signal<number>(0);

  // Crop presets
  readonly presets = [
    {
      icon: '📱',
      label: 'Instagram Post',
      size: '1080×1080',
      width: 1080,
      height: 1080,
    },
    {
      icon: '📺',
      label: 'Instagram Story',
      size: '1080×1920',
      width: 1080,
      height: 1920,
    },
    {
      icon: '🎬',
      label: 'TikTok',
      size: '1080×1920',
      width: 1080,
      height: 1920,
    },
    {
      icon: '🖼️',
      label: 'Facebook Post',
      size: '1200×630',
      width: 1200,
      height: 630,
    },
    {
      icon: '🐦',
      label: 'Twitter Post',
      size: '1200×675',
      width: 1200,
      height: 675,
    },
    {
      icon: '💼',
      label: 'LinkedIn',
      size: '1200×627',
      width: 1200,
      height: 627,
    },
  ];

  constructor() {
    effect((onCleanup) => {
      // Зависимости для пересчета
      const format = this.state().export.format;
      const quality = this.state().export.quality;
      const rot = this.canvasService.rotation();
      const fh = this.canvasService.flipH();
      const fv = this.canvasService.flipV();
      const url = this.state().originalUrl;
      const isResizeTool = this.state().activeTool === 'resize';

      // Базовый размер для расчета Out - это либо выделенная область кропа, либо вся картинка (Src)
      const baseW =
        this.state().crop.width || this.state().metadata.originalWidth;
      const baseH =
        this.state().crop.height || this.state().metadata.originalHeight;

      // Если мы в инструменте Ресайз — Out показывает результат масштабирования ВСЕЙ картинки (Src)
      // Если в другом инструменте — Out показывает размер текущей рамки кропа (если она есть) или Src
      const targetW = isResizeTool
        ? this.state().crop.resizeWidth || this.state().metadata.originalWidth
        : baseW;

      const targetH = isResizeTool
        ? this.state().crop.resizeHeight || this.state().metadata.originalHeight
        : baseH;

      if (!url || !targetW || !targetH) return;

      const timer = setTimeout(() => {
        this.exportService
          .estimateFileSize(
            this.canvasService.getImage(),
            format,
            quality,
            rot,
            fh,
            fv,
            targetW,
            targetH
          )
          .then((res) => {
            this.stateService.updateState({
              metadata: {
                ...this.state().metadata,
                processedWidth: res.width,
                processedHeight: res.height,
                estimatedSize: res.size,
              },
            });
          });
      }, 300);

      onCleanup(() => clearTimeout(timer));
    });
  }

  get state() {
    return this.stateService.state;
  }

  ngOnInit(): void {
    if (this.modalData?.image) {
      const img = this.modalData.image;
      if (typeof img === 'string') {
        this.doLoad(img);
      } else {
        // File object - convert to data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          this.doLoad(result);
        };
        reader.readAsDataURL(img);
      }
    }
  }

  // --- ACTIONS ---

  private async doLoad(url: string) {
    try {
      const img = await this.canvasService.loadImage(url);
      const currentMetadata = this.state().metadata;

      this.stateService.updateState({
        originalUrl: url,
        metadata: {
          ...currentMetadata,
          initialWidth: currentMetadata.initialWidth || img.naturalWidth,
          initialHeight: currentMetadata.initialHeight || img.naturalHeight,
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          processedWidth: img.naturalWidth,
          processedHeight: img.naturalHeight,
          estimatedSize: 0,
        },
      });
    } catch (err) {
      console.error('Failed to load image', err);
      throw err;
    }
  }

  /**
   * Смена инструмента
   */
  setTool(
    tool: 'open' | 'crop' | 'rotate' | 'resize' | 'filters' | 'export'
  ): void {
    this.stateService.updateState({
      activeTool: tool,
      systemMessage: null,
      isPreviewMode: false,
    });

    // Инициализация кропа
    if (tool === 'crop') {
      const state = this.stateService.state();
      if (!state.crop.width && state.metadata.originalWidth > 0) {
        const w = state.metadata.originalWidth;
        const h = state.metadata.originalHeight;
        const cropW = Math.round(w * 0.8);
        const cropH = Math.round(h * 0.8);
        const cropX = Math.round((w - cropW) / 2);
        const cropY = Math.round((h - cropH) / 2);

        this.stateService.updateCrop({
          width: cropW,
          height: cropH,
          x: cropX,
          y: cropY,
          enabled: true,
        });
      }
    }

    // Инициализация ресайза (всегда берем текущий "Src" размер картинки)
    if (tool === 'resize') {
      const s = this.state();
      const baseW = s.metadata.originalWidth;
      const baseH = s.metadata.originalHeight;
      this.stateService.updateCrop({
        resizeWidth: baseW,
        resizeHeight: baseH,
        resizeLocked: true,
      });
    }
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
  async loadFromUrl(): Promise<void> {
    const url = this.urlInput();
    if (!url) return;

    try {
      this.showSystemMessage('Загрузка изображения по ссылке...');
      await this.doLoad(url);
      this.showSystemMessage('Изображение успешно загружено');
      this.urlInput.set('');
      this.setTool('crop');
    } catch (err) {
      console.error('Failed to load from URL:', err);
      this.showSystemMessage('Ошибка загрузки: проверьте ссылку или CORS');
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.doLoad(result);
    };
    reader.readAsDataURL(file);
  }

  // --- UI HANDLERS ---

  setExportFormat(fmt: 'image/jpeg' | 'image/png' | 'image/webp'): void {
    this.stateService.updateState({
      export: { ...this.state().export, format: fmt },
    });
  }

  setQuality(q: number): void {
    this.stateService.updateState({
      export: { ...this.state().export, quality: q },
    });
  }

  rotate(angle: number): void {
    this.canvasService.rotate(angle);
  }

  flip(dir: 'h' | 'v'): void {
    this.canvasService.flip(dir);
  }

  cancel(): void {
    this.modalRef.close();
  }

  save(): void {
    // TODO: Implement export
    console.log('Save triggered', this.state());
    this.modalRef.close(this.state());
  }

  // --- CROP HANDLERS ---

  setCropShape(shape: 'rectangle' | 'circle'): void {
    if (shape === 'circle') {
      this.stateService.updateCrop({
        shape,
        lock: true,
        aspectRatio: 1,
      });
    } else {
      this.stateService.updateCrop({ shape });
    }
  }

  toggleCropLock(): void {
    const crop = this.state().crop;
    const current = crop.lock;
    const newLock = !current;

    console.warn(`[VS] toggleCropLock: ${newLock}`);
    window.alert('VS LOCK CLICKED! New state: ' + newLock);

    // Если включаем замок, фиксируем текущее соотношение
    if (newLock) {
      const w = crop.width || this.state().metadata.originalWidth;
      const h = crop.height || this.state().metadata.originalHeight;
      const ratio = w && h ? w / h : 1;
      this.stateService.updateCrop({ lock: true, aspectRatio: ratio });
    } else {
      this.stateService.updateCrop({ lock: false });
    }
  }

  onCropWidthChange(newWidth: number): void {
    const crop = this.state().crop;
    console.log(
      `[VS] onCropWidthChange: ${newWidth}, lock: ${crop.lock}, ratio: ${crop.aspectRatio}`
    );

    if (crop.lock && crop.aspectRatio) {
      const newHeight = Math.round(newWidth / crop.aspectRatio);
      this.stateService.updateCrop({ width: newWidth, height: newHeight });
    } else {
      this.stateService.updateCrop({ width: newWidth });
    }
  }

  onCropHeightChange(newHeight: number): void {
    const crop = this.state().crop;
    console.log(
      `[VS] onCropHeightChange: ${newHeight}, lock: ${crop.lock}, ratio: ${crop.aspectRatio}`
    );

    if (crop.lock && crop.aspectRatio) {
      const newWidth = Math.round(newHeight * crop.aspectRatio);
      this.stateService.updateCrop({ width: newWidth, height: newHeight });
    } else {
      this.stateService.updateCrop({ height: newHeight });
    }
  }

  applyPreset(preset: { width: number; height: number }): void {
    const originalW = this.state().metadata.originalWidth;
    const originalH = this.state().metadata.originalHeight;

    const x = (originalW - preset.width) / 2;
    const y = (originalH - preset.height) / 2;

    this.stateService.updateCrop({
      width: preset.width,
      height: preset.height,
      x: x > 0 ? x : 0,
      y: y > 0 ? y : 0,
      lock: true,
      aspectRatio: preset.width / preset.height,
    });
  }

  onResizeWidthChange(newWidth: number): void {
    const s = this.state().crop;
    if (s.resizeLocked) {
      const currentW = this.state().metadata.originalWidth;
      const currentH = this.state().metadata.originalHeight;
      const ratio = currentW / currentH;
      const newHeight = Math.round(newWidth / ratio);
      this.stateService.updateCrop({
        resizeWidth: newWidth,
        resizeHeight: newHeight,
      });
    } else {
      this.stateService.updateCrop({ resizeWidth: newWidth });
    }
  }

  onResizeHeightChange(newHeight: number): void {
    const s = this.state().crop;
    if (s.resizeLocked) {
      const currentW = this.state().metadata.originalWidth;
      const currentH = this.state().metadata.originalHeight;
      const ratio = currentW / currentH;
      const newWidth = Math.round(newHeight * ratio);
      this.stateService.updateCrop({
        resizeWidth: newWidth,
        resizeHeight: newHeight,
      });
    } else {
      this.stateService.updateCrop({ resizeHeight: newHeight });
    }
  }

  async applyResize(): Promise<void> {
    const s = this.state().crop;
    const newWidth = s.resizeWidth;
    const newHeight = s.resizeHeight;

    if (!newWidth || !newHeight) return;

    // Генерируем масштабированное изображение (запекаем текущие повороты/отражения)
    try {
      this.stateService.updateState({ isPreviewMode: false }); // Выходим из превью если были в нем
      const processedDataUrl = await this.generateProcessedImage();

      // Загружаем результат как НОВЫЙ оригинал
      await this.doLoad(processedDataUrl);

      // Сбрасываем трансформации (так как они уже запечены в новую картинку)
      this.canvasService.rotation.set(0);
      this.canvasService.flipH.set(false);
      this.canvasService.flipV.set(false);

      this.stateService.updateCrop({
        width: null,
        height: null,
        x: 0,
        y: 0,
      });

      this.showSystemMessage(
        `Размер холста изменен на ${newWidth}x${newHeight}`
      );
    } catch (err) {
      console.error('Resize failed', err);
      this.showSystemMessage('Ошибка при изменении размера');
    }
  }

  private showSystemMessage(msg: string): void {
    this.stateService.updateState({ systemMessage: msg });
    setTimeout(() => {
      if (this.state().systemMessage === msg) {
        this.stateService.updateState({ systemMessage: null });
      }
    }, 4000);
  }

  async toggleResultPreview(): Promise<void> {
    const s = this.state();
    if (s.isPreviewMode) {
      this.stateService.updateState({ isPreviewMode: false });
    } else {
      this.stateService.updateState({
        metadata: { ...s.metadata, estimatedSize: 0 },
      }); // Optional loader state
      try {
        const previewUrl = await this.generateProcessedImage();
        this.stateService.updateState({
          isPreviewMode: true,
          processedUrl: previewUrl,
        });
      } catch (err) {
        console.error('Failed to generate preview', err);
        this.showSystemMessage('Ошибка генерации превью');
      }
    }
  }

  private generateProcessedImage(): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = this.canvasService.getImage();
      if (!img) return reject('No image');

      const s = this.state();
      const rot = this.canvasService.rotation();
      const fh = this.canvasService.flipH();
      const fv = this.canvasService.flipV();

      // 1. Calculate intermediate canvas size (after rotation)
      const angle = (rot + 3600) % 360;
      const isRotated90 = angle === 90 || angle === 270;
      const fullW = isRotated90 ? img.naturalHeight : img.naturalWidth;
      const fullH = isRotated90 ? img.naturalWidth : img.naturalHeight;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = fullW;
      tempCanvas.height = fullH;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return reject('Canvas error');

      tempCtx.save();
      tempCtx.translate(fullW / 2, fullH / 2);
      tempCtx.rotate((rot * Math.PI) / 180);
      tempCtx.scale(fh ? -1 : 1, fv ? -1 : 1);
      tempCtx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      tempCtx.restore();

      // 2. Source: область на оригинале (учитываем кроп)
      const srcX = s.crop.x || 0;
      const srcY = s.crop.y || 0;
      const srcW = s.crop.width || fullW;
      const srcH = s.crop.height || fullH;

      // 3. Target: конечный размер (ресайз)
      const isResizeTool = s.activeTool === 'resize';
      const targetW = isResizeTool
        ? s.crop.resizeWidth || s.metadata.originalWidth
        : s.crop.width || s.metadata.originalWidth;
      const targetH = isResizeTool
        ? s.crop.resizeHeight || s.metadata.originalHeight
        : s.crop.height || s.metadata.originalHeight;

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetW;
      finalCanvas.height = targetH;
      const ctx = finalCanvas.getContext('2d');
      if (!ctx) return reject('Canvas error');

      if (s.crop.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(
          targetW / 2,
          targetH / 2,
          Math.min(targetW, targetH) / 2,
          0,
          Math.PI * 2
        );
        ctx.clip();
      }

      ctx.drawImage(tempCanvas, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);

      let format = s.export.format;
      if (s.crop.shape === 'circle' && format === 'image/jpeg') {
        format = 'image/webp';
      }

      const dataUrl = finalCanvas.toDataURL(format, s.export.quality / 100);
      resolve(dataUrl);
    });
  }

  applyCropAction(): void {
    console.warn('[VS] APPLY CROP ACTION STARTED');
    const img = this.canvasService.getImage();
    if (!img) {
      console.error('[VS] No image found in canvasService');
      return;
    }

    const state = this.state();
    const crop = state.crop;

    console.log('[VS] Current Crop State:', JSON.stringify(crop));

    if (!crop.width || !crop.height) {
      console.warn('[VS] Crop dimensions missing or zero');
      return;
    }

    const rot = this.canvasService.rotation();
    const fh = this.canvasService.flipH();
    const fv = this.canvasService.flipV();

    const tempCanvas = document.createElement('canvas');
    const angle = (rot + 3600) % 360;
    const isRotated90 = angle === 90 || angle === 270;

    const fullW = isRotated90 ? img.naturalHeight : img.naturalWidth;
    const fullH = isRotated90 ? img.naturalWidth : img.naturalHeight;

    tempCanvas.width = fullW;
    tempCanvas.height = fullH;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(fullW / 2, fullH / 2);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.scale(fh ? -1 : 1, fv ? -1 : 1);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    ctx.restore();

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = crop.width;
    finalCanvas.height = crop.height;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) return;

    // Если круг — применяем маску
    if (crop.shape === 'circle') {
      finalCtx.beginPath();
      finalCtx.arc(
        crop.width / 2,
        crop.height / 2,
        Math.min(crop.width, crop.height) / 2,
        0,
        Math.PI * 2
      );
      finalCtx.clip();
    }

    finalCtx.drawImage(
      tempCanvas,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );

    let format = state.export.format;
    // Для круга нужен формат с прозрачностью
    if (crop.shape === 'circle' && format === 'image/jpeg') {
      format = 'image/webp';
      this.stateService.updateExport({ format });
    }

    const croppedDataUrl = finalCanvas.toDataURL(
      format,
      state.export.quality / 100
    );

    this.doLoad(croppedDataUrl)
      .then(() => {
        console.warn('[VS] Crop applied successfully');

        // Сбрасываем трансформации, так как кроп их уже запек
        this.canvasService.rotation.set(0);
        this.canvasService.flipH.set(false);
        this.canvasService.flipV.set(false);

        this.stateService.updateCrop({
          width: null,
          height: null,
          x: 0,
          y: 0,
          enabled: false,
        });

        this.showSystemMessage('Изображение обрезано');

        // Показываем результат (Preview Mode), но не уходим из текущей вкладки Кропа
        this.toggleResultPreview();
      })
      .catch((err) => {
        console.error('[VS] Failed to apply crop:', err);
        window.alert('Ошибка при обрезке: ' + err.message);
      });
  }

  onCropFromCanvas(rect: AvRect): void {
    this.stateService.updateCrop(rect);
  }

  onQualitySliderMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  finish(): void {
    this.save();
  }
}
