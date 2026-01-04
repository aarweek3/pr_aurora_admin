/**
 * Тип для кода языка (BCP-47 format)
 */
export type LanguageCode = string;

/**
 * Модель языка интерфейса приложения (финальная версия)
 */
export interface AppLanguage {
  /**
   * Уникальный идентификатор языка в БД
   */
  id: number;

  /**
   * Код языка по стандарту BCP-47
   * Примеры: 'ru-RU', 'en-US', 'de-DE'
   */
  code: LanguageCode;

  /**
   * Краткий код языка для UI/отображения
   * Примеры: 'RU', 'EN', 'DE'
   * Используется: флаги, компактный режим, иконки
   */
  shortCode: string;

  /**
   * Название на английском (для админки/логов)
   */
  title: string;

  /**
   * Название на родном языке (для UI)
   */
  nativeTitle: string;

  /**
   * Доступность языка для выбора
   */
  enabled: boolean;

  /**
   * Направление письма
   */
  direction: 'ltr' | 'rtl';

  /**
   * Порядок в UI (меньше = выше)
   */
  sortOrder: number;

  /**
   * Язык по умолчанию
   * ВАЖНО: isDefault = true только у enabled языка
   */
  isDefault: boolean;

  /**
   * Системный язык (нельзя удалить/отключить)
   * Обычно true для ru-RU и en-US
   */
  isSystem?: boolean;

  /**
   * Ключ иконки/флага
   */
  iconKey?: string;
}

/**
 * Состояние системы языков
 */
export interface LanguageState {
  /**
   * Текущий активный язык
   * null при инициализации до загрузки
   */
  current: AppLanguage | null;

  /**
   * Доступные языки (только enabled = true)
   */
  available: AppLanguage[];

  /**
   * Все языки включая отключенные (для админки)
   */
  all?: AppLanguage[];

  /**
   * Идет ли загрузка
   */
  isLoading: boolean;

  /**
   * Статус синхронизации с сервером
   * - idle: ничего не происходит
   * - syncing: идет синхронизация
   * - synced: синхронизировано
   * - error: ошибка синхронизации
   */
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';

  /**
   * Последняя ошибка синхронизации
   */
  lastSyncError?: string;
}
