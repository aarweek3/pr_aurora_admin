import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SaveImageResponse } from '../../components/image-modal/models/image-modal.types';
import { ImageModalService } from '../../components/image-modal/services/image-modal.service';
import { ToastNotificationComponent } from '../../components/toast-notification/toast-notification.component';
import {
  ExportImageConfig,
  ExportImageResult,
  ImageExportService,
} from '../../services/image-export.service';

@Component({
  selector: 'app-export-image-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './export-image-modal.component.html',
  styleUrl: './export-image-modal.component.scss',
})
export class ExportImageModalComponent {
  @Input() imageData: string = '';
  @Input() imageWidth: number = 0;
  @Input() imageHeight: number = 0;
  @Output() closed = new EventEmitter<void>();
  @Output() exported = new EventEmitter<ExportImageResult>();

  isOpen = false;
  fileName = '';
  selectedFormat: 'jpg' | 'png' | 'webp' = 'jpg';
  quality = 100;
  estimatedSize = 0;
  isProcessing = false;

  // Исходный файл (для сравнения)
  originalFormat = '';
  originalSize = 0;

  // Настройки контейнера
  useContainer = false;
  containerMode: 'custom' | 'aspect' = 'custom'; // Режим: произвольный размер или соотношение сторон
  containerWidth = 800;
  containerHeight = 600;
  isProportional = true;
  objectFit: 'cover' | 'fill' = 'cover';

  // Настройки выравнивания изображения
  alignment: 'left' | 'center' | 'right' = 'center';

  // Aspect Ratio режим
  selectedAspectRatio: string | null = null;
  aspectRatioDimension: 'width' | 'height' = 'width'; // Какой параметр вводит пользователь
  aspectRatioValue = 800; // Значение введённого параметра

  // Доступные пресеты соотношений сторон
  aspectRatioPresets = [
    { label: '1:1', ratio: 1 / 1 },
    { label: '4:3', ratio: 4 / 3 },
    { label: '16:9', ratio: 16 / 9 },
    { label: '9:16', ratio: 9 / 16 },
    { label: '3:2', ratio: 3 / 2 },
    { label: '2:3', ratio: 2 / 3 },
    { label: '21:9', ratio: 21 / 9 },
    { label: '16:10', ratio: 16 / 10 },
    { label: '5:4', ratio: 5 / 4 },
  ];

  constructor(
    private exportService: ImageExportService,
    private imageModalService: ImageModalService,
  ) {}

  open(
    imageData: string,
    width: number,
    height: number,
    currentAlignment?: 'left' | 'center' | 'right',
  ): void {
    this.imageData = imageData;
    this.imageWidth = width;
    this.imageHeight = height;
    this.fileName = this.exportService.generateDefaultFileName();
    this.selectedFormat = 'jpg';
    this.quality = 100;
    this.isOpen = true;

    // Устанавливаем текущее выравнивание или по умолчанию
    this.alignment = currentAlignment || 'center';

    // Сбрасываем настройки контейнера
    this.useContainer = false;
    this.containerMode = 'custom';
    this.containerWidth = width;
    this.containerHeight = height;
    this.isProportional = true;
    this.objectFit = 'cover';
    this.selectedAspectRatio = null;
    this.aspectRatioDimension = 'width';
    this.aspectRatioValue = width;

    // Определяем исходный формат по data URL
    this.detectOriginalFormat(imageData);

    // Вычисляем исходный размер
    this.calculateOriginalSize(imageData);

    // Вычисляем начальный размер для экспорта
    this.updateEstimatedSize();
  }

  private detectOriginalFormat(dataUrl: string): void {
    if (dataUrl.startsWith('data:image/png')) {
      this.originalFormat = 'PNG';
    } else if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
      this.originalFormat = 'JPG';
    } else if (dataUrl.startsWith('data:image/webp')) {
      this.originalFormat = 'WebP';
    } else {
      this.originalFormat = 'Unknown';
    }
  }

  private calculateOriginalSize(dataUrl: string): void {
    // Размер base64 строки примерно на 33% больше чем бинарный файл
    // Убираем префикс data:image/...;base64,
    const base64Data = dataUrl.split(',')[1] || '';
    const base64Length = base64Data.length;
    // Приблизительный размер в байтах
    this.originalSize = Math.round((base64Length * 3) / 4);
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  selectFormat(format: 'jpg' | 'png' | 'webp'): void {
    this.selectedFormat = format;
    this.updateEstimatedSize();
  }

  onQualityChange(): void {
    this.updateEstimatedSize();
  }

  private async updateEstimatedSize(): Promise<void> {
    try {
      const config: ExportImageConfig = {
        fileName: this.fileName,
        format: this.selectedFormat,
        quality: this.quality,
        imageData: this.imageData,
        width: this.imageWidth,
        height: this.imageHeight,
      };

      const result = await this.exportService.convertImage(config);
      this.estimatedSize = result.estimatedSize;
    } catch (error) {
      console.error('Error calculating file size:', error);
      this.estimatedSize = 0;
    }
  }

  get formattedFileSize(): string {
    return this.exportService.formatFileSize(this.estimatedSize);
  }

  get formattedOriginalSize(): string {
    return this.exportService.formatFileSize(this.originalSize);
  }

  get sizeDifference(): string {
    const diff = this.estimatedSize - this.originalSize;
    const diffPercent = this.originalSize > 0 ? Math.round((diff / this.originalSize) * 100) : 0;

    if (diff === 0) {
      return '(без изменений)';
    } else if (diff > 0) {
      return `(+${this.exportService.formatFileSize(diff)}, +${diffPercent}%)`;
    } else {
      return `(${this.exportService.formatFileSize(diff)}, ${diffPercent}%)`;
    }
  }

  get sizeDifferenceClass(): string {
    const diff = this.estimatedSize - this.originalSize;
    if (diff > 0) return 'size-increase'; // red
    if (diff < 0) return 'size-decrease'; // green
    return 'size-neutral';
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CONTAINER METHODS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Переключение использования контейнера
   */
  onContainerToggle(): void {
    if (this.useContainer) {
      // Инициализируем размеры контейнера размерами изображения
      this.containerWidth = this.imageWidth;
      this.containerHeight = this.imageHeight;
      this.isProportional = true;
    }
  }

  /**
   * Изменение размера контейнера
   */
  onContainerSizeChange(dimension: 'width' | 'height'): void {
    if (!this.useContainer) return;

    // Валидация
    if (this.containerWidth < 1) this.containerWidth = 1;
    if (this.containerWidth > 3000) this.containerWidth = 3000;
    if (this.containerHeight < 1) this.containerHeight = 1;
    if (this.containerHeight > 3000) this.containerHeight = 3000;

    // Если пропорциональная высота и изменили ширину - пересчитываем высоту
    if (this.isProportional && dimension === 'width') {
      this.calculateProportionalHeight();
    }
  }

  /**
   * Переключение пропорциональной высоты
   */
  onProportionalChange(): void {
    if (this.isProportional) {
      this.calculateProportionalHeight();
    }
  }

  /**
   * Переключение пропорциональности через кнопку-замочек
   */
  toggleProportional(): void {
    this.isProportional = !this.isProportional;
    this.onProportionalChange();
  }

  /**
   * Вычисление пропорциональной высоты
   */
  private calculateProportionalHeight(): void {
    if (this.imageWidth === 0) return;

    const aspectRatio = this.imageHeight / this.imageWidth;
    this.containerHeight = Math.round(this.containerWidth * aspectRatio);

    // Ограничиваем диапазон
    if (this.containerHeight < 1) this.containerHeight = 1;
    if (this.containerHeight > 3000) this.containerHeight = 3000;
  }

  /**
   * Выбор режима object-fit
   */
  selectObjectFit(mode: 'cover' | 'fill'): void {
    this.objectFit = mode;
  }

  /**
   * Переключение режима контейнера (Custom / Aspect Ratio)
   */
  onContainerModeChange(): void {
    if (this.containerMode === 'aspect' && this.selectedAspectRatio) {
      this.calculateSizeFromAspectRatio();
    }
  }

  /**
   * Выбор пресета соотношения сторон
   */
  selectAspectRatio(preset: { label: string; ratio: number }): void {
    this.selectedAspectRatio = preset.label;
    this.calculateSizeFromAspectRatio();
  }

  /**
   * Изменение размера в режиме Aspect Ratio
   */
  onAspectRatioValueChange(): void {
    if (this.aspectRatioValue < 1) this.aspectRatioValue = 1;
    if (this.aspectRatioValue > 3000) this.aspectRatioValue = 3000;

    this.calculateSizeFromAspectRatio();
  }

  /**
   * Переключение dimension (width/height) в режиме Aspect Ratio
   */
  onAspectRatioDimensionChange(): void {
    // Меняем местами значение
    const temp = this.containerWidth;
    this.containerWidth = this.containerHeight;
    this.containerHeight = temp;
    this.aspectRatioValue =
      this.aspectRatioDimension === 'width' ? this.containerWidth : this.containerHeight;
  }

  /**
   * Вычисление размеров контейнера на основе выбранного соотношения сторон
   */
  private calculateSizeFromAspectRatio(): void {
    if (!this.selectedAspectRatio) return;

    const preset = this.aspectRatioPresets.find((p) => p.label === this.selectedAspectRatio);
    if (!preset) return;

    if (this.aspectRatioDimension === 'width') {
      // Пользователь ввёл ширину, вычисляем высоту
      this.containerWidth = this.aspectRatioValue;
      this.containerHeight = Math.round(this.aspectRatioValue / preset.ratio);
    } else {
      // Пользователь ввёл высоту, вычисляем ширину
      this.containerHeight = this.aspectRatioValue;
      this.containerWidth = Math.round(this.aspectRatioValue * preset.ratio);
    }

    // Ограничиваем диапазон
    if (this.containerWidth < 1) this.containerWidth = 1;
    if (this.containerWidth > 3000) this.containerWidth = 3000;
    if (this.containerHeight < 1) this.containerHeight = 1;
    if (this.containerHeight > 3000) this.containerHeight = 3000;
  }

  async download(): Promise<void> {
    if (!this.fileName.trim()) {
      ToastNotificationComponent.show({
        type: 'warning',
        message: 'Введите имя файла',
      });
      return;
    }

    this.isProcessing = true;

    try {
      const config: ExportImageConfig = {
        fileName: this.fileName,
        format: this.selectedFormat,
        quality: this.quality,
        imageData: this.imageData,
        width: this.imageWidth,
        height: this.imageHeight,
      };

      // Конвертируем изображение с выбранными настройками
      const result = await this.exportService.convertImage(config);

      console.log('📦 Converted image:', {
        fileName: result.fileName,
        format: result.format,
        quality: result.quality,
        size: `${result.width} × ${result.height}`,
      });

      // ========== НОВАЯ ЛОГИКА: Отправляем через ImageModalService ==========
      // Это даст нам imageId и imageUrl для вставки в редактор
      const metadata = {
        fileName: result.fileName,
        description: '', // TODO: можно добавить поле description в UI
      };

      const serverResponse: SaveImageResponse = (await this.imageModalService
        .saveToServer(result.dataUrl, metadata)
        .toPromise()) as SaveImageResponse;

      if (!serverResponse || !serverResponse.success) {
        throw new Error(serverResponse?.message || 'Не удалось загрузить изображение на сервер');
      }

      console.log('✅ Image uploaded to server:', {
        imageId: serverResponse.imageId,
        imageUrl: serverResponse.imageUrl,
      });

      // Показываем сообщение об успешной отправке
      ToastNotificationComponent.show({
        type: 'success',
        message:
          `Изображение загружено на сервер\n` +
          `Формат: ${result.format.toUpperCase()}\n` +
          `Качество: ${result.quality}%\n` +
          `Размер: ${result.width} × ${result.height} px\n` +
          `Размер файла: ${this.formattedFileSize}`,
        duration: 5000,
      });

      // Возвращаем расширенный результат с данными от сервера и настройками контейнера
      const fullResult = {
        ...result,
        imageId: serverResponse.imageId,
        imageUrl: serverResponse.imageUrl,
        serverResponse,
        // Настройки контейнера
        useContainer: this.useContainer,
        containerWidth: this.containerWidth,
        containerHeight: this.containerHeight,
        objectFit: this.objectFit,
        // Настройки выравнивания
        alignment: this.alignment,
      };

      console.log('📤 Sending export result with settings:', {
        alignment: this.alignment,
        useContainer: this.useContainer,
        containerWidth: this.containerWidth,
        containerHeight: this.containerHeight,
        objectFit: this.objectFit,
      });

      this.exported.emit(fullResult);
      this.close();
    } catch (error) {
      console.error('Export error:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ошибка при экспорте изображения',
      });
    } finally {
      this.isProcessing = false;
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}
