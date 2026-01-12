📋 Структура компонента TinyMCE
⚙️ Конфигурация редактора
🔌 Встроенные и внешние плагины
🎨 Настройка toolbar
🔄 Жизненный цикл компонента
📝 Примеры использования
🔧 Инструкция по добавлению новых кнопок
📚 Полезные ссылки

# 📚 Общие понятия TinyMCE

## 📁 Основной файл конфигурации

**Путь:** `src\app\shared\components\ui\tinymce-editor\tinymce-editor.component.ts`

Этот файл - **Angular компонент для интеграции TinyMCE редактора**. Разберу по частям:

---

## 📋 Что настраивает этот файл:

### **1. Angular компонент-обёртка**
```typescript
@Component({
  selector: 'app-tinymce-editor',  // Как использовать: <app-tinymce-editor>
  standalone: true,                 // Standalone компонент
  template: ` <textarea #editor></textarea> `,  // Простой textarea
})
```

### **2. Входные параметры**
```typescript
@Input() value = '';         // Начальное содержимое редактора
@Input() height = 400;       // Высота редактора (px)
@Input() disabled = false;   // Режим только для чтения
```

### **3. Выходное событие**
```typescript
@Output() valueChange = new EventEmitter<string>();  // Событие при изменении текста
```

---

## ⚙️ **Конфигурация TinyMCE**

### **Базовые настройки**
```typescript
target: this.editorRef.nativeElement,  // К какому элементу привязать редактор
height: this.height,                   // Высота из @Input
base_url: '/assets/tinymce',           // Путь к папке TinyMCE
menubar: true,                         // Показывать верхнее меню
branding: false,                       // Убрать "Powered by TinyMCE"
language: 'ru',                        // Русский язык
language_url: '/assets/tinymce/langs/ru.js',  // Файл локализации
```

### **Плагины**
Список **встроенных** плагинов TinyMCE:
- `accordion` - Аккордеоны
- `advlist` - Продвинутые списки
- `anchor` - Якоря для навигации
- `autolink` - Автоматическое преобразование URL в ссылки
- `autoresize` - Автоматическое изменение размера
- `autosave` - Автосохранение
- `charmap` - Вставка специальных символов
- `code` - Редактирование HTML кода
- `codesample` - Вставка примеров кода с подсветкой
- `directionality` - Направление текста (LTR/RTL)
- `emoticons` - Эмодзи
- `fullscreen` - Полноэкранный режим
- `help` - Справка
- `image` - Вставка изображений
- `importcss` - Импорт CSS стилей
- `insertdatetime` - Вставка даты и времени
- `link` - Вставка ссылок
- `lists` - Списки
- `media` - Вставка медиа (видео, аудио)
- `nonbreaking` - Неразрывный пробел
- `pagebreak` - Разрыв страницы
- `preview` - Предпросмотр
- `quickbars` - Быстрые панели инструментов
- `save` - Сохранение
- `searchreplace` - Поиск и замена
- `table` - Вставка таблиц
- `visualblocks` - Визуализация блоков
- `visualchars` - Визуализация невидимых символов
- `wordcount` - Подсчёт слов

### **Внешние (кастомные) плагины**
```typescript
external_plugins: {
  letterspacing: '/assets/tinymce/plugins/letterspacing/plugin.js',  // Межбуквенный интервал
  footnotes: '/assets/tinymce/plugins/footnotes/plugin.js',           // Сноски
  'av-youtube': '/assets/tinymce/plugins/av-youtube/plugin.js',      // Вставка YouTube
  'av-align-image': '/assets/tinymce/plugins/av-align-image/plugin.js',  // Выравнивание картинок
}
```

### **Toolbar (панель инструментов)**
Три строки кнопок:

**Строка 1:** Основное форматирование
```
letterspacing | undo redo code | accordion blocks fontfamily fontsize lineheight | bold italic underline strikethrough | forecolor backcolor
```

**Строка 2:** Выравнивание, списки, медиа
```
alignleft aligncenter alignright alignjustify | image-align-left image-align-center image-align-right | bullist numlist outdent indent | link image media table | av-youtube charmap emoticons codesample nonbreaking footnotes | hr blockquote subscript superscript | removeformat
```
☝️ Здесь находятся кнопки выравнивания изображений: `image-align-left image-align-center image-align-right`

**Строка 3:** Утилиты и помощь
```
searchreplace fullscreen preview | save restoredraft pagebreak anchor insertdatetime | visualblocks visualchars wordcount | ltr rtl | help
```

### **События**
```typescript
setup: (editor: any) => {
  this.editorInstance = editor;

  // При инициализации редактора
  editor.on('init', () => {
    editor.setContent(this.value || '');              // Загрузить начальное содержимое
    editor.setMode(this.disabled ? 'readonly' : 'design');  // Режим чтения/редактирования
  });

  // При изменении текста
  editor.on('Change KeyUp', () => {
    this.valueChange.emit(editor.getContent());       // Отправить событие в Angular
  });
}
```

---

## 🔄 **Жизненный цикл компонента**

### **При создании**
```typescript
ngAfterViewInit(): void {
  this.loadScript().then(() => this.initEditor());  // 1. Загрузить TinyMCE скрипт
                                                     // 2. Инициализировать редактор
}
```

### **При удалении**
```typescript
ngOnDestroy(): void {
  if (this.editorInstance) {
    tinymce.remove(this.editorInstance);  // Очистить память
  }
}
```

### **Загрузка скрипта**
```typescript
private loadScript(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).tinymce) {
      resolve();  // TinyMCE уже загружен
      return;
    }

    const script = document.createElement('script');
    script.src = '/assets/tinymce/tinymce.min.js';  // Загрузить основной файл
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}
```

---

## 📝 **Как использовать компонент:**

```typescript
// В другом компоненте
<app-tinymce-editor
  [value]="initialContent"
  [height]="600"
  [disabled]="false"
  (valueChange)="onContentChange($event)">
</app-tinymce-editor>
```

**Пример в TypeScript:**
```typescript
export class MyComponent {
  editorContent = '<p>Начальное содержимое</p>';

  onContentChange(newContent: string) {
    console.log('Содержимое изменено:', newContent);
    this.editorContent = newContent;
  }
}
```

---

## 🎯 **Итог:**

Этот файл - **единая точка конфигурации** TinyMCE редактора в вашем Angular приложении. Здесь настраивается:
- ✅ Какие плагины использовать
- ✅ Какие кнопки показывать в toolbar
- ✅ Язык интерфейса
- ✅ Поведение редактора
- ✅ События для интеграции с Angular

---

## 🔧 **Как добавить новую кнопку в toolbar:**

1. Создать плагин в `src/assets/tinymce/plugins/your-plugin/plugin.js`
2. Зарегистрировать кнопку через `editor.ui.registry.addButton()`
3. Добавить плагин в массив `plugins`
4. Добавить плагин в `external_plugins`
5. Добавить ID кнопки в нужную строку `toolbar`

---

## 📚 **Полезные ссылки:**

- [TinyMCE Documentation](https://www.tiny.cloud/docs/)
- [TinyMCE API Reference](https://www.tiny.cloud/docs/api/)
- [TinyMCE Plugin Development](https://www.tiny.cloud/docs/advanced/creating-a-plugin/)
- [TinyMCE Icon Reference](https://www.tiny.cloud/docs/advanced/editor-icon-identifiers/)

---

**Дата обновления:** 8 января 2026 г.
