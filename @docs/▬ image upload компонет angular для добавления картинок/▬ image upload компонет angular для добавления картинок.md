# ТЗ: Angular Image Upload Component (AvImageUploader)

## 🎯 Цели и Задачи

Создать профессиональный, переиспользуемый Angular-компонент для управления изображениями в административной панели Aurora. Компонент должен полностью заменить устаревшие JS/jQuery решения и предоставить нативный опыт работы с графикой прямо в браузере.

**Ключевые возможности:**

1.  Загрузка изображений (Drag & Drop, Paste from Clipboard, File Select).
2.  Редактирование "на лету" (Crop, Resize, Rotate, Flip).
3.  Оптимизация (Конвертация в WebP/JPG, настройки качества).
4.  Ватермарки (Автоматическое наложение логотипа).
5.  Глобальное использование (встраивание в формы через `ControlValueAccessor` и вызов как сервис).

---

## 🛠 Технический Стек

- **Framework**: Angular 19+ (Standalone Components).
- **State Management**: Angular Signals (`signal`, `computed`, `effect`).
- **UI Library**: Ng-Zorro-Antd (`NzModal`, `NzSlider`, `NzUpload`, `NzButton`).
- **Graphics**: Native Canvas API (без тяжелых сторонних библиотек типа Cropper.js, пишем своё легковесное решение).
- **API**: `HttpClient` для отправки `FormData`.

---

## 🏗 Архитектура

### 1. Сервисы (`shared/services/image-flow`)

- `AvImageProcessingService`: "Мозг" обработки. Чистые функции для работы с Canvas.
  - `filesConfig`: интерфейс, настройки (maxSize, formats).
  - `process(file: File, ops: ImageOperations): Observable<Blob>`
  - `crop(canvas, rect)`
  - `resize(canvas, width, height)`
- `AvImageUploadApi`: Сервис общения с бэкендом.
  - `upload(blob: Blob, metadata): Observable<string>` (возвращает URL).

### 2. Компоненты (`shared/components/av-image-uploader`)

- `ImagePickerComponent`: **(Smart)** Обертка для форм (`ControlValueAccessor`).
  - Отображает: Превью текущей картинки, кнопку "Изменить/Загрузить", кнопку "Удалить".
  - Открывает модальное окно.
- `ImageEditorModalComponent`: **(Smart)** Основное модальное окно.
  - Управляет стейтом редактирования (текущий зум, кроп, настройки).
- `CropCanvasComponent`: **(Dumb)** Компонент отображения Canvas и сетки кропа.
  - Рисует картинку.
  - Рисует оверлей (затемнение).
  - Обрабатывает мышиные события (Drag & Drop рамок).

---

## ✅ Чек-лист Реализации (Roadmap)

### Этап 1: Инфраструктура и Тестовая среда

- [ ] Создать структуру папок (`shared/components/av-image-uploader`, `shared/services`).
- [ ] Создать тестовую страницу `pages/tools/test-av-image`.
- [ ] Добавить роут и пункт меню "ТЕСТЫ -> Image Uploader".

### Этап 2: Базовый сервис обработки (Core)

- [ ] Реализовать `AvImageProcessingService`.
- [ ] Метод `readAsDataUrl(file)`: Чтение файла.
- [ ] Метод `loadImage(url)`: Загрузка изображения в `HTMLImageElement`.
- [ ] Метод `resize(img, width, height)`: Базовый ресайз через Canvas.
- [ ] Проверка на тестовой странице (выбрать файл -> показать превью).

### Этап 3: Компонент Кроппера (Canvas Logic)

- [ ] Создать `CropCanvasComponent`.
- [ ] Отрисовка изображения по центру Canvas.
- [ ] Отрисовка полупрозрачного оверлея (затемнение фона).
- [ ] Реализация "рамки" (Rect) с ручками (Handles) по углам.
- [ ] Логика перетаскивания (Drag) рамки.
- [ ] Логика изменения размера рамки (Resize) за углы.
- [ ] Ограничение выхода рамки за пределы изображения.

### Этап 4: Модальное окно Редактора (UI)

- [ ] Создать `ImageEditorModalComponent`.
- [ ] Верстка лейаута:
  - Левая колонка: Canvas (Кроппер).
  - Правая колонка: Настройки (Размеры, Поворот, Формат, Качество).
- [ ] Подключение `CropCanvasComponent`.
- [ ] Реализация зума (Zoom In/Out) колесиком и кнопками.
- [ ] Кнопки поворота (Rotate 90deg) и отражения (Flip H/V).

### Этап 5: Экспорт и Загрузка

- [ ] Добавить настройки экспорта в UI (JPG/WebP, Quality Slider).
- [ ] Реализовать метод `generateBlob()`: получение итогового файла из Canvas с учетом кропа и ресайза.
- [ ] Реализовать `AvImageUploadApi` (Mock или реальный POST запрос).
- [ ] Связать кнопку "Сохранить" с отправкой на сервер.

### Этап 6: Picker (Интеграция в формы)

- [ ] Создать `ImagePickerComponent`.
- [ ] Реализовать `ControlValueAccessor` (writeValue, registerOnChange).
- [ ] Верстка "карточки" превью (как в Figma/существующем дизайне).
- [ ] Интеграция в `SampleMainSeoFormComponent` вместо текстового инпута.

---

## 🎨 Требования к UI/UX

1.  **Современность**: Использовать Glassmorphism, аккуратные тени, плавные анимации.
2.  **Отзывчивость**: Кроппер должен работать плавно, без лагов (использовать `requestAnimationFrame`).
3.  **Удобство**:
    - Поддержка вставки картинки из буфера обмена (Ctrl+V) при открытой модалке.
    - Отображение итогового веса файла (KB/MB) _до_ загрузки.
    - Индикация прогресса загрузки.
4.  **Пресеты**: Должны быть кнопки быстрых форматов (16:9, 1:1, 4:3, "Оригинал").

---

## 📝 Заметки разработчика

- Использовать `OnPush` стратегию изменений.
- Все тяжелые операции с Canvas выносить из Main Thread (в идеале WebWorker, но для начала Service).
- Не забыть про очистку URL через `URL.revokeObjectURL` для предотвращения утечек памяти.
