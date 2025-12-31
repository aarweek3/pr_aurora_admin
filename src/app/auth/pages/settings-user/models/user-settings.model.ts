import {
  AccessibilityLevel,
  DefaultPageSizeOption,
  LoginNotificationMode,
  NavigationBehavior,
  NotificationChannel,
  NotificationLevel,
  SessionTerminationMode,
  SidebarState,
  TableDensity,
  UiDensity,
  UiTheme,
} from '../enums';

/**
 * Интерфейс настроек пользователя
 * Соответствует DTO на backend (UserSettingsDetailDto)
 */
export interface UserSettings {
  // ==========================================
  // 1. ВНЕШНИЙ ВИД (UI / UX)
  // ==========================================

  /** Тема оформления интерфейса */
  theme: UiTheme;

  /** Плотность элементов интерфейса */
  density: UiDensity;

  /** Основной цвет (HEX формат, например #1890ff) */
  primaryColor: string | null;

  // ==========================================
  // 2. НАВИГАЦИЯ И LAYOUT
  // ==========================================

  /** Состояние бокового меню */
  sidebarState: SidebarState;

  /** Поведение навигации при входе */
  navigationBehavior: NavigationBehavior;

  // ==========================================
  // 3. СПИСКИ И ТАБЛИЦЫ
  // ==========================================

  /** Плотность отображения таблиц */
  tableDensity: TableDensity;

  /** Количество записей на странице по умолчанию */
  defaultPageSize: DefaultPageSizeOption;

  /** Показывать расширенные фильтры */
  showAdvancedFilters: boolean;

  // ==========================================
  // 4. ЛОКАЛИЗАЦИЯ
  // ==========================================

  /** Язык интерфейса (например, ru-RU, en-US) */
  language: string;

  /** Часовой пояс (например, UTC, Europe/Moscow) */
  timeZone: string;

  // ==========================================
  // 5. ДОСТУПНОСТЬ
  // ==========================================

  /** Уровень доступности интерфейса */
  accessibilityLevel: AccessibilityLevel;

  // ==========================================
  // 6. УВЕДОМЛЕНИЯ
  // ==========================================

  /** Уровень важности уведомлений */
  notificationLevel: NotificationLevel;

  /** Каналы доставки уведомлений (Flags) */
  notificationChannels: NotificationChannel;

  // ==========================================
  // 7. БЕЗОПАСНОСТЬ И ПОВЕДЕНИЕ
  // ==========================================

  /** Режим завершения сессии */
  sessionTerminationMode: SessionTerminationMode;

  /** Режим уведомлений о входе */
  loginNotificationMode: LoginNotificationMode;
}

/**
 * DTO для обновления настроек пользователя
 * Соответствует UserSettingsUpdateDto на backend
 */
export interface UserSettingsUpdateDto {
  theme: UiTheme;
  density: UiDensity;
  primaryColor?: string | null;
  sidebarState: SidebarState;
  navigationBehavior: NavigationBehavior;
  tableDensity: TableDensity;
  defaultPageSize: DefaultPageSizeOption;
  showAdvancedFilters: boolean;
  language: string;
  timeZone: string;
  accessibilityLevel: AccessibilityLevel;
  notificationLevel: NotificationLevel;
  notificationChannels: NotificationChannel;
  sessionTerminationMode: SessionTerminationMode;
  loginNotificationMode: LoginNotificationMode;
}

/**
 * Дефолтные значения настроек
 * Соответствуют значениям по умолчанию в backend модели
 */
export const DEFAULT_USER_SETTINGS: UserSettings = {
  // 1. ВНЕШНИЙ ВИД
  theme: UiTheme.System,
  density: UiDensity.Comfortable,
  primaryColor: null,

  // 2. НАВИГАЦИЯ
  sidebarState: SidebarState.Expanded,
  navigationBehavior: NavigationBehavior.RememberLastPage,

  // 3. ТАБЛИЦЫ
  tableDensity: TableDensity.Normal,
  defaultPageSize: DefaultPageSizeOption.Size10,
  showAdvancedFilters: false,

  // 4. ЛОКАЛИЗАЦИЯ
  language: 'ru-RU',
  timeZone: 'UTC',

  // 5. ДОСТУПНОСТЬ
  accessibilityLevel: AccessibilityLevel.Standard,

  // 6. УВЕДОМЛЕНИЯ
  notificationLevel: NotificationLevel.All,
  notificationChannels: NotificationChannel.Email | NotificationChannel.InApp,

  // 7. БЕЗОПАСНОСТЬ
  sessionTerminationMode: SessionTerminationMode.Manual,
  loginNotificationMode: LoginNotificationMode.NewDeviceOnly,
};
