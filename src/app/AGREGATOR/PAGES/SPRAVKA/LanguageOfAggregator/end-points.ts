/**
 * Эндпоинты для управления языками агрегатора
 */
export const LANGUAGE_AGGREGATOR_ENDPOINTS = {
  /** Базовый путь */
  BASE: 'v1/aggregator/languages',

  /** Получить все языки */
  GET_ALL: 'v1/aggregator/languages',

  /** Получить только активные */
  GET_AVAILABLE: 'v1/aggregator/languages/available',

  /** Получить по ID */
  GET_BY_ID: (id: number) => `v1/aggregator/languages/${id}`,

  /** Создать */
  CREATE: 'v1/aggregator/languages',

  /** Обновить */
  UPDATE: (id: number) => `v1/aggregator/languages/${id}`,

  /** Удалить */
  DELETE: (id: number) => `v1/aggregator/languages/${id}`,

  /** Статус */
  TOGGLE_STATUS: (id: number) => `v1/aggregator/languages/${id}/status`,

  /** По умолчанию */
  SET_DEFAULT: (id: number) => `v1/aggregator/languages/${id}/default`,

  /** Hard Reset */
  HARD_RESET: 'v1/aggregator/languages/hard-reset',

  /** Initialize */
  INITIALIZE: 'v1/aggregator/languages/initialize',
};
