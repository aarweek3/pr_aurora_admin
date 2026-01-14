import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { VS_MODAL_DATA, VSModalRef } from '@shared/components/ui/vs-modal-compromise';
import { ImageEditorConfig } from '../../models/editor-config.model';
import { ImageCanvasService } from '../../services/image-canvas.service';
import { ImageEditorStateService } from '../../services/image-editor-state.service';
import { ImageExportService } from '../../services/image-export.service';
import { AvCropCanvasComponent, AvRect } from '../crop-canvas/crop-canvas.component';
import { EditorCanvasComponent } from '../editor-canvas/editor-canvas.component';

@Component({
  selector: 'av-image-editor-main',
  standalone: true,
  imports: [CommonModule, FormsModule, EditorCanvasComponent, AvCropCanvasComponent],
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
  readonly resizePanelOpen = signal(false);

  // Inputs
  readonly urlInput = signal('');
  readonly cropWidthInput = signal<number>(0);
  readonly cropHeightInput = signal<number>(0);

  // Crop presets
  readonly presets = [
    { icon: '📱', label: 'Instagram Post', size: '1080×1080', width: 1080, height: 1080 },
    { icon: '📺', label: 'Instagram Story', size: '1080×1920', width: 1080, height: 1920 },
    { icon: '🎬', label: 'TikTok', size: '1080×1920', width: 1080, height: 1920 },
    { icon: '🖼️', label: 'Facebook Post', size: '1200×630', width: 1200, height: 630 },
    { icon: '🐦', label: 'Twitter Post', size: '1200×675', width: 1200, height: 675 },
    { icon: '💼', label: 'LinkedIn', size: '1200×627', width: 1200, height: 627 },
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

      if (!url) return;

      const timer = setTimeout(() => {
        this.exportService
          .estimateFileSize(this.canvasService.getImage(), format, quality, rot, fh, fv)
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

      this.stateService.updateState({
        originalUrl: url,
        metadata: {
          originalWidth: img.naturalWidth,
          originalHeight: img.naturalHeight,
          processedWidth: img.naturalWidth,
          processedHeight: img.naturalHeight,
          estimatedSize: 0,
        },
      });
    } catch (err) {
      console.error('Failed to load image', err);
    }
  }

  /**
   * Смена инструмента
   */
  setTool(tool: 'open' | 'crop' | 'rotate' | 'filters' | 'export'): void {
    this.stateService.updateState({ activeTool: tool });

    // Инициализация кропа при первом входе, если не задан
    if (tool === 'crop') {
      const state = this.stateService.state();
      if (!state.crop.width && state.metadata.originalWidth > 0) {
        const w = state.metadata.originalWidth;
        const h = state.metadata.originalHeight;

        // По умолчанию 80% от картинки
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.doLoad(result);
    };
    reader.readAsDataURL(file);
  }

  // --- UI HANDLERS ---

  setExportFormat(fmt: 'image/jpeg' | 'image/png' | 'image/webp'): void {
    this.stateService.updateState({ export: { ...this.state().export, format: fmt } });
  }

  setQuality(q: number): void {
    this.stateService.updateState({ export: { ...this.state().export, quality: q } });
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
    this.stateService.updateCrop({ shape });
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
      `[VS] onCropWidthChange: ${newWidth}, lock: ${crop.lock}, ratio: ${crop.aspectRatio}`,
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
      `[VS] onCropHeightChange: ${newHeight}, lock: ${crop.lock}, ratio: ${crop.aspectRatio}`,
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

  toggleResizePanel(): void {
    this.resizePanelOpen.update((v) => !v);
  }

  applyResize(): void {
    console.log('Apply Resize not implemented yet');
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

    finalCtx.drawImage(
      tempCanvas,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height,
    );

    const croppedDataUrl = finalCanvas.toDataURL(state.export.format, state.export.quality / 100);

    this.doLoad(croppedDataUrl)
      .then(() => {
        console.warn('[VS] Crop applied successfully');
        window.alert('ОБРЕЗКА ВЫПОЛНЕНА! Сейчас вы перейдете в режим экспорта.');

        this.stateService.updateCrop({
          width: null,
          height: null,
          enabled: false,
        });
        this.setTool('export');
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
