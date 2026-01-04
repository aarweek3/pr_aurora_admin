/**
 * Эндпоинты для управления языками приложения (Backend API v1)
 */
export const LANGUAGE_APP_ENDPOINTS = {
  /** Базовый путь */
  BASE: 'languages-app',

  /** Получить все языки (включая отключенные) */
  GET_ALL: 'languages-app',

  /** Получить только активные языки */
  GET_AVAILABLE: 'languages-app/available',

  /** Получить язык по ID */
  GET_BY_ID: (id: number) => `languages-app/${id}`,

  /** Создать новый язык */
  CREATE: 'languages-app',

  /** Обновить существующий язык */
  UPDATE: (id: number) => `languages-app/${id}`,

  /** Удалить язык */
  DELETE: (id: number) => `languages-app/${id}`,

  /** Установить язык по умолчанию */
  SET_DEFAULT: (id: number) => `languages-app/${id}/default`,

  /** Переключить статус (enabled/disabled) */
  TOGGLE_STATUS: (id: number) => `languages-app/${id}/status`,
};
