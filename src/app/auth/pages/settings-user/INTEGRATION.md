# Инструкция по интеграции User Settings

## ✅ Что уже сделано

### 1. Backend Integration

- ✅ Добавлены API endpoints в `api-endpoints.ts`
- ✅ Создан `UserSettingsService` для работы с API

### 2. Models & Enums

- ✅ 11 TypeScript enum'ов (полное соответствие backend)
- ✅ Интерфейсы `UserSettings` и `UserSettingsUpdateDto`
- ✅ Утилитный класс `SettingsEnumUtils`
- ✅ Дефолтные значения `DEFAULT_USER_SETTINGS`

### 3. UI Components

- ✅ Главный компонент `SettingsPageComponent`
- ✅ 7 компонентов вкладок (Appearance, Navigation, Tables, Localization, Accessibility, Notifications, Security)
- ✅ Роутинг `settings-user.routes.ts`

## 🚀 Шаги для завершения интеграции

### Шаг 1: Добавить роут в главный роутинг

Откройте `src/app/app.routes.ts` и добавьте:

```typescript
{
  path: 'settings',
  loadChildren: () =>
    import('./auth/pages/settings-user/settings-user.routes').then(
      (m) => m.SETTINGS_ROUTES
    ),
  canActivate: [authGuard], // Если используется guard
  title: 'Настройки'
}
```

### Шаг 2: Добавить пункт меню в навигацию

#### Вариант A: В сайдбаре (если используется)

Найдите файл с конфигурацией меню (например, `sidebar-menu.config.ts`) и добавьте:

```typescript
{
  label: 'Настройки',
  icon: 'setting',
  route: '/settings',
  order: 100 // Последний пункт меню
}
```

#### Вариант B: В меню профиля (рекомендуется)

Откройте компонент хедера/профиля (например, `admin-header.component.ts`) и добавьте пункт меню:

```html
<nz-dropdown-menu #userMenu="nzDropdownMenu">
  <ul nz-menu>
    <li nz-menu-item routerLink="/profile">
      <i nz-icon nzType="user"></i>
      Профиль
    </li>
    <li nz-menu-item routerLink="/settings">
      <i nz-icon nzType="setting"></i>
      Настройки
    </li>
    <li nz-menu-divider></li>
    <li nz-menu-item (click)="logout()">
      <i nz-icon nzType="logout"></i>
      Выйти
    </li>
  </ul>
</nz-dropdown-menu>
```

### Шаг 3: Инициализация настроек при входе (опционально)

Добавьте в `AuthService` или `AppComponent` загрузку настроек при входе:

```typescript
import { UserSettingsService } from './auth/pages/settings-user/services';

export class AppComponent implements OnInit {
  private settingsService = inject(UserSettingsService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Загрузить настройки если пользователь авторизован
    this.authService.isAuthenticated$.subscribe((isAuth) => {
      if (isAuth) {
        this.settingsService.loadSettings().subscribe();
      }
    });
  }
}
```

### Шаг 4: Применение настроек к UI (автоматически)

Сервис `UserSettingsService` автоматически применяет настройки к UI через:

- CSS классы на `document.body`
- CSS переменные
- Custom events для сайдбара

#### Необходимые CSS стили

Добавьте в `styles.scss`:

```scss
// Темы
body.light-theme {
  --bg-color: #ffffff;
  --text-color: #000000;
  // ... другие переменные
}

body.dark-theme {
  --bg-color: #1f1f1f;
  --text-color: #ffffff;
  // ... другие переменные
}

// Плотность
body.density-compact {
  --spacing: 8px;
  --padding: 12px;
}

body.density-comfortable {
  --spacing: 16px;
  --padding: 24px;
}

// Доступность
body.accessibility-large-font {
  font-size: 18px;
}

body.accessibility-high-contrast {
  filter: contrast(1.5);
}
```

### Шаг 5: Интеграция с сайдбаром (опционально)

Если у вас есть компонент сайдбара, добавьте слушатель события:

```typescript
export class SidebarComponent implements OnInit {
  ngOnInit(): void {
    window.addEventListener('sidebar-state-change', (event: any) => {
      const state = event.detail.state;
      // Применить состояние к сайдбару
      this.updateSidebarState(state);
    });
  }
}
```

## 🧪 Тестирование

### 1. Проверка роутинга

```
http://localhost:4200/settings
```

### 2. Проверка API

Откройте DevTools → Network и проверьте запросы:

- GET `/api/settings` - загрузка настроек
- PUT `/api/settings` - обновление настроек
- POST `/api/settings/reset` - сброс настроек

### 3. Проверка применения настроек

- Измените тему → проверьте класс на `body`
- Измените цвет → проверьте CSS переменную `--primary-color`
- Измените плотность → проверьте класс на `body`

## 📝 Примеры использования

### Получить текущие настройки в любом компоненте

```typescript
import { UserSettingsService } from './auth/pages/settings-user/services';

export class MyComponent {
  private settingsService = inject(UserSettingsService);

  ngOnInit(): void {
    // Через signal
    const theme = this.settingsService.currentTheme();

    // Или через объект
    const settings = this.settingsService.settings();
    console.log(settings.theme, settings.density);
  }
}
```

### Подписка на изменения настроек

```typescript
this.settingsService.getSettingsChanges().subscribe((settings) => {
  console.log('Settings changed:', settings);
  // Выполнить действия при изменении настроек
});
```

### Проверка конкретной настройки

```typescript
// Email уведомления включены?
const emailEnabled = this.settingsService.emailNotificationsEnabled();

// Текущая тема
const isDark = this.settingsService.currentTheme() === UiTheme.Dark;
```

## ⚠️ Важные замечания

1. **Backend должен быть готов**: Убедитесь, что backend endpoints `/api/settings/*` работают
2. **Авторизация**: Настройки доступны только авторизованным пользователям
3. **Автосохранение**: Изменения сохраняются автоматически при изменении контролов
4. **Signals**: Используются Angular Signals для реактивности

## 🐛 Troubleshooting

### Ошибка 401 при загрузке настроек

- Проверьте, что пользователь авторизован
- Проверьте, что токен передаётся в запросе

### Настройки не применяются к UI

- Проверьте наличие CSS стилей для классов
- Проверьте консоль браузера на ошибки
- Убедитесь, что сервис инициализирован

### Настройки не сохраняются

- Проверьте Network tab на ошибки API
- Проверьте валидацию на backend
- Проверьте формат данных (особенно HEX цвет)

## 📞 Поддержка

При возникновении проблем проверьте:

1. Консоль браузера (F12)
2. Network tab для API запросов
3. Логи backend сервера
4. README.md в папке settings-user

## ✨ Готово!

После выполнения всех шагов страница настроек будет полностью интегрирована в приложение.
