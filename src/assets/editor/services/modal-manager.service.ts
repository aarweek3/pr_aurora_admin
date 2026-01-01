/**
 * ════════════════════════════════════════════════════════════════════════════
 * MODAL MANAGER SERVICE
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Сервис для централизованного управления модальными окнами редактора.
 *
 * Отвечает за:
 * - Открытие/закрытие модальных окон
 * - Управление состоянием модалок
 * - Передачу данных между компонентами и модальными окнами
 * - Callback'и для обработки результатов
 *
 * @module ModalManagerService
 */

import { Injectable } from '@angular/core';
import {
  ContentInsertionService,
  ImageConfig,
  TableConfig,
  YouTubeSettings,
} from './content-insertion.service';

/**
 * Типы модальных окон
 */
export type ModalType = 'sourceCode' | 'youtube' | 'table' | 'image' | 'linkPreview';

/**
 * Базовая конфигурация модального окна
 */
export interface ModalConfig {
  type: ModalType;
  data?: any;
  onConfirm?: (result: any) => void;
  onCancel?: () => void;
}

/**
 * Состояние модального окна
 */
export interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  data: any;
}

/**
 * Сервис для управления модальными окнами
 */
@Injectable({
  providedIn: 'root',
})
export class ModalManagerService {
  /**
   * Текущее состояние модального окна
   */
  private currentModal: ModalState = {
    isOpen: false,
    type: null,
    data: null,
  };

  /**
   * Ссылки на компоненты модальных окон (устанавливаются из AuroraEditor)
   */
  private modalComponents: { [key in ModalType]?: any } = {};

  constructor(private contentInsertion: ContentInsertionService) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // УПРАВЛЕНИЕ СОСТОЯНИЕМ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Получить текущее состояние модального окна
   */
  getCurrentModal(): ModalState {
    return { ...this.currentModal };
  }

  /**
   * Проверить, открыто ли модальное окно
   */
  isModalOpen(): boolean {
    return this.currentModal.isOpen;
  }

  /**
   * Получить тип текущего модального окна
   */
  getCurrentModalType(): ModalType | null {
    return this.currentModal.type;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // РЕГИСТРАЦИЯ КОМПОНЕНТОВ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Регистрирует компонент модального окна
   */
  registerModalComponent(type: ModalType, component: any): void {
    this.modalComponents[type] = component;
    console.log(`[ModalManager] Registered ${type} modal component`);
  }

  /**
   * Получить компонент модального окна
   */
  getModalComponent(type: ModalType): any {
    return this.modalComponents[type];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ОБЩИЕ МЕТОДЫ УПРАВЛЕНИЯ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Открыть модальное окно
   */
  openModal(config: ModalConfig): void {
    console.log(`[ModalManager] Opening ${config.type} modal`, config);

    this.currentModal = {
      isOpen: true,
      type: config.type,
      data: config.data || {},
    };

    const component = this.modalComponents[config.type];
    if (!component) {
      console.error(`[ModalManager] Modal component ${config.type} not registered`);
      return;
    }

    // Устанавливаем callback'и в компонент
    if (config.onConfirm) {
      component.onConfirm = config.onConfirm;
    }
    if (config.onCancel) {
      component.onCancel = config.onCancel;
    }

    // Открываем модальное окно
    if (component.open) {
      component.open(config.data);
    } else {
      console.error(`[ModalManager] Modal component ${config.type} doesn't have open() method`);
    }
  }

  /**
   * Закрыть текущее модальное окно
   */
  closeModal(): void {
    if (!this.currentModal.isOpen) return;

    console.log(`[ModalManager] Closing ${this.currentModal.type} modal`);

    const component = this.modalComponents[this.currentModal.type!];
    if (component && component.close) {
      component.close();
    }

    this.currentModal = {
      isOpen: false,
      type: null,
      data: null,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // СПЕЦИФИЧНЫЕ МЕТОДЫ ДЛЯ КАЖДОГО ТИПА МОДАЛКИ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Открыть модальное окно Source Code
   */
  openSourceCode(
    currentHtml: string,
    currentScss: string,
    onSave: (html: string, scss: string) => void,
  ): void {
    this.openModal({
      type: 'sourceCode',
      data: { html: currentHtml, scss: currentScss },
      onConfirm: (result) => {
        onSave(result.html, result.scss);
      },
    });
  }

  /**
   * Открыть модальное окно YouTube
   */
  openYouTube(editor: HTMLElement): void {
    // Сохраняем позицию курсора перед открытием модального окна
    this.contentInsertion.saveRangeForYouTube();

    this.openModal({
      type: 'youtube',
      data: {},
      onConfirm: (settings: YouTubeSettings) => {
        this.contentInsertion.insertYouTubeVideo(editor, settings);
      },
    });
  }

  /**
   * Открыть модальное окно Table
   */
  openTable(editor: HTMLElement): void {
    this.openModal({
      type: 'table',
      data: {},
      onConfirm: (config: TableConfig) => {
        this.contentInsertion.insertTable(editor, config);
      },
    });
  }

  /**
   * Открыть модальное окно Image
   */
  openImage(editor: HTMLElement): void {
    this.openModal({
      type: 'image',
      data: {},
      onConfirm: (result: { config: ImageConfig; url: string }) => {
        this.contentInsertion.insertImage(editor, result.config, result.url);
      },
    });
  }

  /**
   * Открыть модальное окно Link Preview
   */
  openLinkPreview(editor: HTMLElement): void {
    this.openModal({
      type: 'linkPreview',
      data: {},
      onConfirm: (result: { url: string; size: string }) => {
        this.contentInsertion.insertLinkPreview(editor, result.url, result.size);
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // УТИЛИТАРНЫЕ МЕТОДЫ
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Проверить, зарегистрирован ли компонент модального окна
   */
  isModalComponentRegistered(type: ModalType): boolean {
    return !!this.modalComponents[type];
  }

  /**
   * Получить список всех зарегистрированных модальных окон
   */
  getRegisteredModals(): ModalType[] {
    return Object.keys(this.modalComponents) as ModalType[];
  }

  /**
   * Очистить все зарегистрированные компоненты (для cleanup)
   */
  clearAllModalComponents(): void {
    this.modalComponents = {};
    this.currentModal = {
      isOpen: false,
      type: null,
      data: null,
    };
    console.log('[ModalManager] All modal components cleared');
  }
}
