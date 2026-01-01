import { Injectable, signal } from '@angular/core';

export type ImageModalTab = 'upload' | 'crop' | 'edit' | 'watermark' | 'settings';

export interface CropConfig {
  hardSizeEnabled: boolean;
  targetWidth: number;
  targetHeight: number;
  aspectRatioLocked: boolean;
  customCropWidth: number;
  customCropHeight: number;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageModalState {
  isOpen: boolean;
  activeTab: ImageModalTab;
  isDragOver: boolean;
  uploading: boolean;
  errorMessage: string;

  // Canvas и размеры
  canvasDisplayDimensions: ImageDimensions | null;
  originalImageDimensions: ImageDimensions | null;
  imageScale: number;

  // Crop настройки
  cropConfig: CropConfig;

  // Фильтры (для realtime preview)
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  blur: number;
  grayscale: number;
  sepia: number;
  invert: number;

  // URL изображения для загрузки
  imageUrl: string;

  // Показать информационный popover
  showImageInfoPopover: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ImageModalStateService {
  // Реактивное состояние с сигналами
  private _state = signal<ImageModalState>({
    isOpen: false,
    activeTab: 'upload',
    isDragOver: false,
    uploading: false,
    errorMessage: '',

    canvasDisplayDimensions: null,
    originalImageDimensions: null,
    imageScale: 1,

    cropConfig: {
      hardSizeEnabled: false,
      targetWidth: 800,
      targetHeight: 600,
      aspectRatioLocked: true,
      customCropWidth: 800,
      customCropHeight: 600,
    },

    brightness: 0,
    contrast: 0,
    saturation: 0,
    hueRotate: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    invert: 0,

    imageUrl: '',
    showImageInfoPopover: false,
  });

  // Readonly геттеры для компонентов
  get state() {
    return this._state.asReadonly();
  }

  // Удобные геттеры для частых проверок
  get isOpen() {
    return this._state().isOpen;
  }

  get activeTab() {
    return this._state().activeTab;
  }

  get isDragOver() {
    return this._state().isDragOver;
  }

  get uploading() {
    return this._state().uploading;
  }

  constructor() {}

  // ═══════════════════════════════════════════════════════════════
  // Управление модальным окном
  // ═══════════════════════════════════════════════════════════════

  /**
   * Открыть модальное окно
   */
  open(): void {
    this.updateState({ isOpen: true });
    console.log('🖼️ Image modal opened');
  }

  /**
   * Закрыть модальное окно
   */
  close(): void {
    // Сбросить состояние при закрытии
    this.resetState();
    console.log('🖼️ Image modal closed');
  }

  /**
   * Переключить вкладку
   */
  switchTab(tab: ImageModalTab): void {
    this.updateState({ activeTab: tab });
    console.log(`📂 Switched to tab: ${tab}`);
  }

  // ═══════════════════════════════════════════════════════════════
  // Управление drag & drop
  // ═══════════════════════════════════════════════════════════════

  /**
   * Начать drag over
   */
  startDragOver(): void {
    this.updateState({ isDragOver: true });
  }

  /**
   * Завершить drag over
   */
  endDragOver(): void {
    this.updateState({ isDragOver: false });
  }

  // ═══════════════════════════════════════════════════════════════
  // Управление состоянием загрузки
  // ═══════════════════════════════════════════════════════════════

  /**
   * Начать загрузку
   */
  startUploading(): void {
    this.updateState({
      uploading: true,
      errorMessage: '',
    });
  }

  /**
   * Завершить загрузку
   */
  finishUploading(): void {
    this.updateState({ uploading: false });
  }

  /**
   * Установить сообщение об ошибке
   */
  setError(message: string): void {
    this.updateState({
      errorMessage: message,
      uploading: false,
    });
  }

  /**
   * Очистить ошибку
   */
  clearError(): void {
    this.updateState({ errorMessage: '' });
  }

  // ═══════════════════════════════════════════════════════════════
  // Управление размерами canvas и изображений
  // ═══════════════════════════════════════════════════════════════

  /**
   * Установить размеры отображения на canvas
   */
  setCanvasDisplayDimensions(dimensions: ImageDimensions): void {
    this.updateState({ canvasDisplayDimensions: dimensions });
  }

  /**
   * Установить оригинальные размеры изображения
   */
  setOriginalImageDimensions(dimensions: ImageDimensions): void {
    this.updateState({ originalImageDimensions: dimensions });
  }

  /**
   * Обновить масштаб изображения
   */
  updateImageScale(): void {
    const state = this._state();
    if (state.originalImageDimensions && state.canvasDisplayDimensions) {
      const scaleX = state.canvasDisplayDimensions.width / state.originalImageDimensions.width;
      const scaleY = state.canvasDisplayDimensions.height / state.originalImageDimensions.height;
      const scale = Math.min(scaleX, scaleY);

      this.updateState({ imageScale: scale });
      console.log(`📏 Image scale updated: ${scale.toFixed(3)}`);
    }
  }

  /**
   * Получить текущий масштаб изображения
   */
  getImageScale(): number {
    return this._state().imageScale;
  }

  // ═══════════════════════════════════════════════════════════════
  // Управление настройками обрезки (Crop)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Обновить настройки crop
   */
  updateCropConfig(updates: Partial<CropConfig>): void {
    const currentState = this._state();
    const updatedCropConfig = { ...currentState.cropConfig, ...updates };
    this.updateState({ cropConfig: updatedCropConfig });
  }

  /**
   * Переключить блокировку соотношения сторон
   */
  toggleAspectRatio(): void {
    const currentState = this._state();
    this.updateCropConfig({
      aspectRatioLocked: !currentState.cropConfig.aspectRatioLocked,
    });
  }

  /**
   * Установить размеры для обрезки
   */
  setCropDimensions(width: number, height: number): void {
    this.updateCropConfig({
      customCropWidth: width,
      customCropHeight: height,
    });
  }

  /**
   * Включить/выключить жесткий размер
   */
  toggleHardSize(enabled: boolean): void {
    this.updateCropConfig({ hardSizeEnabled: enabled });
  }

  /**
   * Установить целевой размер
   */
  setTargetSize(width: number, height: number): void {
    this.updateCropConfig({
      targetWidth: width,
      targetHeight: height,
    });
  }

  /**
   * Сбросить настройки crop
   */
  resetCropConfig(): void {
    this.updateCropConfig({
      hardSizeEnabled: false,
      targetWidth: 800,
      targetHeight: 600,
      aspectRatioLocked: true,
      customCropWidth: 800,
      customCropHeight: 600,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Управление фильтрами (для realtime preview)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Установить значение фильтра
   */
  setFilterValue(
    filter: keyof Pick<
      ImageModalState,
      | 'brightness'
      | 'contrast'
      | 'saturation'
      | 'hueRotate'
      | 'blur'
      | 'grayscale'
      | 'sepia'
      | 'invert'
    >,
    value: number,
  ): void {
    this.updateState({ [filter]: value });
  }

  /**
   * Получить все текущие значения фильтров
   */
  getFilterValues() {
    const state = this._state();
    return {
      brightness: state.brightness,
      contrast: state.contrast,
      saturation: state.saturation,
      hueRotate: state.hueRotate,
      blur: state.blur,
      grayscale: state.grayscale,
      sepia: state.sepia,
      invert: state.invert,
    };
  }

  /**
   * Сбросить все фильтры
   */
  resetFilters(): void {
    this.updateState({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hueRotate: 0,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // Управление URL изображения
  // ═══════════════════════════════════════════════════════════════

  /**
   * Установить URL изображения для загрузки
   */
  setImageUrl(url: string): void {
    this.updateState({ imageUrl: url });
  }

  /**
   * Получить URL изображения
   */
  getImageUrl(): string {
    return this._state().imageUrl;
  }

  // ═══════════════════════════════════════════════════════════════
  // Управление информационным popover
  // ═══════════════════════════════════════════════════════════════

  /**
   * Переключить показ информационного popover
   */
  toggleImageInfoPopover(): void {
    const currentState = this._state();
    this.updateState({
      showImageInfoPopover: !currentState.showImageInfoPopover,
    });
  }

  /**
   * Скрыть информационный popover
   */
  hideImageInfoPopover(): void {
    this.updateState({ showImageInfoPopover: false });
  }

  // ═══════════════════════════════════════════════════════════════
  // Валидация состояния
  // ═══════════════════════════════════════════════════════════════

  /**
   * Проверить, можно ли переключиться на указанную вкладку
   */
  canSwitchToTab(tab: ImageModalTab): boolean {
    // На вкладку upload можно переключиться всегда
    if (tab === 'upload') return true;

    // На остальные вкладки можно переключиться только если есть изображение
    // Эту проверку должен делать компонент через ImageHistoryService
    return true; // Пусть компонент сам решает
  }

  /**
   * Валидация настроек crop
   */
  validateCropSettings(): { valid: boolean; error?: string } {
    const state = this._state();
    const { customCropWidth, customCropHeight } = state.cropConfig;

    if (customCropWidth < 1 || customCropWidth > 4000) {
      return { valid: false, error: 'Ширина должна быть от 1 до 4000 пикселей' };
    }

    if (customCropHeight < 1 || customCropHeight > 4000) {
      return { valid: false, error: 'Высота должна быть от 1 до 4000 пикселей' };
    }

    return { valid: true };
  }

  /**
   * Проверить, есть ли несохраненные изменения
   */
  hasUnsavedChanges(): boolean {
    const state = this._state();

    // Проверяем, есть ли измененные фильтры
    const filtersChanged =
      state.brightness !== 0 ||
      state.contrast !== 0 ||
      state.saturation !== 0 ||
      state.hueRotate !== 0 ||
      state.blur !== 0 ||
      state.grayscale !== 0 ||
      state.sepia !== 0 ||
      state.invert !== 0;

    return filtersChanged;
  }

  // ═══════════════════════════════════════════════════════════════
  // Утилитарные методы
  // ═══════════════════════════════════════════════════════════════

  /**
   * Получить полное состояние
   */
  getFullState(): ImageModalState {
    return this._state();
  }

  /**
   * Сбросить состояние к начальным значениям
   */
  private resetState(): void {
    this._state.set({
      isOpen: false,
      activeTab: 'upload',
      isDragOver: false,
      uploading: false,
      errorMessage: '',

      canvasDisplayDimensions: null,
      originalImageDimensions: null,
      imageScale: 1,

      cropConfig: {
        hardSizeEnabled: false,
        targetWidth: 800,
        targetHeight: 600,
        aspectRatioLocked: true,
        customCropWidth: 800,
        customCropHeight: 600,
      },

      brightness: 0,
      contrast: 0,
      saturation: 0,
      hueRotate: 0,
      blur: 0,
      grayscale: 0,
      sepia: 0,
      invert: 0,

      imageUrl: '',
      showImageInfoPopover: false,
    });
  }

  /**
   * Обновить часть состояния
   */
  private updateState(updates: Partial<ImageModalState>): void {
    const currentState = this._state();
    this._state.set({ ...currentState, ...updates });
  }

  /**
   * Получить краткую сводку состояния для отладки
   */
  getStateSummary(): string {
    const state = this._state();
    return `Modal[${state.isOpen ? 'OPEN' : 'CLOSED'}] Tab[${state.activeTab}] Upload[${
      state.uploading
    }] Error[${!!state.errorMessage}]`;
  }
}
