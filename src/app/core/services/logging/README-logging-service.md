# LoggingService (адаптированный для Auth)

Основные изменения в LoggingService:

## 1. Auth специфичные типы

AuthAction - 15 типов auth событий
AuthLogEntry - структура для auth логов

## 2. Новые методы для auth

logAuthEvent() - общий метод для auth событий
logLoginAttempt() - специально для входа
logRegistrationAttempt() - для регистрации
logTokenRefresh() - для обновления токенов
logUserAction() - для аудита действий
logSecurityEvent() - для событий безопасности

## 3. Управление сессией

setCurrentUserId() / clearCurrentUserId()
Автоматическая привязка действий к пользователю
Уникальный sessionId для отслеживания

## 4. Анализ и экспорт

getAuthStats() - статистика по действиям
exportAuthLogs() - экспорт в JSON
Фильтрация по пользователю/действию

## 5. Автоматическая обработка auth ошибок

Определение auth URL в ErrorResponse
Специальное логирование auth ошибок

README включает:

Все auth действия с примерами
Интеграцию с AuthService и ErrorHandlingService
Структуру данных и безопасность
Примеры для разработки и мониторинга

Теперь LoggingService готов для полноценной auth системы с аудитом и мониторингом!

## Описание

Централизованный сервис логирования для системы авторизации. Расширяет базовое логирование специализированными методами для отслеживания auth событий, аудита действий пользователей и мониторинга безопасности.

## Основные функции

- Базовое логирование (debug, info, warn, error)
- Специализированное логирование auth событий
- Аудит действий пользователей
- Отслеживание сессий и безопасности
- Экспорт и анализ auth логов
- Интеграция с мониторинговыми сервисами

## Auth события (AuthAction)

```typescript
type AuthAction = 
  | 'login_attempt'     // Попытка входа
  | 'login_success'     // Успешный вход
  | 'login_failed'      // Неудачный вход
  | 'logout'            // Выход из системы
  | 'register_attempt'  // Попытка регистрации
  | 'register_success'  // Успешная регистрация
  | 'register_failed'   // Неудачная регистрация
  | 'token_refresh'     // Обновление токена
  | 'token_expired'     // Истечение токена
  | 'session_expired'   // Истечение сессии
  | 'password_reset_request' // Запрос сброса пароля
  | 'password_changed'  // Смена пароля
  | 'user_blocked'      // Блокировка пользователя
  | 'unauthorized_access' // Неавторизованный доступ
  | 'permission_denied'   // Отказ в доступе
```

## Базовые методы логирования

### info(context, message, metadata?)

```typescript
loggingService.info('AuthService', 'User profile loaded', { 
  userId: 'user_123',
  loadTime: 250 
});
```

### debug(context, message, metadata?)

```typescript
loggingService.debug('TokenService', 'Token validation started', { 
  tokenLength: 847,
  expiresIn: 900 
});
```

### warn(context, message, metadata?)

```typescript
loggingService.warn('AuthGuard', 'Unauthorized access attempt', { 
  route: '/admin/users',
  userRole: 'user' 
});
```

### error(context, message, metadata?)

```typescript
loggingService.error('AuthInterceptor', 'Token refresh failed', { 
  userId: 'user_123',
  reason: 'Refresh token expired' 
});
```

### logErrorResponse(errorResponse)

```typescript
// Автоматически определяет auth ошибки и логирует их специально
loggingService.logErrorResponse(errorResponse);
```

## Auth специфичные методы

### logAuthEvent(action, userId?, metadata?)

```typescript
// Успешный вход
loggingService.logAuthEvent('login_success', 'user_123', {
  email: 'user@example.com',
  loginMethod: 'email_password'
});

// Неудачная попытка входа
loggingService.logAuthEvent('login_failed', undefined, {
  email: 'user@example.com',
  reason: 'Invalid password',
  attempts: 3
});
```

### logLoginAttempt(email, success, reason?)

```typescript
// Успешный вход
loggingService.logLoginAttempt('user@example.com', true);

// Неудачный вход
loggingService.logLoginAttempt('user@example.com', false, 'Invalid credentials');
```

### logRegistrationAttempt(email, success, reason?)

```typescript
// Успешная регистрация
loggingService.logRegistrationAttempt('newuser@example.com', true);

// Неудачная регистрация
loggingService.logRegistrationAttempt('existing@example.com', false, 'Email already exists');
```

### logTokenRefresh(userId, success, reason?)

```typescript
// Успешное обновление
loggingService.logTokenRefresh('user_123', true);

// Неудачное обновление
loggingService.logTokenRefresh('user_123', false, 'Refresh token expired');
```

### logUserAction(action, userId, details?)

```typescript
loggingService.logUserAction('profile_updated', 'user_123', {
  changedFields: ['firstName', 'lastName'],
  timestamp: new Date().toISOString()
});
```

### logSecurityEvent(event, metadata?)

```typescript
loggingService.logSecurityEvent('suspicious_activity', {
  type: 'multiple_failed_logins',
  count: 5,
  timeWindow: '5 minutes'
});
```

## Управление сессией

### setCurrentUserId(userId)

```typescript
// Устанавливается при успешном логине
loggingService.setCurrentUserId('user_123');
```

### clearCurrentUserId()

```typescript
// Очищается при logout
loggingService.clearCurrentUserId();
```

### getSessionId()

```typescript
const sessionId = loggingService.getSessionId();
// Возвращает: "session_1640995200_abc123def"
```

## Анализ и экспорт логов

### getAuthLogs()

```typescript
const allAuthLogs = loggingService.getAuthLogs();
// Возвращает все auth события в сессии
```

### getAuthLogsByAction(action)

```typescript
const loginAttempts = loggingService.getAuthLogsByAction('login_attempt');
// Только попытки входа
```

### getAuthLogsByUser(userId)

```typescript
const userLogs = loggingService.getAuthLogsByUser('user_123');
// Все события конкретного пользователя
```

### getAuthStats()

```typescript
const stats = loggingService.getAuthStats();
// Возвращает:
// {
//   login_success: 5,
//   login_failed: 2,
//   token_refresh: 3,
//   ...
// }
```

### exportAuthLogs()

```typescript
const logsJson = loggingService.exportAuthLogs();
// Экспорт в JSON для анализа
```

## Интеграция с AuthService

```typescript
@Injectable()
export class AuthService {
  constructor(private loggingService: LoggingService) {}

  login(credentials: LoginData): Observable<AuthResult> {
    this.loggingService.logAuthEvent('login_attempt', undefined, {
      email: credentials.email,
      remember: credentials.remember
    });

    return this.http.post('/auth/login', credentials).pipe(
      tap(result => {
        if (result.success) {
          this.loggingService.setCurrentUserId(result.user.id);
          this.loggingService.logLoginAttempt(credentials.email, true);
        } else {
          this.loggingService.logLoginAttempt(credentials.email, false, result.message);
        }
      })
    );
  }

  logout(): void {
    const userId = this.getCurrentUserId();
    this.loggingService.logAuthEvent('logout', userId);
    this.loggingService.clearCurrentUserId();
    // ... остальная логика logout
  }
}
```

## Интеграция с ErrorHandlingService

```typescript
@Injectable()
export class ErrorHandlingService {
  constructor(private loggingService: LoggingService) {}

  handleError(errorResponse: ErrorResponse): void {
    // Автоматически логирует все ошибки
    this.loggingService.logErrorResponse(errorResponse);

    // Auth ошибки логируются специально
    if (errorResponse.status === 401) {
      this.loggingService.logSecurityEvent('unauthorized_access', {
        url: errorResponse.requestUrl,
        correlationId: errorResponse.correlationId
      });
    }
  }
}
```

## Структура AuthLogEntry

```typescript
interface AuthLogEntry {
  timestamp: string;       // ISO строка времени
  sessionId: string;       // ID сессии
  userId?: string;         // ID пользователя (если авторизован)
  action: AuthAction;      // Тип действия
  context: string;         // Контекст ('AuthEvent')
  message: string;         // Описание на русском
  metadata?: LogMetadata;  // Дополнительные данные
  level: 'info' | 'warn' | 'error'; // Уровень важности
  userAgent?: string;      // Браузер пользователя
  ip?: string;            // IP адрес (в реальном проекте)
}
```

## Конфигурация в environment

```typescript
export const environment = {
  enableLogging: true,        // Базовое логирование
  enableDebugMode: true,      // Debug сообщения
  production: false           // Отправка в мониторинг
};
```

## Мониторинг в production

В production режиме критические ошибки автоматически отправляются в сервис мониторинга:

```typescript
// Заглушка для интеграции с Sentry, LogRocket и т.д.
private sendToMonitoringService(context: string, message: string, metadata: LogMetadata): void {
  // Sentry.captureException(...);
  // LogRocket.captureException(...);
}
```

## Безопасность

### Что НЕ логируется

- Пароли и другие чувствительные данные
- Полные токены (только metadata)
- Личная информация пользователей

### Что логируется

- Email адреса (для аудита)
- ID пользователей
- Временные метки
- Результаты операций
- Причины ошибок

## Производительность

- Максимум 500 auth логов в памяти
- Автоматическая очистка старых записей
- Асинхронная отправка в мониторинг
- Минимальное влияние на UI поток

## Примеры использования

### При разработке

```typescript
// Отладка auth flow
console.log(loggingService.getAuthStats());
console.log(loggingService.exportAuthLogs());
```

### Мониторинг безопасности

```typescript
// Анализ неудачных попыток входа
const failedLogins = loggingService.getAuthLogsByAction('login_failed');
const suspiciousIPs = failedLogins
  .filter(log => log.metadata?.attempts > 3)
  .map(log => log.ip);
```

### Аудит пользователей

```typescript
// История действий пользователя
const userHistory = loggingService.getAuthLogsByUser('user_123');
const lastLogin = userHistory
  .filter(log => log.action === 'login_success')
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
```
