/**
 * Сервис для круговой обрезки изображений
 * Основная бизнес-логика плагина Circle
 */

import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  CIRCLE_CONSTANTS,
  CircleConfig,
  CircleResult,
  CircleSettings,
  CircleState,
  ImageBounds,
  InteractionMode,
  MousePosition,
} from './circle.types';
import { CircleUtilsImpl, circleUtils } from './utils/circle.utils';

@Injectable({
  providedIn: 'root',
})
export class CircleService {
  // Состояние сервиса
  private readonly _isActive = new BehaviorSubject<boolean>(false);
  private readonly _currentConfig = new BehaviorSubject<CircleConfig | null>(null);
  private readonly _currentState = new BehaviorSubject<CircleState>('idle');
  private readonly _settings = new BehaviorSubject<CircleSettings>({
    defaultRadiusPercent: 40,
    strokeColor: '#007bff',
    strokeWidth: 2,
    fillColor: '#000000',
    fillOpacity: 0.3,
    autoCenter: true,
    showHandles: true,
    snapToGrid: false,
    enableKeyboardShortcuts: true,
    snapToPixels: true,
    minRadius: 10,
    showInfo: true,
  });

  // События
  private readonly _onConfigChange = new EventEmitter<CircleConfig>();
  private readonly _onStateChange = new EventEmitter<CircleState>();
  private readonly _onApply = new EventEmitter<CircleResult>();
  private readonly _onCancel = new EventEmitter<void>();

  // Внутренние переменные
  private canvas: HTMLCanvasElement | null = null;
  private overlayCanvas: HTMLCanvasElement | null = null;
  private imageElement: HTMLImageElement | null = null;
  private imageBounds: ImageBounds | null = null;
  private currentInteractionMode: InteractionMode = 'none';
  private lastMousePosition: MousePosition | null = null;
  private isMouseDown = false;
  private destroy$ = new EventEmitter<void>();

  // Public Observable свойства
  readonly isActive$: Observable<boolean> = this._isActive.asObservable();
  readonly currentConfig$: Observable<CircleConfig | null> = this._currentConfig.asObservable();
  readonly currentState$: Observable<CircleState> = this._currentState.asObservable();
  readonly settings$: Observable<CircleSettings> = this._settings.asObservable();
  readonly onConfigChange$: Observable<CircleConfig> = this._onConfigChange.asObservable();
  readonly onStateChange$: Observable<CircleState> = this._onStateChange.asObservable();
  readonly onApply$: Observable<CircleResult> = this._onApply.asObservable();
  readonly onCancel$: Observable<void> = this._onCancel.asObservable();

  constructor() {
    this.setupKeyboardShortcuts();
  }

  /**
   * Активировать плагин круговой обрезки
   * @param canvas Canvas элемент с изображением
   * @param image HTML изображение
   * @param overlayCanvas Overlay canvas для интерфейса
   * @param initialConfig Начальная конфигурация (опционально)
   */
  activate(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    overlayCanvas?: HTMLCanvasElement,
    initialConfig?: Partial<CircleConfig>,
  ): void {
    this.canvas = canvas;
    this.imageElement = image;
    this.overlayCanvas = overlayCanvas || this.createOverlayCanvas(canvas);

    // Устанавливаем границы изображения
    this.imageBounds = {
      width: image.naturalWidth,
      height: image.naturalHeight,
      minX: 0,
      minY: 0,
      maxX: image.naturalWidth,
      maxY: image.naturalHeight,
    };

    // Создаем начальную конфигурацию
    const optimalRadius = circleUtils.calculateOptimalRadius(
      image.naturalWidth,
      image.naturalHeight,
    );

    const defaultConfig = circleUtils.centerCircle(
      image.naturalWidth,
      image.naturalHeight,
      optimalRadius,
    );

    // Объединяем с пользовательской конфигурацией
    const finalConfig = {
      ...defaultConfig,
      ...this._settings.value,
      ...initialConfig,
    };

    this.setConfig(finalConfig);
    this.setupMouseEvents();
    this.setState('configuring');
    this._isActive.next(true);

    console.log('[CircleService] Активирован с конфигурацией:', finalConfig);
  }

  /**
   * Деактивировать плагин
   */
  deactivate(): void {
    this.cleanup();
    this._isActive.next(false);
    this._currentConfig.next(null);
    this.setState('idle');

    console.log('[CircleService] Деактивирован');
  }

  /**
   * Применить круговую обрезку
   */
  apply(): void {
    const config = this._currentConfig.value;
    if (!config || !this.imageElement) {
      console.error('[CircleService] Нет конфигурации или изображения для применения');
      return;
    }

    this.setState('processing');

    try {
      // Создаем результат обрезки
      const croppedImage = CircleUtilsImpl.applyCircularCrop(this.imageElement, config);
      const info = CircleUtilsImpl.getCircleInfo(config);

      const result: CircleResult = {
        config: { ...config },
        croppedImage,
        originalImage: this.imageElement.src,
        originalSize: {
          width: this.imageElement.naturalWidth,
          height: this.imageElement.naturalHeight,
        },
        croppedSize: {
          width: config.radius * 2,
          height: config.radius * 2,
        },
        info: {
          ...info,
          outputFormat: 'image/png',
          hasTransparency: true,
          fileSize: Math.round(croppedImage.length * 0.75), // Примерный расчет размера base64
        },
        metadata: {
          timestamp: Date.now(),
          format: 'png',
          quality: 1.0,
        },
      };

      this._onApply.emit(result);
      console.log('[CircleService] Обрезка применена:', result.info);
    } catch (error) {
      console.error('[CircleService] Ошибка при применении обрезки:', error);
      this.setState('error');
      return;
    }

    this.deactivate();
  }

  /**
   * Отменить операцию
   */
  cancel(): void {
    console.log('[CircleService] Операция отменена');
    this._onCancel.emit();
    this.deactivate();
  }

  /**
   * Установить новую конфигурацию круга
   */
  setConfig(config: Partial<CircleConfig>): void {
    if (!this.imageBounds) return;

    const currentConfig = this._currentConfig.value || {
      centerX: 0,
      centerY: 0,
      radius: CIRCLE_CONSTANTS.MIN_RADIUS,
      strokeColor: '#007bff',
      strokeWidth: 2,
      fillOpacity: 0.3,
    };

    const newConfig = { ...currentConfig, ...config };
    const validatedConfig = circleUtils.validateBounds(newConfig, this.imageBounds);

    this._currentConfig.next(validatedConfig);
    this._onConfigChange.emit(validatedConfig);
    this.renderOverlay();
  }

  /**
   * Обновить настройки плагина
   */
  updateSettings(settings: Partial<CircleSettings>): void {
    const currentSettings = this._settings.value;
    const newSettings = { ...currentSettings, ...settings };
    this._settings.next(newSettings);

    // Обновляем текущую конфигурацию с новыми настройками
    const currentConfig = this._currentConfig.value;
    if (currentConfig) {
      this.setConfig({
        strokeColor: newSettings.strokeColor,
        strokeWidth: newSettings.strokeWidth,
        fillOpacity: newSettings.fillOpacity,
      });
    }
  }

  /**
   * Центрировать круг
   */
  centerCircle(): void {
    if (!this.imageBounds) return;

    const currentConfig = this._currentConfig.value;
    if (!currentConfig) return;

    const centeredConfig = circleUtils.centerCircle(
      this.imageBounds.maxX - this.imageBounds.minX,
      this.imageBounds.maxY - this.imageBounds.minY,
      currentConfig.radius,
    );

    this.setConfig(centeredConfig);
  }

  /**
   * Сбросить конфигурацию к оптимальной
   */
  resetToOptimal(): void {
    if (!this.imageBounds) return;

    const imageWidth = this.imageBounds.maxX - this.imageBounds.minX;
    const imageHeight = this.imageBounds.maxY - this.imageBounds.minY;

    const optimalRadius = circleUtils.calculateOptimalRadius(imageWidth, imageHeight);
    const optimalConfig = circleUtils.centerCircle(imageWidth, imageHeight, optimalRadius);

    this.setConfig(optimalConfig);
  }

  // Приватные методы

  private setState(state: CircleState): void {
    this._currentState.next(state);
    this._onStateChange.emit(state);
  }

  private setupMouseEvents(): void {
    if (!this.overlayCanvas) return;

    const mousedown$ = fromEvent<MouseEvent>(this.overlayCanvas, 'mousedown');
    const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
    const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');

    // Обработка нажатия мыши
    mousedown$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      event.preventDefault();
      this.handleMouseDown(event);
    });

    // Обработка движения мыши
    mousemove$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      this.handleMouseMove(event);
    });

    // Обработка отпускания мыши
    mouseup$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.handleMouseUp();
    });
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!this.overlayCanvas || !this.canvas) return;

    const mousePos = CircleUtilsImpl.getCanvasCoordinates(event, this.overlayCanvas);
    const config = this._currentConfig.value;

    if (!config) return;

    this.isMouseDown = true;
    this.lastMousePosition = mousePos;

    // Определяем режим взаимодействия
    if (circleUtils.isPointInResizeHandle(mousePos, config)) {
      this.currentInteractionMode = 'resize';
      this.setState('resizing');
    } else if (circleUtils.isPointInCircle(mousePos, config)) {
      this.currentInteractionMode = 'move';
      this.setState('moving');
    } else {
      this.currentInteractionMode = 'none';
    }

    console.log('[CircleService] Mouse down:', { mousePos, mode: this.currentInteractionMode });
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.overlayCanvas || !this.canvas || !this.isMouseDown || !this.lastMousePosition) return;

    const mousePos = CircleUtilsImpl.getCanvasCoordinates(event, this.overlayCanvas);
    const config = this._currentConfig.value;

    if (!config || !this.imageBounds) return;

    const deltaX = mousePos.x - this.lastMousePosition.x;
    const deltaY = mousePos.y - this.lastMousePosition.y;

    let newConfig: Partial<CircleConfig> = {};

    switch (this.currentInteractionMode) {
      case 'move':
        newConfig = {
          centerX: config.centerX + deltaX,
          centerY: config.centerY + deltaY,
        };
        break;

      case 'resize':
        const newRadius = CircleUtilsImpl.calculateRadiusFromMousePos(
          mousePos,
          config,
          this.imageBounds,
        );
        newConfig = { radius: newRadius };
        break;
    }

    if (Object.keys(newConfig).length > 0) {
      this.setConfig(newConfig);
      this.lastMousePosition = mousePos;
    }
  }

  private handleMouseUp(): void {
    if (!this.isMouseDown) return;

    this.isMouseDown = false;
    this.currentInteractionMode = 'none';
    this.lastMousePosition = null;
    this.setState('configuring');

    console.log('[CircleService] Mouse up - возврат к конфигурированию');
  }

  private renderOverlay(): void {
    if (!this.overlayCanvas || !this.canvas) return;

    const config = this._currentConfig.value;
    if (!config) return;

    // Рассчитываем масштаб отображения
    const canvasRect = this.canvas.getBoundingClientRect();
    const overlayRect = this.overlayCanvas.getBoundingClientRect();

    const scaleX = overlayRect.width / this.canvas.width;
    const scaleY = overlayRect.height / this.canvas.height;
    const scale = Math.min(scaleX, scaleY);

    CircleUtilsImpl.renderCircleOverlay(this.overlayCanvas, config, scale);
  }

  private createOverlayCanvas(baseCanvas: HTMLCanvasElement): HTMLCanvasElement {
    const overlay = document.createElement('canvas');
    overlay.width = baseCanvas.width;
    overlay.height = baseCanvas.height;
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.pointerEvents = 'auto';
    overlay.style.cursor = 'crosshair';

    // Добавляем overlay в контейнер canvas
    const container = baseCanvas.parentElement;
    if (container) {
      container.style.position = 'relative';
      container.appendChild(overlay);
    }

    return overlay;
  }

  private setupKeyboardShortcuts(): void {
    const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown');

    keydown$.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (!this._isActive.value || !this._settings.value.enableKeyboardShortcuts) return;

      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          this.apply();
          break;
        case 'Escape':
          event.preventDefault();
          this.cancel();
          break;
        case 'c':
          if (event.ctrlKey) {
            event.preventDefault();
            this.centerCircle();
          }
          break;
        case 'r':
          if (event.ctrlKey) {
            event.preventDefault();
            this.resetToOptimal();
          }
          break;
      }
    });
  }

  private cleanup(): void {
    this.destroy$.emit();

    // Удаляем overlay canvas
    if (this.overlayCanvas && this.overlayCanvas.parentElement) {
      this.overlayCanvas.parentElement.removeChild(this.overlayCanvas);
    }

    // Сбрасываем переменные
    this.canvas = null;
    this.overlayCanvas = null;
    this.imageElement = null;
    this.imageBounds = null;
    this.currentInteractionMode = 'none';
    this.lastMousePosition = null;
    this.isMouseDown = false;
  }

  /**
   * Получить текущую конфигурацию
   */
  get currentConfig(): CircleConfig | null {
    return this._currentConfig.value;
  }

  /**
   * Получить текущее состояние
   */
  get currentState(): CircleState {
    return this._currentState.value;
  }

  /**
   * Получить текущие настройки
   */
  get settings(): CircleSettings {
    return this._settings.value;
  }

  /**
   * Проверить, активен ли плагин
   */
  get isActive(): boolean {
    return this._isActive.value;
  }
}
