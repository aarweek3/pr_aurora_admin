# Техническое задание: Система авторизации клиента Aurora Admin

**Версия:** 1.0
**Дата:** 27.12.2024
**Статус:** Реализовано

> **⚠️ ВАЖНО:** Данная версия документа описывает базовую систему авторизации.
> Для информации о **Auth Control Panel** (панель управления и тестирования авторизации)
> см. [TZ_Client_Auth_System_v2.0.md](./TZ_Client_Auth_System_v2.0.md)

---

## Changelog v1.0 → v2.0

**Добавлено в версии 2.0:**

- 🆕 Auth Control Panel - панель управления авторизацией
- 🆕 Simulator Tab - симуляция ошибок и сценариев
- 🆕 Playground Tab - ручное тестирование API
- 🆕 Система уведомлений о критичных событиях
- 🆕 Экспорт данных в JSON
- 🆕 Интеграция с Logger Console

**Изменения:**

- Расширена архитектура модуля auth
- Добавлены новые сервисы для мониторинга и тестирования
- Обновлены рекомендации по безопасности

---

## 1. Общее описание системы

Система авторизации Aurora Admin представляет собой полнофункциональное клиентское решение для управления аутентификацией и авторизацией пользователей на базе Angular 18+ с использованием современных подходов (Signals, Standalone Components, Functional Guards).

### 1.1 Ключевые особенности

- **Cookie-based аутентификация** с HttpOnly cookies
- **Автоматическое обновление токенов** (Refresh Token механизм)
- **Ролевая модель доступа** (RBAC - Role-Based Access Control)
- **Мониторинг состояния токенов** в реальном времени
- **Перехват HTTP запросов** с автоматической обработкой ошибок
- **Защита маршрутов** через функциональные guards
- **Централизованное управление сессией**

---

## 2. Архитектура системы

### 2.1 Структура модуля авторизации

```
src/app/auth/
├── components/          # UI компоненты
│   ├── login/          # Страница входа
│   ├── register/       # Страница регистрации
│   ├── forgot-password/
│   ├── reset-password/
│   ├── admin-dashboard/
│   ├── user-dashboard/
│   └── admin-entrance-dashboard/
├── services/           # Бизнес-логика
│   ├── auth.service.ts           # Основной сервис авторизации
│   ├── token.service.ts          # Управление токенами
│   ├── auth.interceptor.ts       # HTTP интерцептор
│   ├── role.service.ts           # Управление ролями
│   ├── password.service.ts       # Работа с паролями
│   ├── user-profile.service.ts   # Профиль пользователя
│   ├── activity-logs.service.ts  # Логирование активности
│   └── error-handler.service.ts  # Обработка ошибок
├── guards/             # Защита маршрутов
│   └── guards.ts       # Функциональные guards
├── models/             # Типы и интерфейсы
│   ├── auth.models.ts
│   ├── user.models.ts
│   ├── role.models.ts
│   ├── session.models.ts
│   ├── activity.models.ts
│   └── common.models.ts
├── constants/          # Константы
├── validators/         # Валидаторы форм
├── directives/         # Директивы
├── pipes/              # Пайпы
├── utils/              # Утилиты
└── auth.routes.ts      # Маршруты модуля
```

---

## 3. Основные сервисы

### 3.1 AuthService

**Назначение:** Центральный сервис для управления аутентификацией пользователей.

#### Основные возможности:

1. **Управление сессией:**

   - Регистрация пользователя
   - Вход в систему
   - Выход из системы
   - Обновление токена
   - Получение профиля

2. **Состояние пользователя (Signals):**

   ```typescript
   private currentUser = signal<UserProfileDto | null>(null);
   private userRoles = signal<string[]>([]);

   public isAuthenticated = computed(() => this.currentUser() !== null);
   public isAdmin = computed(() => this.userRoles().includes('Admin'));
   public isModerator = computed(() => this.userRoles().includes('Moderator'));
   ```

3. **Инициализация:**
   - Автоматическая проверка сохраненной сессии при запуске
   - Валидация токена через API
   - Восстановление данных пользователя из localStorage

#### API методы:

```typescript
// Регистрация
register(data: RegisterDto): Observable<ApiResponse<{ user: UserProfileDto }>>

// Вход
login(data: LoginDto): Observable<ApiResponse<{ user: UserProfileDto }>>

// Выход
logout(): Observable<ApiResponse<void>>

// Обновление токена
refreshToken(): Observable<ApiResponse<{ user: UserProfileDto }>>

// Получение профиля
getProfile(): Observable<ApiResponse<UserProfileDto>>

// Смена пароля
changePassword(data: ChangePasswordDto): Observable<ApiResponse<void>>

// Загрузка ролей
loadUserRoles(): Observable<string[]>
```

#### Публичные геттеры:

```typescript
getCurrentUser(): UserProfileDto | null
getUserRoles(): string[]
isLoggedIn(): boolean
isAdminUser(): boolean
isModeratorUser(): boolean
hasRole(role: string): boolean
```

#### Утилиты:

```typescript
// Определение маршрута после авторизации
getRedirectRoute(returnUrl?: string): string

// Перенаправление после успешного входа
redirectAfterLogin(returnUrl?: string): void

// Принудительное обновление токена
forceTokenRefresh(): Observable<ApiResponse<{ user: UserProfileDto }>>

// Очистка сессии
clearSession(): void
```

---

### 3.2 TokenService

**Назначение:** Управление и мониторинг JWT токенов.

#### Основные возможности:

1. **Мониторинг токенов:**

   - Автоматическая проверка валидности каждые 30 секунд
   - Отслеживание времени до истечения
   - Уведомление о статусе токена

2. **Интерфейс TokenStatus:**

   ```typescript
   interface TokenStatus {
     exists: boolean; // Токен существует
     valid: boolean; // Токен валиден
     expired: boolean; // Токен истек
     isValid: boolean; // Алиас для совместимости
     userEmail: string | null; // Email пользователя
     userId: string | null; // ID пользователя
     userRoles: string[]; // Роли пользователя
     expiresAt: Date | null; // Дата истечения
     timeUntilExpiry: number; // Время до истечения (мс)
     lastChecked: Date; // Время последней проверки
     claims?: { email?: string };
   }
   ```

3. **Интеграция с сервером:**
   - Проверка токена через `/auth/debug-token`
   - Получение информации о cookies через `/auth/debug-cookies`
   - Валидация консистентности клиент-сервер

#### API методы:

```typescript
// Запуск мониторинга
startMonitoring(): void

// Остановка мониторинга
stopMonitoring(): void

// Получение статуса (Observable)
getTokenStatus(): Observable<TokenStatus>

// Получение статуса (синхронно)
getCurrentStatus(): TokenStatus

// Проверка валидности
isTokenValid(): boolean

// Принудительная проверка
checkTokenStatus(): Observable<TokenStatus>

// Получение информации с сервера
checkServerToken(): Observable<ServerTokenInfo>

// Получение информации о cookies
getCookieInfo(): Observable<CookieInfo>

// Получение ролей пользователя
getUserRoles(): Observable<string[]>

// Валидация консистентности
validateConsistency(
  clientEmail?: string,
  clientRoles?: string[]
): Observable<{
  isConsistent: boolean;
  differences: string[];
  serverInfo: ServerTokenInfo | null;
  clientInfo: { email?: string; roles?: string[] };
}>

// Очистка статуса
clearStatus(): void
```

#### Утилиты для UI:

```typescript
// Форматирование времени
formatTimeUntilExpiry(ms: number): string

// Цвет статуса
getStatusColor(status?: TokenStatus): string

// Текст статуса
getStatusText(status?: TokenStatus): string
```

---

### 3.3 AuthInterceptor

**Назначение:** Перехват HTTP запросов для автоматической обработки авторизации и ошибок.

#### Основные функции:

1. **Автоматическая установка credentials:**

   ```typescript
   const authReq = req.clone({
     withCredentials: true,
     setHeaders: {
       "Content-Type": req.headers.get("Content-Type") || "application/json",
     },
   });
   ```

2. **Обработка 401 ошибок:**

   - Автоматическая попытка обновления токена
   - Предотвращение множественных refresh запросов
   - Повтор оригинального запроса после успешного refresh
   - Перенаправление на login при неудаче

3. **Механизм refresh токена:**

   ```typescript
   // Глобальные переменные для контроля
   let isRefreshing = false;
   const refreshTokenSubject = new BehaviorSubject<any>(null);

   // Логика обработки
   if (isRefreshing) {
     // Ожидаем завершения текущего refresh
     return refreshTokenSubject.pipe(
       filter((result) => result !== null),
       take(1),
       switchMap(() => next(request))
     );
   }

   // Начинаем новый refresh
   isRefreshing = true;
   return authService.refreshToken().pipe(
     switchMap(() => next(request)),
     catchError(() => redirectToLogin())
   );
   ```

4. **Обработка ошибок:**

   - 401: Автоматический refresh или редирект
   - 403: Возврат ошибки без редиректа
   - Остальные: Форматирование сообщения об ошибке

5. **Логирование (только в dev режиме):**
   - Запросы: метод, URL, заголовки
   - Ответы: статус, время выполнения
   - Ошибки: детальная информация

#### Вспомогательные функции:

```typescript
// Проверка auth endpoints
function isAuthEndpoint(url: string): boolean;

// Перенаправление на login
function redirectToLogin(router: Router, isDevMode: boolean): void;

// Обработка ошибок
function handleError(error: HttpErrorResponse): Error;

// Извлечение сообщения об ошибке
function getErrorMessage(error: any): string;
```

---

## 4. Guards (Защита маршрутов)

Все guards реализованы как функциональные (CanActivateFn) для совместимости с Angular 18+.

### 4.1 authGuard

**Назначение:** Базовая защита для авторизованных пользователей.

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(["/auth/login"], {
    queryParams: { returnUrl: state.url },
  });
};
```

**Использование:**

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  component: DashboardComponent
}
```

---

### 4.2 guestGuard

**Назначение:** Защита страниц для неавторизованных пользователей (login, register).

```typescript
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Перенаправляем авторизованного пользователя
  const targetRoute = authService.getRedirectRoute();
  return router.createUrlTree([targetRoute]);
};
```

**Использование:**

```typescript
{
  path: 'login',
  canActivate: [guestGuard],
  component: LoginComponent
}
```

---

### 4.3 roleGuard

**Назначение:** Универсальная проверка ролей с гибкой конфигурацией.

```typescript
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const message = inject(NzMessageService);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(["/auth/login"], {
      queryParams: { returnUrl: state.url },
    });
  }

  const requiredRoles = (route.data?.["roles"] as string[]) || [];
  const requireAll = (route.data?.["requireAll"] as boolean) || false;

  if (requiredRoles.length === 0) {
    return true;
  }

  const userRoles = authService.getUserRoles();
  const hasAccess = requireAll ? requiredRoles.every((role) => userRoles.includes(role)) : requiredRoles.some((role) => userRoles.includes(role));

  if (hasAccess) {
    return true;
  }

  message.error("Insufficient permissions to access this page");
  const targetRoute = authService.getRedirectRoute();
  return router.createUrlTree([targetRoute]);
};
```

**Использование:**

```typescript
// Требуется хотя бы одна из ролей
{
  path: 'admin',
  canActivate: [roleGuard],
  data: { roles: ['Admin', 'Moderator'] },
  component: AdminComponent
}

// Требуются все роли
{
  path: 'super-admin',
  canActivate: [roleGuard],
  data: { roles: ['Admin', 'SuperUser'], requireAll: true },
  component: SuperAdminComponent
}
```

---

### 4.4 adminGuard

**Назначение:** Быстрый доступ только для администраторов.

```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  route.data = { ...route.data, roles: ["Admin"] };
  return roleGuard(route, state);
};
```

---

### 4.5 moderatorGuard

**Назначение:** Доступ для модераторов и администраторов.

```typescript
export const moderatorGuard: CanActivateFn = (route, state) => {
  route.data = { ...route.data, roles: ["Admin", "Moderator"] };
  return roleGuard(route, state);
};
```

---

### 4.6 userOnlyGuard

**Назначение:** Доступ только для обычных пользователей (исключает админов).

```typescript
export const userOnlyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(["/auth/login"], {
      queryParams: { returnUrl: state.url },
    });
  }

  const userRoles = authService.getUserRoles();

  if (userRoles.includes("Admin")) {
    return router.createUrlTree(["/admin-entrance-dashboard"]);
  }

  if (userRoles.includes("Moderator")) {
    return router.createUrlTree(["/moderator/dashboard"]);
  }

  return true;
};
```

---

## 5. Модели данных

### 5.1 Аутентификация

```typescript
// Регистрация
interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// Вход
interface LoginDto {
  email: string;
  password: string;
}

// Смена пароля
interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Восстановление пароля
interface ForgotPasswordDto {
  email: string;
}

interface ResetPasswordDto {
  email: string;
  token: string;
  newPassword: string;
}
```

### 5.2 Пользователь

```typescript
interface UserProfileDto {
  fullName: string;
  email: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}
```

### 5.3 Ответы API

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfileDto;
  requiresTwoFactor: boolean;
}
```

---

## 6. Потоки работы (Flows)

### 6.1 Поток регистрации

```
1. Пользователь заполняет форму регистрации
2. Компонент вызывает authService.register(data)
3. AuthService отправляет POST /auth/register
4. При успехе:
   - Сохраняет пользователя в currentUser signal
   - Сохраняет данные в localStorage
   - Запускает tokenService.startMonitoring()
   - Загружает роли через loadUserRoles()
   - Перенаправляет на соответствующий dashboard
5. При ошибке:
   - Возвращает ошибку в компонент
   - Компонент отображает сообщение пользователю
```

### 6.2 Поток входа

```
1. Пользователь вводит email и пароль
2. Компонент вызывает authService.login(data)
3. AuthService отправляет POST /auth/login с withCredentials: true
4. Сервер устанавливает HttpOnly cookies (access_token, refresh_token)
5. При успехе:
   - Обновляет currentUser signal
   - Сохраняет в localStorage
   - Запускает мониторинг токенов
   - Загружает роли
   - Определяет целевой маршрут через getRedirectRoute()
   - Выполняет redirectAfterLogin()
6. При ошибке:
   - Отображает сообщение об ошибке
```

### 6.3 Поток автоматического refresh токена

```
1. Пользователь делает запрос к защищенному API
2. AuthInterceptor добавляет withCredentials: true
3. Сервер возвращает 401 (токен истек)
4. AuthInterceptor перехватывает ошибку:
   a. Проверяет, не идет ли уже refresh (isRefreshing)
   b. Если да - ставит запрос в очередь через refreshTokenSubject
   c. Если нет:
      - Устанавливает isRefreshing = true
      - Вызывает authService.refreshToken()
      - POST /auth/refresh с withCredentials: true
      - Сервер обновляет cookies
      - При успехе:
        * Обновляет данные пользователя
        * Повторяет оригинальный запрос
        * Разблокирует очередь (refreshTokenSubject.next(true))
      - При неудаче:
        * Очищает сессию
        * Перенаправляет на /auth/login
5. Оригинальный запрос выполняется с новым токеном
```

### 6.4 Поток выхода

```
1. Пользователь нажимает "Выход"
2. Компонент вызывает authService.logout()
3. AuthService отправляет POST /auth/logout
4. Сервер удаляет cookies
5. Клиент:
   - Очищает currentUser и userRoles signals
   - Удаляет данные из localStorage
   - Останавливает мониторинг токенов (tokenService.clearStatus())
   - Перенаправляет на /auth/login
```

### 6.5 Поток мониторинга токенов

```
1. После успешного входа вызывается tokenService.startMonitoring()
2. Сервис запускает timer(30000, 30000) - проверка каждые 30 секунд
3. При каждой проверке:
   - GET /auth/debug-token с withCredentials: true
   - Сервер возвращает информацию о токене
   - TokenService обновляет tokenStatus$ BehaviorSubject
   - Компоненты подписанные на getTokenStatus() получают обновление
4. При выходе или ошибке:
   - stopMonitoring() отменяет подписку
   - Устанавливает пустой статус
```

---

## 7. Хранение данных

### 7.1 LocalStorage

```typescript
// Ключи хранения
STORAGE_KEYS = {
  USER_DATA: "user_data",
  AUTH_TOKEN: "auth_token", // Не используется (токены в cookies)
  REFRESH_TOKEN: "refresh_token", // Не используется
};

// Сохраняемые данные
interface StoredUserData {
  fullName: string;
  email: string;
  department?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}
```

**Примечание:** Токены НЕ хранятся в localStorage по соображениям безопасности. Используются HttpOnly cookies.

### 7.2 Cookies (управляются сервером)

```
access_token  - HttpOnly, Secure, SameSite=Strict
refresh_token - HttpOnly, Secure, SameSite=Strict
```

---

## 8. API Endpoints

### 8.1 Аутентификация

```typescript
POST / api / auth / register;
POST / api / auth / login;
POST / api / auth / logout;
POST / api / auth / refresh;
POST / api / auth / change - password;
POST / api / auth / forgot - password;
POST / api / auth / reset - password;
```

### 8.2 Профиль

```typescript
GET / api / auth / profile;
PUT / api / auth / profile;
```

### 8.3 Отладка (только для разработки)

```typescript
GET / api / auth / debug - token; // Информация о текущем токене
GET / api / auth / debug - cookies; // Информация о cookies
```

---

## 9. Безопасность

### 9.1 Меры безопасности

1. **HttpOnly Cookies:**

   - Токены недоступны для JavaScript
   - Защита от XSS атак

2. **Secure & SameSite:**

   - Передача только по HTTPS
   - Защита от CSRF атак

3. **Автоматический refresh:**

   - Короткий срок жизни access токена
   - Длительный refresh токен

4. **Валидация на клиенте:**

   - Проверка формата email
   - Требования к паролю
   - Подтверждение пароля

5. **Защита маршрутов:**

   - Guards проверяют авторизацию
   - Ролевой контроль доступа
   - Сохранение returnUrl для возврата

6. **Логирование:**
   - Отслеживание попыток входа
   - Мониторинг активности пользователей
   - Детальные логи в dev режиме

### 9.2 Обработка ошибок

1. **Сетевые ошибки:**

   - Автоматический retry для 401
   - Понятные сообщения пользователю
   - Логирование для отладки

2. **Валидация:**

   - Клиентская валидация форм
   - Серверная валидация
   - Отображение ошибок валидации

3. **Таймауты:**
   - Автоматическое обновление токена
   - Предупреждение о скором истечении
   - Graceful logout при истечении

---

## 10. Интеграция с UI

### 10.1 Использование в компонентах

```typescript
@Component({
  selector: "app-dashboard",
  template: `
    @if (authService.isAuthenticated()) {
    <div class="dashboard">
      <h1>Welcome, {{ authService.getCurrentUser()?.fullName }}</h1>

      @if (authService.isAdmin()) {
      <admin-panel />
      } @if (authService.isModerator()) {
      <moderator-panel />
      }
    </div>
    }
  `,
})
export class DashboardComponent {
  authService = inject(AuthService);
}
```

### 10.2 Мониторинг токенов в UI

```typescript
@Component({
  selector: "app-token-status",
  template: `
    <div class="token-status" [style.color]="statusColor()">
      <span>{{ statusText() }}</span>
      <span>{{ timeRemaining() }}</span>
    </div>
  `,
})
export class TokenStatusComponent {
  private tokenService = inject(TokenService);

  status = toSignal(this.tokenService.getTokenStatus());

  statusColor = computed(() => this.tokenService.getStatusColor(this.status()));

  statusText = computed(() => this.tokenService.getStatusText(this.status()));

  timeRemaining = computed(() => {
    const s = this.status();
    return s ? this.tokenService.formatTimeUntilExpiry(s.timeUntilExpiry) : "";
  });
}
```

---

## 11. Тестирование

### 11.1 Компоненты для тестирования

```
src/app/auth/components/test/
├── test-auth/          # Тестирование авторизации
├── test-cors/          # Тестирование CORS
├── token-test/         # Тестирование токенов
├── test-one-user/      # Тестирование одного пользователя
└── test-two-user/      # Тестирование двух пользователей
```

### 11.2 Сценарии тестирования

1. **Регистрация и вход:**

   - Успешная регистрация
   - Валидация полей
   - Дубликат email
   - Успешный вход
   - Неверные credentials

2. **Управление сессией:**

   - Автоматический refresh
   - Множественные вкладки
   - Истечение токена
   - Принудительный logout

3. **Роли и доступ:**

   - Проверка ролей
   - Доступ к защищенным маршрутам
   - Перенаправление при отсутствии прав

4. **Восстановление пароля:**
   - Запрос сброса
   - Получение токена
   - Установка нового пароля

---

## 12. Конфигурация

### 12.1 Environment

```typescript
// environment.ts
export const environment = {
  production: false,
  api: {
    baseUrl: "https://localhost:7233/api",
  },
};
```

### 12.2 API Endpoints

```typescript
// api-endpoints.ts
export const ApiEndpoints = {
  AUTH: {
    BASE: "/api/auth",
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
    PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
};

export const STORAGE_KEYS = {
  USER_DATA: "user_data",
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
};
```

---

## 13. Лучшие практики

### 13.1 Рекомендации по использованию

1. **Всегда используйте guards:**

   ```typescript
   {
     path: 'protected',
     canActivate: [authGuard],
     component: ProtectedComponent
   }
   ```

2. **Проверяйте роли в компонентах:**

   ```typescript
   @if (authService.hasRole('Admin')) {
     <admin-content />
   }
   ```

3. **Обрабатывайте ошибки:**

   ```typescript
   authService.login(data).subscribe({
     next: () => this.router.navigate(["/dashboard"]),
     error: (err) => this.message.error(err.message),
   });
   ```

4. **Используйте Signals:**

   ```typescript
   isAuthenticated = authService.isAuthenticated;
   currentUser = authService.getCurrentUser;
   ```

5. **Мониторьте токены в критичных местах:**
   ```typescript
   tokenStatus = toSignal(tokenService.getTokenStatus());
   ```

### 13.2 Что НЕ делать

1. ❌ Не храните токены в localStorage
2. ❌ Не отключайте withCredentials
3. ❌ Не игнорируйте ошибки авторизации
4. ❌ Не дублируйте логику guards
5. ❌ Не забывайте про cleanup при выходе

---

## 14. Диаграммы

### 14.1 Диаграмма компонентов

```
┌─────────────────────────────────────────────────────────┐
│                    Angular Application                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │   Guards     │─────▶│  AuthService │                │
│  └──────────────┘      └──────┬───────┘                │
│                               │                          │
│  ┌──────────────┐            │                          │
│  │ Components   │◀───────────┤                          │
│  └──────────────┘            │                          │
│                               │                          │
│  ┌──────────────┐      ┌─────▼────────┐                │
│  │ Interceptor  │─────▶│TokenService  │                │
│  └──────────────┘      └──────────────┘                │
│         │                                                │
└─────────┼────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend API                           │
│  /auth/login, /auth/refresh, /auth/profile, etc.       │
└─────────────────────────────────────────────────────────┘
```

### 14.2 Диаграмма потока данных

```
User Action
    │
    ▼
Component
    │
    ▼
AuthService ──────────────┐
    │                     │
    ▼                     ▼
HTTP Request         Update Signals
    │                     │
    ▼                     ▼
Interceptor          UI Updates
    │
    ▼
Backend API
    │
    ▼
Response (with cookies)
    │
    ▼
AuthService
    │
    ▼
TokenService.startMonitoring()
```

---

## 15. Заключение

Система авторизации Aurora Admin представляет собой современное, безопасное и масштабируемое решение для управления аутентификацией и авторизацией в Angular приложениях.

### Ключевые преимущества:

✅ **Безопасность:** HttpOnly cookies, автоматический refresh, защита от XSS/CSRF
✅ **Удобство:** Signals для реактивности, функциональные guards, автоматизация
✅ **Гибкость:** Ролевая модель, настраиваемые guards, расширяемая архитектура
✅ **Надежность:** Обработка ошибок, мониторинг токенов, логирование
✅ **Современность:** Angular 18+, Standalone Components, TypeScript

### Дальнейшее развитие:

- Двухфакторная аутентификация (2FA)
- OAuth провайдеры (Google, GitHub)
- Биометрическая аутентификация
- Session management (управление активными сессиями)
- Advanced logging и аудит

---

**Документ подготовлен:** 27.12.2024
**Версия системы:** Aurora Admin v1.0
**Статус:** Production Ready
