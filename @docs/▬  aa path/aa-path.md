# 🌐 Модуль Платформ и Языков: Справочная информация

Этот документ содержит технические детали, структуру файлов и тестовые данные для работы с платформами и языками в системе Aurora Admin.

---

## 🏗️ Архитектура Backend (C#)

Модели на сервере
Platform.cs - базовая модель платформы
PlatformTranslation.cs = локализванные имена и description

### Add yjную платформу

D:\_PROGECT\pr_aurora_admin\src\app\pages\platform-manager\components\platform-page\platform-page.component.ts

### Структура проекта

```text
pr_srv_names/
├── DAL/                          # Уровень доступа к данным
│   ├── Models/Business/
│   │   ├── Platform.cs           # Основная модель EF (Платформа)
│   │   ├── PlatformTranslation.cs # Локализация платформы
│   │   └── SoftwareVersionPlatform.cs # Связи
│   ├── Constants/
│   │   └── PlatformConstants.cs  # Лимиты и константы
│   └── Repositories/
│       ├── PlatformRepository.cs
│       └── Interfaces/
│           └── IPlatformRepository.cs
└── Project_Server_Auth/          # API и Бизнес-логика
    ├── Controllers/
    │   └── PlatformController.cs # REST API
    └── Pages/Platform/
        ├── Dtos/
        │   └── PlatformDto.cs
        ├── Interfaces/
        │   └── IPlatformService.cs
        └── Services/
            ├── PlatformService.cs # Основная логика
            ├── PlatformProfile.cs # AutoMapper
            └── PlatformValidator.cs # Валидация
```

---

## 💾 База данных (SQL)

Database=DbNames

> [!NOTE]
> Платформы поддерживают мультиязычность. Основные данные хранятся в `platform`, переводы — в `platform_translation`.

```sql
-- Основная таблица с глобальными настройками
CREATE TABLE platform (
    Id uniqueidentifier PRIMARY KEY,
    Name nvarchar(100) NOT NULL,
    Code nvarchar(50) NOT NULL UNIQUE,
    Family nvarchar(50) NULL,
    UrlPictureMain nvarchar(500) NULL, -- Главная картинка
    IsActive bit NOT NULL DEFAULT 1,
    SortOrder int NOT NULL DEFAULT 100,
    CreatedAt datetime2 NOT NULL,
    UpdatedAt datetime2 NOT NULL
);

-- Таблица локализации (RU/EN/etc)
CREATE TABLE platform_translation (
    Id int IDENTITY PRIMARY KEY,
    PlatformId uniqueidentifier NOT NULL,
    LanguageId int NOT NULL,
    Name nvarchar(100) NOT NULL,
    Description nvarchar(500) NULL,
    UrlPicture nvarchar(500) NULL,     -- Локализованная картинка
    SeoDataId int NULL,
    CreatedAt datetime2 NOT NULL,
    UpdatedAt datetime2 NOT NULL,

    FOREIGN KEY (PlatformId) REFERENCES platform(Id) ON DELETE CASCADE,
    UNIQUE (PlatformId, LanguageId)
);
```

---

## 🛣️ Роутинг (Angular)

Конфигурация маршрутов для управления платформами:

```typescript
// app.routes.ts
{
  path: '',
  component: PlatformManagerComponent, // Список платформ
},
{
  path: 'new',
  component: PlatformPageComponent,    // Страница создания
},
{
  path: ':id/edit',
  component: PlatformPageComponent,    // Страница редактирования
}
```

### ⚙️ Режимы работы `PlatformPageComponent`

Компонент определяет режим работы автоматически в `ngOnInit()`:

- **Создание** (`/platforms/new`) → `mode = 'add'` (пустая форма).
- **Редактирование** (`/platforms/:id/edit`) → `mode = 'edit'` (загрузка данных по `id`).

---

## 📝 Тестовые данные для QA

Используйте эти данные для проверки корректности создания и отображения платформ.

### 🏁 Вариант 1: Windows (Desktop)

| Поле           | Значение                                      |
| :------------- | :-------------------------------------------- |
| **Название**   | Windows                                       |
| **Код**        | `windows-pc`                                  |
| **Семейство**  | Microsoft                                     |
| **Main Image** | `https://example.com/images/windows-main.png` |
| **Активна**    | ✅ Да                                         |
| **Порядок**    | 100                                           |

<details>
<summary><b>Локализация и SEO (RU/EN)</b></summary>

#### 🇷🇺 Русский (Russian)

- **Описание**: Операционная система Windows — самая популярная платформа для персональных компьютеров...
- **SEO Title**: Программы для Windows — Скачать лучшее ПО
- **SEO Desc**: Полный каталог программ для ОС Windows. Безопасное ПО.
- **Slug**: `windows-programmy`

#### 🇬🇧 Английский (English)

- **Name**: Windows
- **Description**: Windows operating system is the most popular platform for personal computers...
- **SEO Title**: Windows Software — Download Best Programs
- **Slug**: `windows-software`
</details>

### � Вариант 2: PlayStation 5 (Console)

| Поле          | Значение         |
| :------------ | :--------------- |
| **Название**  | PlayStation 5    |
| **Код**       | `playstation-5`  |
| **Семейство** | Sony PlayStation |
| **Активна**   | ✅ Да            |
| **Порядок**   | 200              |

<details>
<summary><b>Локализация и SEO (RU/EN)</b></summary>

#### 🇷🇺 Русский (Russian)

- **Описание**: PlayStation 5 — игровая консоль нового поколения от Sony с поддержкой 4K...
- **Slug**: `igry-playstation-5`

#### 🇬🇧 Английский (English)

- **Name**: PlayStation 5
- **Description**: PlayStation 5 is a next-generation gaming console from Sony...
- **Slug**: `playstation-5-games`
</details>

---

## 🌍 Управление языками

Основной компонент управления списком языков:
`language-manager.component.ts`

---

## 🛠️ Вспомогательные компоненты

- `SampleMainSeoModalComponent` — Модальное окно для управления SEO-данными внутри платформ.
- **Расположение**: `sample-main-seo-modal/`

---

_Документация обновлена в соответствии со стандартом верстки Aurora._
