/**
 * Утилиты для работы с круговой обрезкой
 * Математические вычисления и вспомогательные функции
 */

import {
  CIRCLE_CONSTANTS,
  CircleConfig,
  CircleUtils,
  ImageBounds,
  MousePosition,
} from '../circle.types';

/**
 * Класс утилит для круговой обрезки
 */
export class CircleUtilsImpl implements CircleUtils {
  /**
   * Рассчитать оптимальный радиус для изображения
   * @param imageWidth Ширина изображения
   * @param imageHeight Высота изображения
   * @returns Оптимальный радиус
   */
  calculateOptimalRadius(imageWidth: number, imageHeight: number): number {
    // Радиус = 40% от меньшей стороны (по умолчанию)
    const minSide = Math.min(imageWidth, imageHeight);
    const radius = Math.floor(minSide * 0.4);

    // Проверяем минимальные ограничения
    return Math.max(radius, CIRCLE_CONSTANTS.MIN_RADIUS);
  }

  /**
   * Центрировать круг на изображении
   * @param imageWidth Ширина изображения
   * @param imageHeight Высота изображения
   * @param radius Радиус круга
   * @returns Конфигурация центрированного круга
   */
  centerCircle(imageWidth: number, imageHeight: number, radius: number): CircleConfig {
    return {
      centerX: Math.floor(imageWidth / 2),
      centerY: Math.floor(imageHeight / 2),
      radius: radius,
      strokeWidth: 2,
      strokeColor: '#007bff',
      fillOpacity: 0.3,
    };
  }

  /**
   * Проверить и скорректировать границы круга
   * @param config Конфигурация круга
   * @param bounds Границы изображения
   * @returns Скорректированная конфигурация
   */
  validateBounds(config: CircleConfig, bounds: ImageBounds): CircleConfig {
    let { centerX, centerY, radius } = config;

    // Рассчитаем максимально допустимый радиус для текущего центра
    const maxRadiusFromBounds = Math.min(
      centerX - bounds.minX, // Расстояние до левой границы
      centerY - bounds.minY, // Расстояние до верхней границы
      bounds.maxX - centerX, // Расстояние до правой границы
      bounds.maxY - centerY, // Расстояние до нижней границы
    );

    // Ограничиваем радиус
    radius = Math.min(radius, maxRadiusFromBounds);
    radius = Math.max(radius, CIRCLE_CONSTANTS.MIN_RADIUS);

    // Корректируем центр, если круг выходит за границы
    if (centerX - radius < bounds.minX) {
      centerX = bounds.minX + radius;
    }
    if (centerX + radius > bounds.maxX) {
      centerX = bounds.maxX - radius;
    }
    if (centerY - radius < bounds.minY) {
      centerY = bounds.minY + radius;
    }
    if (centerY + radius > bounds.maxY) {
      centerY = bounds.maxY - radius;
    }

    return {
      ...config,
      centerX: Math.floor(centerX),
      centerY: Math.floor(centerY),
      radius: Math.floor(radius),
    };
  }

  /**
   * Проверить попадание точки в круг
   * @param point Координаты точки
   * @param config Конфигурация круга
   * @returns true если точка внутри круга
   */
  isPointInCircle(point: MousePosition, config: CircleConfig): boolean {
    const distance = this.distanceFromCenter(point, config);
    return distance <= config.radius;
  }

  /**
   * Проверить попадание точки в ручку изменения размера
   * @param point Координаты точки
   * @param config Конфигурация круга
   * @param handleSize Размер ручки
   * @returns true если точка в ручке
   */
  isPointInResizeHandle(
    point: MousePosition,
    config: CircleConfig,
    handleSize: number = CIRCLE_CONSTANTS.RESIZE_HANDLE_SIZE,
  ): boolean {
    const distance = this.distanceFromCenter(point, config);
    const handleDistance = Math.abs(distance - config.radius);
    return handleDistance <= handleSize / 2;
  }

  /**
   * Рассчитать расстояние от центра круга до точки
   * @param point Координаты точки
   * @param config Конфигурация круга
   * @returns Расстояние в пикселях
   */
  distanceFromCenter(point: MousePosition, config: CircleConfig): number {
    const dx = point.x - config.centerX;
    const dy = point.y - config.centerY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Преобразовать координаты мыши в координаты canvas
   * @param mouseEvent События мыши
   * @param canvas HTML canvas элемент
   * @param scale Масштаб отображения
   * @param offset Смещение изображения
   * @returns Координаты на canvas
   */
  static getCanvasCoordinates(
    mouseEvent: MouseEvent,
    canvas: HTMLCanvasElement,
    scale: number = 1,
    offset: { x: number; y: number } = { x: 0, y: 0 },
  ): MousePosition {
    const rect = canvas.getBoundingClientRect();
    const x = (mouseEvent.clientX - rect.left - offset.x) / scale;
    const y = (mouseEvent.clientY - rect.top - offset.y) / scale;

    return { x: Math.floor(x), y: Math.floor(y) };
  }

  /**
   * Рассчитать новый радиус на основе позиции мыши
   * @param mousePos Позиция мыши
   * @param config Текущая конфигурация
   * @param bounds Границы изображения
   * @returns Новый радиус
   */
  static calculateRadiusFromMousePos(
    mousePos: MousePosition,
    config: CircleConfig,
    bounds: ImageBounds,
  ): number {
    const distance = Math.sqrt(
      Math.pow(mousePos.x - config.centerX, 2) + Math.pow(mousePos.y - config.centerY, 2),
    );

    // Ограничиваем радиус границами изображения
    const maxRadius = Math.min(
      config.centerX - bounds.minX,
      config.centerY - bounds.minY,
      bounds.maxX - config.centerX,
      bounds.maxY - config.centerY,
    );

    return Math.max(CIRCLE_CONSTANTS.MIN_RADIUS, Math.min(Math.floor(distance), maxRadius));
  }

  /**
   * Создать круговую маску на canvas
   * @param canvas Canvas для рисования
   * @param config Конфигурация круга
   * @param imageScale Масштаб изображения (для корректного отображения)
   */
  static renderCircleOverlay(
    canvas: HTMLCanvasElement,
    config: CircleConfig,
    imageScale: number = 1,
    offset: { x: number; y: number } = { x: 0, y: 0 },
  ): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очищаем canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Применяем масштаб и смещение
    const scaledCenterX = config.centerX * imageScale + offset.x;
    const scaledCenterY = config.centerY * imageScale + offset.y;
    const scaledRadius = config.radius * imageScale;

    // Рисуем затемненную область вне круга
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${config.fillOpacity})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Вырезаем круглую область
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(scaledCenterX, scaledCenterY, scaledRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Рисуем границу круга
    ctx.strokeStyle = config.strokeColor;
    ctx.lineWidth = config.strokeWidth;
    ctx.beginPath();
    ctx.arc(scaledCenterX, scaledCenterY, scaledRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Рисуем ручки изменения размера
    this.renderResizeHandles(ctx, scaledCenterX, scaledCenterY, scaledRadius, config.strokeColor);
  }

  /**
   * Нарисовать ручки для изменения размера
   * @param ctx Контекст canvas
   * @param centerX Центр X (с учетом масштаба)
   * @param centerY Центр Y (с учетом масштаба)
   * @param radius Радиус (с учетом масштаба)
   * @param color Цвет ручек
   */
  private static renderResizeHandles(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    color: string,
  ): void {
    const handleSize = CIRCLE_CONSTANTS.RESIZE_HANDLE_SIZE;

    // Позиции ручек (по четырем сторонам круга)
    const handles = [
      { x: centerX + radius, y: centerY }, // Правая
      { x: centerX, y: centerY - radius }, // Верхняя
      { x: centerX - radius, y: centerY }, // Левая
      { x: centerX, y: centerY + radius }, // Нижняя
    ];

    ctx.fillStyle = color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    handles.forEach((handle) => {
      // Рисуем квадратную ручку
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });

    // Рисуем центральную точку
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Применить круговую обрезку к изображению
   * @param image HTML изображение
   * @param config Конфигурация обрезки
   * @returns Base64 строка PNG с прозрачностью
   */
  static applyCircularCrop(image: HTMLImageElement, config: CircleConfig): string {
    // Создаем canvas размером с диаметр круга
    const diameter = config.radius * 2;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = diameter;
    canvas.height = diameter;

    // Создаем круговую маску
    ctx.beginPath();
    ctx.arc(config.radius, config.radius, config.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Рассчитываем смещение для центрирования обрезки
    const offsetX = config.radius - config.centerX;
    const offsetY = config.radius - config.centerY;

    // Рисуем изображение с учетом смещения
    ctx.drawImage(image, offsetX, offsetY);

    // Возвращаем PNG для сохранения прозрачности
    return canvas.toDataURL('image/png', CIRCLE_CONSTANTS.EXPORT_QUALITY);
  }

  /**
   * Рассчитать информацию о круге для отображения
   * @param config Конфигурация круга
   * @returns Объект с информацией
   */
  static getCircleInfo(config: CircleConfig) {
    return {
      centerX: Math.round(config.centerX),
      centerY: Math.round(config.centerY),
      radius: Math.round(config.radius),
      diameter: Math.round(config.radius * 2),
      area: Math.round(Math.PI * config.radius * config.radius),
      circumference: Math.round(2 * Math.PI * config.radius),
    };
  }
}

// Экспортируем экземпляр утилит
export const circleUtils = new CircleUtilsImpl();
