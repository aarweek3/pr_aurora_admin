/**
 * Сервис управления стилями blockquote
 *
 * @module BlockquoteStylesService
 * @description
 * Основной сервис для работы с пользовательскими стилями цитат.
 * Реализует "Offline-first" стратегию:
 * - Все операции сначала выполняются в IndexedDB (мгновенно)
 * - Затем синхронизируются с сервером в фоне (если онлайн)
 *
 * @architecture
 * - IndexedDB (Dexie.js) - локальное хранилище
 * - Backend API - облачная синхронизация (опционально)
 * - RxJS BehaviorSubject - реактивный стрим изменений
 */

import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { BLOCKQUOTE_PRESETS } from '../config/quote-presets';
import {
  BlockquoteStyle,
  BlockquoteStyleRecord,
  ExportedStylesData,
  ImportResult,
  ValidationResult,
} from '../types/blockquote-styles.types';
import { db, getDBStats, initDB } from './aurora-db.service';

// ═══════════════════════════════════════════════════════
// СЕРВИС
// ═══════════════════════════════════════════════════════

@Injectable({ providedIn: 'root' })
export class BlockquoteStylesService {
  // ───────────────────────────────────────────────────
  // КОНСТАНТЫ
  // ───────────────────────────────────────────────────

  /** Максимальное количество пользовательских стилей */
  private readonly MAX_CUSTOM_STYLES = 100;

  /** Ключ для хранения времени последней синхронизации */
  private readonly LAST_SYNC_KEY = 'aurora-blockquote-last-sync';

  // ───────────────────────────────────────────────────
  // СОСТОЯНИЕ
  // ───────────────────────────────────────────────────

  /** Реактивный стрим всех стилей (пресеты + пользовательские) */
  private allStyles$ = new BehaviorSubject<BlockquoteStyle[]>([]);

  /** Время последней синхронизации с сервером */
  private lastSyncAt?: string;

  /** Флаг: выполняется ли синхронизация */
  private syncInProgress = false;

  /** Флаг: инициализирован ли сервис */
  private initialized = false;

  // ───────────────────────────────────────────────────
  // CONSTRUCTOR
  // ───────────────────────────────────────────────────

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.init();
  }

  // ═══════════════════════════════════════════════════════
  // ИНИЦИАЛИЗАЦИЯ
  // ═══════════════════════════════════════════════════════

  /**
   * Инициализация сервиса
   * @private
   */
  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // 1. Инициализируем IndexedDB
      await initDB();

      // 2. Загружаем стили из IndexedDB
      await this.loadStyles();

      // 3. Загружаем время последней синхронизации
      if (isPlatformBrowser(this.platformId)) {
        this.lastSyncAt = localStorage.getItem(this.LAST_SYNC_KEY) || undefined;
      }

      // 4. Подписываемся на события сети (если браузер)
      if (isPlatformBrowser(this.platformId)) {
        window.addEventListener('online', () => this.onNetworkStatusChange());

        // Если онлайн - запускаем синхронизацию
        if (navigator.onLine) {
          this.syncWithServerSilent();
        }
      }

      this.initialized = true;
      console.log('✅ BlockquoteStylesService инициализирован');
    } catch (error) {
      console.error('❌ Ошибка инициализации BlockquoteStylesService:', error);
    }
  }

  /**
   * Обработчик изменения статуса сети
   * @private
   */
  private onNetworkStatusChange(): void {
    if (navigator.onLine) {
      console.log('🌐 Подключение к сети восстановлено. Запуск синхронизации...');
      this.syncWithServerSilent();
    }
  }

  // ═══════════════════════════════════════════════════════
  // ПОЛУЧЕНИЕ СТИЛЕЙ
  // ═══════════════════════════════════════════════════════

  /**
   * Получить все стили (предустановленные + пользовательские)
   * @returns Observable<BlockquoteStyle[]>
   */
  getAllStyles(): Observable<BlockquoteStyle[]> {
    return this.allStyles$.asObservable();
  }

  /**
   * Получить стиль по ID
   * @param id - ID стиля
   * @returns Promise<BlockquoteStyle | undefined>
   */
  async getStyleById(id: string): Promise<BlockquoteStyle | undefined> {
    // Сначала проверяем пресеты
    const preset = BLOCKQUOTE_PRESETS.find((s) => s.id === id);
    if (preset) return preset;

    // Ищем в IndexedDB
    const record = await db.blockquoteStyles.get(id);
    return record ? this.recordToStyle(record) : undefined;
  }

  /**
   * Получить только предустановленные стили
   * @returns BlockquoteStyle[]
   */
  getPresets(): BlockquoteStyle[] {
    return BLOCKQUOTE_PRESETS;
  }

  /**
   * Получить только пользовательские стили
   * @returns Promise<BlockquoteStyle[]>
   */
  async getCustomStyles(): Promise<BlockquoteStyle[]> {
    // Используем filter() для boolean полей
    const records = await db.blockquoteStyles
      .filter((style: BlockquoteStyleRecord) => style.deleted !== true)
      .toArray();

    return records.map((r: BlockquoteStyleRecord) => this.recordToStyle(r));
  }

  // ═══════════════════════════════════════════════════════
  // CRUD ОПЕРАЦИИ
  // ═══════════════════════════════════════════════════════

  /**
   * Создать новый пользовательский стиль
   * @param style - Данные стиля
   * @returns Promise<BlockquoteStyle>
   */
  async createCustomStyle(style: BlockquoteStyle): Promise<BlockquoteStyle> {
    // 1. Проверка лимита
    const count = await db.blockquoteStyles
      .filter((s: BlockquoteStyleRecord) => s.deleted !== true)
      .count();

    if (count >= this.MAX_CUSTOM_STYLES) {
      throw new Error(`Максимум ${this.MAX_CUSTOM_STYLES} пользовательских стилей`);
    }

    // 2. Валидация
    const validation = this.validateStyle(style);
    if (!validation.valid) {
      throw new Error(`Ошибка валидации: ${validation.error}`);
    }

    // 3. Создаём запись с метаданными
    const now = new Date();
    const record: BlockquoteStyleRecord = {
      ...style,
      id: this.generateId(),
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    // 4. Сохраняем в IndexedDB (мгновенно)
    await db.blockquoteStyles.add(record);

    // 5. Обновляем стрим
    await this.loadStyles();

    // 6. Фоновая синхронизация с сервером (если онлайн)
    // TODO: Реализовать когда будет Backend API
    // if (navigator.onLine) {
    //   this.apiService.create(this.recordToStyle(record)).subscribe(...);
    // }

    console.log(`✅ Стиль "${record.name}" создан`);
    return this.recordToStyle(record);
  }

  /**
   * Обновить существующий пользовательский стиль
   * @param id - ID стиля
   * @param updates - Обновления
   * @returns Promise<boolean>
   */
  async updateCustomStyle(id: string, updates: Partial<BlockquoteStyle>): Promise<boolean> {
    // 1. Проверяем существование
    const existing = await db.blockquoteStyles.get(id);
    if (!existing) {
      console.warn(`Стиль ${id} не найден`);
      return false;
    }

    // 2. Валидация (если есть изменения в структуре)
    if (updates.quote || updates.footer) {
      const merged = { ...existing, ...updates };
      const validation = this.validateStyle(merged);
      if (!validation.valid) {
        throw new Error(`Ошибка валидации: ${validation.error}`);
      }
    }

    // 3. Обновляем в IndexedDB
    await db.blockquoteStyles.update(id, {
      ...updates,
      id, // Сохраняем ID
      isCustom: true, // Сохраняем флаг
      updatedAt: new Date(),
    });

    // 4. Обновляем стрим
    await this.loadStyles();

    // 5. Фоновая синхронизация
    // TODO: Реализовать когда будет Backend API

    console.log(`✅ Стиль "${updates.name || id}" обновлён`);
    return true;
  }

  /**
   * Удалить пользовательский стиль (мягкое удаление)
   * @param id - ID стиля
   * @returns Promise<boolean>
   */
  async deleteCustomStyle(id: string): Promise<boolean> {
    const existing = await db.blockquoteStyles.get(id);
    if (!existing) {
      console.warn(`Стиль ${id} не найден`);
      return false;
    }

    // Мягкое удаление (для синхронизации с сервером)
    await db.blockquoteStyles.update(id, {
      deleted: true,
      updatedAt: new Date(),
    });

    // Обновляем стрим
    await this.loadStyles();

    // Фоновая синхронизация
    // TODO: Реализовать когда будет Backend API

    console.log(`✅ Стиль "${existing.name}" удалён`);
    return true;
  }

  /**
   * Физическое удаление стиля (окончательное)
   * @param id - ID стиля
   * @returns Promise<boolean>
   */
  async hardDeleteCustomStyle(id: string): Promise<boolean> {
    await db.blockquoteStyles.delete(id);
    await this.loadStyles();

    console.log(`🗑️ Стиль ${id} удалён физически`);
    return true;
  }

  /**
   * Дублировать стиль (создать копию)
   * @param id - ID исходного стиля
   * @param newName - Название копии
   * @returns Promise<BlockquoteStyle | null>
   */
  async duplicateStyle(id: string, newName: string): Promise<BlockquoteStyle | null> {
    const original = await this.getStyleById(id);
    if (!original) {
      console.warn(`Стиль ${id} не найден`);
      return null;
    }

    return this.createCustomStyle({
      ...original,
      name: newName,
      id: '', // Будет сгенерирован в createCustomStyle
      isCustom: true,
    });
  }

  // ═══════════════════════════════════════════════════════
  // ЭКСПОРТ/ИМПОРТ
  // ═══════════════════════════════════════════════════════

  /**
   * Экспортировать все пользовательские стили в JSON
   * @returns Promise<string>
   */
  async exportStyles(): Promise<string> {
    const records = await db.blockquoteStyles
      .filter((s: BlockquoteStyleRecord) => s.deleted !== true)
      .toArray();

    const exportData: ExportedStylesData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      count: records.length,
      styles: records.map((r: BlockquoteStyleRecord) => this.recordToStyle(r)),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Скачать стили как JSON файл
   * @returns Promise<void>
   */
  async downloadStylesAsFile(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('downloadStylesAsFile доступен только в браузере');
      return;
    }

    const json = await this.exportStyles();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora-quote-styles-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Стили экспортированы в файл');
  }

  /**
   * Импортировать стили из JSON
   * @param json - JSON строка
   * @returns Promise<ImportResult>
   */
  async importStyles(json: string): Promise<ImportResult> {
    try {
      const data = JSON.parse(json);

      // Поддержка двух форматов
      let styles: any[];

      if (Array.isArray(data)) {
        // Старый формат - просто массив
        styles = data;
      } else if (data.styles && Array.isArray(data.styles)) {
        // Новый формат - объект с метаданными
        styles = data.styles;

        // Проверка версии
        if (data.version && data.version !== '1.0') {
          return {
            success: false,
            count: 0,
            errors: [`Неподдерживаемая версия формата: ${data.version}`],
          };
        }
      } else {
        return {
          success: false,
          count: 0,
          errors: ['Неверный формат файла'],
        };
      }

      const errors: string[] = [];
      let count = 0;

      for (const style of styles) {
        // Валидация
        const validation = this.validateStyle(style);
        if (!validation.valid) {
          errors.push(`Стиль "${style.name || 'Неизвестный'}": ${validation.error}`);
          continue;
        }

        try {
          // Создаём новый ID чтобы избежать конфликтов
          const now = new Date();
          const record: BlockquoteStyleRecord = {
            ...style,
            id: this.generateId(),
            isCustom: true,
            createdAt: now,
            updatedAt: now,
          };

          await db.blockquoteStyles.add(record);
          count++;
        } catch (error) {
          errors.push(`Не удалось импортировать "${style.name}"`);
        }
      }

      await this.loadStyles();

      console.log(`✅ Импортировано стилей: ${count}`);
      if (errors.length > 0) {
        console.warn('⚠️ Ошибки импорта:', errors);
      }

      return { success: true, count, errors };
    } catch (error) {
      return {
        success: false,
        count: 0,
        errors: ['Ошибка парсинга JSON: ' + (error as Error).message],
      };
    }
  }

  /**
   * Загрузить стили из файла
   * @param file - File объект
   * @returns Promise<ImportResult>
   */
  async importStylesFromFile(file: File): Promise<ImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const json = e.target?.result as string;
        const result = await this.importStyles(json);
        resolve(result);
      };

      reader.onerror = () => {
        resolve({
          success: false,
          count: 0,
          errors: ['Ошибка чтения файла'],
        });
      };

      reader.readAsText(file);
    });
  }

  // ═══════════════════════════════════════════════════════
  // СИНХРОНИЗАЦИЯ (заглушки для будущей реализации)
  // ═══════════════════════════════════════════════════════

  /**
   * Синхронизация с сервером (тихая, без ошибок)
   * @private
   */
  private async syncWithServerSilent(): Promise<void> {
    try {
      await this.syncWithServer();
    } catch (error) {
      console.warn('⚠️ Синхронизация не удалась:', error);
    }
  }

  /**
   * Синхронизация с сервером
   * @returns Promise<void>
   *
   * TODO: Реализовать когда будет Backend API
   * Алгоритм:
   * 1. Получить все локальные стили
   * 2. Отправить на сервер POST /api/blockquote-styles/sync
   * 3. Получить актуальный список с сервера
   * 4. Мерджить с локальными (по времени updatedAt)
   * 5. Обновить syncedAt для всех синхронизированных
   */
  private async syncWithServer(): Promise<void> {
    if (this.syncInProgress) {
      console.log('⏳ Синхронизация уже выполняется...');
      return;
    }

    this.syncInProgress = true;

    try {
      console.log('🔄 Начало синхронизации с сервером...');

      // TODO: Реализовать когда будет Backend API
      // const localRecords = await db.blockquoteStyles.toArray();
      // const localStyles = localRecords.map(r => this.recordToStyle(r));
      //
      // const result = await this.apiService.sync(localStyles, this.lastSyncAt).toPromise();
      //
      // if (result && result.success) {
      //   await this.mergeServerStyles(result.styles);
      //   this.lastSyncAt = result.syncedAt;
      //   localStorage.setItem(this.LAST_SYNC_KEY, this.lastSyncAt);
      //   console.log(`✅ Синхронизация завершена. Стилей: ${result.styles.length}`);
      // }

      // Заглушка
      console.log('ℹ️ Backend API не настроен. Синхронизация пропущена.');
    } catch (error) {
      console.error('❌ Ошибка синхронизации:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Мердж серверных стилей с локальными
   * @param serverStyles - Стили с сервера
   * @private
   *
   * TODO: Реализовать когда будет Backend API
   */
  private async mergeServerStyles(serverStyles: BlockquoteStyle[]): Promise<void> {
    // Логика мерджа по времени updatedAt
    // Если серверная версия новее - обновляем локальную
    // Если локальная новее - отправляем на сервер
  }

  // ═══════════════════════════════════════════════════════
  // ПРИВАТНЫЕ МЕТОДЫ
  // ═══════════════════════════════════════════════════════

  /**
   * Загрузить все стили из IndexedDB
   * @private
   */
  private async loadStyles(): Promise<void> {
    const records = await db.blockquoteStyles
      .filter((s: BlockquoteStyleRecord) => s.deleted !== true)
      .toArray();

    const customStyles = records.map((r: BlockquoteStyleRecord) => this.recordToStyle(r));
    const allStyles = [...BLOCKQUOTE_PRESETS, ...customStyles];

    this.allStyles$.next(allStyles);
  }

  /**
   * Конвертировать запись БД в стиль
   * @private
   */
  private recordToStyle(record: BlockquoteStyleRecord): BlockquoteStyle {
    const { createdAt, updatedAt, syncedAt, deleted, ...style } = record;
    return style;
  }

  /**
   * Генерировать уникальный ID
   * @private
   */
  private generateId(): string {
    return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Валидация структуры стиля
   * @private
   */
  private validateStyle(style: any): ValidationResult {
    if (!style || typeof style !== 'object') {
      return { valid: false, error: 'Стиль должен быть объектом' };
    }

    if (!style.name || typeof style.name !== 'string') {
      return { valid: false, error: 'Отсутствует название стиля (name)' };
    }

    if (!style.quote || typeof style.quote !== 'object') {
      return { valid: false, error: 'Отсутствует секция "quote"' };
    }

    if (!style.footer || typeof style.footer !== 'object') {
      return { valid: false, error: 'Отсутствует секция "footer"' };
    }

    // Валидация обязательных полей в quote
    const requiredQuoteFields = ['backgroundColor', 'borderColor', 'padding', 'fontSize', 'color'];
    for (const field of requiredQuoteFields) {
      if (!(field in style.quote)) {
        return { valid: false, error: `Отсутствует поле quote.${field}` };
      }
    }

    // Валидация обязательных полей в footer
    const requiredFooterFields = ['fontSize', 'color', 'textAlign'];
    for (const field of requiredFooterFields) {
      if (!(field in style.footer)) {
        return { valid: false, error: `Отсутствует поле footer.${field}` };
      }
    }

    return { valid: true };
  }

  // ═══════════════════════════════════════════════════════
  // ПУБЛИЧНЫЕ УТИЛИТЫ
  // ═══════════════════════════════════════════════════════

  /**
   * Получить статистику
   * @returns Promise<object>
   */
  async getStats(): Promise<{
    totalStyles: number;
    customStyles: number;
    presetStyles: number;
    deletedStyles: number;
    unsyncedStyles: number;
  }> {
    const dbStats = await getDBStats();

    return {
      totalStyles: BLOCKQUOTE_PRESETS.length + dbStats.customStyles,
      customStyles: dbStats.customStyles,
      presetStyles: BLOCKQUOTE_PRESETS.length,
      deletedStyles: dbStats.deletedStyles,
      unsyncedStyles: dbStats.unsyncedStyles,
    };
  }

  /**
   * Очистить все пользовательские стили
   * @returns Promise<void>
   */
  async clearAllCustomStyles(): Promise<void> {
    await db.blockquoteStyles.clear();
    await this.loadStyles();
    console.log('🗑️ Все пользовательские стили удалены');
  }
}
