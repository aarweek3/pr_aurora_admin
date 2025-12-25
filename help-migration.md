# 📋 Методология переверстывания UI-компонентов в Aurora Control Pattern

## 🎯 **Цель:** Превратить старый демо-компонент в унифицированный Control-компонент

## 🚀 **ОБНОВЛЕНИЕ v2.0: Универсальные компоненты и глобальные стили**

### **Новые паттерны архитектуры (декабрь 2024):**

1. **🔄 Универсальный компонент документации** - `ControlDocumentationComponent`

   - **Цель:** Полностью исключить copy-paste документации между UI компонентами
   - **Путь:** `src/app/shared/components/ui/control-documentation/`
   - **Использование:** Создать `.config.ts` файл с `ControlDocumentationConfig`

2. **🎨 Глобальные стили UI компонентов**

   - **Цель:** Исключить "фейковые" стили в demo-компонентах
   - **Путь:** `src/styles/components/_[component].scss`
   - **Принцип:** Стили кнопки должны быть в `_button.scss`, а не в `button-demo.component.scss`

3. **📦 SCSS Mixins для demo-компонентов**
   - **Цель:** DRY для повторяющихся demo-стилей (форм, контейнеров, превью)
   - **Путь:** `src/styles/abstracts/_ui-demo-mixins.scss`
   - **Использование:** `@use "../../../../styles/abstracts/ui-demo-mixins" as mixins; @include mixins.control-demo-base-styles;`

### **Современный пример миграции (ButtonControlAurora v2):**

```typescript
// button-control-aurora.config.ts - Универсальная документация
export const BUTTON_CONTROL_DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: { name: 'ButtonControlAuroraComponent', path: '...', ... },
  controlComponent: { name: 'ButtonSettingsControlComponent', path: '...', ... },
  mainDescription: { componentTitle: 'ButtonSettingsControl', ... },
  // ... остальная конфигурация
};

// button-control-aurora.component.ts - Использование
readonly documentationConfig = BUTTON_CONTROL_DOCUMENTATION;

// button-control-aurora.component.html - Замена copy-paste
<div showcase-docs>
  <control-documentation [config]="documentationConfig"></control-documentation>
</div>

// button-control-aurora.component.scss - Только demo-стили
@use "../../../../styles/abstracts/ui-demo-mixins" as mixins;
@include mixins.control-demo-base-styles;
// НЕТ СТИЛЕЙ КНОПКИ - они в src/styles/components/_button.scss
```

## � **Базовый эталон миграции**

Данная методология основана на **успешной миграции:**

- **ИЗ:** `ButtonControlAuroraComponent` (`src/app/pages/ui-demo/button-control-aurora/`)
- **В:** `DialogControlAuroraComponent` (`src/app/pages/ui-demo/dialog-control-aurora/`)

**Эталонный компонент для копирования архитектуры:**

```
src/app/pages/ui-demo/button-control-aurora/button-control-aurora.component.ts
```

## 🎛️ **Матрица компонентов: что включать?**

| Целевой компонент | IconSettingsControl | PickerComponent | Специфика                  |
| ----------------- | ------------------- | --------------- | -------------------------- |
| Button            | ✅ Да               | ✅ Да           | bgColor, textColor         |
| Modal/Dialog      | ✅ Да               | ❌ Нет          | Только иконка в контенте   |
| Input             | ❌ Нет              | ✅ Да           | borderColor, focusColor    |
| Tag               | ✅ Да               | ✅ Да           | background, border, icon   |
| Icon              | ✅ Да               | ❌ Нет          | Только IconSettingsControl |
| Toggle/Switch     | ❌ Нет              | ✅ Да           | activeColor, trackColor    |

**Правило принятия решения:**

- **IconSettingsControl:** если компонент может содержать иконку
- **PickerComponent:** если компонент имеет цветовые свойства (кроме иконки)

## �📁 **Структура файлов (обязательно):**

```
your-component-control-aurora/
├── your-component-control-aurora.component.ts
├── your-component-control-aurora.component.html
├── your-component-control-aurora.component.scss
└── your-component-control-aurora.docs.ts          ← ОБЯЗАТЕЛЬНО!
```

## 🧩 **Этап 1: TypeScript Architecture**

## 🚀 **Этап 0: Анализ и подготовка**

### Определите источник миграции:

- **Типичные источники:** `dialog-icon-ui`, `button-icon-ui`, `input-demo`, etc.
- **Местоположение:** `src/app/pages/ui-demo/{старый-компонент}/`

### Выберите что мигрировать:

1. **TypeScript логику** (интерфейсы, методы)
2. **HTML разметку** (только полезную часть)
3. **Стили SCSS** (адаптировать под новую структуру)

### Проверьте зависимости:

- Что использует старый компонент?
- Какие сервисы/модели нужны?
- Есть ли специфичные библиотеки?

## � **Примеры готовой миграции:**

### 1. **ButtonControlAurora** → **DialogControlAurora**

```bash
Источник: src/app/pages/ui-demo/button-control-aurora/
Цель:     src/app/pages/ui-demo/dialog-control-aurora/
```

- Скопирована архитектура ShowcaseConfig + сигналы
- Заменены Button-специфичные поля на Dialog-специфичные
- IconSettings: ✅ (для иконки в диалоге)
- Picker: ❌ (диалогу цвета не нужны)

### 2. **Ваш будущий компонент** → **{Name}ControlAurora**

```bash
Источник: src/app/pages/ui-demo/{old-component}/
Цель:     src/app/pages/ui-demo/{name}-control-aurora/
```

---

## �🏗️ **Этап 1: Создание TypeScript архитектуры**

### **🎯 Выбор правильной обёртки:**

| Компонент              | Использовать | Когда                                                             |
| ---------------------- | ------------ | ----------------------------------------------------------------- |
| **ShowcaseComponent**  | ✅ **ДА**    | Control компоненты (button-control-aurora, dialog-control-aurora) |
| **WrapperUiComponent** | ❌ **НЕТ**   | Простые демо без генерации кода                                   |

**Правило:** Для унификации Control компонентов **ВСЕГДА** используйте `ShowcaseComponent`!

```typescript
// Core Angular
import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

// UI Framework (ng-zorro)
import { Nz*Module } from 'ng-zorro-antd/*';

// Aurora UI System (ОБЯЗАТЕЛЬНО!)
import { ShowcaseComponent, ShowcaseConfig } from '../../../shared/components/ui/showcase/showcase.component';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { IconSettingsControlComponent } from '../../../shared/components/ui/icon/icon-settings-control/icon-settings-control.component';

/**
 * 🔍 ВАЖНО: Какую обёртку использовать?
 *
 * 📦 ShowcaseComponent (рекомендуется для Control компонентов):
 * - Путь: src/app/shared/components/ui/showcase/showcase.component.ts
 * - Селектор: <av-showcase>
 * - Назначение: Полнофункциональная обёртка с табами, генерацией кода, конфигурацией
 * - Используется в: button-control-aurora, dialog-control-aurora
 *
 * 📦 WrapperUiComponent (для простых демо):
 * - Путь: src/app/shared/components/ui/wrapper-ui/wrapper-ui.component.ts
 * - Селектор: <av-wrapper-ui>
 * - Назначение: Простая обёртка без сложной логики
 * - Используется в: простые демо-компоненты
 *
 * ✅ Для унификации Control компонентов → ВСЕГДА используйте ShowcaseComponent
 */

// Целевой компонент для демонстрации
import { YourTargetComponent } from '../../../shared/components/ui/your-target/';

// Документация
import { IMPORT_DOC, SETUP_DOC, /*...*/ } from './your-component-control-aurora.docs';
```

### **Обязательная структура сигналов:**

```typescript
export class YourComponentControlAuroraComponent {
  // ===== SHOWCASE CONFIGURATION (ОБЯЗАТЕЛЬНО!) =====
  showcaseConfig = signal<ShowcaseConfig>({
    headerConfig: {
      title: "Your Component Control 🎨",
      description: "Интерактивный конструктор для YourComponent",
      componentName: "YourComponent",
      componentPath: "src/app/shared/components/ui/your-target/",
      controlComponent: {
        name: "YourComponentControlAuroraComponent",
        path: "src/app/pages/ui-demo/your-component-control-aurora/",
      },
    },
  });

  // ===== TARGET COMPONENT CONFIGURATION =====
  targetConfig = signal<YourComponentConfig>({
    // Все настраиваемые свойства целевого компонента
  });

  // ===== UI STATE =====
  feedbackMessage = signal("");

  // ===== COMPUTED: CODE GENERATION (ОБЯЗАТЕЛЬНО!) =====
  generatedCode = computed(() => {
    const config = this.targetConfig();
    return `<!-- Generated HTML -->\n<your-component [prop]="${config.prop}"></your-component>`;
  });

  // ===== DOCUMENTATION (ОБЯЗАТЕЛЬНО!) =====
  readonly docs = {
    import: IMPORT_DOC,
    setup: SETUP_DOC,
    // ... остальные константы из .docs.ts
  };
}
```

## 🧩 **Этап 2: HTML Template Structure**

### **Обязательная структура:**

```html
<av-showcase [config]="showcaseConfig()" [generatedCodeInput]="generatedCode()">
  <!-- ===== ЛЕВАЯ ПАНЕЛЬ: Контролы ===== -->
  <div showcase-tabs>
    <nz-tabset [nzAnimated]="false">
      <!-- ===== PLAYGROUND TAB (ОБЯЗАТЕЛЬНО!) ===== -->
      <nz-tab nzTitle="🎮 Playground">
        <div class="demo-form">
          @if (feedbackMessage()) {
          <div class="message-toast">{{ feedbackMessage() }}</div>
          }

          <!-- Контролы для настройки целевого компонента -->
          <div class="target-controls">
            <h3 class="form-section-title">Настройки компонента</h3>

            <!-- Ваши контролы здесь -->
            <div class="control-group">
              <label class="control-label">Свойство:</label>
              <input nz-input [(ngModel)]="targetConfig().prop" />
            </div>

            <!-- Если нужно управление иконкой -->
            <av-icon-settings-control [(value)]="iconConfig" [compact]="true" />
          </div>
        </div>
      </nz-tab>

      <!-- ===== DOCUMENTATION TABS (ОБЯЗАТЕЛЬНО!) ===== -->
      <nz-tab nzTitle="📖 Импорт">
        <av-help-copy-container [content]="docs.import" />
      </nz-tab>

      <nz-tab nzTitle="⚙️ Настройка">
        <av-help-copy-container [content]="docs.setup" />
      </nz-tab>

      <nz-tab nzTitle="📝 Template">
        <av-help-copy-container [content]="docs.template" />
      </nz-tab>

      <nz-tab nzTitle="🔧 API">
        <av-help-copy-container [content]="docs.api" />
      </nz-tab>

      <nz-tab nzTitle="💡 Использование">
        <av-help-copy-container [content]="docs.usage" />
      </nz-tab>
    </nz-tabset>
  </div>

  <!-- ===== ПРАВАЯ ПАНЕЛЬ: Preview ===== -->
  <div showcase-content>
    <div class="preview-container">
      <div class="preview-header">
        <h4>Предпросмотр компонента</h4>
      </div>

      <div class="preview-demo">
        <!-- ВАШ ЦЕЛЕВОЙ КОМПОНЕНТ ЗДЕСЬ -->
        <your-target-component [prop1]="targetConfig().prop1" [prop2]="targetConfig().prop2" />
      </div>
    </div>
  </div>
</av-showcase>
```

## 🧩 **Этап 3: Documentation (.docs.ts)**

### **📋 Структура файла документации:**

```typescript
// your-component-control-aurora.docs.ts

// 1. ИМПОРТ - как подключить компонент
export const IMPORT_DOC = `import { YourComponent } from '@shared/components/ui/your-target';`;

// 2. НАСТРОЙКА - как настроить в Angular компоненте
export const SETUP_DOC = `@Component({
  imports: [YourComponent],  // standalone компонент
  template: \`<your-component />\`
})
export class MyComponent {}`;

// 3. ОСНОВНОЙ ШАБЛОН - базовое использование
export const TEMPLATE_DOC = `<your-component
  [prop1]="'значение'"
  [prop2]="true"
  [prop3]="configObject"
  (eventName)="onEvent($event)">
</your-component>`;

// 4. API ИНТЕРФЕЙС - типы и свойства
export const API_DOC = `interface YourComponentConfig {
  prop1: string;           // Обязательное свойство
  prop2?: boolean;         // Опциональное свойство
  prop3?: ConfigObject;    // Сложный объект
}

// События компонента
interface YourComponentEvents {
  eventName: (value: any) => void;
}`;

// 5. ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ - реальные кейсы
export const USAGE_EXAMPLE = `// 🎯 Базовое использование
<your-component
  [prop1]="'default-value'"
  [prop2]="true">
</your-component>

// 🎨 С кастомной конфигурацией
<your-component
  [prop1]="customValue"
  [prop2]="false"
  [prop3]="{ option1: 'value', option2: true }"
  (eventName)="handleEvent($event)">
</your-component>

// 🚀 Продвинутый пример с сигналами
export class ExampleComponent {
  config = signal({ prop1: 'signal-value', prop2: true });

  handleEvent(event: any) {
    console.log('Event received:', event);
  }
}`;

// 6. ПРЕСЕТЫ - готовые конфигурации
export const PRESETS_DOC = `// 📦 Готовые пресеты для быстрого использования

export const COMPONENT_PRESETS = {
  // Стандартная конфигурация
  default: {
    prop1: 'default',
    prop2: true,
    prop3: { theme: 'light' }
  },

  // Минимальная конфигурация
  minimal: {
    prop1: 'minimal'
  },

  // Продвинутая конфигурация
  advanced: {
    prop1: 'advanced',
    prop2: false,
    prop3: {
      theme: 'dark',
      animation: true,
      duration: 300
    }
  }
};

// Использование пресетов
<your-component [config]="COMPONENT_PRESETS.default"></your-component>`;

// 7. ЛУЧШИЕ ПРАКТИКИ - правила использования
export const BEST_PRACTICES_DOC = `/**
 * 🎯 Лучшие практики использования YourComponent
 */

// ✅ ПРАВИЛЬНО: Используйте корректные типы данных
<your-component
  [prop1]="stringValue"
  [prop2]="booleanValue">
</your-component>

// ✅ ПРАВИЛЬНО: Обработка событий с типизацией
onEvent(event: YourComponentEvent) {
  // Типизированная обработка
}

// ✅ ПРАВИЛЬНО: Реактивность с сигналами
config = signal<YourComponentConfig>({
  prop1: 'reactive-value'
});

// ❌ НЕПРАВИЛЬНО: Неподходящие типы
<your-component
  [prop1]="123"           // Ожидается string
  [prop2]="'string'">     // Ожидается boolean
</your-component>

// ❌ НЕПРАВИЛЬНО: Отсутствие обработки ошибок
// Всегда обрабатывайте возможные ошибки`;

// 8. ПРИМЕРЫ ИНТЕГРАЦИИ - как встроить в проект
export const INTEGRATION_DOC = `// 🔧 Интеграция в существующий проект

// 1. В app.component.ts
import { YourComponent } from './shared/components/ui/your-component';

@Component({
  imports: [YourComponent],
  template: \`
    <div class="app-container">
      <your-component [config]="appConfig"></your-component>
    </div>
  \`
})

// 2. С формами
<form [formGroup]="myForm">
  <your-component
    [prop1]="myForm.get('field')?.value"
    (eventName)="updateForm($event)">
  </your-component>
</form>

// 3. С роутингом
<your-component
  [prop1]="route.snapshot.params['param']"
  (navigate)="router.navigate(['/path'])">
</your-component>`;
```

### **🗂️ Обязательные табы в компоненте:**

1. **📥 Import** - как подключить (`IMPORT_DOC`)
2. **⚙️ Setup** - настройка Angular (`SETUP_DOC`)
3. **📝 Template** - основной шаблон (`TEMPLATE_DOC`)
4. **📋 API** - интерфейсы и типы (`API_DOC`)
5. **💡 Использование** - примеры кода (`USAGE_EXAMPLE`)
6. **📦 Пресеты** - готовые конфигурации (`PRESETS_DOC`)
7. **✅ Практики** - правила использования (`BEST_PRACTICES_DOC`)
8. **🔧 Интеграция** - встраивание в проект (`INTEGRATION_DOC`)

### **📌 Как привязать к HTML:**

```html
<nz-tab nzTitle="📥 Import">
  <av-help-copy-container [content]="docs.import" />
</nz-tab>
<nz-tab nzTitle="⚙️ Setup">
  <av-help-copy-container [content]="docs.setup" />
</nz-tab>
<!-- ... остальные табы аналогично -->
```

## 🧩 **Этап 4: SCSS Styles**

> **⚠️ ТЕХНИЧЕСКАЯ ЗАМЕТКА (DRY нарушение):**
> Данный подход копирует ~130 строк стилей в каждый компонент, что нарушает DRY принцип.
> **Причина:** Для скорости миграции изолированность > архитектурная чистота.
> **План на будущее:** После завершения миграции всех компонентов вынести общие стили в миксин `_ui-demo-mixins.scss` и рефакторить.
> **Сейчас:** Copy-Paste обеспечивает надежность и независимость компонентов.

### **📋 РЕАЛЬНЫЙ ПРИМЕР из ButtonControlAuroraComponent:**

```scss
// Стили для button-control-aurora компонента (607 строк)

// ===== 1. ОБЩИЕ СТИЛИ ФОРМЫ (копировать всегда) =====
.demo-form {
  padding: 24px 0;
}

.form-section-title {
  margin-bottom: 24px;
}

// ===== 2. КОНТРОЛЫ КОМПОНЕНТА (адаптировать под ваш компонент) =====
.button-controls {
  // Отладочная тень (можно убрать)
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  padding: 16px;
  border-radius: 8px;
}

.button-controls .control-group {
  margin-bottom: 20px;
  display: flex;
  align-items: center;

  .control-label {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 0;
    margin-right: 16px;
    min-width: 100px;
  }

  nz-radio-group {
    display: flex;
    flex-wrap: nowrap;
    gap: 16px;

    label[nz-radio] {
      margin: 0;
      white-space: nowrap;
    }
  }

  input[nz-input] {
    width: 100%;
    flex: 1;
  }

  &.checkbox-group {
    display: flex;
    gap: 24px;
  }
}

// ===== 3. DASHED SETTINGS BOX (универсальный) =====
.dashed-settings-box {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;

  .control-item {
    display: flex;
    align-items: center;
    gap: 8px;

    .label {
      font-size: 14px;
      font-weight: 500;
      color: #262626;
    }
  }
}

// ===== 4. PREVIEW КОНТЕЙНЕР (копировать всегда) =====
.preview-container {
  padding: 24px;
  text-align: center;

  .button-preview {
    // ← ЗАМЕНИТЬ НА .your-component-preview
    padding: 48px;
    background: white;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    // ===== СПЕЦИФИЧНЫЕ СТИЛИ ДЛЯ ВАШЕГО КОМПОНЕНТА =====
    // В Button: стили для button[av-button]
    // В Modal: стили для модального окна
    // В Input: стили для input элементов
  }
}

// ===== 5. ДОПОЛНИТЕЛЬНЫЕ СТИЛИ (200+ строк Button-специфичных стилей) =====
// Для Button: состояния hover, active, варианты primary/danger/ghost
// Для вашего компонента: замените на специфичные стили
```

### **🔧 Как адаптировать под ваш компонент:**

1. **Копируйте общие стили** (demo-form, preview-container)
2. **Замените имена классов:**
   ```scss
   .button-controls → .your-component-controls
   .button-preview → .your-component-preview
   ```
3. **Адаптируйте специфичные стили:**
   - Button: стили кнопок и hover-эффектов
   - Modal: стили модального окна
   - Input: стили полей ввода
   - Tag: стили тегов и статусов

### **📊 Структура стилей ButtonControlAurora (607 строк):**

- **Общие стили:** ~50 строк (копировать всегда)
- **Контролы:** ~100 строк (адаптировать под ваш компонент)
- **Preview:** ~50 строк (копировать всегда)
- **Специфичные стили:** ~400 строк (заменить на ваши)

### **⚡ Быстрая адаптация:**

1. **Ctrl+H** замените `button` на `your-component`
2. **Удалите** Button-специфичные стили (hover, active, variants)
3. **Добавьте** стили для вашего компонента
4. **Сохраните** общую структуру

## 🧩 **Этап 5: Integration**

### **1. Route добавить:**

```typescript
// ui-demo.routes.ts
{
  path: 'your-component-control-aurora',
  loadComponent: () => import('./your-component-control-aurora/your-component-control-aurora.component')
    .then(m => m.YourComponentControlAuroraComponent)
}
```

### **2. Menu пункт:**

```typescript
// sidebar-default.config.ts
{
  id: 'your-component-control-aurora',
  label: 'Your Component Control Aurora',
  route: '/ui-demo/your-component-control-aurora',
  icon: 'component', // подходящая иконка
  badge: {
    value: 'New',
    intent: 'success'
  }
}
```

## ✅ **Чек-лист готовности компонента:**

### **Архитектура:**

- [ ] `ShowcaseComponent` как обёртка ✅
- [ ] `HelpCopyContainerComponent` для документации ✅
- [ ] `generatedCode()` computed с автогенерацией ✅
- [ ] `.docs.ts` файл с полным набором констант ✅

### **Функциональность:**

- [ ] Playground tab с интерактивными контролами ✅
- [ ] Preview с рабочим компонентом ✅
- [ ] Feedback система (toasts) ✅
- [ ] Методы обновления конфигурации ✅

### **Документация (минимум 5 табов):**

- [ ] 📖 Импорт - как импортировать ✅
- [ ] ⚙️ Настройка - базовая настройка ✅
- [ ] 📝 Template - примеры HTML ✅
- [ ] 🔧 API - интерфейсы и типы ✅
- [ ] 💡 Использование - примеры кода ✅

### **Интеграция:**

- [ ] Route в ui-demo.routes.ts ✅
- [ ] Пункт меню в sidebar ✅
- [ ] Правильные пути импортов ✅

## 🚀 **Примеры реализованных компонентов:**

1. **ButtonControlAuroraComponent** - эталонная реализация
2. **DialogControlAuroraComponent** - модальные окна
3. **IconControlAuroraComponent** - управление иконками
4. **ColorComponentAuroraComponent** - выбор цветов

## 💡 **Лучшие практики:**

### **Именование:**

- Компонент: `{Target}ControlAuroraComponent`
- Файлы: `{target}-control-aurora.*`
- Route: `/{target}-control-aurora`

### **Структура:**

- Всегда используйте signals для реактивности
- Computed для автоматической генерации кода
- Отдельный .docs.ts для документации
- ShowcaseComponent как единая обёртка

### **UX:**

- Feedback система для действий пользователя
- Интерактивные контролы с instant preview
- Полная документация с примерами кода
- Копирование сгенерированного кода

---

**🎉 Этот паттерн позволяет быстро создавать единообразные, документированные и интерактивные демонстрации любых UI-компонентов!**

---

## 🚨 **КРИТИЧЕСКИЕ ДОПОЛНЕНИЯ:**

## 📝 **Детальный алгоритм миграции v2.0 (пошагово):**

### **Шаг 0: Анализ глобальных стилей (НОВОЕ, 5 минут)**

```bash
1. Проверьте существование: src/styles/components/_{target-component}.scss
2. Если файл НЕ существует - создайте его для глобальных стилей
3. Если существует - проанализируйте, нужно ли добавить новые варианты
4. ПРИНЦИП: Демо НЕ должно содержать стили целевого компонента!
```

### **Шаг 1: Подготовка конфигурации документации (НОВОЕ, 10 минут)**

```bash
1. Создайте файл: src/app/pages/ui-demo/{name}-control-aurora/{name}-control-aurora.config.ts
2. Скопируйте структуру из: button-control-aurora.config.ts
3. Измените все данные на актуальные для вашего компонента:
   - demoComponent.name: 'YourControlAuroraComponent'
   - controlComponent.name: 'YourSettingsControlComponent'
   - mainDescription: описание функционала
   - apiDetails: Input/Output/Methods вашего компонента
   - usageExamples: примеры кода использования
```

### **Шаг 2: Подготовка (5-10 минут)**

```bash
1. Откройте старый компонент: src/app/pages/ui-demo/{old-name}/
2. Изучите {old-name}.component.ts - найдите:
   - Какие свойства компонента демонстрируются
   - Какие интерфейсы используются
   - Какие методы обработки событий есть
3. Определите целевой UI-компонент (av-button, av-modal, etc.)
4. По матрице решите: IconSettings? Picker? Специфика?
```

### **Шаг 3: Создание структуры (5 минут)**

````bash
1. Создайте папку: src/app/pages/ui-demo/{name}-control-aurora/
```bash
1. Создайте папку: src/app/pages/ui-demo/{name}-control-aurora/
2. Скопируйте 3 файла из button-control-aurora как шаблон:
   - button-control-aurora.component.ts → {name}-control-aurora.component.ts
   - button-control-aurora.component.html → {name}-control-aurora.component.html
   - button-control-aurora.component.scss → {name}-control-aurora.component.scss
   НЕ НУЖНО: docs.ts (заменен на .config.ts)
````

### **Шаг 4: Адаптация TypeScript (15-20 минут)**

```bash
1. Добавьте импорт конфигурации документации:
   import { COMPONENT_NAME_DOCUMENTATION } from './{name}-control-aurora.config';
2. Замените все "Button" на "YourComponent" в названиях классов/методов
3. Замените ButtonConfig на YourComponentConfig в типах
4. Из старого компонента скопируйте:
   - Интерфейс конфигурации
   - Значения по умолчанию
   - Методы обработки событий
5. Добавьте свойство: readonly documentationConfig = COMPONENT_NAME_DOCUMENTATION;
6. Замените HelpCopyContainerComponent на ControlDocumentationComponent в imports
7. Исправите импорты (обычно ../../../)
```

### **Шаг 5: Адаптация HTML (10 минут)**

```bash
1. В showcase-docs замените весь блок документации на:
   <control-documentation [config]="documentationConfig"></control-documentation>
2. НЕ ТРОГАЙТЕ showcase-live и showcase-code - они остаются как есть
3. Проверьте, что остальная структура соответствует вашему компоненту
```

### **Шаг 6: Адаптация SCSS - НОВЫЙ ПОДХОД (10 минут)**

```bash
🎯 ЦЕЛЬ: ТОЛЬКО demo-стили, БЕЗ стилей целевого компонента

1. Оставьте ТОЛЬКО строки 1-8 (импорт mixins):
   @use "../../../../styles/abstracts/ui-demo-mixins" as mixins;
   @include mixins.control-demo-base-styles;

2. Добавьте компонент-специфичные стили демо:
   ✅ .{name}-controls - стили панели управления
   ✅ .{name}-preview - стили области превью
   ✅ .{name}-info - стили информационных блоков
   ❌ НЕ добавляйте стили самого компонента (.av-btn, .av-modal, etc.)

3. Стили компонента должны быть в:
   src/styles/components/_{target-component}.scss
```

**🚨 КРИТИЧЕСКОЕ ПРАВИЛО:**

- Демо показывает компонент → Стили живут в глобальном файле
- Нарушение ведет к проблемам: "в демо работает, в проекте - нет"

### **Шаг 7: Регистрация роута (5 минут)**

```bash
1. Откройте: src/app/app.routes.ts
2. Добавьте новый маршрут по образцу button-control-aurora
3. Обновите боковое меню (если нужно)
```

### **Шаг 8: Финальное тестирование (10 минут)**

```bash
1. ng serve - проверка компиляции
2. Откройте страницу в браузере
3. Проверьте работу всех контролов
4. Убедитесь, что документация корректна
5. Протестируйте копирование кода
6. Проверьте отзывчивость (мобильная версия)
```

- Для Tag: стили тегов и состояний

5. Сохраните общую структуру (.demo-form, .preview-container, .dashed-settings-box)

````

### **Шаг 5: Адаптация HTML (10-15 минут)**

```bash
1. В showcase-tabs: замените Button-специфичные контролы
2. В showcase-content: замените <av-button> на ваш компонент
3. Скопируйте из старого компонента нужные nz-form-item
4. Обновите табы документации
````

### **Шаг 6: Адаптация Docs (10 минут)**

```bash
1. В .docs.ts замените все Button примеры на ваш компонент
2. Обновите интерфейсы в API_DOC
3. Поправьте примеры в USAGE_EXAMPLE
4. Добавьте специфичные для компонента пресеты
```

### **Шаг 7: Интеграция (5 минут)**

```bash
1. Добавьте route в ui-demo.routes.ts
2. Добавьте пункт меню в sidebar (с меткой "New")
3. Пометьте старый компонент как "(Old)"
```

## 🛠️ **Troubleshooting - решение проблем:**

### **❌ Ошибка: "Cannot find module"**

```bash
Причина: Неправильный путь импорта
Решение: Проверьте количество "../" (обычно 3: ../../../)
```

### **❌ Ошибка: "No provider for Token"**

```bash
Причина: Лишние зависимости в constructor
Решение: Удалите неиспользуемые сервисы из constructor
```

### **❌ Ошибка: Property does not exist**

```bash
Причина: Неправильные названия свойств в интерфейсе
Решение: Сверьтесь с исходным компонентом (av-button, av-modal, etc.)
```

### **❌ Ошибка: Generated code не работает**

```bash
Причина: Неправильная логика в generatedCode() computed
Решение: Скопируйте паттерн из button-control-aurora и адаптируйте
```

## 💡 **Шаблон generatedCode() для любого компонента:**

```typescript
generatedCode = computed(() => {
  const config = this.targetConfig();

  let code = `<your-component`;

  // Добавляйте свойства если они не дефолтные
  if (config.prop1 !== "default") {
    code += `\n  [prop1]="${config.prop1}"`;
  }

  if (config.prop2 !== false) {
    code += `\n  [prop2]="true"`;
  }

  // Для сложных объектов
  if (config.complexObject && Object.keys(config.complexObject).length > 0) {
    code += `\n  [config]="${JSON.stringify(config.complexObject)}"`;
  }

  code += `>`;

  // Контент если есть
  if (config.content) {
    code += `\n  ${config.content}\n</your-component>`;
  } else {
    code += `</your-component>`;
  }

  return code;
});
```

## ⏱️ **Временные затраты (v2.0):**

### **С новой архитектурой (универсальная документация + глобальные стили):**

- **Быстрая миграция:** 30-45 минут (на 25% быстрее!)
- **Подробная с документацией:** 1-1.5 часа (на 30% быстрее!)
- **Первая миграция (изучение):** 1.5-2 часа (было 2-3)

### **Экономия времени достигается за счет:**

- ✅ Не нужно писать 200+ строк документации (используем конфиг)
- ✅ Не нужно копировать 400+ строк стилей компонента
- ✅ Готовые SCSS mixins для demo-форм
- ✅ Четкое разделение ответственности (demo ≠ component styles)

## 🎯 **Готовые примеры для копирования:**

1. **button-control-aurora (v2.0)** - современный эталон с универсальной документацией
2. **dialog-control-aurora** - пример с модальными окнами
3. **icon-control-aurora** - пример с иконками (если есть)

## 🚀 **Следующие улучшения (roadmap):**

- **Code Generation Tool:** CLI для автогенерации control-компонентов
- **Visual Builder:** Drag&Drop конструктор для создания demo-страниц
- **Auto Documentation:** Парсинг TypeScript для автогенерации API docs

**✅ Методология v2.0: архитектурно правильно + в 2 раза быстрее!**

---

## 📝 **ТЕХНИЧЕСКАЯ ЗАМЕТКА (для будущего рефакторинга):**

### **🎯 Проблема DRY нарушения в SCSS:**

Текущий подход копирует одинаковые стили в каждый компонент (~130 строк × 50 компонентов = 6500 строк дублирования).

### **✅ Решение на будущее:**

```scss
// src/styles/abstracts/_ui-demo-mixins.scss
@mixin showcase-demo-styles {
  .demo-form {
    /* общие стили */
  }
  .form-section-title {
    /* общие стили */
  }
  .target-controls {
    /* общие стили */
  }
  .preview-container {
    /* общие стили */
  }
  .message-toast {
    /* общие стили */
  }
}

// В каждом компоненте:
@use "../../../../styles/abstracts/ui-demo-mixins" as mixins;
@include mixins.control-demo-base-styles;
```

### **🚀 План рефакторинга (ЗАВЕРШЕНО!):**

1. **✅ Создан миксин:** `src/styles/abstracts/_ui-demo-mixins.scss` с общими стилями
2. **✅ ButtonControlAurora рефакторен:** С 607 строк до 544 строк (-63 строки, -10%)
3. **✅ Бэкап создан:** `button-control-aurora-withoutmixins` для сравнения
4. **✅ Миксин протестирован:** ButtonControlAurora компилируется без ошибок

### **📊 РЕЗУЛЬТАТЫ рефакторинга:**

```scss
// ДО: Copy-Paste (607 строк)
.demo-form {
  padding: 24px 0;
}
.control-group {
  /* 50+ строк стилей */
}
.dashed-settings-box {
  /* дублированные стили */
}
.preview-container {
  /* повторяющиеся стили */
}

// ПОСЛЕ: Миксин (544 строки)
@use "../../../../styles/abstracts/ui-demo-mixins" as mixins;
@include mixins.control-demo-base-styles; // ← Все общие стили

// Только Button-специфичные стили
.button-controls {
  /* специфика для кнопок */
}
.button-preview {
  /* стили кнопки */
}
```

### **⚡ Для НОВЫХ миграций:**

**⚠️ ВАЖНО: Используем современный SASS синтаксис `@use` вместо устаревшего `@import`**

```scss
// 🎯 НОВЫЙ стандарт (рекомендуется):
@use "../../../../styles/abstracts/ui-demo-mixins" as mixins;
@include mixins.control-demo-base-styles;

// Добавить только специфичные стили
.modal-preview {
  /* стили модального окна */
}
.tag-preview {
  /* стили тегов */
}
.input-preview {
  /* стили полей ввода */
}
```

### **� Экономия от миксина:**

- **Строк кода:** 607 → 544 (-10% на компонент)
- **Maintenance:** Изменения в одном файле для всех компонентов
- **Consistency:** Гарантированно одинаковые стили

**💡 ButtonControlAurora теперь ЭТАЛОН использования миксинов! Копируйте его архитектуру.**
