/**
 * Примеры использования моделей и enum'ов настроек пользователя
 */

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
} from './enums';

import {
  DEFAULT_USER_SETTINGS,
  EnumOption,
  SettingsEnumUtils,
  UserSettings,
  UserSettingsUpdateDto,
} from './models';

// ==========================================
// ПРИМЕР 1: Создание объекта настроек
// ==========================================

const userSettings: UserSettings = {
  theme: UiTheme.Dark,
  density: UiDensity.Compact,
  primaryColor: '#1890ff',
  sidebarState: SidebarState.Collapsed,
  navigationBehavior: NavigationBehavior.RememberLastPage,
  tableDensity: TableDensity.Compact,
  defaultPageSize: DefaultPageSizeOption.Size20,
  showAdvancedFilters: true,
  language: 'ru-RU',
  timeZone: 'Europe/Moscow',
  accessibilityLevel: AccessibilityLevel.Standard,
  notificationLevel: NotificationLevel.ImportantOnly,
  notificationChannels: NotificationChannel.Email | NotificationChannel.InApp,
  sessionTerminationMode: SessionTerminationMode.OnBrowserClose,
  loginNotificationMode: LoginNotificationMode.NewDeviceOnly,
};

// ==========================================
// ПРИМЕР 2: Использование дефолтных значений
// ==========================================

const settings = { ...DEFAULT_USER_SETTINGS };
console.log(settings.theme); // UiTheme.System
console.log(settings.density); // UiDensity.Comfortable

// ==========================================
// ПРИМЕР 3: Частичное обновление (Partial)
// ==========================================

const updateDto: Partial<UserSettingsUpdateDto> = {
  theme: UiTheme.Light,
  primaryColor: '#ff4d4f',
};

// ==========================================
// ПРИМЕР 4: Получение опций для контролов
// ==========================================

// Для radio group / select
const themeOptions: EnumOption<UiTheme>[] = SettingsEnumUtils.getUiThemeOptions();
/*
[
  { value: 1, label: 'Светлая', description: 'Светлая тема оформления' },
  { value: 2, label: 'Тёмная', description: 'Тёмная тема оформления' },
  { value: 3, label: 'Системная', description: 'Автоматически из настроек ОС' }
]
*/

const densityOptions = SettingsEnumUtils.getUiDensityOptions();
const sidebarOptions = SettingsEnumUtils.getSidebarStateOptions();
const pageSizeOptions = SettingsEnumUtils.getDefaultPageSizeOptions();

// ==========================================
// ПРИМЕР 5: Получение меток enum значений
// ==========================================

const themeLabel = SettingsEnumUtils.getUiThemeLabel(UiTheme.Dark);
console.log(themeLabel); // 'Тёмная'

const densityLabel = SettingsEnumUtils.getUiDensityLabel(UiDensity.Comfortable);
console.log(densityLabel); // 'Комфортная'

// ==========================================
// ПРИМЕР 6: Работа с Flags Enum (NotificationChannel)
// ==========================================

// Комбинирование каналов
let channels = NotificationChannel.Email | NotificationChannel.InApp;

// Проверка наличия канала
const hasEmail = SettingsEnumUtils.hasNotificationChannel(channels, NotificationChannel.Email);
console.log(hasEmail); // true

const hasPush = SettingsEnumUtils.hasNotificationChannel(channels, NotificationChannel.Push);
console.log(hasPush); // false

// Переключение канала (toggle)
channels = SettingsEnumUtils.toggleNotificationChannel(channels, NotificationChannel.Push);
console.log(channels); // Email | InApp | Push

channels = SettingsEnumUtils.toggleNotificationChannel(channels, NotificationChannel.Email);
console.log(channels); // InApp | Push (Email убран)

// Получение метки для комбинации каналов
const channelsLabel = SettingsEnumUtils.getNotificationChannelLabel(channels);
console.log(channelsLabel); // 'В приложении, Push'

// ==========================================
// ПРИМЕР 7: Использование в Angular компоненте
// ==========================================

/*
@Component({
  selector: 'app-settings-appearance',
  template: `
    <nz-radio-group [(ngModel)]="settings.theme">
      <label *ngFor="let option of themeOptions" nz-radio [nzValue]="option.value">
        {{ option.label }}
        <span class="description">{{ option.description }}</span>
      </label>
    </nz-radio-group>
  `
})
export class SettingsAppearanceComponent {
  settings = signal<UserSettings>(DEFAULT_USER_SETTINGS);
  themeOptions = SettingsEnumUtils.getUiThemeOptions();

  onThemeChange(theme: UiTheme): void {
    this.settings.update(s => ({ ...s, theme }));
  }
}
*/

// ==========================================
// ПРИМЕР 8: Валидация HEX цвета
// ==========================================

function isValidHexColor(color: string | null): boolean {
  if (!color) return true; // null допустим
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

console.log(isValidHexColor('#1890ff')); // true
console.log(isValidHexColor('#fff')); // true
console.log(isValidHexColor('invalid')); // false

// ==========================================
// ПРИМЕР 9: Типобезопасное обновление
// ==========================================

function updateSettings(current: UserSettings, updates: Partial<UserSettings>): UserSettings {
  return { ...current, ...updates };
}

const updated = updateSettings(userSettings, {
  theme: UiTheme.Light,
  density: UiDensity.Comfortable,
});

// ==========================================
// ПРИМЕР 10: Проверка значений enum
// ==========================================

function isValidTheme(value: number): value is UiTheme {
  return [UiTheme.Light, UiTheme.Dark, UiTheme.System].includes(value);
}

console.log(isValidTheme(1)); // true
console.log(isValidTheme(999)); // false

export {
  isValidHexColor,
  isValidTheme,
  themeOptions,
  updateSettings,
  // Примеры экспортируются для использования в тестах
  userSettings,
};
