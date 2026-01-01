import { ElementRef, Injectable } from '@angular/core';
import { ToastNotificationComponent } from '../components/toast-notification/toast-notification.component';
import { CropTool } from './crop-tool';
import { CropArea, CropConfig } from './crop.types';

/**
 * Размеры изображения
 */
export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Результат инициализации crop tool
 */
export interface CropInitResult {
  success: boolean;
  cropTool?: CropTool;
  cropImage?: HTMLImageElement;
  displayScale: number;
  canvasDisplayDimensions: ImageDimensions;
  originalImageDimensions: ImageDimensions;
  error?: string;
}

/**
 * Результат применения обрезки
 */
export interface CropApplyResult {
  success: boolean;
  croppedDataUrl?: string;
  realCropArea?: CropArea;
  finalDimensions?: ImageDimensions;
  error?: string;
}

/**
 * Сервис для работы с обрезкой изображений
 * Инкапсулирует всю логику CropTool, вычисления размеров, масштабирования
 */
@Injectable({
  providedIn: 'root',
})
export class CropService {
  /**
   * Создать HTMLImageElement из Data URL
   */
  async createImageElement(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /**
   * Вычислить масштаб отображения (displayScale)
   * displayScale = canvasDisplayWidth / originalImageWidth
   */
  calculateDisplayScale(
    canvasDisplayDimensions: ImageDimensions,
    originalImageDimensions: ImageDimensions,
  ): number {
    return canvasDisplayDimensions.width / originalImageDimensions.width;
  }

  /**
   * Подогнать canvas под контейнер с сохранением пропорций
   * Возвращает вычисленные размеры canvas
   */
  fitCanvasToContainer(
    containerWidth: number,
    containerHeight: number,
    imageWidth: number,
    imageHeight: number,
  ): ImageDimensions {
    const imageAspect = imageWidth / imageHeight;
    const containerAspect = containerWidth / containerHeight;

    let canvasWidth: number;
    let canvasHeight: number;

    if (imageAspect > containerAspect) {
      // Изображение шире контейнера - ограничиваем по ширине
      canvasWidth = containerWidth;
      canvasHeight = canvasWidth / imageAspect;
    } else {
      // Изображение выше контейнера - ограничиваем по высоте
      canvasHeight = containerHeight;
      canvasWidth = canvasHeight * imageAspect;
    }

    return {
      width: Math.floor(canvasWidth),
      height: Math.floor(canvasHeight),
    };
  }

  /**
   * Инициализация CropTool
   * Создаёт Image элемент, вычисляет размеры, рисует на canvas, создаёт CropTool
   */
  async initializeCropTool(params: {
    dataUrl: string;
    cropCanvas: ElementRef<HTMLCanvasElement>;
    cropOverlay: ElementRef<HTMLCanvasElement>;
    containerRef: ElementRef<HTMLElement>;
    cropConfig: CropConfig;
  }): Promise<CropInitResult> {
    const { dataUrl, cropCanvas, cropOverlay, containerRef, cropConfig } = params;

    try {
      // 1. Создать временный Image из Data URL
      const cropImage = await this.createImageElement(dataUrl);

      // 2. Сохранить размеры оригинального изображения
      const originalImageDimensions: ImageDimensions = {
        width: cropImage.naturalWidth || cropImage.width,
        height: cropImage.naturalHeight || cropImage.height,
      };

      // 3. Получить размеры контейнера
      const containerWidth = containerRef.nativeElement.clientWidth;
      const containerHeight = containerRef.nativeElement.clientHeight;

      // 4. Вычислить размеры canvas с сохранением пропорций
      const canvasDimensions = this.fitCanvasToContainer(
        containerWidth,
        containerHeight,
        cropImage.width,
        cropImage.height,
      );

      // 5. Установить размеры canvas
      const canvas = cropCanvas.nativeElement;
      const overlayCanvas = cropOverlay.nativeElement;

      canvas.width = canvasDimensions.width;
      canvas.height = canvasDimensions.height;
      overlayCanvas.width = canvasDimensions.width;
      overlayCanvas.height = canvasDimensions.height;

      // 6. Отрисовать изображение на canvas
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cropImage, 0, 0, canvas.width, canvas.height);

      // 7. Вычислить масштаб отображения
      const displayScale = this.calculateDisplayScale(canvasDimensions, originalImageDimensions);

      // 8. Инициализировать CropTool
      const cropTool = new CropTool({
        aspectRatio: cropConfig.proportional ? this.calculateAspectRatioFromCropTool(null) : null,
        showGrid: cropConfig.showGrid,
      });

      cropTool.mount(canvas, overlayCanvas);

      ToastNotificationComponent.show({
        type: 'info',
        message: 'Переместите и измените размер рамки обрезки',
      });

      return {
        success: true,
        cropTool,
        cropImage,
        displayScale,
        canvasDisplayDimensions: canvasDimensions,
        originalImageDimensions,
      };
    } catch (error) {
      console.error('Failed to initialize crop tool:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Не удалось инициализировать инструмент обрезки',
      });

      return {
        success: false,
        displayScale: 1,
        canvasDisplayDimensions: { width: 0, height: 0 },
        originalImageDimensions: { width: 0, height: 0 },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Обновить размеры canvas при resize окна
   */
  resizeCropCanvas(params: {
    cropImage: HTMLImageElement;
    cropCanvas: ElementRef<HTMLCanvasElement>;
    cropOverlay: ElementRef<HTMLCanvasElement>;
    containerRef: ElementRef<HTMLElement>;
  }): ImageDimensions {
    const { cropImage, cropCanvas, cropOverlay, containerRef } = params;

    const containerWidth = containerRef.nativeElement.clientWidth;
    const containerHeight = containerRef.nativeElement.clientHeight;

    const canvasDimensions = this.fitCanvasToContainer(
      containerWidth,
      containerHeight,
      cropImage.width,
      cropImage.height,
    );

    const canvas = cropCanvas.nativeElement;
    const overlayCanvas = cropOverlay.nativeElement;

    canvas.width = canvasDimensions.width;
    canvas.height = canvasDimensions.height;
    overlayCanvas.width = canvasDimensions.width;
    overlayCanvas.height = canvasDimensions.height;

    // Перерисовать изображение
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cropImage, 0, 0, canvas.width, canvas.height);
    }

    return canvasDimensions;
  }

  /**
   * Применить обрезку
   * Преобразует координаты из canvas-пикселей в пиксели оригинального изображения,
   * вырезает область, применяет resize если нужен жёсткий размер
   */
  async applyCrop(params: {
    cropTool: CropTool;
    cropImage: HTMLImageElement;
    displayScale: number;
    cropConfig: CropConfig;
  }): Promise<CropApplyResult> {
    const { cropTool, cropImage, displayScale, cropConfig } = params;

    try {
      const cropArea = cropTool.getCropArea();

      // Пересчитать координаты из canvas-пикселей в пиксели оригинального изображения
      const realCropArea: CropArea = {
        x: Math.round(cropArea.x / displayScale),
        y: Math.round(cropArea.y / displayScale),
        width: Math.round(cropArea.width / displayScale),
        height: Math.round(cropArea.height / displayScale),
      };

      // Создать временный canvas для обрезки
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = realCropArea.width;
      tempCanvas.height = realCropArea.height;
      const tempCtx = tempCanvas.getContext('2d')!;

      // Вырезать область
      tempCtx.drawImage(
        cropImage,
        realCropArea.x,
        realCropArea.y,
        realCropArea.width,
        realCropArea.height,
        0,
        0,
        realCropArea.width,
        realCropArea.height,
      );

      // Если включен жесткий размер, применить resize
      let finalCanvas = tempCanvas;
      if (cropConfig.hardSizeEnabled && cropConfig.targetWidth && cropConfig.targetHeight) {
        const resizeCanvas = document.createElement('canvas');
        resizeCanvas.width = cropConfig.targetWidth;
        resizeCanvas.height = cropConfig.targetHeight;
        const resizeCtx = resizeCanvas.getContext('2d')!;

        resizeCtx.drawImage(
          tempCanvas,
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
          0,
          0,
          resizeCanvas.width,
          resizeCanvas.height,
        );

        finalCanvas = resizeCanvas;
      }

      // Преобразовать в data URL
      const croppedDataUrl = finalCanvas.toDataURL('image/png');

      ToastNotificationComponent.show({
        type: 'success',
        message: `Изображение обрезано: ${finalCanvas.width}×${finalCanvas.height}px`,
      });

      return {
        success: true,
        croppedDataUrl,
        realCropArea,
        finalDimensions: {
          width: finalCanvas.width,
          height: finalCanvas.height,
        },
      };
    } catch (error) {
      console.error('Crop failed:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Ошибка при обрезке изображения',
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Применить целевой размер к рамке обрезки
   * Вычисляет размер рамки на canvas с учётом displayScale и центрирует её
   */
  applyTargetSize(params: {
    cropTool: CropTool;
    cropConfig: CropConfig;
    displayScale: number;
    canvasDisplayDimensions: ImageDimensions;
    originalImageDimensions: ImageDimensions;
  }): boolean {
    const { cropTool, cropConfig, displayScale, canvasDisplayDimensions, originalImageDimensions } =
      params;

    if (!cropConfig.hardSizeEnabled) return false;

    const targetWidth = cropConfig.targetWidth;
    const targetHeight = cropConfig.targetHeight;

    if (!targetWidth || !targetHeight || targetWidth <= 0 || targetHeight <= 0) {
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Введите корректные значения ширины и высоты',
        duration: 3000,
      });
      return false;
    }

    // Проверка - нужно ли увеличение изображения
    let effectiveImageWidth = originalImageDimensions.width;
    let effectiveImageHeight = originalImageDimensions.height;

    if (targetWidth > effectiveImageWidth || targetHeight > effectiveImageHeight) {
      const upscaleX = targetWidth / effectiveImageWidth;
      const upscaleY = targetHeight / effectiveImageHeight;
      const upscale = Math.max(upscaleX, upscaleY);

      effectiveImageWidth *= upscale;
      effectiveImageHeight *= upscale;

      ToastNotificationComponent.show({
        type: 'warning',
        message: `Изображение увеличено в ${upscale.toFixed(
          2,
        )}x для обрезки ${targetWidth}×${targetHeight}`,
        duration: 4000,
      });
    }

    // Вычисление размера рамки для отображения на canvas
    const displayWidth = targetWidth * displayScale;
    const displayHeight = targetHeight * displayScale;

    // Центрирование рамки на canvas
    const x = Math.round((canvasDisplayDimensions.width - displayWidth) / 2);
    const y = Math.round((canvasDisplayDimensions.height - displayHeight) / 2);

    // Установка рамки через CropTool
    const newArea: CropArea = {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.round(displayWidth),
      height: Math.round(displayHeight),
    };

    cropTool.setCropArea(newArea);
    cropTool.setAspectRatio(targetWidth / targetHeight);

    ToastNotificationComponent.show({
      type: 'success',
      message: `Размер ${targetWidth}×${targetHeight} применен к рамке обрезки`,
      duration: 3000,
    });

    return true;
  }

  /**
   * Рассчитать пропорции из рамки CropTool
   */
  calculateAspectRatioFromCropTool(cropTool: CropTool | null): number | null {
    if (!cropTool) return null;

    const area = cropTool.getCropArea();
    return area.width / area.height;
  }

  /**
   * Рассчитать пропорции из целевого размера
   */
  calculateAspectRatioFromTarget(
    targetWidth: number | undefined,
    targetHeight: number | undefined,
  ): number | null {
    if (!targetWidth || !targetHeight) return null;
    return targetWidth / targetHeight;
  }

  /**
   * Очистить CropTool
   */
  cleanupCropTool(cropTool: CropTool | null): void {
    if (cropTool) {
      cropTool.unmount();
    }
  }
}
