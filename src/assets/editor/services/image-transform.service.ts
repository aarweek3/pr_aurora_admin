import { Injectable } from '@angular/core';
import { ToastNotificationComponent } from '../components/toast-notification/toast-notification.component';
import { ImageHistoryService, ImageOperation } from './image-history.service';
import { ImageProcessingService } from './image-processing.service';

export interface ImageTransformData {
  current: string;
  original: string;
  history: ImageOperation[];
}

export interface TransformOperation {
  type: 'rotate' | 'flip' | 'brightness-contrast' | 'filter';
  params: Record<string, any>;
  resultDataUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImageTransformService {
  constructor(
    private imageProcessingService: ImageProcessingService,
    private imageHistoryService: ImageHistoryService,
  ) {}

  /**
   * Применить поворот изображения
   */
  async applyRotation(
    imageData: ImageTransformData,
    angle: number,
    updateCallback: (newData: string) => void,
  ): Promise<void> {
    if (!imageData.current) {
      ToastNotificationComponent.show({
        type: 'warning',
        message: 'Сначала загрузите изображение',
      });
      return;
    }

    try {
      await this.applyOperation(
        imageData,
        'rotate',
        { angle },
        (dataUrl) => this.rotateImage(dataUrl, angle),
        updateCallback,
      );

      ToastNotificationComponent.show({
        type: 'success',
        message: `Изображение повернуто на ${angle}°`,
      });
    } catch (error) {
      console.error('Rotation error:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Не удалось повернуть изображение',
      });
    }
  }

  /**
   * Применить отражение изображения
   */
  async applyFlip(
    imageData: ImageTransformData,
    direction: 'horizontal' | 'vertical',
    updateCallback: (newData: string) => void,
  ): Promise<void> {
    if (!imageData.current) {
      ToastNotificationComponent.show({
        type: 'warning',
        message: 'Сначала загрузите изображение',
      });
      return;
    }

    try {
      await this.applyOperation(
        imageData,
        'flip',
        { direction },
        (dataUrl) => this.flipImage(dataUrl, direction),
        updateCallback,
      );

      ToastNotificationComponent.show({
        type: 'success',
        message: 'Изображение отражено',
      });
    } catch (error) {
      console.error('Flip error:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Не удалось отразить изображение',
      });
    }
  }

  /**
   * Применить фильтры яркости и контрастности
   */
  async applyFilters(
    imageData: ImageTransformData,
    brightness: number,
    contrast: number,
    updateCallback: (newData: string) => void,
  ): Promise<void> {
    if (!imageData.current) {
      ToastNotificationComponent.show({
        type: 'warning',
        message: 'Сначала загрузите изображение',
      });
      return;
    }

    try {
      await this.applyOperation(
        imageData,
        'brightness-contrast',
        { brightness, contrast },
        (dataUrl) => this.applyBrightnessContrast(dataUrl, brightness, contrast),
        updateCallback,
      );

      ToastNotificationComponent.show({
        type: 'success',
        message: 'Фильтры применены',
      });
    } catch (error) {
      console.error('Filter error:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Не удалось применить фильтры',
      });
    }
  }

  /**
   * Применить пресетный фильтр
   */
  async applyPresetFilter(
    imageData: ImageTransformData,
    filter: 'grayscale' | 'sepia' | 'vintage' | 'cold' | 'warm',
    updateCallback: (newData: string) => void,
  ): Promise<void> {
    if (!imageData.current) {
      ToastNotificationComponent.show({
        type: 'warning',
        message: 'Сначала загрузите изображение',
      });
      return;
    }

    try {
      await this.applyOperation(
        imageData,
        'filter',
        { filter },
        (dataUrl) => this.applyFilter(dataUrl, filter),
        updateCallback,
      );

      ToastNotificationComponent.show({
        type: 'success',
        message: `Фильтр "${filter}" применён`,
      });
    } catch (error) {
      console.error('Preset filter error:', error);
      ToastNotificationComponent.show({
        type: 'error',
        message: 'Не удалось применить фильтр',
      });
    }
  }

  /**
   * Применить фильтры в реальном времени к canvas
   */
  applyFiltersRealtime(
    imageData: ImageTransformData,
    canvas: HTMLCanvasElement,
    brightness: number,
    contrast: number,
  ): void {
    console.log('🎨 applyFiltersRealtime called');
    console.log('brightness:', brightness, 'contrast:', contrast);

    if (!imageData.current) {
      console.warn('⚠️ No current image data');
      return;
    }

    if (!canvas) {
      console.warn('⚠️ No canvas provided');
      return;
    }

    console.log('✅ Canvas found:', canvas.width, 'x', canvas.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('⚠️ No canvas context');
      return;
    }

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Создаем временное изображение из текущих данных
    const img = new Image();
    img.onload = () => {
      console.log('🖼️ Image loaded, drawing...');

      // Рисуем исходное изображение
      ctx.drawImage(img, 0, 0);

      // Получаем пиксели
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Применяем яркость и контраст
      const brightnessValue = brightness / 100;
      const contrastValue = (contrast + 100) / 100;

      console.log('📊 Applying filters - brightness:', brightnessValue, 'contrast:', contrastValue);

      for (let i = 0; i < data.length; i += 4) {
        // Применяем контраст
        data[i] = ((data[i] / 255 - 0.5) * contrastValue + 0.5) * 255;
        data[i + 1] = ((data[i + 1] / 255 - 0.5) * contrastValue + 0.5) * 255;
        data[i + 2] = ((data[i + 2] / 255 - 0.5) * contrastValue + 0.5) * 255;

        // Применяем яркость
        data[i] += brightnessValue * 255;
        data[i + 1] += brightnessValue * 255;
        data[i + 2] += brightnessValue * 255;

        // Ограничиваем значения от 0 до 255
        data[i] = Math.max(0, Math.min(255, data[i]));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
      }

      // Применяем измененные пиксели обратно
      ctx.putImageData(imageData, 0, 0);
      console.log('✅ Filters applied to canvas');
    };

    img.onerror = (error) => {
      console.error('❌ Image load error:', error);
    };

    img.src = imageData.current;
    console.log('📥 Loading image from:', imageData.current.substring(0, 50) + '...');
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Базовый метод для применения операций с сохранением в истории
   */
  private async applyOperation(
    imageData: ImageTransformData,
    operationType: string,
    params: Record<string, any>,
    processor: (dataUrl: string) => Promise<string>,
    updateCallback: (newData: string) => void,
  ): Promise<void> {
    try {
      const oldData = imageData.current;
      const resultDataUrl = await processor(imageData.current);

      // Обновляем данные изображения
      imageData.current = resultDataUrl;

      // Добавляем в историю
      const operation: TransformOperation = {
        type: operationType as any,
        params,
        resultDataUrl,
      };

      // Создаем операцию для истории
      const historyOperation: ImageOperation = {
        id: this.imageHistoryService.generateOperationId(),
        type: operationType as any,
        params: operation.params,
        timestamp: Date.now(),
        resultDataUrl,
      };

      // Добавляем в историю (аналогично логике из компонента)
      if (
        imageData.history &&
        'historyIndex' in imageData &&
        typeof (imageData as any).historyIndex === 'number'
      ) {
        const data = imageData as ImageTransformData & { historyIndex: number };
        if (data.historyIndex < data.history.length - 1) {
          data.history = data.history.slice(0, data.historyIndex + 1);
        }
        data.history.push(historyOperation);
        data.historyIndex++;
      }

      // Вызываем callback для обновления компонента
      updateCallback(resultDataUrl);
    } catch (error) {
      console.error(`❌ ${operationType} operation failed:`, error);
      throw error;
    }
  }

  /**
   * Поворот изображения
   */
  private async rotateImage(dataUrl: string, angle: number): Promise<string> {
    return this.imageProcessingService.rotateImage(dataUrl, angle);
  }

  /**
   * Отражение изображения
   */
  private async flipImage(dataUrl: string, direction: 'horizontal' | 'vertical'): Promise<string> {
    return this.imageProcessingService.flipImage(dataUrl, direction);
  }

  /**
   * Применение яркости и контрастности
   */
  private async applyBrightnessContrast(
    dataUrl: string,
    brightness: number,
    contrast: number,
  ): Promise<string> {
    return this.imageProcessingService.applyBrightnessContrast(dataUrl, brightness, contrast);
  }

  /**
   * Применение пресетного фильтра
   */
  private async applyFilter(
    dataUrl: string,
    filter: 'grayscale' | 'sepia' | 'vintage' | 'cold' | 'warm',
  ): Promise<string> {
    return this.imageProcessingService.applyFilter(dataUrl, filter);
  }
}
