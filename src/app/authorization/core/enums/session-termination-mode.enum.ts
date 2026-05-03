/**
 * Режим завершения сессии
 */
export enum SessionTerminationMode {
  /** Завершение вручную */
  Manual = 1,
  /** При закрытии вкладки */
  OnTabClose = 2,
  /** При закрытии браузера */
  OnBrowserClose = 3,
}
