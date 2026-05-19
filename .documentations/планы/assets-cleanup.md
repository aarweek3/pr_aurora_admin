# План рефакторинга src/assets (Code Evacuation)

**Цель**: Очистить папку `assets` от исходного кода (.ts), перенести компоненты и сервисы в `src/app` и привести проект к стандартам Angular.

---

## 🏗 Этап 6: Эвакуация LanguageApp
**Место назначения**: `src/app/features/language-app/`

- [x] **6.1. Перенос структуры**:
  - [x] `assets/languageApp/components/` -> `src/app/features/language-app/components/`
  - [x] `assets/languageApp/services/` -> `src/app/features/language-app/services/`
  - [x] `assets/languageApp/models/` -> `src/app/features/language-app/models/`
  - [x] `assets/languageApp/config/` -> `src/app/features/language-app/config/`
  - [x] `assets/languageApp/utils/` -> `src/app/features/language-app/utils/`
- [x] **6.2. Рефакторинг путей**: Исправить все внутренние импорты внутри LanguageApp.
- [x] **6.3. Обновление эндпоинтов**: Перенести `end-points.ts` в `environments/api-endpoints.ts` или оставить в локальном конфиге фичи.

## 🛠 Этап 7: Перенос UI-Контролов
**Место назначения**: `src/app/shared/components/controls/`

- [x] **7.1. Markdown Control**: Перенести `assets/controls/markdown-control/` -> `shared/components/controls/markdown-control/`.
- [x] **7.2. TinyMCE Control**: Перенести `assets/controls/tinymce-control/` -> `shared/components/controls/tinymce-control/`.
- [x] **7.3. Индексация**: Добавить новые контролы в `shared/components/ui/index.ts` (или создать отдельный индекс для контролов).

## 🧪 Этап 8: Организация тестовых страниц
**Место назначения**: `src/app/pages/debug-tools/`

- [x] **8.1. Миграция тестов**: Перенести все папки из `assets/tests/` в `src/app/pages/debug-tools/`.
- [x] **8.2. Роутинг**: Обновить маршруты для доступа к тестовым страницам (если они нужны в runtime).

## 📊 Этап 9: Константы и Данные
- [x] **9.1. Icon Presets**: `assets/constants/icon-presets.const.ts` -> `src/app/core/constants/icon-presets.const.ts`.
- [x] **9.2. Dictionaries**: Если словари — это TS-файлы, перенести их в `src/app/core/data/` или `shared/data/`.

---

## 🧹 Финализация
- [x] **Обновление импортов**: Глобальный поиск и замена всех импортов, указывающих на `assets/.../*.ts`.
- [x] **Очистка angular.json**: Убедиться, что сборщик не пытается обрабатывать TS в ассетах.
