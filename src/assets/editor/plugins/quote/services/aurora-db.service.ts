/**
 * Сервис для работы с IndexedDB через Dexie.js
 *
 * @module AuroraDB
 * @description База данных для хранения пользовательских стилей blockquote
 * @architecture Offline-first: все операции сначала сохраняются локально
 */

import Dexie, { Table } from 'dexie';
import { BlockquoteStyleRecord } from '../types/blockquote-styles.types';

// ═══════════════════════════════════════════════════════
// ОПРЕДЕЛЕНИЕ БАЗЫ ДАННЫХ
// ═══════════════════════════════════════════════════════

/**
 * Класс базы данных Aurora Editor
 *
 * @extends Dexie
 * @description Определяет схему IndexedDB для хранения стилей
 */
export class AuroraDB extends Dexie {
  /**
   * Таблица для хранения пользовательских стилей blockquote
   *
   * @type {Table<BlockquoteStyleRecord, string>}
   * @description
   * - Первый generic: тип записи (BlockquoteStyleRecord)
   * - Второй generic: тип первичного ключа (string - id)
   */
  blockquoteStyles!: Table<BlockquoteStyleRecord, string>;

  constructor() {
    super('AuroraEditorDB');

    // ───────────────────────────────────────────────────
    // ВЕРСИЯ 1: Базовая схема
    // ───────────────────────────────────────────────────
    this.version(1).stores({
      /**
       * Таблица blockquoteStyles
       *
       * Схема индексов:
       * - id: первичный ключ (автоматически)
       * - name: для поиска по названию
       * - isCustom: для фильтрации (только пользовательские)
       * - createdAt: для сортировки по дате создания
       * - updatedAt: для сортировки по дате обновления
       * - syncedAt: для определения несинхронизированных записей
       * - deleted: для фильтрации удалённых (мягкое удаление)
       *
       * Синтаксис Dexie:
       * - Первое поле (id) - всегда первичный ключ
       * - Остальные поля - индексы для быстрого поиска
       * - & в начале - составной индекс
       * - * в начале - multi-entry индекс
       * - [] в конце - compound index
       */
      blockquoteStyles: 'id, name, isCustom, createdAt, updatedAt, syncedAt, deleted',
    });

    // ───────────────────────────────────────────────────
    // БУДУЩИЕ ВЕРСИИ (примеры миграций)
    // ───────────────────────────────────────────────────

    /*
    // Версия 2: Добавление категорий
    this.version(2).stores({
      blockquoteStyles: 'id, name, isCustom, category, createdAt, updatedAt, syncedAt, deleted'
    }).upgrade(tx => {
      // Миграция данных при обновлении схемы
      return tx.table('blockquoteStyles').toCollection().modify(style => {
        style.category = 'default';
      });
    });
    */

    /*
    // Версия 3: Добавление таблицы тегов
    this.version(3).stores({
      blockquoteStyles: 'id, name, isCustom, category, createdAt, updatedAt, syncedAt, deleted',
      tags: '++id, name, &styleId' // Связь многие-ко-многим
    });
    */
  }
}

// ═══════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════

/**
 * Глобальный экземпляр базы данных
 *
 * @constant
 * @type {AuroraDB}
 * @description Используйте этот экземпляр во всех сервисах
 *
 * @example
 * ```typescript
 * import { db } from './aurora-db.service';
 *
 * // Получить все стили
 * const styles = await db.blockquoteStyles.toArray();
 *
 * // Добавить новый стиль
 * await db.blockquoteStyles.add(newStyle);
 *
 * // Обновить стиль
 * await db.blockquoteStyles.update(id, { name: 'Новое имя' });
 *
 * // Удалить стиль
 * await db.blockquoteStyles.delete(id);
 * ```
 */
export const db = new AuroraDB();

// ═══════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ═══════════════════════════════════════════════════════

/**
 * Инициализация базы данных
 *
 * @returns {Promise<void>}
 * @description
 * Вызывается автоматически при первом обращении к БД.
 * Можно использовать для предзагрузки данных или проверки версии.
 *
 * @example
 * ```typescript
 * await initDB();
 * console.log('База данных готова к работе');
 * ```
 */
export async function initDB(): Promise<void> {
  try {
    // Проверяем доступность IndexedDB
    if (!('indexedDB' in window)) {
      throw new Error('IndexedDB не поддерживается в этом браузере');
    }

    // Открываем БД (Dexie автоматически создаст её при первом обращении)
    await db.open();

    console.log(`✅ AuroraDB инициализирована. Версия: ${db.verno}`);
  } catch (error) {
    console.error('❌ Ошибка инициализации AuroraDB:', error);
    throw error;
  }
}

/**
 * Очистка всей базы данных (для разработки/тестирования)
 *
 * @returns {Promise<void>}
 * @warning Удаляет ВСЕ данные! Использовать только в dev режиме.
 *
 * @example
 * ```typescript
 * if (environment.development) {
 *   await clearDB();
 * }
 * ```
 */
export async function clearDB(): Promise<void> {
  try {
    await db.blockquoteStyles.clear();
    console.log('🗑️ База данных очищена');
  } catch (error) {
    console.error('❌ Ошибка очистки БД:', error);
    throw error;
  }
}

/**
 * Удаление всей базы данных (полное удаление)
 *
 * @returns {Promise<void>}
 * @warning Удаляет саму БД! Использовать только для полного сброса.
 *
 * @example
 * ```typescript
 * await deleteDB();
 * location.reload(); // Перезагрузка страницы для пересоздания БД
 * ```
 */
export async function deleteDB(): Promise<void> {
  try {
    await db.delete();
    console.log('🗑️ База данных полностью удалена');
  } catch (error) {
    console.error('❌ Ошибка удаления БД:', error);
    throw error;
  }
}

/**
 * Получить информацию о базе данных
 *
 * @returns {Promise<{name: string, version: number, tables: string[]}>}
 * @description Возвращает метаданные БД
 *
 * @example
 * ```typescript
 * const info = await getDBInfo();
 * console.log(`БД: ${info.name}, версия ${info.version}`);
 * console.log(`Таблицы: ${info.tables.join(', ')}`);
 * ```
 */
export async function getDBInfo(): Promise<{
  name: string;
  version: number;
  tables: string[];
}> {
  await db.open();

  return {
    name: db.name,
    version: db.verno,
    tables: db.tables.map((table: { name: string }) => table.name),
  };
}

/**
 * Экспорт всей базы данных в JSON (для резервного копирования)
 *
 * @returns {Promise<string>}
 * @description Экспортирует все таблицы в JSON формат
 *
 * @example
 * ```typescript
 * const backup = await exportDB();
 * localStorage.setItem('db-backup', backup);
 * ```
 */
export async function exportDB(): Promise<string> {
  const data = {
    version: db.verno,
    exportedAt: new Date().toISOString(),
    tables: {
      blockquoteStyles: await db.blockquoteStyles.toArray(),
    },
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Импорт базы данных из JSON (восстановление из резервной копии)
 *
 * @param {string} json - JSON строка с данными БД
 * @returns {Promise<void>}
 *
 * @example
 * ```typescript
 * const backup = localStorage.getItem('db-backup');
 * if (backup) {
 *   await importDB(backup);
 * }
 * ```
 */
export async function importDB(json: string): Promise<void> {
  try {
    const data = JSON.parse(json);

    // Очищаем текущие данные
    await db.blockquoteStyles.clear();

    // Импортируем данные
    if (data.tables?.blockquoteStyles) {
      await db.blockquoteStyles.bulkAdd(data.tables.blockquoteStyles);
    }

    console.log('✅ База данных импортирована');
  } catch (error) {
    console.error('❌ Ошибка импорта БД:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════
// СТАТИСТИКА И ОТЛАДКА
// ═══════════════════════════════════════════════════════

/**
 * Получить статистику по базе данных
 *
 * @returns {Promise<{totalStyles: number, customStyles: number, deletedStyles: number}>}
 * @description Возвращает количество записей в БД
 *
 * @example
 * ```typescript
 * const stats = await getDBStats();
 * console.log(`Всего стилей: ${stats.totalStyles}`);
 * console.log(`Пользовательских: ${stats.customStyles}`);
 * console.log(`Удалённых: ${stats.deletedStyles}`);
 * ```
 */
export async function getDBStats(): Promise<{
  totalStyles: number;
  customStyles: number;
  deletedStyles: number;
  unsyncedStyles: number;
}> {
  const totalStyles = await db.blockquoteStyles.count();

  // Для boolean полей используем filter() вместо where().equals()
  const customStyles = await db.blockquoteStyles
    .filter((style: BlockquoteStyleRecord) => style.isCustom === true)
    .count();
  const deletedStyles = await db.blockquoteStyles
    .filter((style: BlockquoteStyleRecord) => style.deleted === true)
    .count();
  const unsyncedStyles = await db.blockquoteStyles
    .filter(
      (style: BlockquoteStyleRecord) => style.syncedAt === undefined || style.syncedAt === null,
    )
    .count();

  return {
    totalStyles,
    customStyles,
    deletedStyles,
    unsyncedStyles,
  };
}

/**
 * Логирование запроса в консоль (для отладки)
 *
 * @param {string} operation - Название операции
 * @param {any} data - Данные операции
 *
 * @example
 * ```typescript
 * logDBOperation('CREATE', newStyle);
 * ```
 */
export function logDBOperation(operation: string, data?: any): void {
  if (typeof window !== 'undefined' && (window as any).__DEV__) {
    console.log(`[AuroraDB] ${operation}`, data);
  }
}
