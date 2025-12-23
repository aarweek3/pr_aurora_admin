# Copilot Instructions for PrAuroraAdmin

## Архитектура и основные компоненты

- Проект построен на Angular, структура разделена на модули: `auth`, `core`, `features`, `layout`, `pages`, `shared`.
- Макеты:
  - `AuthLayoutComponent` — для страниц авторизации, использует Ng Zorro UI.
  - `MainLayoutComponent` — основной макет приложения после авторизации, с навигацией, профилем, хлебными крошками.
- UI компоненты и директивы (`shared/components/ui`):
  - Кнопки: директива `av-button` для стилизованных и семантических кнопок.
  - Поля ввода: директива `avInput` и компонент `av-input` с поддержкой label, hint, error.
  - Теги: компонент `av-tag` для статусов, категорий, с поддержкой иконок, удаления, клика.
  - Пагинация: компонент `av-pagination` с продвинутым API и событиями.

## Важные паттерны и соглашения

- Все UI компоненты используют префикс `av-` для Angular директив и компонентов.
- Для иконок используйте компонент `<av-icon>` и SVG из `assets/icons`.
- Стили разделены по SCSS-папкам: `abstracts`, `base`, `components`, `layout`, `utilities`, `vendors`.
- Для роутинга используйте файлы `app.routes.ts`, `auth.routes.ts` и соответствующие модули.
- Сервисы и модели лежат в папках `services/` и `models/` внутри соответствующих модулей.

## Сборка, запуск и тестирование

- Запуск dev-сервера с SSL и HMR: используйте npm-скрипт `start:ssl` или задачу VS Code `ng serve (dev + SSL + HMR)`.
- Сборка production: `ng build` или задача `ng build (production)`.
- Юнит-тесты: `ng test` (или задача `ng test (watch)` для режима watch).
- Линтинг: `ng lint`.

## Интеграции и зависимости

- Основной UI — [Ng Zorro](https://ng.ant.design/docs/angular/introduce/ru), компоненты интегрированы через модули.
- Для авторизации и работы с пользователями используйте сервисы из `auth/services` и модели из `auth/models`.
- Внешние API и endpoints — конфигурируются через файлы в `environments/`.

## Примеры типовых паттернов

- Кнопка с загрузкой:
  ```html
  <button av-button [avLoading]="isLoading()">Сохранить</button>
  ```
- Поле ввода с ошибкой:
  ```html
  <av-input label="Email" [status]="'error'" [errorMessage]="emailError"></av-input>
  ```
- Пагинация с обработчиком:
  ```html
  <av-pagination [total]="100" (paginationChange)="onChange($event)"></av-pagination>
  ```

## Рекомендации для AI-агентов

- Соблюдайте структуру модулей и префиксы компонентов.
- Для новых UI-элементов используйте существующие директивы и компоненты.
- При добавлении новых сервисов и моделей — размещайте их в соответствующих папках.
- Для интеграции с API — используйте сервисы и конфиги из `environments/`.

---

Если какие-то разделы требуют уточнения или примеры, пожалуйста, уточните!
