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
    export: {
      format: 'image/jpeg',
      quality: 90,
      fileName: 'image_edited',
    },
    crop: {
      enabled: false,
      aspectRatio: null,
      width: null,
      height: null,
      x: 0,
      y: 0,
    },
    metadata: {
      originalWidth: 0,
      originalHeight: 0,
      fileSize: 0,
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
   * Сброс зума
   */
  resetZoom(): void {
    this.updateState({ zoom: 1 });
  }
}
