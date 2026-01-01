import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImageConfig } from '../../interfaces/image.interfaces';
import { ExportImageModalComponent } from '../../modals/export-image-modal/export-image-modal.component';
import { AuroraImageService } from '../../services/aurora-image.service';
import { CropTool } from '../../services/crop-tool';
import { CropConfig, CropPreset } from '../../services/crop.types';
import {
  WatermarkConfig,
  WatermarkPosition,
  WatermarkService,
} from '../../services/watermark.service';
// Circle plugin types
import { CircleConfig, CircleService } from '../../plugins/circle';
import { CircleUtilsImpl } from '../../plugins/circle/utils/circle.utils';
// Frame plugin types
import { FrameConfig, FramePreset, FrameService } from '../../plugins/frame';
// Новые сервисы для оптимизации
import { CropService } from '../../services/crop.service';
import {
  ImageFileService,
  ImageLoadResult as ServiceImageLoadResult,
} from '../../services/image-file.service';
import {
  ImageHistoryService,
  ImageOperation,
  ImageOperationType,
  ImageMetadata as ServiceImageMetadata,
} from '../../services/image-history.service';
import { ImageLoadService } from '../../services/image-load.service';
import { ImageModalStateService } from '../../services/image-modal-state.service';
import { ImageProcessingService } from '../../services/image-processing.service';
import { ImageTransformService } from '../../services/image-transform.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { CropPresetsComponent } from '../crop-presets/crop-presets.component';
import { ToastNotificationComponent } from '../toast-notification/toast-notification.component';
import { UploadState } from './models/image-modal.types';
import { ImageModalService } from './services/image-modal.service';

// ═══════════════════════════════════════════════════════════════
// ИМПОРТ ТИПОВ ИЗ СЕРВИСОВ
// ═══════════════════════════════════════════════════════════════

/**
 * Центральное хранилище изображения
 * Вариант В: Только Data URL, без кешированного HTMLImageElement
 */
interface ImageData {
  // Data URL версии
  original: string | null; // Оригинал (после загрузки, неизменяемый)
  current: string | null; // Текущая версия (после всех операций)

  // Метаданные
  metadata: ServiceImageMetadata | null;

  // История операций (для Undo/Redo)
  history: ImageOperation[];

  // Индекс текущей операции в истории (-1 = нет операций)
  historyIndex: number;
}

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, CropPresetsComponent, ExportImageModalComponent],
  providers: [AuroraImageService],
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss'],
})
export class ImageModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() imageSelected = new EventEmitter<{ config: ImageConfig; imageUrl: string }>();
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  @ViewChild('editorCanvas') editorCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('modalWindow') modalWindow?: ElementRef<HTMLDivElement>;
  @ViewChild('uploadCanvas') uploadCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropCanvas') cropCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropOverlay') cropOverlay?: ElementRef<HTMLCanvasElement>;
  @ViewChild('cropCanvasArea') cropCanvasArea?: ElementRef<HTMLDivElement>;
  @ViewChild('circleCanvas') circleCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('circleOverlay') circleOverlay?: ElementRef<HTMLCanvasElement>;
  @ViewChild('frameCanvas') frameCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('bodyCanvas') bodyCanvas?: ElementRef<HTMLDivElement>;
  @ViewChild('watermarkCanvas') watermarkCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('exportModal') exportModal?: ExportImageModalComponent;

  isOpen = false;
  activeTab: 'upload' | 'crop' | 'circle' | 'frame' | 'edit' | 'watermark' | 'settings' = 'upload';

  // ═══════════════════════════════════════════════════════════════
  // НОВАЯ АРХИТЕКТУРА: Единое хранилище изображения
  // ═══════════════════════════════════════════════════════════════

  /**
   * Центральное хранилище изображения с историей операций
   * Теперь используется через ImageHistoryService
   */
  get imageData() {
    const data = this.imageHistoryService.imageData();
    return (
      data || {
        original: null,
        current: null,
        metadata: null,
        history: [],
        historyIndex: -1,
      }
    );
  }

  /**
   * Конфигурация водяного знака (v2)
   */
  watermarkConfig: WatermarkConfig = {
    enabled: true, // Включен по умолчанию для отображения настроек
    type: 'text', // v2: по умолчанию текстовый
    text: '© 2025', // Дефолтный текст для отображения настроек
    position: 'bottom-right',
    fontSize: 0, // 0 = автоматический расчет
    fontFamily: 'Arial',
    color: '#FFFFFF',
    opacity: 70,
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
  };

  /**
   * URL превью загруженного логотипа (v2)
   */
  logoPreviewUrl: string | null = null;

  /**
   * Получить список доступных шрифтов (v2)
   */
  get availableFonts() {
    return this.watermarkService.getAvailableFonts();
  }

  // ═══════════════════════════════════════════════════════════════
  // UI STATE (временные переменные для UI)
  // ═══════════════════════════════════════════════════════════════

  // Универсальная структура - управление sidebar и статусом
  showSidebar: boolean = false;
  statusMessage: string = 'Выберите изображение для загрузки';
  statusIcon: string = 'ℹ️';
  sourceType: 'url' | 'file' | 'drop' = 'file';
  imageUrl = '';
  selectedFile?: File;
  errorMessage = '';
  uploading = false;
  uploadProgress = 0;

  // Modal drag state
  isDraggingModal = false;
  modalDragStartX = 0;
  modalDragStartY = 0;
  modalLeft = 0;
  modalTop = 0;

  // ═══════════════════════════════════════════════════════════════
  // BACKWARD COMPATIBILITY (для совместимости, постепенно удалим)
  // ═══════════════════════════════════════════════════════════════

  /** @deprecated Используйте imageData.current */
  get previewUrl(): string {
    return this.imageData.current || '';
  }

  /** @deprecated Используйте imageData.metadata.fileName */
  get imageFileName(): string {
    return this.imageData.metadata?.fileName || '';
  }

  /** @deprecated Используйте imageData.metadata.fileSize */
  get imageFileSize(): number {
    return this.imageData.metadata?.fileSize || 0;
  }

  /**
   * Получить форматированную строку для статус-бара
   * Формат: "📐 1200×800px (было 3000×2000) | 💾 450KB (было 2.4MB) | 🖼️ PNG (было JPEG)"
   */
  get statusBarInfo(): string {
    if (!this.imageData.metadata) return '';

    const meta = this.imageData.metadata;
    const parts: string[] = [];

    // Размеры
    if (meta.originalWidth && meta.originalHeight) {
      parts.push(
        `📐 ${meta.width}×${meta.height}px (было ${meta.originalWidth}×${meta.originalHeight})`,
      );
    } else {
      parts.push(`📐 ${meta.width}×${meta.height}px`);
    }

    // Размер файла
    const currentSize = this.imageFileService.formatFileSize(meta.fileSize);
    if (meta.originalFileSize) {
      const originalSize = this.imageFileService.formatFileSize(meta.originalFileSize);
      parts.push(`💾 ${currentSize} (было ${originalSize})`);
    } else {
      parts.push(`💾 ${currentSize}`);
    }

    // Формат
    const currentFormat = this.getFormatDisplayName(meta.format);
    parts.push(`🖼️ ${currentFormat}`);

    return parts.join(' | ');
  }

  // ═══════════════════════════════════════════════════════════════
  // IMAGE INFO POPOVER
  // ═══════════════════════════════════════════════════════════════

  /**
   * Флаг отображения popover с детальной информацией об изображении
   */
  showImageInfoPopover: boolean = false;

  /**
   * Переключить отображение popover с информацией об изображении
   */
  toggleImageInfoPopover(): void {
    this.showImageInfoPopover = !this.showImageInfoPopover;
  }

  /**
   * Получить процент изменения размера изображения (ширина × высота)
   * @param meta - метаданные изображения
   * @returns процент изменения (положительное = уменьшение, отрицательное = увеличение)
   */
  getImageSizeChangePercent(meta: ServiceImageMetadata): number {
    if (!meta.originalWidth || !meta.originalHeight) return 0;

    const originalArea = meta.originalWidth * meta.originalHeight;
    const currentArea = meta.width * meta.height;
    const change = ((originalArea - currentArea) / originalArea) * 100;

    return Math.round(change);
  }

  /**
   * Получить процент изменения размера файла
   * @param meta - метаданные изображения
   * @returns процент изменения (положительное = уменьшение, отрицательное = увеличение)
   */
  getFileSizeChangePercent(meta: ServiceImageMetadata): number {
    if (!meta.originalFileSize) return 0;

    const change = ((meta.originalFileSize - meta.fileSize) / meta.originalFileSize) * 100;

    return Math.round(change);
  }

  /**
   * Получить человекочитаемое название источника изображения
   * @param source - тип источника
   * @returns отформатированное название
   */
  getSourceDisplayName(source: 'file' | 'url' | 'unsplash'): string {
    const sourceMap: Record<string, string> = {
      file: 'Загружено с компьютера',
      url: 'Загружено по URL',
      unsplash: 'Unsplash',
    };

    return sourceMap[source] || source;
  }

  /** @deprecated Legacy crop data - используйте imageData */
  private _legacyCroppedData: string | null = null;
  private _legacyCroppedDimensions: { width: number; height: number } | null = null;

  // Геттеры для доступа к legacy данным в шаблоне
  get legacyCroppedData(): string | null {
    return this._legacyCroppedData;
  }

  get legacyCroppedDimensions(): { width: number; height: number } | null {
    return this._legacyCroppedDimensions;
  }

  // ═══════════════════════════════════════════════════════════════
  // CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  config: ImageConfig = {
    source: 'url',
    width: '100%',
    alignment: 'center',
  };

  customWidth = 500;
  isDragOver = false;

  customCropWidth = 800;
  customCropHeight = 600;

  // Фильтры (работают в реальном времени через CSS)
  brightness = 0;
  contrast = 0;
  saturation = 0;
  hueRotate = 0;
  blur = 0;
  grayscale = 0;
  sepia = 0;
  invert = 0;

  // Пропорциональное изменение размеров
  aspectRatioLocked = false;
  private aspectRatio = 0;

  // Crop state
  cropConfig: CropConfig = {
    proportional: true,
    showGrid: true,
    hardSizeEnabled: true,
    targetWidth: undefined,
    targetHeight: undefined,
    proportionLocked: false,
  };
  selectedPreset: CropPreset | null = null;
  private cropTool: CropTool | null = null;
  private cropImage: HTMLImageElement | null = null;

  // Circle crop state
  circleConfig: CircleConfig = {
    centerX: 0,
    centerY: 0,
    radius: 50,
    strokeWidth: 2,
    strokeColor: '#007bff',
    fillOpacity: 0.3,
  };
  private circleService: CircleService | null = null;
  private circleImage: HTMLImageElement | null = null;

  // Frame state
  frameConfig: FrameConfig = {
    type: 'solid',
    thickness: 3,
    color: '#000000',
    opacity: 1,
    padding: 0, // По умолчанию без отступа
    borderRadius: 0,
  };
  framePresets: FramePreset[] = [];
  selectedFramePreset: string | null = null;
  private frameImage: HTMLImageElement | null = null;
  private originalFrameImage: HTMLImageElement | null = null; // Запоминаем оригинал для многократного применения

  // ═══════════════════════════════════════════════════════════════
  // SCALING SYSTEM (TZ_CROP_SCALING.md)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Размеры оригинального изображения (naturalWidth/Height)
   */
  private originalImageDimensions = { width: 0, height: 0 };

  /**
   * Размеры отображения изображения на canvas
   */
  private canvasDisplayDimensions = { width: 0, height: 0 };

  /**
   * Коэффициент масштабирования (canvas / original)
   */
  private displayScale = 1;

  private callback?: (config: ImageConfig, imageUrl: string) => void;

  // ═══════════════════════════════════════════════════════════════
  // SERVER UPLOAD STATE (загрузка на сервер)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Состояние загрузки изображения на сервер
   */
  uploadState: UploadState = {
    isUploading: false,
    uploadProgress: 0,
    uploadError: null,
    serverImageId: null,
  };

  constructor(
    private imageService: AuroraImageService,
    private imageModalService: ImageModalService,
    private watermarkService: WatermarkService,
    private imageProcessingService: ImageProcessingService,
    private imageHistoryService: ImageHistoryService,
    private imageModalStateService: ImageModalStateService,
    private imageFileService: ImageFileService,
    private imageUploadService: ImageUploadService,
    private cropService: CropService,
    private imageLoadService: ImageLoadService,
    private imageTransformService: ImageTransformService,
    private frameService: FrameService,
  ) {}

  ngOnInit(): void {
    document.addEventListener('openImageModal', this.handleOpenModal as EventListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('openImageModal', this.handleOpenModal as EventListener);
    this.cleanupCropTool();
  }

  ngAfterViewInit(): void {
    console.log('🖼️ ngAfterViewInit - ViewChild elements:', {
      cropCanvas: !!this.cropCanvas,
      circleCanvas: !!this.circleCanvas,
      frameCanvas: !!this.frameCanvas,
      watermarkCanvas: !!this.watermarkCanvas,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // НОВАЯ АРХИТЕКТУРА: Методы работы с imageData
  // ═══════════════════════════════════════════════════════════════

  /**
   * @deprecated Заменено на делегирование в ImageLoadService.loadImageData()
   */
  private async loadImageData(
    dataUrl: string,
    metadata: Partial<ServiceImageMetadata>,
  ): Promise<void> {
    // Преобразуем в формат ImageLoadService
    const params = {
      dataUrl,
      metadata: {
        fileName: metadata.fileName || 'image.png',
        fileSize: metadata.fileSize || this.imageProcessingService.calculateDataUrlSize(dataUrl),
        source: metadata.source || 'file',
        sourceUrl: metadata.sourceUrl,
        alt: metadata.alt || '',
        title: metadata.title || '',
        caption: metadata.caption || '',
      } as any,
    };

    const result = await this.imageLoadService.loadImageData(params);

    if (result.success) {
      // Обновить старые переменные для совместимости
      this.updateLegacyState();
      console.log('✅ Image data loaded via ImageLoadService:', result.metadata);
    } else {
      throw new Error(result.error || 'Failed to load image data');
    }
  }

  /**
   * Применить операцию к изображению и добавить в историю
   * Вариант В: Работаем только с Data URL, метаданные обновляем через временный Image
   */
  private async applyOperation(
    type: ImageOperationType,
    params: any,
    processor: (dataUrl: string) => Promise<string>,
  ): Promise<void> {
    if (!this.imageData.current) {
      throw new Error('No image loaded');
    }

    // Применить операцию
    const resultDataUrl = await processor(this.imageData.current);

    // Создать операцию
    const operation: ImageOperation = {
      id: this.imageHistoryService.generateOperationId(),
      type,
      params,
      timestamp: Date.now(),
      resultDataUrl,
    };

    // Если мы не в конце истории (был Undo), удаляем "будущие" операции
    if (this.imageData.historyIndex < this.imageData.history.length - 1) {
      this.imageData.history = this.imageData.history.slice(0, this.imageData.historyIndex + 1);
    }

    // Добавить операцию в историю
    this.imageData.history.push(operation);
    this.imageData.historyIndex++;
    this.imageData.current = resultDataUrl;

    // 🆕 Обновить метаданные после операции (размеры, формат, fileSize)
    if (this.imageData.metadata) {
      const tempImg = await this.createImageElement(resultDataUrl);

      // Сохранить оригинальные размеры при первой операции (если еще не сохранены)
      if (!this.imageData.metadata.originalWidth && !this.imageData.metadata.originalHeight) {
        this.imageData.metadata.originalWidth = this.imageData.metadata.width;
        this.imageData.metadata.originalHeight = this.imageData.metadata.height;
        this.imageData.metadata.originalFileSize = this.imageData.metadata.fileSize;
      }

      // Обновить текущие размеры
      this.imageData.metadata.width = tempImg.width;
      this.imageData.metadata.height = tempImg.height;

      // Обновить формат (он может измениться при операциях, например, всегда PNG после обрезки)
      this.imageData.metadata.format = this.getImageFormatFromDataUrl(resultDataUrl);

      // Обновить размер файла
      this.imageData.metadata.fileSize =
        this.imageProcessingService.calculateDataUrlSize(resultDataUrl);
    }

    // Обновить старые переменные для совместимости
    this.updateLegacyState();

    console.log('✅ Operation applied (Variant V):', {
      type,
      params,
      historyLength: this.imageData.history.length,
      historyIndex: this.imageData.historyIndex,
    });
  }

  /**
   * Undo - отменить последнюю операцию
   */
  async undo(): Promise<void> {
    if (!this.canUndo()) {
      console.warn('⚠️ Cannot undo: at start of history');
      return;
    }

    this.imageData.historyIndex--;
    const operation = this.imageData.history[this.imageData.historyIndex];
    this.imageData.current = operation.resultDataUrl;

    // Обновить метаданные размеров через временный Image
    if (this.imageData.metadata) {
      const tempImg = await this.createImageElement(operation.resultDataUrl);
      this.imageData.metadata.width = tempImg.width;
      this.imageData.metadata.height = tempImg.height;
    }

    this.updateLegacyState();

    ToastNotificationComponent.show({
      type: 'info',
      message: `↶ Отменено: ${this.imageHistoryService.getOperationName(operation.type)}`,
    });

    console.log('↶ Undo to:', {
      type: operation.type,
      historyIndex: this.imageData.historyIndex,
    });
  }

  /**
   * Redo - повторить отмененную операцию
   */
  async redo(): Promise<void> {
    if (!this.canRedo()) {
      console.warn('⚠️ Cannot redo: at end of history');
      return;
    }

    this.imageData.historyIndex++;
    const operation = this.imageData.history[this.imageData.historyIndex];
    this.imageData.current = operation.resultDataUrl;

    // Обновить метаданные размеров через временный Image
    if (this.imageData.metadata) {
      const tempImg = await this.createImageElement(operation.resultDataUrl);
      this.imageData.metadata.width = tempImg.width;
      this.imageData.metadata.height = tempImg.height;
    }

    this.updateLegacyState();

    ToastNotificationComponent.show({
      type: 'info',
      message: `↷ Повторено: ${this.imageHistoryService.getOperationName(operation.type)}`,
    });

    console.log('↷ Redo to:', {
      type: operation.type,
      historyIndex: this.imageData.historyIndex,
    });
  }

  /**
   * Можно ли выполнить Undo
   */
  canUndo(): boolean {
    return this.imageHistoryService.canUndo();
  }

  /**
   * Можно ли выполнить Redo
   */
  canRedo(): boolean {
    return this.imageHistoryService.canRedo();
  }

  /**
   * Сбросить к оригиналу
   */
  async resetToOriginal(): Promise<void> {
    const result = await this.imageHistoryService.resetToOriginal();
    if (result.success) {
      this.updateLegacyState();
      ToastNotificationComponent.show({
        type: 'success',
        message: result.message,
      });
    }
  }

  /**
   * Создать HTMLImageElement из Data URL
   */
  private async createImageElement(dataUrl: string): Promise<HTMLImageElement> {
    return this.imageProcessingService.createImageElement(dataUrl);
  }

  /**
   * Обновить старые переменные для совместимости с существующим кодом
   */
  private updateLegacyState(): void {
    // Legacy method - больше не требуется, данные хранятся в imageData
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITY METHODS (вспомогательные методы для работы с изображениями)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Определить формат изображения из Data URL
   * @param dataUrl - Data URL изображения
   * @returns MIME-type формата (например, "image/jpeg", "image/png")
   */
  getImageFormatFromDataUrl(dataUrl: string): string {
    return this.imageProcessingService.getImageFormatFromDataUrl(dataUrl);
  }

  /**
   * Получить короткое название формата из MIME-type
   * @param format - MIME-type (например, "image/jpeg")
   * @returns Короткое название (например, "JPEG")
   */
  getFormatDisplayName(format: string): string {
    return this.imageFileService.getFormatDisplayName(format);
  }

  // ═══════════════════════════════════════════════════════════════
  // SCALING SYSTEM METHODS (TZ_CROP_SCALING.md)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Вычислить и обновить коэффициент масштабирования изображения
   * Использует fit-inside логику (минимальный масштаб по осям)
   */
  private updateImageScale(): void {
    if (!this.originalImageDimensions.width || !this.canvasDisplayDimensions.width) {
      console.warn('⚠️ updateImageScale: Missing dimensions', {
        original: this.originalImageDimensions,
        display: this.canvasDisplayDimensions,
      });
      return;
    }

    // Вычисляем масштаб по обеим осям
    const scaleX = this.canvasDisplayDimensions.width / this.originalImageDimensions.width;
    const scaleY = this.canvasDisplayDimensions.height / this.originalImageDimensions.height;

    // Берем минимальный масштаб (fit-inside логика)
    this.displayScale = Math.min(scaleX, scaleY);

    console.log('📏 Display scale updated:', {
      original: this.originalImageDimensions,
      display: this.canvasDisplayDimensions,
      scaleX: scaleX.toFixed(3),
      scaleY: scaleY.toFixed(3),
      displayScale: this.displayScale.toFixed(3),
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Старые методы (постепенно переписываем на новую архитектуру)
  // ═══════════════════════════════════════════════════════════════

  private handleOpenModal = (event: CustomEvent): void => {
    this.callback = event.detail.callback;
    this.open();
  };

  open(): void {
    this.isOpen = true;
    this.resetForm();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.activeTab = 'upload';
    this.sourceType = 'file';
    this.imageUrl = '';
    this.selectedFile = undefined;
    this.errorMessage = '';
    this.uploading = false;
    this.uploadProgress = 0;

    // Сбросить новую архитектуру
    this.imageHistoryService.clear();

    // Сбросить legacy данные
    this._legacyCroppedData = null;
    this._legacyCroppedDimensions = null;

    this.brightness = 0;
    this.contrast = 0;
    this.saturation = 0;

    this.config = {
      source: 'url',
      width: '100%',
      alignment: 'center',
    };

    // Reset modal position
    this.modalLeft = 0;
    this.modalTop = 0;
    if (this.modalWindow) {
      this.modalWindow.nativeElement.style.left = '';
      this.modalWindow.nativeElement.style.top = '';
      this.modalWindow.nativeElement.style.transform = '';
    }
  }

  switchTab(tab: 'upload' | 'crop' | 'circle' | 'frame' | 'edit' | 'watermark' | 'settings'): void {
    this.activeTab = tab;

    // Управление sidebar - показываем только для определённых вкладок
    this.showSidebar = ['crop', 'circle', 'frame', 'edit'].includes(tab);

    // Обновление статусного сообщения в зависимости от вкладки
    switch (tab) {
      case 'upload':
        this.statusIcon = 'ℹ️';
        this.statusMessage = 'Выберите изображение для загрузки';
        break;
      case 'crop':
        this.statusIcon = '✂️';
        this.statusMessage = 'Переместите и измените размер рамки обрезки';
        break;
      case 'circle':
        this.statusIcon = '⭕';
        this.statusMessage = 'Переместите и измените размер круга для обрезки';
        break;
      case 'frame':
        console.log('🖼️ Switch to Frame tab');
        this.statusIcon = '🖼️';
        this.statusMessage = 'Выберите стиль рамки и настройте параметры';
        break;
      case 'edit':
        this.statusIcon = '🎨';
        this.statusMessage = 'Примените фильтры и эффекты';
        break;
      case 'watermark':
        this.statusIcon = '💧';
        this.statusMessage = 'Добавьте текстовый водяной знак';
        break;
      case 'settings':
        this.statusIcon = '⚙️';
        this.statusMessage = 'Настройте отображение изображения';
        break;
    }

    // Инициализируем данные изображения для crop, circle, frame или edit вкладок
    if (
      (tab === 'crop' || tab === 'circle' || tab === 'frame' || tab === 'edit') &&
      this.previewUrl &&
      !this.imageData.original
    ) {
      this.initializeImageData();
    }

    // Инициализировать crop tool при переключении на таб Обрезка
    if (tab === 'crop' && this.previewUrl) {
      setTimeout(() => {
        this.initCropTool();
      }, 100);
    } else if (tab === 'circle' && this.previewUrl) {
      // Инициализировать circle tool при переключении на таб Круг
      setTimeout(() => {
        this.initCircleTool();
      }, 100);
    } else if (tab === 'frame' && this.previewUrl) {
      // Инициализировать frame tool при переключении на таб Рамка
      console.log('🖼️ Frame tab selected, previewUrl exists:', !!this.previewUrl);
      console.log('🖼️ imageData.current exists:', !!this.imageData.current);
      setTimeout(() => {
        this.initFrameTool();
      }, 100);
    } else if (tab === 'watermark' && this.previewUrl) {
      // Инициализировать preview водяного знака при переключении на вкладку
      setTimeout(() => {
        this.renderWatermarkPreview();
      }, 100);
    } else {
      // Подогнать содержимое canvas после смены вкладки (кроме crop, т.к. initCropTool уже делает это)
      setTimeout(() => {
        this.fitBodyCanvasContent();
      }, 150);
    }
  }

  /**
   * @deprecated Больше не нужен - loadImageData() инициализирует всё автоматически
   */
  private async initializeImageData(): Promise<void> {
    // Метод оставлен для совместимости, но фактически ничего не делает
    // Вся инициализация происходит в loadImageData()
    if (!this.imageData.current) {
      console.warn('initializeImageData called but imageData.current is null');
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const result = await this.imageLoadService.handleFileInputChange(event);

    if (!result.success) {
      this.errorMessage = result.error || 'Ошибка выбора файла';
      this.imageLoadService.showErrorMessage(this.errorMessage);
      return;
    }

    if (result.dataUrl && result.metadata) {
      this.selectedFile = undefined; // Не нужно, так как файл обрабатывается в сервисе
      this.errorMessage = '';
      this.config.source = 'file';

      // Загрузить изображение через сервис
      const loadResult = await this.imageLoadService.loadImageData({
        dataUrl: result.dataUrl,
        metadata: result.metadata,
      });

      if (loadResult.success && loadResult.metadata) {
        this.imageLoadService.showSuccessMessage(
          `${loadResult.metadata.fileName} успешно загружен`,
        );

        // Отрисовать на upload canvas
        setTimeout(() => {
          this.drawUploadCanvas();
        }, 100);
      } else {
        this.errorMessage = loadResult.error || 'Ошибка при загрузке изображения';
        this.imageLoadService.showErrorMessage(this.errorMessage);
      }
    }
  }

  /**
   * @deprecated Заменено на делегирование в ImageLoadService.handleFileInputChange()
   */

  async loadFromUrl(): Promise<void> {
    this.errorMessage = '';
    this.uploading = true;

    try {
      const result = await this.imageLoadService.loadFromUrl(this.imageUrl);

      if (!result.success) {
        this.errorMessage = result.error || 'Ошибка загрузки URL';
        this.imageLoadService.showErrorMessage(this.errorMessage);
        return;
      }

      if (result.dataUrl && result.metadata) {
        this.config.source = 'url';

        // Загрузить изображение через сервис
        const loadResult = await this.imageLoadService.loadImageData({
          dataUrl: result.dataUrl,
          metadata: result.metadata,
        });

        if (loadResult.success && loadResult.metadata) {
          this.imageLoadService.showSuccessMessage('Изображение загружено по URL');

          // Отрисовать на upload canvas
          setTimeout(() => {
            this.drawUploadCanvas();
          }, 100);
        } else {
          this.errorMessage = loadResult.error || 'Ошибка при загрузке изображения';
          this.imageLoadService.showErrorMessage(this.errorMessage);
        }
      }
    } catch (error) {
      this.errorMessage = 'Не удалось загрузить изображение';
      this.imageLoadService.showErrorMessage(this.errorMessage);
    } finally {
      this.uploading = false;
    }
  }

  private loadImageFromUrl(url: string): Promise<ServiceImageLoadResult> {
    return this.imageFileService.loadImageFromUrl(url);
  }

  /**
   * Отрисовать изображение на upload canvas
   * Использует ту же логику что и initCropTool для единообразия
   */
  private async drawUploadCanvas(): Promise<void> {
    console.log('🎨 drawUploadCanvas called via ImageLoadService');

    if (!this.uploadCanvas || !this.imageData.current || !this.bodyCanvas) {
      console.warn('⚠️ drawUploadCanvas: Missing canvas or image data');
      return;
    }

    try {
      // Делегируем отрисовку в ImageLoadService
      const success = await this.imageLoadService.drawImageOnCanvas(
        this.imageData.current,
        this.uploadCanvas,
        this.bodyCanvas,
      );

      if (success) {
        // Создать временный Image для сохранения размеров (для совместимости)
        const img = await this.createImageElement(this.imageData.current);

        this.originalImageDimensions = {
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        };

        const canvas = this.uploadCanvas.nativeElement;
        this.canvasDisplayDimensions = {
          width: canvas.width,
          height: canvas.height,
        };

        // Вычислить и сохранить масштаб отображения
        this.updateImageScale();

        // Если hardSizeEnabled - показать уведомление
        if (
          this.cropConfig.hardSizeEnabled &&
          this.cropConfig.targetWidth &&
          this.cropConfig.targetHeight
        ) {
          ToastNotificationComponent.show({
            type: 'info',
            message: `Сохранён целевой размер ${this.cropConfig.targetWidth}×${this.cropConfig.targetHeight}. Перейдите на вкладку Обрезать и нажмите "Применить размер"`,
            duration: 5000,
          });
        }

        console.log('✅ Upload canvas drawn successfully via ImageLoadService');
      } else {
        console.error('❌ ImageLoadService failed to draw canvas');
      }
    } catch (error) {
      console.error('❌ Failed to draw upload canvas:', error);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  async onDrop(event: DragEvent): Promise<void> {
    this.isDragOver = false;

    const result = await this.imageLoadService.handleDrop(event);

    if (!result.success) {
      this.errorMessage = result.error || 'Ошибка при перетаскивании файла';
      this.imageLoadService.showErrorMessage(this.errorMessage);
      return;
    }

    if (result.dataUrl && result.metadata) {
      this.errorMessage = '';
      this.config.source = 'file';

      // Загрузить изображение через сервис
      const loadResult = await this.imageLoadService.loadImageData({
        dataUrl: result.dataUrl,
        metadata: result.metadata,
      });

      if (loadResult.success && loadResult.metadata) {
        this.imageLoadService.showSuccessMessage(
          `${loadResult.metadata.fileName} успешно загружен`,
        );

        // Отрисовать на upload canvas
        setTimeout(() => {
          this.drawUploadCanvas();
        }, 100);
      } else {
        this.errorMessage = loadResult.error || 'Ошибка при загрузке изображения';
        this.imageLoadService.showErrorMessage(this.errorMessage);
      }
    }
  }

  openFileDialog(): void {
    if (this.fileInput) {
      this.imageLoadService.openFileDialog(this.fileInput);
    }
  }

  private async cropImageFromCenter(
    dataUrl: string,
    width: number,
    height: number,
  ): Promise<string> {
    return this.imageProcessingService.cropImageFromCenter(dataUrl, width, height);
  }

  async applyRotation(angle: number): Promise<void> {
    if (!this.imageData.current) {
      return;
    }

    const transformData = {
      current: this.imageData.current,
      original: this.imageData.original,
      history: this.imageData.history,
      historyIndex: this.imageData.historyIndex,
    } as any;

    await this.imageTransformService.applyRotation(transformData, angle, (newData) => {
      this.imageData.current = newData;
    });
  }

  async applyFlip(direction: 'horizontal' | 'vertical'): Promise<void> {
    if (!this.imageData.current) {
      return;
    }

    const transformData = {
      current: this.imageData.current,
      original: this.imageData.original,
      history: this.imageData.history,
      historyIndex: this.imageData.historyIndex,
    } as any;

    await this.imageTransformService.applyFlip(transformData, direction, (newData) => {
      this.imageData.current = newData;
    });
  }

  async cropCustom(): Promise<void> {
    if (!this.imageData.current) {
      ToastNotificationComponent.show({
        type: 'warning',
        message: 'Сначала загрузите изображение',
      });
      return;
    }

    if (this.customCropWidth < 1 || this.customCropWidth > 4000) {
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Ширина должна быть от 1 до 4000 пикселей',
      });
      return;
    }

    if (this.customCropHeight < 1 || this.customCropHeight > 4000) {
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Высота должна быть от 1 до 4000 пикселей',
      });
      return;
    }

    try {
      await this.applyOperation(
        'crop',
        { width: this.customCropWidth, height: this.customCropHeight },
        (dataUrl) => this.cropImageFromCenter(dataUrl, this.customCropWidth, this.customCropHeight),
      );

      // Обновить legacy данные для совместимости
      this._legacyCroppedData = this.imageData.current;
      this._legacyCroppedDimensions = {
        width: this.customCropWidth,
        height: this.customCropHeight,
      };

      ToastNotificationComponent.show({
        type: 'success',
        message: 'Изображение обрезано',
      });
    } catch (error) {
      console.error('Crop error:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Не удалось обрезать изображение',
      });
    }
  }
  // ═══════════════════════════════════════════════════════════════
  // ПРОПОРЦИОНАЛЬНОЕ ИЗМЕНЕНИЕ РАЗМЕРОВ
  // ═══════════════════════════════════════════════════════════════

  toggleAspectRatio(): void {
    this.aspectRatioLocked = !this.aspectRatioLocked;

    if (this.aspectRatioLocked) {
      // Сохраняем текущее соотношение сторон
      this.aspectRatio = this.customCropWidth / this.customCropHeight;

      ToastNotificationComponent.show({
        type: 'info',
        message: `Пропорции зафиксированы: ${this.customCropWidth}×${this.customCropHeight}`,
      });
    } else {
      ToastNotificationComponent.show({
        type: 'info',
        message: 'Свободное изменение размеров',
      });
    }
  }

  onCropWidthChange(): void {
    if (this.aspectRatioLocked && this.aspectRatio > 0) {
      // Автоматически пересчитываем высоту
      this.customCropHeight = Math.round(this.customCropWidth / this.aspectRatio);
    }
  }

  onCropHeightChange(): void {
    if (this.aspectRatioLocked && this.aspectRatio > 0) {
      // Автоматически пересчитываем ширину
      this.customCropWidth = Math.round(this.customCropHeight * this.aspectRatio);
    }
  }

  resetCrop(): void {
    // Используем новый метод resetToOriginal для полного сброса
    this.resetToOriginal();

    // Очистить legacy переменные для совместимости
    this._legacyCroppedData = null;
    this._legacyCroppedDimensions = null;
  }

  async applyFilters(): Promise<void> {
    if (!this.imageData.current) {
      return;
    }

    const transformData = {
      current: this.imageData.current,
      original: this.imageData.original,
      history: this.imageData.history,
      historyIndex: this.imageData.historyIndex,
    } as any;

    await this.imageTransformService.applyFilters(
      transformData,
      this.brightness,
      this.contrast,
      (newData) => {
        this.imageData.current = newData;
      },
    );
  }

  applyFiltersRealtime(): void {
    if (!this.imageData.current) {
      return;
    }

    const canvas = this.editorCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    const transformData = {
      current: this.imageData.current,
      original: this.imageData.original,
      history: this.imageData.history,
      historyIndex: this.imageData.historyIndex,
    } as any;

    this.imageTransformService.applyFiltersRealtime(
      transformData,
      canvas,
      this.brightness,
      this.contrast,
    );
  }

  async applyPresetFilter(
    filter: 'grayscale' | 'sepia' | 'vintage' | 'cold' | 'warm',
  ): Promise<void> {
    if (!this.imageData.current) {
      return;
    }

    const transformData = {
      current: this.imageData.current,
      original: this.imageData.original,
      history: this.imageData.history,
      historyIndex: this.imageData.historyIndex,
    } as any;

    await this.imageTransformService.applyPresetFilter(transformData, filter, (newData) => {
      this.imageData.current = newData;
    });
  }

  resetFilters(): void {
    this.brightness = 0;
    this.contrast = 0;
    this.saturation = 0;
    this.hueRotate = 0;
    this.blur = 0;
    this.grayscale = 0;
    this.sepia = 0;
    this.invert = 0;

    // Используем новый метод resetToOriginal
    this.resetToOriginal();
  }

  // ═══════════════════════════════════════════════════════════════
  // WATERMARK (ВОДЯНОЙ ЗНАК)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Обработчик изменения настроек водяного знака (для preview)
   */
  onWatermarkChange(): void {
    if (this.watermarkConfig.enabled && this.watermarkConfig.text) {
      this.renderWatermarkPreview();
    }
  }

  /**
   * Установить позицию водяного знака и обновить preview
   */
  setWatermarkPosition(position: WatermarkPosition): void {
    this.watermarkConfig.position = position;
    this.renderWatermarkPreview();
  }

  /**
   * Сбросить настройки водяного знака (v2)
   */
  resetWatermark(): void {
    this.watermarkConfig = {
      enabled: false,
      type: 'text',
      text: '',
      position: 'bottom-right',
      fontSize: 0,
      fontFamily: 'Arial',
      color: '#FFFFFF',
      opacity: 70,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
    };
    this.logoPreviewUrl = null;

    ToastNotificationComponent.show({
      type: 'info',
      message: 'Настройки водяного знака сброшены',
    });
  }

  /**
   * Переключить тип водяного знака (v2)
   */
  onTypeChange(newType: 'text' | 'image'): void {
    this.watermarkConfig.type = newType;
    this.renderWatermarkPreview();
  }

  /**
   * Обработка загрузки файла логотипа (v2)
   */
  async onLogoFileChange(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Валидация через сервис
    const validation = this.watermarkService.validateImageFile(file);
    if (!validation.valid) {
      ToastNotificationComponent.show({
        type: 'error',
        message: validation.error || 'Ошибка валидации файла',
      });
      return;
    }

    try {
      // Загрузка файла
      const dataUrl = await this.watermarkService.loadImageFromFile(file);
      this.watermarkConfig.imageUrl = dataUrl;
      this.watermarkConfig.imageFile = file;
      this.logoPreviewUrl = dataUrl;

      // Получаем размеры изображения
      const img = new Image();
      img.onload = () => {
        // Вычисляем рекомендуемый размер
        const recommended = this.watermarkService.getRecommendedImageSize(img.width, img.height);

        // Масштабируем с сохранением пропорций
        const dimensions = this.watermarkService.calculateImageDimensions(
          img.width,
          img.height,
          recommended.width,
          recommended.height,
        );

        this.watermarkConfig.imageWidth = dimensions.width;
        this.watermarkConfig.imageHeight = dimensions.height;

        // Обновляем превью
        this.renderWatermarkPreview();

        ToastNotificationComponent.show({
          type: 'success',
          message: `Логотип загружен (${dimensions.width}x${dimensions.height}px)`,
        });
      };
      img.src = dataUrl;
    } catch (error) {
      console.error('Ошибка загрузки логотипа:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Ошибка загрузки логотипа',
      });
    }
  }

  /**
   * Удалить загруженный логотип (v2)
   */
  removeLogo(): void {
    this.watermarkConfig.imageUrl = undefined;
    this.watermarkConfig.imageFile = undefined;
    this.watermarkConfig.imageWidth = undefined;
    this.watermarkConfig.imageHeight = undefined;
    this.logoPreviewUrl = null;
    this.renderWatermarkPreview();

    ToastNotificationComponent.show({
      type: 'info',
      message: 'Логотип удален',
    });
  }

  /**
   * Обработка изменения размера шрифта (v2)
   */
  onFontSizeChange(value: number): void {
    this.watermarkConfig.fontSize = value;
    this.renderWatermarkPreview();
  }

  /**
   * Обработка изменения прозрачности (v2)
   */
  onOpacityChange(value: number): void {
    this.watermarkConfig.opacity = value;
    this.renderWatermarkPreview();
  }

  /**
   * Обработка изменения поворота (v2)
   */
  onRotationChange(value: number): void {
    this.watermarkConfig.rotation = value;
    this.renderWatermarkPreview();
  }

  /**
   * Обработка изменения смещения (v2)
   */
  onOffsetChange(axis: 'x' | 'y', value: number): void {
    if (axis === 'x') {
      this.watermarkConfig.offsetX = value;
    } else {
      this.watermarkConfig.offsetY = value;
    }
    this.renderWatermarkPreview();
  }

  /**
   * Обработка изменения цвета (v2)
   */
  onColorChange(color: string): void {
    this.watermarkConfig.color = color;
    this.renderWatermarkPreview();
  }

  /**
   * Обработка изменения семейства шрифта (v2)
   */
  onFontFamilyChange(font: string): void {
    this.watermarkConfig.fontFamily = font;
    this.renderWatermarkPreview();
  }

  /**
   * Обработка переключения tile pattern (v2)
   */
  onTilePatternToggle(enabled: boolean): void {
    this.watermarkConfig.tilePattern = enabled;
    this.renderWatermarkPreview();
  }

  /**
   * Применить водяной знак (добавляет операцию в историю)
   */
  async applyWatermark(): Promise<void> {
    if (!this.watermarkService.validateConfig(this.watermarkConfig)) {
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Введите текст водяного знака',
      });
      return;
    }

    try {
      // Применяем операцию через applyOperation используя сервис
      await this.applyOperation('watermark', { ...this.watermarkConfig }, async (dataUrl) => {
        return await this.watermarkService.applyWatermark(dataUrl, this.watermarkConfig);
      });

      console.log(`💧 Водяной знак применен: "${this.watermarkConfig.text}"`);

      ToastNotificationComponent.show({
        type: 'success',
        message: 'Водяной знак добавлен',
      });

      // Переходим к настройкам
      this.activeTab = 'settings';
    } catch (error) {
      console.error('❌ Ошибка применения водяного знака:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Ошибка применения водяного знака',
      });
    }
  }

  /**
   * Рендер предпросмотра водяного знака (без изменения imageData.current) - v2
   */
  private async renderWatermarkPreview(): Promise<void> {
    if (!this.imageData.current) {
      console.warn('⚠️ renderWatermarkPreview: No image data');
      return;
    }

    const canvas = this.watermarkCanvas?.nativeElement;
    if (!canvas) {
      console.warn('⚠️ renderWatermarkPreview: No canvas element');
      return;
    }

    try {
      await this.watermarkService.renderWatermarkPreview(
        canvas,
        this.imageData.current,
        this.watermarkConfig,
      );
    } catch (error) {
      console.error('❌ Failed to render watermark preview:', error);
    }
  }

  getFinalImage(): string {
    return this._legacyCroppedData || this.imageData.current || this.previewUrl;
  }

  /**
   * Применить изменения и вставить изображение в редактор
   * НОВАЯ ЛОГИКА: Сначала открывает ExportImageModal для выбора формата/качества
   * Затем загружает на сервер и вставляет HTML
   */
  async applyAndInsert(): Promise<void> {
    const finalImage = this.getFinalImage();

    if (!finalImage) {
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Нет изображения для вставки',
      });
      return;
    }

    if (!this.imageData.metadata) {
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Нет метаданных изображения',
      });
      return;
    }

    // ========== НОВАЯ ЛОГИКА: Открыть ExportImageModal ==========
    // Открываем модальное окно для выбора формата, качества и размера
    if (this.exportModal) {
      // Получаем размеры изображения
      const imageSize = await this.imageFileService.getImageDimensionsFromDataUrl(finalImage);

      console.log('📦 Opening ExportImageModal...', {
        width: imageSize.width,
        height: imageSize.height,
        dataUrlLength: finalImage.length,
        currentAlignment: this.config.alignment,
      });

      // Открываем модалку экспорта с текущими настройками выравнивания
      this.exportModal.open(finalImage, imageSize.width, imageSize.height, this.config.alignment);

      // ExportImageModal теперь отправит на сервер и вызовет handleExportComplete
      return;
    }

    // ========== FALLBACK: Старая логика (если exportModal не найден) ==========
    console.warn('⚠️ ExportImageModal not found, using fallback logic');
    await this.uploadToServerAndInsert(finalImage);
  }

  /**
   * Обработчик завершения экспорта из ExportImageModal
   * Вызывается когда ExportImageModal отправил изображение на сервер
   */
  async handleExportComplete(result: any): Promise<void> {
    console.log('✅ Export completed, result from ExportImageModal:', result);

    // Проверяем, что ExportImageModal вернул данные от сервера
    if (!result || !result.imageId || !result.imageUrl) {
      console.error('❌ Invalid result from ExportImageModal:', result);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Не удалось получить данные изображения от сервера',
      });
      return;
    }

    try {
      // Сохраняем imageId в uploadState
      this.uploadState.serverImageId = result.imageId;
      this.uploadState.isUploading = false;

      console.log('📝 Building HTML for editor with server URL:', {
        imageId: result.imageId,
        imageUrl: result.imageUrl,
        containerSettings: {
          useContainer: result.useContainer,
          containerWidth: result.containerWidth,
          containerHeight: result.containerHeight,
          objectFit: result.objectFit,
        },
      });

      // Построить HTML с URL от сервера и настройками контейнера
      const metadata = this.imageData.metadata;
      const containerSettings = result.useContainer
        ? {
            useContainer: result.useContainer,
            containerWidth: result.containerWidth,
            containerHeight: result.containerHeight,
            objectFit: result.objectFit as 'cover' | 'fill',
          }
        : undefined;

      const html = this.imageUploadService.buildImageHtml({
        imageUrl: result.imageUrl,
        imageId: result.imageId,
        alt: metadata?.alt || metadata?.title || '',
        caption: metadata?.caption || '',
        linkUrl: this.config.linkUrl || '',
        width: this.config.width || '100%',
        alignment: result.alignment || this.config.alignment || 'center',
        containerSettings,
      });

      // Вставить в редактор через callback
      if (this.callback) {
        this.callback(this.config, html);
      }

      // Показать Toast успеха
      ToastNotificationComponent.show({
        type: 'success',
        message: 'Изображение вставлено в редактор',
        duration: 3000,
      });

      // Закрыть модальное окно
      this.close();
    } catch (error) {
      console.error('❌ Error in handleExportComplete:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Ошибка при вставке изображения в редактор',
      });
    }
  }

  /**
   * Обработчик закрытия ExportImageModal без экспорта
   */
  onExportModalClosed(): void {
    console.log('📦 ExportImageModal closed without export');
    // Ничего не делаем, пользователь отменил экспорт
  }

  /**
   * Загрузить изображение на сервер и вставить в редактор
   */
  private async uploadToServerAndInsert(finalImage: string): Promise<void> {
    this.uploadState.isUploading = true;
    this.uploadState.uploadProgress = 0;
    this.uploadState.uploadError = null;

    try {
      const fileName = this.imageData.metadata?.fileName || 'image.png';

      console.log('📤 Uploading image to server...', { fileName });

      // Загружаем изображение через новый сервис
      const uploadResult = await this.imageUploadService.uploadImageToServer(finalImage, fileName);

      if (!uploadResult.success || !uploadResult.imageId || !uploadResult.imageUrl) {
        throw new Error(uploadResult.error || 'Не удалось загрузить изображение');
      }

      this.uploadState.serverImageId = uploadResult.imageId;

      console.log('✅ Image uploaded successfully:', {
        imageId: uploadResult.imageId,
        imageUrl: uploadResult.imageUrl,
      });

      // Получаем размеры изображения
      const dimensions = await this.imageUploadService.getImageDimensions(finalImage);

      // Построить HTML с URL от сервера
      const html = this.imageUploadService.buildImageHtml({
        imageUrl: uploadResult.imageUrl,
        imageId: uploadResult.imageId,
        alt: this.config.alt || '',
        title: this.config.title || '',
        caption: this.config.caption || '',
        width: dimensions.width,
        height: dimensions.height,
        clickable: this.config.clickable || false,
        openInNewWindow: this.config.openInNewWindow || false,
      });

      // Вставить в редактор через callback
      if (this.callback) {
        this.callback(this.config, html);
      }

      // Показать Toast успеха
      ToastNotificationComponent.show({
        type: 'success',
        message: 'Изображение загружено на сервер и вставлено',
        duration: 3000,
      });

      // Закрыть модальное окно
      this.close();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.uploadState.uploadError = errorMessage;

      console.error('❌ Failed to upload image:', error);

      ToastNotificationComponent.show({
        type: 'error',
        message: errorMessage,
        duration: 5000,
      });

      // НЕ закрываем модальное окно, чтобы пользователь мог повторить попытку
    } finally {
      // 9. Сбросить флаг загрузки
      this.uploadState.isUploading = false;
    }
  }

  // Modal drag methods
  onModalHeaderMouseDown(event: MouseEvent): void {
    if (!this.modalWindow) return;

    this.isDraggingModal = true;
    const rect = this.modalWindow.nativeElement.getBoundingClientRect();
    this.modalDragStartX = event.clientX - rect.left;
    this.modalDragStartY = event.clientY - rect.top;

    document.addEventListener('mousemove', this.onModalMouseMove);
    document.addEventListener('mouseup', this.onModalMouseUp);
    event.preventDefault();
  }

  private onModalMouseMove = (event: MouseEvent): void => {
    if (!this.isDraggingModal || !this.modalWindow) return;

    this.modalLeft = event.clientX - this.modalDragStartX;
    this.modalTop = event.clientY - this.modalDragStartY;

    const modal = this.modalWindow.nativeElement;
    modal.style.left = `${this.modalLeft}px`;
    modal.style.top = `${this.modalTop}px`;
    modal.style.transform = 'none';
  };

  private onModalMouseUp = (): void => {
    this.isDraggingModal = false;
    document.removeEventListener('mousemove', this.onModalMouseMove);
    document.removeEventListener('mouseup', this.onModalMouseUp);
  };

  getModalStyle(): { [key: string]: string } {
    if (this.modalLeft === 0 && this.modalTop === 0) {
      return {};
    }
    return {
      left: `${this.modalLeft}px`,
      top: `${this.modalTop}px`,
      transform: 'none',
    };
  }

  // ────────────────────────────────────────────────────────────────
  // Crop Methods
  // ────────────────────────────────────────────────────────────────

  /**
   * Инициализация CropTool при переключении на таб Обрезка
   * Вариант В: Создаем временный Image из imageData.current
   */
  async initCropTool(): Promise<void> {
    console.log('🔍 initCropTool: START');

    // Проверяем наличие canvas элементов, контейнера и Data URL
    const containerRef = this.bodyCanvas || this.cropCanvasArea;
    if (!this.imageData.current || !this.cropCanvas || !this.cropOverlay || !containerRef) {
      console.log('❌ initCropTool: Missing required elements');
      return;
    }

    try {
      // Делегируем инициализацию в CropService
      const result = await this.cropService.initializeCropTool({
        dataUrl: this.imageData.current,
        cropCanvas: this.cropCanvas,
        cropOverlay: this.cropOverlay,
        containerRef,
        cropConfig: this.cropConfig,
      });

      if (result.success && result.cropTool && result.cropImage) {
        this.cropTool = result.cropTool;
        this.cropImage = result.cropImage;
        this.displayScale = result.displayScale;
        this.canvasDisplayDimensions = result.canvasDisplayDimensions;
        this.originalImageDimensions = result.originalImageDimensions;

        console.log('✅ CropTool initialized successfully', {
          displayScale: this.displayScale,
          canvasDisplayDimensions: this.canvasDisplayDimensions,
          originalImageDimensions: this.originalImageDimensions,
        });
      }
    } catch (error) {
      console.error('Failed to initialize crop tool:', error);
    }
  }

  /**
   * Подгоняет размер canvas под контейнер с сохранением пропорций
   * Отступ 3% учитывается через CSS padding
   * Использует bodyCanvas если доступен, иначе cropCanvasArea для обратной совместимости
   */
  private fitCanvasToContainer(): void {
    console.log('📐 fitCanvasToContainer: START');

    if (!this.cropImage || !this.cropCanvas) {
      console.log('❌ fitCanvasToContainer: Missing cropImage or cropCanvas');
      return;
    }

    const containerRef = this.bodyCanvas || this.cropCanvasArea;
    if (!containerRef) {
      console.log('❌ fitCanvasToContainer: No container ref');
      return;
    }

    // Делегируем в CropService
    const canvasDimensions = this.cropService.resizeCropCanvas({
      cropImage: this.cropImage,
      cropCanvas: this.cropCanvas,
      cropOverlay: this.cropOverlay!,
      containerRef,
    });

    // Обновляем размеры отображения
    this.canvasDisplayDimensions = canvasDimensions;

    console.log('📐 fitCanvasToContainer: END');
  }

  /**
   * Инициализация Circle Tool при переключении на таб Круг
   */
  async initCircleTool(): Promise<void> {
    console.log('🔍 initCircleTool: START');

    // Проверяем наличие canvas элементов и Data URL
    if (!this.imageData.current || !this.circleCanvas || !this.circleOverlay) {
      console.log('❌ initCircleTool: Missing required elements');
      return;
    }

    try {
      // Создаем временный Image из Data URL
      const img = new Image();
      img.onload = () => {
        this.circleImage = img;

        // Настраиваем canvas размеры
        const canvas = this.circleCanvas!.nativeElement;
        const overlay = this.circleOverlay!.nativeElement;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        overlay.width = img.naturalWidth;
        overlay.height = img.naturalHeight;

        // Рисуем изображение на canvas
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        // Инициализируем конфигурацию круга
        this.initCircleConfig(img.naturalWidth, img.naturalHeight);

        // Создаем и активируем CircleService
        this.circleService = new CircleService();
        this.circleService.activate(canvas, img, overlay, this.circleConfig);

        // Подписываемся на события
        this.setupCircleServiceEvents();

        console.log('✅ CircleTool initialized successfully');
      };

      img.onerror = (error) => {
        console.error('❌ Failed to load image for circle tool:', error);
      };

      img.src = this.imageData.current;
    } catch (error) {
      console.error('❌ Failed to initialize circle tool:', error);
    }
  }

  /**
   * Инициализация конфигурации круга на основе размеров изображения
   */
  private initCircleConfig(imageWidth: number, imageHeight: number): void {
    // Используем утилиты из Circle плагина
    const circleUtils = new CircleUtilsImpl();
    const optimalRadius = circleUtils.calculateOptimalRadius(imageWidth, imageHeight);
    const centeredConfig = circleUtils.centerCircle(imageWidth, imageHeight, optimalRadius);

    // Обновляем конфигурацию
    this.circleConfig = {
      ...this.circleConfig,
      ...centeredConfig,
    };

    console.log('🔧 Circle config initialized:', this.circleConfig);
  }

  /**
   * Настройка обработчиков событий для CircleService
   */
  private setupCircleServiceEvents(): void {
    if (!this.circleService) return;

    // Обработка изменения конфигурации
    this.circleService.onConfigChange$.subscribe((config) => {
      this.circleConfig = { ...config };
      console.log('🔄 Circle config updated:', this.circleConfig);
    });

    // Обработка применения круговой обрезки
    this.circleService.onApply$.subscribe((result) => {
      console.log('✅ Circle crop applied:', result);
      this.handleCircleApplyResult(result);
    });

    // Обработка отмены
    this.circleService.onCancel$.subscribe(() => {
      console.log('❌ Circle crop cancelled');
    });
  }

  /**
   * Обработка результата применения круговой обрезки
   */
  private handleCircleApplyResult(result: any): void {
    try {
      // Обновляем текущие данные изображения
      this.imageData.current = result.croppedImage;

      // Логируем успешное применение
      console.log(`✅ Круговая обрезка применена. Радиус: ${result.config.radius}px`);

      // Переключаемся на вкладку редактирования
      this.switchTab('edit');
    } catch (error) {
      console.error('❌ Error handling circle apply result:', error);
    }
  }

  /**
   * Универсальный метод для подгонки любого содержимого body-canvas
   * Работает для всех вкладок (upload, crop, edit, settings)
   * Вызывается при смене вкладок, загрузке изображения и resize окна
   */
  private fitBodyCanvasContent(): void {
    if (!this.bodyCanvas) return;

    const container = this.bodyCanvas.nativeElement;

    // Для разных вкладок применяем разную логику
    switch (this.activeTab) {
      case 'upload':
      case 'settings':
        // Для img элементов - обновляем стили для корректного вписывания
        const img = container.querySelector('img');
        if (img) {
          img.style.maxWidth = '100%';
          img.style.maxHeight = '100%';
          img.style.width = 'auto';
          img.style.height = 'auto';
          img.style.objectFit = 'contain';
        }
        break;

      case 'crop':
        // Для crop используем существующий метод fitCanvasToContainer
        this.fitCanvasToContainer();
        break;

      case 'edit':
        // Для edit canvas применяем ту же логику что и для crop
        if (this.editorCanvas) {
          this.fitCanvasToContainer();
        }
        break;
    }
  }

  /**
   * Очистка CropTool
   */
  private cleanupCropTool(): void {
    this.cropService.cleanupCropTool(this.cropTool);
    this.cropTool = null;
    this.cropImage = null;
  }

  /**
   * Обработка изменения размера окна
   * Перерисовывает canvas при resize модального окна
   * + Автоматически пересчитывает displayScale и применяет targetSize (TZ_CROP_SCALING.md)
   */
  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.activeTab === 'crop' && this.cropImage && this.cropCanvas) {
      // Пересчитать размеры canvas
      this.fitCanvasToContainer();

      // Перерисовать изображение
      const canvas = this.cropCanvas.nativeElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.cropImage, 0, 0, canvas.width, canvas.height);
      }

      // 🆕 Обновить canvasDisplayDimensions после resize
      this.canvasDisplayDimensions = {
        width: canvas.width,
        height: canvas.height,
      };

      // 🆕 Пересчитать масштаб
      this.updateImageScale();

      // Обновить CropTool если он существует
      if (this.cropTool) {
        this.cropTool.updateCanvasSize();
      }

      // 🆕 Если есть целевой размер - применить заново (TZ_CROP_SCALING.md Задача 6)
      if (
        this.cropConfig.hardSizeEnabled &&
        this.cropConfig.targetWidth &&
        this.cropConfig.targetHeight
      ) {
        // Небольшая задержка для завершения resize
        setTimeout(() => {
          this.applyTargetSize();
        }, 50);
      }
    }

    // Для всех вкладок применяем универсальный resize
    this.fitBodyCanvasContent();
  }

  /**
   * Переключение чекбокса "Пропорционально"
   */
  onProportionalChange(): void {
    if (!this.cropTool) return;

    const aspectRatio = this.cropConfig.proportional
      ? this.cropService.calculateAspectRatioFromCropTool(this.cropTool)
      : null;
    this.cropTool.setAspectRatio(aspectRatio);
  }

  /**
   * Переключение чекбокса "Показать сетку"
   */
  onGridChange(): void {
    if (!this.cropTool) return;
    this.cropTool.setShowGrid(this.cropConfig.showGrid);
  }

  /**
   * Переключение чекбокса "Жесткий размер"
   */
  onHardSizeChange(): void {
    // Если включен жесткий размер и есть выбранный пресет
    if (this.cropConfig.hardSizeEnabled && this.selectedPreset) {
      this.cropConfig.targetWidth = this.selectedPreset.width;
      this.cropConfig.targetHeight = this.selectedPreset.height;
    }
  }

  /**
   * Применить целевой размер к рамке обрезки
   * Реализация согласно TZ_CROP_SCALING.md
   */
  applyTargetSize(): void {
    if (!this.cropTool || !this.cropConfig.hardSizeEnabled) return;

    // Пересчет displayScale (актуальный на момент вызова)
    this.updateImageScale();

    // Делегируем в CropService
    this.cropService.applyTargetSize({
      cropTool: this.cropTool,
      cropConfig: this.cropConfig,
      displayScale: this.displayScale,
      canvasDisplayDimensions: this.canvasDisplayDimensions,
      originalImageDimensions: this.originalImageDimensions,
    });
  }

  /**
   * Изменение целевого размера
   */
  onTargetSizeChange(dimension: 'width' | 'height'): void {
    if (!this.cropConfig.proportionLocked) return;

    const ratio = this.cropService.calculateAspectRatioFromTarget(
      this.cropConfig.targetWidth,
      this.cropConfig.targetHeight,
    );

    if (!ratio) return;

    if (dimension === 'width' && this.cropConfig.targetWidth) {
      this.cropConfig.targetHeight = Math.round(this.cropConfig.targetWidth / ratio);
    } else if (dimension === 'height' && this.cropConfig.targetHeight) {
      this.cropConfig.targetWidth = Math.round(this.cropConfig.targetHeight * ratio);
    }
  }

  /**
   * Переключение замка пропорций
   */
  toggleProportionLock(): void {
    this.cropConfig.proportionLocked = !this.cropConfig.proportionLocked;

    // Если замок включен, установить пропорции из текущих значений
    if (
      this.cropConfig.proportionLocked &&
      this.cropConfig.targetWidth &&
      this.cropConfig.targetHeight
    ) {
      // Пропорции уже установлены
    }
  }

  /**
   * Выбор пресета
   */
  onPresetSelected(preset: CropPreset): void {
    this.selectedPreset = preset;

    // Автоматически включить жесткий размер
    this.cropConfig.hardSizeEnabled = true;
    this.cropConfig.targetWidth = preset.width;
    this.cropConfig.targetHeight = preset.height;
    this.cropConfig.proportionLocked = true;

    // Установить пропорции для рамки
    if (this.cropTool) {
      const aspectRatio = preset.width / preset.height;
      this.cropTool.setAspectRatio(aspectRatio);
    }

    ToastNotificationComponent.show({
      type: 'success',
      message: `Выбран пресет: ${preset.name} (${preset.width}×${preset.height})`,
    });
  }

  /**
   * Применить обрезку
   * Использует новую архитектуру с applyOperation() для автоматического обновления метаданных
   */
  /**
   * Применить обрезку
   * Использует новую архитектуру с applyOperation() для автоматического обновления метаданных
   */
  async applyCrop(): Promise<void> {
    if (!this.cropTool || !this.cropCanvas || !this.cropImage) {
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Инструмент обрезки не инициализирован',
      });
      return;
    }

    try {
      // Делегируем обрезку в CropService
      const result = await this.cropService.applyCrop({
        cropTool: this.cropTool,
        cropImage: this.cropImage,
        displayScale: this.displayScale,
        cropConfig: this.cropConfig,
      });

      if (
        !result.success ||
        !result.croppedDataUrl ||
        !result.realCropArea ||
        !result.finalDimensions
      ) {
        throw new Error(result.error || 'Crop failed');
      }

      // ✅ Использовать новую архитектуру: applyOperation() автоматически обновит метаданные
      await this.applyOperation('crop', result.realCropArea, async () => result.croppedDataUrl!);

      // Обновить legacy состояние для совместимости
      this._legacyCroppedData = result.croppedDataUrl;
      this._legacyCroppedDimensions = result.finalDimensions;

      // ✅ Остаемся на вкладке Обрезать после успешной обрезки
      // Перерисовываем canvas с обрезанным изображением и инициализируем новый crop tool
      this.cleanupCropTool();

      // Небольшая задержка чтобы DOM успел обновиться после cleanup
      setTimeout(() => {
        console.log('🔄 Re-initializing crop tool with cropped image...');
        this.initCropTool();
      }, 100);
    } catch (error) {
      console.error('Crop failed:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Ошибка при обрезке изображения',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TEMPLATE WRAPPER METHODS (обёртки для использования в шаблоне)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Обёртка для formatFileSize из сервиса (для использования в шаблоне)
   */
  formatFileSize(bytes: number): string {
    return this.imageFileService.formatFileSize(bytes);
  }

  // ═══════════════════════════════════════════════════════════════
  // CIRCLE CROP METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Центрировать круг на изображении
   */
  centerCircle(): void {
    if (this.circleService) {
      this.circleService.centerCircle();
    }
  }

  /**
   * Сбросить размер круга к оптимальному
   */
  resetCircleToOptimal(): void {
    if (this.circleService) {
      this.circleService.resetToOptimal();
    }
  }

  /**
   * Применить круговую обрезку
   */
  applyCircle(): void {
    if (this.circleService) {
      this.circleService.apply();
    }
  }

  /**
   * Обновить отображение круга (при изменении настроек)
   */
  updateCircleOverlay(): void {
    // Обновляем конфигурацию сервиса при изменении настроек UI
    if (this.circleService) {
      const updatedConfig = {
        ...this.circleConfig,
        // Дополнительные настройки можно добавить здесь
      };
      this.circleService.setConfig(updatedConfig);
    }
  }

  /**
   * Обёртка для Math объекта (для использования в template)
   */
  get Math() {
    return Math;
  }

  // ═══════════════════════════════════════════════════════════════
  // FRAME METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Инициализация Frame Tool (по аналогии с initCircleTool)
   */
  async initFrameTool(): Promise<void> {
    console.log('🖼️ initFrameTool: START');

    // Проверяем наличие canvas элементов и Data URL
    if (!this.imageData.current || !this.frameCanvas) {
      console.log('❌ initFrameTool: Missing required elements');
      return;
    }

    try {
      // Создаем временный Image из Data URL
      const img = new Image();
      img.onload = () => {
        this.frameImage = img;

        // ✅ Запоминаем ОРИГИНАЛЬНОЕ изображение (для многократного применения)
        if (!this.originalFrameImage) {
          this.originalFrameImage = img;
          console.log('🖼️ Original frame image saved:', {
            width: img.naturalWidth,
            height: img.naturalHeight,
          });
        }

        // Настраиваем canvas
        const canvas = this.frameCanvas!.nativeElement;

        // Сохраняем размеры для Frame сервиса
        this.originalImageDimensions = {
          width: img.naturalWidth,
          height: img.naturalHeight,
        };

        // ВАЖНО: Сначала активируем Frame сервис (он установит размеры canvas)
        this.frameService.activate(img, canvas);

        // ЗАТЕМ рисуем изображение (после того как canvas получил правильные размеры)
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        console.log('🖼️ Image drawn on canvas:', {
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          canvasOffsetWidth: canvas.offsetWidth,
          canvasOffsetHeight: canvas.offsetHeight,
        });

        // Загружаем пресеты
        this.framePresets = this.frameService.getPresets();

        // Подписываемся на события
        this.setupFrameServiceEvents();

        console.log('✅ FrameTool initialized successfully');
      };

      img.onerror = (error) => {
        console.error('❌ Failed to load image for frame tool:', error);
      };

      img.src = this.imageData.current;
    } catch (error) {
      console.error('❌ Failed to initialize frame tool:', error);
    }
  }

  /**
   * Настраивает события Frame сервиса
   */
  private setupFrameServiceEvents(): void {
    this.frameService.on('onConfigChange', (config: FrameConfig) => {
      this.frameConfig = { ...config };
    });

    this.frameService.on('onPreviewUpdate', (previewUrl: string) => {
      // Обновляем превью если нужно
    });

    this.frameService.on('onError', (error: string) => {
      console.error('❌ Frame Service Error:', error);
    });
  }

  /**
   * Обновляет превью рамки в реальном времени
   * ✅ Всегда применяем к ОРИГИНАЛЬНОМУ изображению
   */
  async updateFramePreview(): Promise<void> {
    // ✅ Используем ОРИГИНАЛ, а не текущее изображение
    const sourceImage = this.originalFrameImage || this.frameImage;

    if (!sourceImage || !this.frameCanvas) {
      return;
    }

    try {
      const canvas = this.frameCanvas.nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      console.log('🖼️ updateFramePreview - using ORIGINAL image:', {
        width: sourceImage.naturalWidth,
        height: sourceImage.naturalHeight,
        isOriginal: sourceImage === this.originalFrameImage,
      });

      // Импортируем FrameUtils для рисования
      const { FrameUtils } = await import('../../plugins/frame/utils/frame.utils');

      // ✅ Применяем рамку к ОРИГИНАЛЬНОМУ изображению
      FrameUtils.applyFrameToCanvas(canvas, sourceImage, this.frameConfig);

      console.log('🖼️ Frame preview updated in real-time');
    } catch (error) {
      console.error('Failed to update frame preview:', error);
    }
  }

  /**
   * Применяет рамку к изображению (остаемся на вкладке Рамка)
   */
  async applyFrame(): Promise<void> {
    if (!this.frameImage || !this.frameCanvas) {
      console.log('❌ Frame image or canvas not available');
      return;
    }

    try {
      const canvas = this.frameCanvas.nativeElement;

      // Получаем результат как Data URL
      const dataUrl = canvas.toDataURL('image/png');

      console.log('🖼️ Applying frame - canvas size:', {
        width: canvas.width,
        height: canvas.height,
        originalImageSize: {
          width: this.frameImage.width,
          height: this.frameImage.height,
        },
      });

      // ✅ Сохраняем операцию в историю через applyOperation
      await this.applyOperation('frame', this.frameConfig, async () => dataUrl);

      // ✅ Сбрасываем originalFrameImage - теперь новое изображение станет оригиналом
      this.originalFrameImage = null;

      // ✅ Остаемся на вкладке Рамка (не переключаемся)
      // Переинициализируем Frame tool с новым изображением
      setTimeout(() => {
        console.log('🔄 Re-initializing frame tool with framed image...');
        this.initFrameTool();
      }, 100);

      console.log('✅ Frame applied successfully');
    } catch (error) {
      console.error('❌ Failed to apply frame:', error);
    }
  }

  /**
   * Сбрасывает настройки рамки и обновляет preview
   */
  resetFrameConfig(): void {
    this.frameConfig = {
      type: 'solid',
      thickness: 3,
      color: '#000000',
      opacity: 1,
      padding: 0, // По умолчанию без отступа
      borderRadius: 0,
    };

    this.selectedFramePreset = null;

    // Обновляем preview
    this.updateFramePreview();
  }

  /**
   * Выбирает пресет рамки и обновляет preview в реальном времени
   */
  selectFramePreset(presetId: string): void {
    const preset = this.framePresets.find((p) => p.id === presetId);
    if (preset) {
      this.frameConfig = { ...preset.config };
      this.selectedFramePreset = presetId;

      // Обновляем preview в реальном времени
      this.updateFramePreview();
    }
  }

  /**
   * Получает человеко-читаемое название типа рамки
   */
  getFrameTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      solid: 'Сплошная',
      dashed: 'Пунктирная',
      dotted: 'Точечная',
      double: 'Двойная',
      groove: 'Вдавленная',
      ridge: 'Выпуклая',
      shadow: 'С тенью',
      gradient: 'Градиент',
      rounded: 'Скругленная',
    };
    return labels[type] || type;
  }

  /**
   * Вычисляет итоговый размер изображения с рамкой
   */
  getFramedImageSize(): { width: number; height: number; mode: string; sizeChange: string } {
    const original = this.originalFrameImage || this.frameImage;
    if (!original) {
      return { width: 0, height: 0, mode: '', sizeChange: '' };
    }

    const originalWidth = original.naturalWidth;
    const originalHeight = original.naturalHeight;

    if (this.frameConfig.padding > 0) {
      // Режим "ВОКРУГ" - размер увеличивается
      const totalPadding = this.frameConfig.padding * 2;
      const totalFrameSize = this.frameConfig.thickness * 2;
      const newWidth = originalWidth + totalPadding + totalFrameSize;
      const newHeight = originalHeight + totalPadding + totalFrameSize;
      const deltaWidth = newWidth - originalWidth;
      const deltaHeight = newHeight - originalHeight;

      return {
        width: newWidth,
        height: newHeight,
        mode: 'around',
        sizeChange: `+${deltaWidth}×${deltaHeight}px`,
      };
    } else {
      // Режим "ПОВЕРХ" - размер сохраняется
      return {
        width: originalWidth,
        height: originalHeight,
        mode: 'overlay',
        sizeChange: 'без изменений',
      };
    }
  }

  /**
   * Обновляет размытие тени
   */
  updateShadowBlur(event: any): void {
    const blur = parseInt(event.target.value);
    if (!this.frameConfig.shadow) {
      this.frameConfig.shadow = {
        offsetX: 0,
        offsetY: 2,
        blur: blur,
        spread: 0,
        color: '#000000',
      };
    } else {
      this.frameConfig.shadow.blur = blur;
    }
  }

  /**
   * Обновляет цвет тени
   */
  updateShadowColor(event: any): void {
    const color = event.target.value;
    if (!this.frameConfig.shadow) {
      this.frameConfig.shadow = {
        offsetX: 0,
        offsetY: 2,
        blur: 8,
        spread: 0,
        color: color,
      };
    } else {
      this.frameConfig.shadow.color = color;
    }
  }

  /**
   * Обновляет направление градиента
   */
  updateGradientDirection(event: any): void {
    const direction = event.target.value;
    if (!this.frameConfig.gradient) {
      this.frameConfig.gradient = {
        direction: direction,
        colors: ['#ff0000', '#0000ff'],
      };
    } else {
      this.frameConfig.gradient.direction = direction;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // IMAGE SETTINGS MODAL
  // ═══════════════════════════════════════════════════════════════
}
