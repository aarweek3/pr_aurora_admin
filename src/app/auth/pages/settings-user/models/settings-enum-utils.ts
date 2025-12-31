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
 * Интерфейс для опций select/radio контролов
 */
export interface EnumOption<T> {
  value: T;
  label: string;
  description?: string;
}

/**
 * Утилиты для работы с enum'ами настроек
 */
export class SettingsEnumUtils {
  // ==========================================
  // UI THEME
  // ==========================================

  static getUiThemeOptions(): EnumOption<UiTheme>[] {
    return [
      { value: UiTheme.Light, label: 'Светлая', description: 'Светлая тема оформления' },
      { value: UiTheme.Dark, label: 'Тёмная', description: 'Тёмная тема оформления' },
      { value: UiTheme.System, label: 'Системная', description: 'Автоматически из настроек ОС' },
    ];
  }

  static getUiThemeLabel(value: UiTheme): string {
    const option = this.getUiThemeOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }

  // ==========================================
  // UI DENSITY
  // ==========================================

  static getUiDensityOptions(): EnumOption<UiDensity>[] {
    return [
      { value: UiDensity.Compact, label: 'Компактная', description: 'Минимальные отступы' },
      { value: UiDensity.Comfortable, label: 'Комфортная', description: 'Стандартные отступы' },
    ];
  }

  static getUiDensityLabel(value: UiDensity): string {
    const option = this.getUiDensityOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }

  // ==========================================
  // SIDEBAR STATE
  // ==========================================

  static getSidebarStateOptions(): EnumOption<SidebarState>[] {
    return [
      { value: SidebarState.Expanded, label: 'Развёрнуто', description: 'Меню полностью раскрыто' },
      { value: SidebarState.Collapsed, label: 'Свёрнуто', description: 'Только иконки' },
      { value: SidebarState.Auto, label: 'Автоматически', description: 'Зависит от ширины экрана' },
    ];
  }

  static getSidebarStateLabel(value: SidebarState): string {
    const option = this.getSidebarStateOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }

  // ==========================================
  // NAVIGATION BEHAVIOR
  // ==========================================

  static getNavigationBehaviorOptions(): EnumOption<NavigationBehavior>[] {
    return [
      {
        value: NavigationBehavior.RememberLastPage,
        label: 'Запоминать последнюю страницу',
        description: 'Открывать последнюю посещённую страницу',
      },
      {
        value: NavigationBehavior.AlwaysHome,
        label: 'Всегда главная',
        description: 'Всегда открывать главную страницу',
      },
    ];
  }

  static getNavigationBehaviorLabel(value: NavigationBehavior): string {
    const option = this.getNavigationBehaviorOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }

  // ==========================================
  // TABLE DENSITY
  // ==========================================

  static getTableDensityOptions(): EnumOption<TableDensity>[] {
    return [
      {
        value: TableDensity.Compact,
        label: 'Компактная',
        description: 'Меньше отступов между строками',
      },
      { value: TableDensity.Normal, label: 'Нормальная', description: 'Стандартные отступы' },
    ];
  }

  static getTableDensityLabel(value: TableDensity): string {
    const option = this.getTableDensityOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }

  // ==========================================
  // DEFAULT PAGE SIZE
  // ==========================================

  static getDefaultPageSizeOptions(): EnumOption<DefaultPageSizeOption>[] {
    return [
      { value: DefaultPageSizeOption.Size10, label: '10 записей' },
      { value: DefaultPageSizeOption.Size20, label: '20 записей' },
      { value: DefaultPageSizeOption.Size50, label: '50 записей' },
      { value: DefaultPageSizeOption.Size100, label: '100 записей' },
    ];
  }

  static getDefaultPageSizeLabel(value: DefaultPageSizeOption): string {
    const option = this.getDefaultPageSizeOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }

  // ==========================================
  // ACCESSIBILITY LEVEL
  // ==========================================

  static getAccessibilityLevelOptions(): EnumOption<AccessibilityLevel>[] {
    return [
      {
        value: AccessibilityLevel.Standard,
        label: 'Стандартный',
        description: 'Обычный размер шрифтов и элементов',
      },
      {
        value: AccessibilityLevel.LargeFont,
        label: 'Увеличенный шрифт',
        description: 'Крупные шрифты для лучшей читаемости',
      },
      {
        value: AccessibilityLevel.HighContrast,
        label: 'Высокий контраст',
        description: 'Максимальный контраст для улучшенной видимости',
      },
    ];
  }

  static getAccessibilityLevelLabel(value: AccessibilityLevel): string {
    const option = this.getAccessibilityLevelOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }

  // ==========================================
  // NOTIFICATION LEVEL
  // ==========================================

  static getNotificationLevelOptions(): EnumOption<NotificationLevel>[] {
    return [
      {
        value: NotificationLevel.None,
        label: 'Не показывать',
        description: 'Отключить все уведомления',
      },
      {
        value: NotificationLevel.ImportantOnly,
        label: 'Только важные',
        description: 'Показывать только важные уведомления',
      },
      {
        value: NotificationLevel.All,
        label: 'Все уведомления',
        description: 'Показывать все уведомления',
      },
    ];
  }

  static getNotificationLevelLabel(value: NotificationLevel): string {
    const option = this.getNotificationLevelOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }

  // ==========================================
  // NOTIFICATION CHANNEL (FLAGS)
  // ==========================================

  static getNotificationChannelOptions(): EnumOption<NotificationChannel>[] {
    return [
      {
        value: NotificationChannel.Email,
        label: 'Email',
        description: 'Уведомления на электронную почту',
      },
      {
        value: NotificationChannel.InApp,
        label: 'В приложении',
        description: 'Уведомления внутри приложения',
      },
      {
        value: NotificationChannel.Push,
        label: 'Push-уведомления',
        description: 'Push-уведомления в браузере',
      },
    ];
  }

  static getNotificationChannelLabel(value: NotificationChannel): string {
    if (value === NotificationChannel.None) return 'Нет';

    const labels: string[] = [];
    if (value & NotificationChannel.Email) labels.push('Email');
    if (value & NotificationChannel.InApp) labels.push('В приложении');
    if (value & NotificationChannel.Push) labels.push('Push');

    return labels.length > 0 ? labels.join(', ') : 'Нет';
  }

  static hasNotificationChannel(
    channels: NotificationChannel,
    channel: NotificationChannel,
  ): boolean {
    return (channels & channel) === channel;
  }

  static toggleNotificationChannel(
    channels: NotificationChannel,
    channel: NotificationChannel,
  ): NotificationChannel {
    return channels ^ channel;
  }

  // ==========================================
  // SESSION TERMINATION MODE
  // ==========================================

  static getSessionTerminationModeOptions(): EnumOption<SessionTerminationMode>[] {
    return [
      {
        value: SessionTerminationMode.Manual,
        label: 'Вручную',
        description: 'Завершать сессию только при выходе',
      },
      {
        value: SessionTerminationMode.OnTabClose,
        label: 'При закрытии вкладки',
        description: 'Автоматически при закрытии вкладки',
      },
      {
        value: SessionTerminationMode.OnBrowserClose,
        label: 'При закрытии браузера',
        description: 'Автоматически при закрытии браузера',
      },
    ];
  }

  static getSessionTerminationModeLabel(value: SessionTerminationMode): string {
    const option = this.getSessionTerminationModeOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }

  // ==========================================
  // LOGIN NOTIFICATION MODE
  // ==========================================

  static getLoginNotificationModeOptions(): EnumOption<LoginNotificationMode>[] {
    return [
      {
        value: LoginNotificationMode.Never,
        label: 'Никогда',
        description: 'Не уведомлять о входах',
      },
      {
        value: LoginNotificationMode.NewDeviceOnly,
        label: 'Только новые устройства',
        description: 'Уведомлять при входе с нового устройства',
      },
      {
        value: LoginNotificationMode.Always,
        label: 'Всегда',
        description: 'Уведомлять при каждом входе',
      },
    ];
  }

  static getLoginNotificationModeLabel(value: LoginNotificationMode): string {
    const option = this.getLoginNotificationModeOptions().find((o) => o.value === value);
    return option?.label ?? 'Неизвестно';
  }
}
