# План создания модуля LanguageOfAggregator (Frontend)

Этот документ описывает архитектурный план создания модуля управления языками агрегатора.

## 1. Описание задачи
Необходимо реализовать интерфейс для управления сущностью `LanguageOfAggregator`, которая определена на бэкенде. Модуль должен поддерживать полный цикл CRUD операций, а также специфичные действия (установка по умолчанию, переключение RTL).

## 2. Соответствие модели данных
На основе `LanguageOfAggregator.cs`, фронтенд модель будет включать:
- `id: number`
- `code: string` (BCP-47)
- `shortCode: string`
- `title: string`
- `nativeTitle: string`
- `enabled: boolean`
- `isDefault: boolean`
- `isRtl: boolean`
- `sortOrder: number`
- `isSystem: boolean`
- `iconPath: string`

## 3. Архитектура (согласно Modular Guide)
Модуль будет организован в папку `src/app/AGREGATOR/PAGES/SPRAVKA/LanguageOfAggregator/`:

- **models/**: описание интерфейсов.
- **services/**: 
    - `LanguageAggregatorApiService`: общение с бэкендом.
    - `LanguageAggregatorService`: управление состоянием через Signals.
- **components/**:
    - `LanguageAggregatorManagerComponent`: основная таблица и шапка.
    - `LanguageAggregatorModalComponent`: диалоговое окно редактирования.
- **end-points.ts**: реестр эндпоинтов (например, `languages-aggregator`).

## 4. UI Дизайн
- Использование таблиц Ng-Zorro (`nz-table`).
- Кнопки действий (Edit, Delete, Set Default).
- Визуальное отображение флагов/иконок через `IconPath`.
- Поддержка темы Aurora Admin.

## 5. Интеграция
- Регистрация в `app.routes.ts`.
- Добавление в `sidebar-default.config.ts` в раздел «Агрегатор -> Справочники».
