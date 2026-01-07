# Анализ реализации кнопки "Вставить" изображения

**Дата:** 7 января 2026 г.
**Источник:** Анализ `image-modal.component.ts` для реализации в TinyMCE плагине `av-image`

---

## 📋 Обзор

Документ описывает механизм вставки обработанного изображения в редактор на основе существующей реализации в Angular компоненте `image-modal.component.ts`.

---

## 🎯 Основной процесс (метод `applyAndInsert`)

### Последовательность действий

1. **Получение финального изображения**: `getFinalImage()` возвращает Data URL обработанного изображения
2. **Открытие ExportImageModal**: Модальное окно для выбора формата, качества и размера
3. **Обработка результата**: `handleExportComplete()` получает данные с сервера после загрузки

### Код из `image-modal.component.ts` (строки 1536-1580)

```typescript
async applyAndInsert(): Promise<void> {
  const finalImage = this.getFinalImage();

  if (!finalImage) {
    ToastNotificationComponent.show({
      type: 'error',
      message: 'Нет изображения для вставки',
    });
    return;
  }

  if (!this.imageData.metadata) {
    ToastNotificationComponent.show({
      type: 'error',
      message: 'Нет метаданных изображения',
    });
    return;
  }

  // ========== НОВАЯ ЛОГИКА: Открыть ExportImageModal ==========
  if (this.exportModal) {
    // Получаем размеры изображения
    const imageSize = await this.imageFileService.getImageDimensionsFromDataUrl(finalImage);

    console.log('📦 Opening ExportImageModal...', {
      width: imageSize.width,
      height: imageSize.height,
      dataUrlLength: finalImage.length,
      currentAlignment: this.config.alignment,
    });

    // Открываем модалку экспорта с текущими настройками выравнивания
    this.exportModal.open(finalImage, imageSize.width, imageSize.height, this.config.alignment);

    // ExportImageModal теперь отправит на сервер и вызовет handleExportComplete
    return;
  }

  // ========== FALLBACK: Старая логика (если exportModal не найден) ==========
  console.warn('⚠️ ExportImageModal not found, using fallback logic');
  await this.uploadToServerAndInsert(finalImage);
}
```

---

## 🔑 Ключевые компоненты

### 1. **Callback-механизм**

```typescript
// Определение callback (строка 392)
private callback?: (config: ImageConfig, imageUrl: string) => void;

// Получение callback при открытии (строка 714)
private handleOpenModal = (event: CustomEvent): void => {
  this.callback = event.detail.callback;
  this.open();
};

// Вызов callback для вставки (строка 1712)
if (this.callback) {
  this.callback(this.config, html);
}
```

**Принцип работы:**

- Callback передаётся через CustomEvent при открытии модалки
- Вызывается с двумя параметрами: `config` (настройки) и `html` (готовый HTML)
- Используется для вставки HTML в редактор

---

### 2. **Метод `buildImageHtml` (ImageUploadService)**

**Расположение:** `src/assets/editor/services/image-upload.service.ts` (строки 97-233)

Строит HTML для вставки в редактор:

```html
<figure class="aurora-image" data-image-id="..." data-align="..." data-width="...">
  <img class="aurora-image__img" src="..." alt="..." title="..." />
  <figcaption class="aurora-image__caption">...</figcaption>
</figure>
```

#### Поддерживаемые возможности:

- ✅ **Выравнивание** (left/center/right)
- ✅ **Размеры** (width/height)
- ✅ **Контейнер с фиксированными размерами** (useContainer + objectFit: cover/fill)
- ✅ **Ссылки** (linkUrl, clickable, openInNewWindow)
- ✅ **Подпись** (caption)
- ✅ **Alt и Title**

#### Параметры метода:

```typescript
interface BuildHtmlOptions {
  imageUrl: string;
  imageId: string;
  alt?: string;
  title?: string;
  caption?: string;
  width?: string | number;
  height?: string | number;
  clickable?: boolean;
  openInNewWindow?: boolean;
  alignment?: "left" | "center" | "right";
  linkUrl?: string;
  containerSettings?: {
    useContainer: boolean;
    containerWidth: number;
    containerHeight: number;
    objectFit: "cover" | "fill";
  };
}
```

#### Пример использования:

```typescript
const html = this.imageUploadService.buildImageHtml({
  imageUrl: result.imageUrl,
  imageId: result.imageId,
  alt: metadata?.alt || metadata?.title || "",
  caption: metadata?.caption || "",
  linkUrl: this.config.linkUrl || "",
  width: this.config.width || "100%",
  alignment: result.alignment || this.config.alignment || "center",
  containerSettings,
});
```

---

### 3. **Загрузка на сервер**

**Метод:** `uploadImageToServer(dataUrl: string, fileName: string)`

**Возвращает:**

```typescript
{
  success: boolean,
  imageId: string,
  imageUrl: string,
  error?: string
}
```

**Код из `uploadToServerAndInsert` (строки 1669-1710):**

```typescript
private async uploadToServerAndInsert(finalImage: string): Promise<void> {
  this.uploadState.isUploading = true;
  this.uploadState.uploadProgress = 0;
  this.uploadState.uploadError = null;

  try {
    const fileName = this.imageData.metadata?.fileName || 'image.png';

    console.log('📤 Uploading image to server...', { fileName });

    // Загружаем изображение через новый сервис
    const uploadResult = await this.imageUploadService.uploadImageToServer(finalImage, fileName);

    if (!uploadResult.success || !uploadResult.imageId || !uploadResult.imageUrl) {
      throw new Error(uploadResult.error || 'Не удалось загрузить изображение');
    }

    this.uploadState.serverImageId = uploadResult.imageId;

    console.log('✅ Image uploaded successfully:', {
      imageId: uploadResult.imageId,
      imageUrl: uploadResult.imageUrl,
    });

    // Получаем размеры изображения
    const dimensions = await this.imageUploadService.getImageDimensions(finalImage);

    // Построить HTML с URL от сервера
    const html = this.imageUploadService.buildImageHtml({
      imageUrl: uploadResult.imageUrl,
      imageId: uploadResult.imageId,
      alt: this.config.alt || '',
      title: this.config.title || '',
      caption: this.config.caption || '',
      width: dimensions.width,
      height: dimensions.height,
      clickable: this.config.clickable || false,
      openInNewWindow: this.config.openInNewWindow || false,
    });

    // Вставить в редактор через callback
    if (this.callback) {
      this.callback(this.config, html);
    }

    // Показать Toast успеха
    ToastNotificationComponent.show({
      type: 'success',
      message: 'Изображение загружено на сервер и вставлено',
      duration: 3000,
    });

    // Закрыть модальное окно
    this.close();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    this.uploadState.uploadError = errorMessage;

    console.error('❌ Failed to upload image:', error);

    ToastNotificationComponent.show({
      type: 'error',
      message: errorMessage,
      duration: 5000,
    });

    // НЕ закрываем модальное окно, чтобы пользователь мог повторить попытку
  } finally {
    this.uploadState.isUploading = false;
  }
}
```

---

## 🔄 Полная последовательность действий

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Пользователь нажимает "Вставить"                         │
│    → applyAndInsert()                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Получение финального изображения                         │
│    → getFinalImage() returns Data URL                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Открытие ExportImageModal                                │
│    → exportModal.open(dataUrl, width, height, alignment)    │
│    Пользователь выбирает формат/качество/размер             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ExportImageModal загружает на сервер                     │
│    → uploadImageToServer(dataUrl, fileName)                 │
│    Получает: { imageId, imageUrl }                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Вызов handleExportComplete(result)                       │
│    → Получает результат от сервера                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Построение HTML                                          │
│    → buildImageHtml({ imageUrl, imageId, ... })             │
│    Возвращает: <figure>...</figure>                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Вызов callback                                           │
│    → callback(config, html)                                 │
│    Вставляет HTML в редактор                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Показ уведомления + закрытие модалки                     │
│    → ToastNotificationComponent.show()                      │
│    → close()                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Адаптация для TinyMCE плагина `av-image`

### Что нужно реализовать в `plugin.js`:

#### 1. **Получить финальный canvas после всех обработок**

```javascript
// В классе AvModal
getFinalCanvas() {
  // Создаём временный canvas для финального рендеринга
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Копируем размеры из основного canvas
  canvas.width = this.canvas.width;
  canvas.height = this.canvas.height;

  // Рисуем основное изображение
  ctx.drawImage(this.canvas, 0, 0);

  // Применяем все активные слои (watermark, frame, etc.)
  if (this.watermarkEnabled) {
    this.watermarkManager.draw(ctx, canvas.width, canvas.height);
  }

  if (this.frameEnabled) {
    this.frameManager.draw(ctx, canvas.width, canvas.height);
  }

  return canvas;
}
```

#### 2. **Конвертировать в Data URL**

```javascript
const canvas = this.getFinalCanvas();
const dataUrl = canvas.toDataURL("image/png"); // или 'image/jpeg', 'image/webp'
```

#### 3. **Построить HTML аналогично `buildImageHtml`**

```javascript
buildImageHtml(imageUrl, options = {}) {
  const {
    imageId = `img-${Date.now()}`,
    alt = '',
    title = '',
    caption = '',
    width = '100%',
    alignment = 'center',
    linkUrl = '',
    clickable = false,
    openInNewWindow = false
  } = options;

  // Экранирование HTML
  const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  // Атрибуты figure
  const figureClass = 'aurora-image';
  const figureAttrs = [
    `class="${figureClass}"`,
    `data-image-id="${escapeHtml(imageId)}"`,
    `data-align="${alignment}"`,
    `data-width="${width}"`
  ];

  // Стили figure
  const figureStyles = [];

  if (alignment === 'left') {
    figureStyles.push('float: left', 'margin: 0 16px 8px 0');
  } else if (alignment === 'right') {
    figureStyles.push('float: right', 'margin: 0 0 8px 16px');
  } else if (alignment === 'center') {
    figureStyles.push('margin-left: auto', 'margin-right: auto', 'display: table');
  }

  if (width && width !== 'auto') {
    if (width.includes('%')) {
      figureStyles.push(`max-width: ${width}`);
    } else {
      figureStyles.push(`width: ${width}`);
    }
  }

  if (figureStyles.length > 0) {
    figureAttrs.push(`style="${figureStyles.join('; ')}"`);
  }

  // Тег img
  const imgTag = `<img class="aurora-image__img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(alt)}"${title ? ` title="${escapeHtml(title)}"` : ''} />`;

  // Обернуть в ссылку если нужно
  const finalLinkUrl = linkUrl || (clickable ? imageUrl : '');
  const imageContent = finalLinkUrl
    ? `<a href="${escapeHtml(finalLinkUrl)}"${openInNewWindow ? ' target="_blank" rel="noopener noreferrer"' : ''}>${imgTag}</a>`
    : imgTag;

  // Caption
  const captionTag = caption
    ? `<figcaption class="aurora-image__caption">${escapeHtml(caption)}</figcaption>`
    : '';

  // Финальный HTML
  return `<figure ${figureAttrs.join(' ')}>${imageContent}${captionTag}</figure>`;
}
```

#### 4. **Вставить в TinyMCE**

```javascript
// В обработчике кнопки "Вставить"
insertImage() {
  const canvas = this.getFinalCanvas();
  const dataUrl = canvas.toDataURL('image/png');

  // Опция 1: Вставить Data URL напрямую (без загрузки на сервер)
  const html = this.buildImageHtml(dataUrl, {
    imageId: `img-${Date.now()}`,
    alt: this.config.alt || '',
    width: this.config.width || '100%',
    alignment: this.config.alignment || 'center',
    caption: this.config.caption || ''
  });

  editor.insertContent(html);

  // Показать уведомление
  console.log('✅ Изображение вставлено в редактор');

  // Закрыть модальное окно
  api.close();
}

// Опция 2: Загрузить на сервер (если нужно)
async insertImageWithUpload() {
  const canvas = this.getFinalCanvas();
  const dataUrl = canvas.toDataURL('image/png');

  try {
    // Загрузить на сервер (через fetch API)
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: dataUrl,
        fileName: 'image.png'
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    // Построить HTML с URL от сервера
    const html = this.buildImageHtml(result.imageUrl, {
      imageId: result.imageId,
      alt: this.config.alt || '',
      width: this.config.width || '100%',
      alignment: this.config.alignment || 'center',
      caption: this.config.caption || ''
    });

    editor.insertContent(html);

    console.log('✅ Изображение загружено и вставлено');

    api.close();
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    alert('Не удалось загрузить изображение');
  }
}
```

#### 5. **Добавить обработчик кнопки "Вставить"**

```javascript
// В методе onclick класса AvModal
if (target.classList.contains("av-insert-btn")) {
  this.insertImage(); // или this.insertImageWithUpload() если нужна загрузка
  return;
}
```

---

## ❓ Вопросы для уточнения реализации

1. **Загрузка на сервер**

   - ❓ Нужна ли загрузка на сервер или достаточно Data URL?
   - ❓ Если нужна загрузка, какой endpoint использовать?

2. **Формат экспорта**

   - ❓ Нужен ли выбор формата (PNG/JPEG/WebP)?
   - ❓ Нужна ли настройка качества для JPEG?
   - ❓ Нужна ли возможность изменить размер перед экспортом?

3. **Контейнер**

   - ❓ Нужна ли поддержка контейнера с object-fit (cover/fill)?
   - ❓ Нужна ли возможность задать фиксированные размеры контейнера?

4. **Метаданные**

   - ❓ Какие поля обязательны: alt, title, caption, linkUrl?
   - ❓ Где хранить эти настройки (в отдельной вкладке "Настройки")?

5. **UI/UX**
   - ❓ Нужен ли прогресс загрузки?
   - ❓ Нужны ли Toast-уведомления об успехе/ошибке?
   - ❓ Должна ли модалка закрываться автоматически после вставки?

---

## 📝 Рекомендации

### Минимальная реализация (MVP):

1. ✅ Получить финальный canvas со всеми обработками
2. ✅ Конвертировать в Data URL (PNG)
3. ✅ Построить простой HTML: `<img src="data:..." />`
4. ✅ Вставить через `editor.insertContent(html)`
5. ✅ Закрыть модальное окно

### Расширенная реализация:

1. ✅ Выбор формата и качества
2. ✅ Загрузка на сервер
3. ✅ Поддержка метаданных (alt, caption, link)
4. ✅ Поддержка выравнивания и размеров
5. ✅ Toast-уведомления
6. ✅ Прогресс загрузки

---

## 🚀 План реализации

### Этап 1: Базовая вставка

- [ ] Создать метод `getFinalCanvas()`
- [ ] Добавить метод `insertImage()` с Data URL
- [ ] Подключить обработчик кнопки "Вставить"
- [ ] Протестировать вставку в TinyMCE

### Этап 2: HTML-форматирование

- [ ] Реализовать метод `buildImageHtml()`
- [ ] Добавить поддержку `<figure>` и `<figcaption>`
- [ ] Добавить data-атрибуты для идентификации
- [ ] Протестировать разметку

### Этап 3: Настройки изображения

- [ ] Добавить поля для alt, caption, linkUrl
- [ ] Добавить выбор выравнивания (left/center/right)
- [ ] Добавить настройку ширины
- [ ] Сохранять настройки в `this.config`

### Этап 4: Загрузка на сервер (опционально)

- [ ] Создать метод `uploadToServer(dataUrl)`
- [ ] Добавить индикатор загрузки
- [ ] Обработать ошибки загрузки
- [ ] Использовать server URL вместо Data URL

### Этап 5: Экспорт (опционально)

- [ ] Добавить выбор формата (PNG/JPEG/WebP)
- [ ] Добавить настройку качества для JPEG
- [ ] Добавить изменение размера перед экспортом
- [ ] Создать отдельное модальное окно экспорта

---

## 📚 Связанные файлы

- **Angular компонент:** `src/assets/editor/components/image-modal/image-modal.component.ts`
- **Сервис загрузки:** `src/assets/editor/services/image-upload.service.ts`
- **TinyMCE плагин:** `src/assets/tinymce/plugins/av-image/plugin.js`

---

## 📅 История изменений

- **2026-01-07** - Создан анализ реализации на основе image-modal.component.ts

---

_Документ создан для планирования реализации кнопки "Вставить" в TinyMCE плагине av-image на основе существующей архитектуры Angular компонента._
