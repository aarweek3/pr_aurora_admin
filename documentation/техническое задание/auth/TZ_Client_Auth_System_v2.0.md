# ТЗ: Auth Control Panel - Панель управления авторизацией

**Версия:** 2.0
**Дата:** 27.12.2024
**Статус:** В разработке
**Базируется на:** [TZ_Client_Auth_System_v1.0.md](./TZ_Client_Auth_System_v1.0.md)

---

## 1. Назначение

Auth Control Panel - инструмент для мониторинга, тестирования и отладки системы авторизации Aurora Admin.

### Ключевые возможности:

- 📊 Мониторинг сессий и токенов в реальном времени
- 🎭 Управление ролями и тестирование прав доступа
- 🔬 Симуляция ошибок и edge cases
- 🧪 Playground для ручного тестирования API
- 🔔 Уведомления о критичных событиях
- 📤 Экспорт данных в JSON

---

## 2. Размещение

### Путь в приложении:

```
Admin Dashboard → Auth Control (новая вкладка)
```

### Файловая структура:

```
src/app/auth/auth-control/
├── components/
│   ├── auth-control-dashboard/      # Главный компонент
│   ├── session-tab/                 # Таб "Session"
│   ├── tokens-tab/                  # Таб "Tokens"
│   ├── roles-tab/                   # Таб "Roles"
│   ├── simulator-tab/               # Таб "Simulator"
│   ├── playground-tab/              # Таб "Playground"
│   └── shared/
│       ├── token-status-card/
│       ├── role-badge/
│       ├── json-editor/
│       └── simulation-result/
├── services/
│   ├── auth-control.service.ts
│   ├── auth-simulator.service.ts
│   ├── auth-playground.service.ts
│   ├── auth-notification.service.ts
│   └── auth-export.service.ts
├── models/
│   ├── auth-control.models.ts
│   ├── simulator.models.ts
│   └── playground.models.ts
└── auth-control.routes.ts
```

---

## 3. Структура табов

### Tab 1: Session (Мониторинг сессии)

**Отображаемая информация:**

- Текущий пользователь (email, fullName, department)
- Статус авторизации
- Роли пользователя
- Время сессии
- Timeline последних событий (10 записей)

**Действия:**

- Refresh Token
- View Profile
- Force Logout
- Clear Session
- View in Logger (переход в Logger Console)

---

### Tab 2: Tokens (Управление токенами)

**Access Token:**

- Статус (Valid/Expired)
- Время истечения
- Прогресс-бар времени
- Decoded JWT Claims
- Действия: Copy JWT, Decode, Export JSON

**Refresh Token:**

- Статус
- Время истечения
- Последнее использование
- Действия: Force Refresh, Revoke

**Server Validation:**

- Check Server Token
- Check Cookies
- Консистентность клиент-сервер

---

### Tab 3: Roles (Роли и права)

**Current Roles:**

- Список активных ролей
- Добавление/удаление ролей (dev mode)

**Route Access Matrix:**

- Таблица: Route | Your Access | Required Role
- Тестирование доступа к конкретному URL
- Guard Testing

**Available Roles:**

- Список всех ролей в системе
- Описание каждой роли

---

### Tab 4: Simulator (Симуляция ошибок) 🆕

**HTTP Error Simulation:**

- 401 Unauthorized
- 403 Forbidden
- 500 Server Error
- Network Timeout
- Выбор целевого endpoint

**Token Expiration Simulation:**

- Expire Access Token Now
- Expire Refresh Token Now
- Set Custom Expiry (минуты)

**Session Scenarios:**

- Concurrent Login (вход с другого устройства)
- Session Hijack (невалидная подпись)
- CORS Error
- Rate Limit (429)

**Simulation Results:**

- Лог выполнения
- Проверка работы interceptor
- Экспорт результатов

---

### Tab 5: Playground (Ручное тестирование) 🆕

**Request Builder:**

- Метод: GET/POST/PUT/DELETE
- Endpoint: dropdown с auth endpoints
- Quick Templates: Login, Register, Refresh, Profile, etc.

**Request Body:**

- JSON редактор с подсветкой синтаксиса
- Валидация JSON
- Автоформатирование

**Headers:**

- Content-Type
- ☑ Include Credentials
- ☑ Auto-add Authorization
- Добавление custom headers

**Response Viewer:**

- Status code и время
- Headers (включая Set-Cookie)
- Body с форматированием
- Действия: Copy, Export, View in Logger

**Request History:**

- Последние 20 запросов
- Load/Delete/Clear All
- Сохранение в localStorage

---

## 4. Сервисы

### AuthSimulatorService

```typescript
interface SimulationType {
  type: "http_error" | "token_expiry" | "session_scenario";
  errorCode?: 401 | 403 | 500 | 0;
  target?: string;
  duration?: number;
}

class AuthSimulatorService {
  activeSimulation = signal<SimulationType | null>(null);

  simulateError(config: SimulationType): void;
  simulateTokenExpiry(type: "access" | "refresh" | "both"): void;
  simulateScenario(name: string): Observable<SimulationResult>;
  deactivate(): void;
}
```

### AuthPlaygroundService

```typescript
interface PlaygroundRequest {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
  withCredentials: boolean;
}

class AuthPlaygroundService {
  requestHistory = signal<PlaygroundRequest[]>([]);

  sendRequest(request: PlaygroundRequest): Observable<any>;
  loadTemplate(name: string): PlaygroundRequest;
  saveToHistory(request: PlaygroundRequest): void;
  exportHistory(): void;
}
```

### AuthNotificationService

```typescript
class AuthNotificationService {
  startMonitoring(): void;

  // Уведомления:
  // - Token expires in 5 min (warning)
  // - Token expires in 2 min (critical)
  // - Token expired (error)
  // - Token refreshed (success)
}
```

### AuthExportService

```typescript
interface ExportData {
  exportDate: string;
  exportType: "session" | "tokens" | "roles" | "playground";
  data: any;
}

class AuthExportService {
  exportSession(): void;
  exportTokens(): void;
  exportRoles(): void;
  exportPlaygroundHistory(): void;

  private downloadJSON(data: ExportData, filename: string): void;
}
```

---

## 5. Интеграция с Logger Console

### Связь между панелями:

**Auth Control → Logger Console:**

- Кнопка "View in Logger" в каждом табе
- Автоматическая установка фильтра `[HTTP]` + `/auth/`
- Передача контекста (выбранный запрос)

**Logger Console → Auth Control:**

- Быстрый фильтр "🔐 Auth Events"
- Ссылка на Auth Control в контекстном меню

**Реализация:**

```typescript
// В Auth Control
openLoggerWithFilter(requestId?: string) {
  loggerService.setFilter({
    tag: '[HTTP]',
    urlContains: '/auth/'
  });
  router.navigate(['/dev/logger-console']);
}

// В Logger Console
<nz-tag (click)="filterAuthEvents()">
  🔐 Auth Events
</nz-tag>
```

---

## 6. Безопасность и доступ

### Поэтапное внедрение:

**Этап 1: Development**

```typescript
{
  path: 'auth-control',
  canActivate: [],  // Без ограничений
  component: AuthControlDashboardComponent
}
```

**Этап 2: Testing**

```typescript
{
  path: 'auth-control',
  canActivate: [authGuard],  // Только авторизованные
  component: AuthControlDashboardComponent
}
```

**Этап 3: Production**

```typescript
{
  path: 'auth-control',
  canActivate: [
    adminGuard,
    () => !environment.production || environment.features.authControlPanel
  ],
  component: AuthControlDashboardComponent
}
```

### Feature Flags:

```typescript
// environment.ts
features: {
  authControlPanel: true,
  authControlSimulator: true,
  authControlPlayground: true,
  authControlForceActions: true  // force logout, change roles
}
```

---

## 7. Уведомления

### Типы уведомлений:

| Событие                | Тип      | Цвет    | Длительность   |
| ---------------------- | -------- | ------- | -------------- |
| Token expires in 5 min | Warning  | Желтый  | 10 сек         |
| Token expires in 2 min | Critical | Красный | 15 сек         |
| Token expired          | Error    | Красный | Не закрывается |
| Token refreshed        | Success  | Зеленый | 3 сек          |
| Refreshing token       | Info     | Синий   | 5 сек          |

### Настройки:

```typescript
interface NotificationSettings {
  enableExpiryWarnings: boolean;
  showRefreshNotifications: boolean;
  alertOnAuthErrors: boolean;
  warningThreshold: number; // минуты
  criticalThreshold: number; // минуты
}
```

---

## 8. Экспорт данных

### Формат JSON:

```json
{
  "exportDate": "2024-12-27T21:30:00Z",
  "exportType": "auth-control-session",
  "data": {
    "user": { "email": "...", "fullName": "...", "roles": [...] },
    "session": { "startTime": "...", "duration": 7200 },
    "tokens": {
      "accessToken": { "valid": true, "expiresAt": "..." },
      "refreshToken": { "valid": true, "expiresAt": "..." }
    },
    "events": [...]
  }
}
```

### Кнопки экспорта:

- Session Tab: Export Session
- Tokens Tab: Export Tokens
- Roles Tab: Export Roles & Matrix
- Playground Tab: Export History

---

## 9. План реализации

### Фаза 1: MVP (1 день)

- ✅ Базовая структура компонентов
- ✅ Session Tab (read-only)
- ✅ Tokens Tab (read-only)
- ✅ Интеграция с AuthService и TokenService

### Фаза 2: Полный функционал (2 дня)

- ✅ Roles Tab с матрицей
- ✅ Simulator Tab
- ✅ Playground Tab
- ✅ Базовые действия (refresh, logout)

### Фаза 3: Интеграция (1 день)

- ✅ Связь с Logger Console
- ✅ Система уведомлений
- ✅ Экспорт данных
- ✅ Feature flags

### Фаза 4: Полировка (1 день)

- ✅ Анимации и transitions
- ✅ Адаптивность
- ✅ Документация
- ✅ Тестирование

---

## 10. Технические требования

### Зависимости:

- Angular 18+
- Ng-Zorro Ant Design
- RxJS
- Существующие сервисы: AuthService, TokenService

### Производительность:

- Мониторинг токенов: каждые 30 сек
- Уведомления: каждую минуту
- История Playground: max 20 записей
- Timeline событий: max 10 записей

### Совместимость:

- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

---

## 11. Дизайн

### Стиль (как Health Panel):

- Фон: `#ffffff`
- Тени: `0 10px 40px rgba(0,0,0,0.04)`
- Табы: Активный с линией `#1890ff`
- Статусы: 🟢 `#52c41a` / 🟡 `#faad14` / 🔴 `#ff4d4f`
- Градиенты для кнопок
- Прогресс-бары для времени

### Адаптивность:

- Desktop: полная панель
- Tablet: скрытие некоторых деталей
- Mobile: только критичная информация

---

## 12. Тестирование

### Unit тесты:

- AuthSimulatorService
- AuthPlaygroundService
- AuthNotificationService
- AuthExportService

### Integration тесты:

- Взаимодействие с AuthService
- Взаимодействие с TokenService
- Интеграция с Logger Console

### E2E тесты:

- Полный цикл симуляции ошибки
- Отправка запроса через Playground
- Экспорт данных

---

## 13. Документация

### Для разработчиков:

- README.md в папке auth-control
- JSDoc комментарии в сервисах
- Примеры использования

### Для пользователей:

- Встроенная помощь (tooltips)
- Описание каждого таба
- FAQ по типичным сценариям

---

## Заключение

Auth Control Panel - мощный инструмент для отладки и тестирования системы авторизации, который значительно упростит разработку и поддержку приложения.

**Ключевые преимущества:**

- ✅ Полный контроль над авторизацией
- ✅ Быстрая отладка проблем
- ✅ Автоматизация тестирования
- ✅ Визуализация процессов
- ✅ Интеграция с существующими инструментами

---

**Документ подготовлен:** 27.12.2024
**Версия:** 2.0
**Статус:** Готов к реализации
