# Скрипт заполнения данных платформ

## Описание

Скрипт `seed-platforms.ps1` предназначен для автоматического заполнения базы данных начальным набором платформ через API.

## Требования

- PowerShell 5.1 или выше
- Доступ к API (локальный или удаленный)
- JWT токен авторизации (если API защищен)
- Права на создание платформ (роль Admin или ContentManager)

## Использование

### Базовый запуск (локальный API)

```powershell
cd helps
.\seed-platforms.ps1
```

По умолчанию:

- API URL: `http://localhost:5000`
- Приоритет: 1 (только основные 6 платформ)
- Перезаписывает существующие

### С параметрами

```powershell
# Указать URL API
.\seed-platforms.ps1 -ApiUrl "https://api.example.com"

# С токеном авторизации
.\seed-platforms.ps1 -Token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Пропустить существующие платформы
.\seed-platforms.ps1 -SkipExisting

# Расширенный набор (включая PWA, HarmonyOS)
.\seed-platforms.ps1 -Priority 2

# Полный набор с игровыми консолями
.\seed-platforms.ps1 -Priority 3

# Все параметры вместе
.\seed-platforms.ps1 `
  -ApiUrl "https://api.example.com" `
  -Token "your-jwt-token" `
  -SkipExisting `
  -Priority 2
```

## Параметры

| Параметр       | Тип    | По умолчанию            | Описание                                         |
| -------------- | ------ | ----------------------- | ------------------------------------------------ |
| `ApiUrl`       | string | `http://localhost:5000` | URL API сервера                                  |
| `Token`        | string | _(пусто)_               | JWT токен для авторизации                        |
| `SkipExisting` | switch | `false`                 | Не перезаписывать существующие платформы         |
| `Priority`     | int    | `1`                     | Уровень данных: 1=основные, 2=расширенные, 3=все |

## Приоритеты данных

### Priority 1 (Минимум) - 6 платформ

Основные платформы для старта:

- Windows Desktop
- macOS
- Linux
- Android
- iOS
- Web Application

### Priority 2 (Расширенный) - +3 платформы

Дополнительно к Priority 1:

- Progressive Web App (PWA)
- HarmonyOS (Huawei)
- Chrome OS (Chromebook)

### Priority 3 (Полный) - +4 платформы

Дополнительно к Priority 2:

- PlayStation (PS4/PS5)
- Xbox (Series X/S)
- Nintendo Switch
- Steam Deck

## Примеры вывода

### Успешное выполнение

```
╔═══════════════════════════════════════════════════════════════╗
║          ЗАПОЛНЕНИЕ БАЗЫ ДАННЫХ ПЛАТФОРМАМИ                  ║
╚═══════════════════════════════════════════════════════════════╝

Параметры запуска:
  API URL: http://localhost:5000
  Приоритет данных: 1
  Пропускать существующие: False

Начинаем создание платформ (6 шт.)...

[1/6] Обработка: Windows Desktop (windows)
  ✓ Успешно создано (ID: a1b2c3d4-...)

[2/6] Обработка: macOS (macos)
  ✓ Успешно создано (ID: e5f6g7h8-...)

...

╔═══════════════════════════════════════════════════════════════╗
║                    РЕЗУЛЬТАТЫ ВЫПОЛНЕНИЯ                      ║
╚═══════════════════════════════════════════════════════════════╝

✓ Успешно создано:  6

Всего обработано:   6

Завершено: 2026-02-02 15:30:45
```

### С пропуском существующих

```
[1/6] Обработка: Windows Desktop (windows)
  ⊘ Уже существует, пропускаем

[2/6] Обработка: macOS (macos)
  ✓ Успешно создано (ID: e5f6g7h8-...)

...

✓ Успешно создано:  3
⊘ Пропущено:        3
```

### С ошибками

```
[3/6] Обработка: Linux (linux)
  ✗ Ошибка создания: 401 Unauthorized
  Ответ сервера: {"message": "Invalid token"}

...

✓ Успешно создано:  4
✗ Ошибок:           2
```

## Структура создаваемых данных

Каждая платформа включает:

```json
{
  "name": "Windows Desktop",
  "code": "windows",
  "family": "desktop",
  "isActive": true,
  "sortOrder": 10,
  "translations": [
    {
      "languageId": 1,
      "languageCode": "ru",
      "name": "Windows",
      "description": "Операционная система Microsoft Windows...",
      "seoData": {
        "title": "Скачать приложение для Windows",
        "description": "Загрузите официальное приложение...",
        "keywords": "windows, скачать, приложение"
      }
    }
  ]
}
```

## Получение JWT токена

### Через Swagger UI

1. Откройте `http://localhost:5000/swagger`
2. Авторизуйтесь через `/api/auth/login`
3. Скопируйте токен из ответа

### Через PowerShell

```powershell
$loginBody = @{
    email = "admin@example.com"
    password = "YourPassword123"
} | ConvertTo-Json

$response = Invoke-RestMethod `
  -Uri "http://localhost:5000/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body $loginBody

$token = $response.token
Write-Host "Token: $token"

# Использовать в скрипте
.\seed-platforms.ps1 -Token $token
```

## Проверка результатов

### Через API

```powershell
# Получить список платформ
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/platforms?pageSize=20"

# Получить конкретную платформу
Invoke-RestMethod -Uri "http://localhost:5000/api/v1/platforms/{id}"
```

### Через админ-панель

1. Откройте браузер
2. Перейдите на страницу платформ: `/platforms`
3. Проверьте список созданных записей

## Устранение неполадок

### Ошибка: "Invoke-RestMethod: Unable to connect"

**Причина:** API сервер не запущен или неверный URL

**Решение:**

```powershell
# Проверьте, что API запущен
curl http://localhost:5000/health

# Или укажите правильный URL
.\seed-platforms.ps1 -ApiUrl "http://localhost:7000"
```

### Ошибка: "401 Unauthorized"

**Причина:** Требуется авторизация или токен невалиден

**Решение:**

```powershell
# Получите новый токен и передайте его
.\seed-platforms.ps1 -Token "your-valid-jwt-token"
```

### Ошибка: "400 Bad Request" - "Code already exists"

**Причина:** Платформа с таким кодом уже существует

**Решение:**

```powershell
# Используйте флаг -SkipExisting
.\seed-platforms.ps1 -SkipExisting
```

### Ошибка: "403 Forbidden"

**Причина:** Недостаточно прав для создания платформ

**Решение:**

- Проверьте роль пользователя (должна быть Admin или ContentManager)
- Авторизуйтесь под пользователем с правами админа

## Интеграция в CI/CD

### GitHub Actions

```yaml
- name: Seed platforms
  run: |
    pwsh -File helps/seed-platforms.ps1 `
      -ApiUrl ${{ secrets.API_URL }} `
      -Token ${{ secrets.ADMIN_TOKEN }} `
      -SkipExisting `
      -Priority 2
```

### Docker

```dockerfile
RUN pwsh -File /app/helps/seed-platforms.ps1 \
    -ApiUrl "http://api:5000" \
    -Priority 1
```

## Дополнительная информация

- Полное ТЗ: `@docs/платформы-ТЗ.md`
- API документация: `/swagger` на вашем API сервере
- Модели данных: `src/app/pages/platform-manager/models/platform.model.ts`

## Поддержка

При возникновении проблем:

1. Проверьте логи API сервера
2. Убедитесь, что БД доступна
3. Проверьте права пользователя
4. Изучите ответ сервера в выводе скрипта

---

**Версия:** 1.0
**Дата:** 2 февраля 2026 г.
