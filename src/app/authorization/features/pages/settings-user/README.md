# User Settings - Frontend Models & Enums

Эта директория содержит TypeScript модели и enum'ы для работы с настройками пользователя.

## 📁 Структура

```
settings-user/
├── enums/              # TypeScript enum'ы
│   ├── ui-theme.enum.ts
│   ├── ui-density.enum.ts
│   ├── sidebar-state.enum.ts
│   ├── navigation-behavior.enum.ts
│   ├── table-density.enum.ts
│   ├── default-page-size-option.enum.ts
│   ├── accessibility-level.enum.ts
│   ├── notification-level.enum.ts
│   ├── notification-channel.enum.ts
│   ├── session-termination-mode.enum.ts
│   ├── login-notification-mode.enum.ts
│   └── index.ts        # Barrel export
│
└── models/             # TypeScript модели и утилиты
    ├── user-settings.model.ts      # Интерфейсы UserSettings, UserSettingsUpdateDto
    ├── settings-enum-utils.ts      # Утилиты для работы с enum'ами
    └── index.ts                    # Barrel export
```

## 🔧 Использование

### Импорт enum'ов

```typescript
import { UiTheme, UiDensity, SidebarState, NotificationChannel } from './enums';
```

### Импорт моделей

```typescript
import {
  UserSettings,
  UserSettingsUpdateDto,
  DEFAULT_USER_SETTINGS,
  SettingsEnumUtils,
} from './models';
```

### Работа с утилитами

```typescript
// Получить опции для select/radio контролов
const themeOptions = SettingsEnumUtils.getUiThemeOptions();
// => [{ value: 1, label: 'Светлая', description: '...' }, ...]

// Получить метку enum значения
const label = SettingsEnumUtils.getUiThemeLabel(UiTheme.Dark);
// => 'Тёмная'

// Работа с flags enum (NotificationChannel)
const channels = NotificationChannel.Email | NotificationChannel.InApp;
const hasEmail = SettingsEnumUtils.hasNotificationChannel(channels, NotificationChannel.Email);
// => true

const toggled = SettingsEnumUtils.toggleNotificationChannel(channels, NotificationChannel.Push);
// => Email | InApp | Push
```

## 📋 Enum'ы

### 1. UiTheme (Тема интерфейса)

- `Light = 1` - Светлая тема
- `Dark = 2` - Тёмная тема
- `System = 3` - Системная (автоматически)

### 2. UiDensity (Плотность интерфейса)

- `Compact = 1` - Компактная
- `Comfortable = 2` - Комфортная

### 3. SidebarState (Состояние сайдбара)

- `Expanded = 1` - Развёрнуто
- `Collapsed = 2` - Свёрнуто
- `Auto = 3` - Автоматически

### 4. NavigationBehavior (Поведение навигации)

- `RememberLastPage = 1` - Запоминать последнюю страницу
- `AlwaysHome = 2` - Всегда главная

### 5. TableDensity (Плотность таблиц)

- `Compact = 1` - Компактная
- `Normal = 2` - Нормальная

### 6. DefaultPageSizeOption (Размер страницы)

- `Size10 = 10` - 10 записей
- `Size20 = 20` - 20 записей
- `Size50 = 50` - 50 записей
- `Size100 = 100` - 100 записей

### 7. AccessibilityLevel (Уровень доступности)

- `Standard = 1` - Стандартный
- `LargeFont = 2` - Увеличенный шрифт
- `HighContrast = 3` - Высокий контраст

### 8. NotificationLevel (Уровень уведомлений)

- `None = 0` - Не показывать
- `ImportantOnly = 1` - Только важные
- `All = 2` - Все уведомления

### 9. NotificationChannel (Каналы уведомлений) - FLAGS

- `None = 0` - Нет
- `Email = 1` - Email
- `InApp = 2` - В приложении
- `Push = 4` - Push-уведомления

**Примечание:** Это flags enum, можно комбинировать через побитовое ИЛИ:

```typescript
const channels = NotificationChannel.Email | NotificationChannel.InApp;
```

### 10. SessionTerminationMode (Режим завершения сессии)

- `Manual = 1` - Вручную
- `OnTabClose = 2` - При закрытии вкладки
- `OnBrowserClose = 3` - При закрытии браузера

### 11. LoginNotificationMode (Уведомления о входе)

- `Never = 0` - Никогда
- `NewDeviceOnly = 1` - Только новые устройства
- `Always = 2` - Всегда

## 🔄 Соответствие Backend

Все enum'ы и модели **полностью соответствуют** backend реализации:

- `DAL/Enums/Settings/*.cs`
- `DAL/Models/UserSettings.cs`
- `DAL/Interfaces/IUserSettings.cs`

Значения enum'ов идентичны, что обеспечивает корректную сериализацию/десериализацию при обмене данными с API.

## 📝 Дефолтные значения

```typescript
const defaults = DEFAULT_USER_SETTINGS;
// {
//   theme: UiTheme.System,
//   density: UiDensity.Comfortable,
//   sidebarState: SidebarState.Expanded,
//   ...
// }
```

## 🎯 Следующие шаги

1. ✅ Создать enum'ы
2. ✅ Создать модели
3. ✅ Создать утилиты
4. ✅ Создать сервис `UserSettingsService`
5. ✅ Создать компоненты UI
6. ✅ Интегрировать с API
7. ⏳ Добавить роут в главный роутинг приложения
8. ⏳ Добавить пункт меню "Настройки" в навигацию

## 🎨 Созданные компоненты

### Главный компонент

- **SettingsPageComponent** - страница настроек с вкладками

### Компоненты вкладок

- **AppearanceTabComponent** - Внешний вид (тема, плотность, цвет)
- **NavigationTabComponent** - Навигация (сайдбар, поведение при входе)
- **TablesTabComponent** - Таблицы (плотность, размер страницы, фильтры)
- **LocalizationTabComponent** - Локализация (язык, часовой пояс)
- **AccessibilityTabComponent** - Доступность (уровень доступности)
- **NotificationsTabComponent** - Уведомления (уровень, каналы)
- **SecurityTabComponent** - Безопасность (завершение сессии, уведомления о входе)

## 🔌 API Integration

### Endpoints

```typescript
ApiEndpoints.SETTINGS.GET; // GET /api/settings
ApiEndpoints.SETTINGS.UPDATE; // PUT /api/settings
ApiEndpoints.SETTINGS.RESET; // POST /api/settings/reset
ApiEndpoints.SETTINGS.EXISTS; // GET /api/settings/exists
ApiEndpoints.SETTINGS.BY_USER_ID; // GET /api/settings/user/{userId}
```

### Использование сервиса

```typescript
import { UserSettingsService } from './services';

constructor(private settingsService: UserSettingsService) {}

// Загрузить настройки
this.settingsService.loadSettings().subscribe();

// Обновить настройки
this.settingsService.patchSettings({ theme: UiTheme.Dark }).subscribe();

// Сбросить к дефолтным
this.settingsService.resetToDefaults().subscribe();

// Доступ к текущим настройкам через signals
const theme = this.settingsService.currentTheme();
const loading = this.settingsService.loading();
```

## 📁 Структура файлов

```
settings-user/
├── components/
│   ├── settings-page/          # Главная страница
│   ├── appearance-tab/          # Вкладка "Внешний вид"
│   ├── navigation-tab/          # Вкладка "Навигация"
│   ├── tables-tab/              # Вкладка "Таблицы"
│   ├── localization-tab/        # Вкладка "Локализация"
│   ├── accessibility-tab/       # Вкладка "Доступность"
│   ├── notifications-tab/       # Вкладка "Уведомления"
│   ├── security-tab/            # Вкладка "Безопасность"
│   └── index.ts                 # Barrel export
├── enums/                       # TypeScript enum'ы (11 файлов)
├── models/                      # Модели и утилиты
├── services/                    # UserSettingsService
├── routes/                      # Роутинг
├── validators/                  # Валидаторы (будущее)
├── settings-user.routes.ts      # Роуты модуля
├── EXAMPLES.ts                  # Примеры использования
└── README.md                    # Документация
```

## 📚 Документация

Полная спецификация: `DAL/Documentations/SettingUser/FULL_SPECIFICATION.md`
