import { Injectable, signal } from '@angular/core';
import { ImageEditorState } from '../models/editor-state.model';

@Injectable()
export class ImageEditorStateService {
  /**
   * Центральное состояние (Signals)
   */
  readonly state = signal<ImageEditorState>({
    activeTool: 'open',
    originalUrl: null,
    zoom: 1,
    transparency: 100,
    rotation: 0,
    systemMessage: null,
    isPreviewMode: false,
    processedUrl: null,
    export: {
      format: 'image/jpeg',
      quality: 90,
      fileName: 'image_edited',
    },
    crop: {
      enabled: false,
      shape: 'rectangle',
      aspectRatio: null,
      width: null,
      height: null,
      x: 0,
      y: 0,
      lock: true,
      resizePanelEnabled: false,
      resizeWidth: 0,
      resizeHeight: 0,
      resizeLocked: true,
    },
    metadata: {
      initialWidth: 0,
      initialHeight: 0,
      originalWidth: 0,
      originalHeight: 0,
      originalSize: 0,
      processedWidth: 0,
      processedHeight: 0,
      estimatedSize: 0,
    },
  });

  /**
   * Обновить часть состояния
   */
  updateState(patch: Partial<ImageEditorState>): void {
    this.state.update((s) => ({ ...s, ...patch }));
  }

  /**
   * Обновить настройки экспорта
   */
  updateExport(patch: Partial<ImageEditorState['export']>): void {
    this.state.update((s) => ({
      ...s,
      export: { ...s.export, ...patch },
    }));
  }

  /**
   * Обновить настройки кропа
   */
  updateCrop(patch: Partial<ImageEditorState['crop']>): void {
    this.state.update((s) => ({
      ...s,
      crop: { ...s.crop, ...patch },
    }));
  }

  /**
   * Сброс зума
   */
  resetZoom(): void {
    this.updateState({ zoom: 1 });
  }
}
