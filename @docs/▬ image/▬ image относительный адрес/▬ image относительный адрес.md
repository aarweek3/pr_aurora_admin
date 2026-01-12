# Документация: Работа с относительными путями изображений (Frontend & Backend)

Данный документ описывает архитектуру работы с изображениями в проекте Aurora, с фокусом на использование **относительных путей** (`/uploads/...`) для обеспечения совместимости между средами (Development, Staging, Production).

---

## 1. Концепция

Мы отказались от использования абсолютных путей (вида `https://localhost:7233/uploads/...` или `https://api.domain.com/uploads/...`) в контенте сайта.

**Почему?**

1.  **Переносимость**: База данных может быть развернута на любом домене без необходимости миграции ссылок.
2.  **Dev/Prod паритет**: Ошибки смешанного контента (HTTP vs HTTPS) исключаются, так как путь начинается от корня сайта.
3.  **Proxy**: В режиме разработки мы используем проксирование, чтобы Angular Dev Server (`:4200`) прозрачно запрашивал файлы у Backend (`:7233`).

---

## 2. Backend (ASP.NET Core)

Сервер отвечает за сохранение файлов и отдачу статики.

### 2.1. Сохранение файла

При загрузке изображения (например, через контроллер `ImageUploadTinyController` или `AvImageStudioController`), сервер сохраняет файл в физическую папку `wwwroot/uploads`.

**Формат пути возвращаемого сервером:**
Сервер возвращает JSON с полем `url` (или `imageUrl`), содержащим **относительный путь** от корня веб-сервера.

Пример ответа:

```json
{
  "success": true,
  "url": "/uploads/images/2026/01/11/my-image-ab12cd.jpg",
  "imageId": "..."
}
```

### 2.2. Раздача статики

В `Program.cs` настроена раздача статических файлов. Это позволяет запрашивать файлы напрямую по путям, начинающимся с `/uploads`.

---

## 3. Frontend (Angular) - Настройка среды

Чтобы Angular Dev Server (работающий на порту `4200`) мог отдавать картинки, лежащие на Бэкенде (порт `7233`), используется механизм **Proxy**.

### 3.1. Конфигурация Proxy (`src/proxy.conf.json`)

Создан файл конфигурации, который перенаправляет запросы, начинающиеся с `/api` и `/uploads`, на бэкенд.

```json
{
  "/api": {
    "target": "https://localhost:7233",
    "secure": false,
    "changeOrigin": true
  },
  "/uploads": {
    "target": "https://localhost:7233",
    "secure": false,
    "changeOrigin": true
  }
}
```

### 3.2. Подключение в `angular.json`

Файл прокси подключен в настройки запуска сервера (`serve`).

```json
"architect": {
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "proxyConfig": "src/proxy.conf.json"
    },
    ...
  }
}
```

**Результат:**
Когда браузер запрашивает `http://localhost:4200/uploads/image.jpg`, Angular пересылает запрос на `https://localhost:7233/uploads/image.jpg`. Картинка загружается корректно, при этом для браузера путь остается относительным.

---

## 4. Компоненты UI

### 4.1. Студия изображений (`AvImageStudioModalComponent`)

Компонент был модифицирован, чтобы **не превращать** полученный от сервера путь обратно в абсолютный.

**Логика сохранения (`av-image-studio-modal.component.ts`):**

```typescript
// ... внутри метода save()
if (uploadResponse.success) {
  // ВАЖНО: Мы сохраняем именно относительный путь, который вернул сервер.
  // Мы НЕ используем ApiEndpoints.getImageUrl() здесь, чтобы не добавлять домен.
  result.dataUrl = uploadResponse.url; // Например: "/uploads/images/..."
}
this.closeModal(result);
```

### 4.2. Плагин TinyMCE (`av-image`)

Плагин редактора также настроен на работу с "сырым" URL от сервера.

**Файл `src/assets/tinymce/plugins/av-image/plugin.js`**:

```javascript
// ... внутри метода uploadImage().then(...)
var imageUrl = result.imageUrl;

// Раньше здесь был код, добавляющий 'https://localhost:7233'
// Теперь мы используем imageUrl как есть.

var imgTag = '<img src="' + imageUrl + '" ... >';
editor.insertContent(imgTag);
```

**Итоговый HTML в редакторе:**

```html
<figure ...>
  <img src="/uploads/images/2026/01/11/image-name.jpg" alt="" ... />
</figure>
```

---

## 5. Тестирование и `TestImageStudioComponent`

В отладочном стенде мы убрали принудительную конвертацию путей через `ApiEndpoints.getImageUrl`.

**Было:**

```typescript
const fullUrl = ApiEndpoints.getImageUrl(res.dataUrl); // Превращало в http://localhost:7233/...
```

**Стало:**

```typescript
const fullUrl = res.dataUrl; // Используем "/uploads/..." напрямую
```

При использовании `bypassSecurityTrustHtml`, Angular корректно рендерит тег `<img src="/uploads/...">`, который затем подхватывается DevServer Proxy.

---

## Резюме

1. **Server**: Возвращает `/uploads/...`.
2. **Proxy**: Прокидывает `/uploads/` -> `:7233`.
3. **Client**: Вставляет в DOM `<img src="/uploads/...">`.

Это решение гарантирует, что контент, созданный в Dev окружении, будет корректно работать на Prod окружении без дополнительных обработок ссылок в базе данных.
