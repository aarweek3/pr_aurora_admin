# Техническое задание: Image Studio VS (av-image-editor-vs)

## На базе движка VS Modal Compromise

### 1. Цель проекта

Создать полностью автономный, высокопроизводительный компонент для редактирования и подготовки изображений к публикации. Компонент должен сочетать в себе эстетику Visual Studio Code / Photoshop и базироваться на гибридном движке модальных окон `VS Modal Compromise`.

### 2. Ключевые принципы

- **Автономность (Self-contained)**: Все модели, сервисы и компоненты находятся внутри модуля. Никаких внешних зависимостей, кроме базового UI-движка.
- **Производительность**: Использование Canvas API для отрисовки и трансформации изображений.
- **UX/UI**: Профессиональный темный интерфейс с фиксированными панелями управления.
- **Реактивность**: Использование Angular Signals для управления состоянием редактора.

---

### 3. Архитектура модуля

**Путь:** `src/app/shared/components/av-image-editor-vs/`

#### 📂 Структура папок:

- `models/`: Интерфейсы состояния (`ImageState`), конфигурации и типов инструментов.
- `services/`:
  - `image-canvas.service.ts`: Математика, отрисовка, зум, обрезка.
  - `image-export.service.ts`: Генерация финального файла, работа с качеством.
- `components/`:
  - `image-editor-main/`: Основной контейнер-контент для модального окна.
  - `editor-sidebar/`: Панель выбора инструментов (лево).
  - `editor-control-panel/`: Параметры активного инструмента (право).
  - `editor-canvas/`: Рабочая область с холстом.
  - `editor-footer/`: Кнопки "Отмена" и "Готово".
  - `editor-status-bar/`: Техническая информация об изображении.

---

### 4. Чек-лист реализации (Roadmap)

#### 🟩 Фаза 1: Основание (Скелет) — [В ПРОЦЕССЕ 🟢]

- [x] Создать структуру папок модуля.
- [x] Описать базовые модели: `EditorState`, `ExportConfig`.
  - [Модель состояния](../../src/app/shared/components/av-image-editor-vs/models/editor-state.model.ts)
  - [Конфигурация и результат](../../src/app/shared/components/av-image-editor-vs/models/editor-config.model.ts)
- [x] Создать сервис управления состоянием `ImageEditorStateService`.
  - [Сервис состояния](../../src/app/shared/components/av-image-editor-vs/services/image-editor-state.service.ts)
- [x] Создать тестовый стенд для отладки верстки и логики.
  - [Стенд отладки](../../src/app/pages/tools/test-image-editor-vs/test-image-editor-vs.component.ts)
- [x] Перенести и адаптировать верстку из `compromise-test-content` в `ImageEditorMainComponent`:
  - [Основной компонент](../../src/app/shared/components/av-image-editor-vs/components/image-editor-main/image-editor-main.component.ts)
  - [Шаблон компонента](../../src/app/shared/components/av-image-editor-vs/components/image-editor-main/image-editor-main.component.html)
  - [Стили компонента](../../src/app/shared/components/av-image-editor-vs/components/image-editor-main/image-editor-main.component.scss)
  - [x] Трехпанельный макет (Сайдбар, Холст, Контрол-панель).
  - [x] Стилизация в стиле Aurora Studio (Photoshop dark).
  - [x] Интеграция нового статус-бара и футера.

#### 🟦 Фаза 2: Движок Canvas (Сердце) — [СЛЕДУЮЩИЙ ШАГ 🚀]

- [ ] Создать сервис `ImageCanvasService` для математики и рендеринга.
- [ ] Создать компонент `EditorCanvasComponent` (обертка над `<canvas>`).
- [ ] Реализовать загрузку изображения на Canvas.
- [ ] Система масштабирования (Zoom) и центрирования.
- [ ] Реализовать сетку и направляющие (Guides).
- [ ] **Инструмент "Обрезка" (Crop)**:
  - [ ] Визуальная рамка кропа поверх изображения.
  - [ ] Выбор пресетов соотношения сторон (1:1, 16:9, Custom).
  - [ ] Ручной ввод размеров области кропа.

#### 🟧 Фаза 3: Панель управления и инструменты

- [ ] Реализовать выбор формата (JPEG, PNG, WebP).
- [ ] Слайдер качества (Quality) с мгновенным обновлением веса (ориентировочно).
- [ ] Кнопки быстрого выравнивания (Align: Left, Center, Right).
- [ ] Интеграция чекбоксов (Прогрессивный JPEG, Сохранение прозрачности).

#### 🟨 Фаза 4: Экспорт и Интеграция

- [ ] Метод генерации результирующего `Blob` / `Base64`.
- [ ] Логика закрытия модалки через `modalRef.close(result)`.
- [ ] Создание публичного контрола `AvImageEditorVsComponent` (Picker) для использования в формах.

---

### 5. Требования к UI (Стиль Aurora)

- **Цвета**: Фон контейнера `#252525`, панели `#1e1e1e`, акценты `#007acc` (VS Blue).
- **Типографика**: Шрифт Segoe UI / Inter, размер 11px для подписей, консольный шрифт для статус-бара.
- **Интерактивы**: Photoshop-style ползунки (sliders), кнопки с четкими границами, плавные hover эффекты.

---

### 6. Входные и Выходные данные

**Input (`EditorConfig`)**:

- `imageUrl`: string
- `aspectRatio`: number (optional)
- `targetWidth/Height`: number (optional)

**Output (`EditorResult`)**:

- `file`: Blob / File
- `dataUrl`: string
- `dimensions`: { width, height }
- `format`: string
- `quality`: number
