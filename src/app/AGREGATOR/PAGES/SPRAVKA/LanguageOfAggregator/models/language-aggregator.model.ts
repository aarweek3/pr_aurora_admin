/**
 * Модель языка для агрегатора
 * Соответствует бэкенд-модели LanguageOfAggregator.cs
 */
export interface LanguageAggregator {
  /** Уникальный идентификатор */
  id: number;

  /** Полный код локализации (например, "ru-RU", "en-US") */
  code: string;

  /** Краткий код языка (например, "ru", "en") */
  shortCode: string;

  /** Название языка на английском */
  title: string;

  /** Само название языка на этом же языке */
  nativeTitle: string;

  /** Флаг активности */
  enabled: boolean;

  /** Флаг основного языка системы */
  isDefault: boolean;

  /** Флаг письма справа налево (Right-to-Left) */
  isRtl: boolean;

  /** Порядок сортировки */
  sortOrder: number;

  /** Флаг системного языка */
  isSystem: boolean;

  /** Ключ иконки или флага (например, 'flag_ru') */
  iconKey?: string;
}

/**
 * Состояние сервиса языков агрегатора
 */
export interface LanguageAggregatorState {
  all: LanguageAggregator[];
  available: LanguageAggregator[];
  current: LanguageAggregator | null;
  isLoading: boolean;
  error: string | null;
}
