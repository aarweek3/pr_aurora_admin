# ButtonControlAuroraComponent - Архитектурный эталон

## 📋 Общая информация

**Путь:** `src/app/pages/ui-demo/button-control-aurora/button-control-aurora.component.ts`
**Назначение:** Демонстрационный компонент для интерактивного управления ButtonDirective
**Архитектурная роль:** Эталонный образец для всех UI Control компонентов

---

## 🏗️ Архитектурная структура

### 1. Файловая структура (Clean Architecture)

```
button-control-aurora/
├── button-control-aurora.component.ts      # 🧠 Основная логика и состояние
├── button-control-aurora.component.html    # 🎨 Шаблон с табами и showcase
├── button-control-aurora.component.scss    # 🎭 Стили + темная тема
├── button-control-aurora.config.ts         # 📚 Универсальная документация
└── icon-presets.const.ts                  # 📦 Извлеченные константы
```

**Принцип разделения ответственности:**

- `.ts` - бизнес-логика, состояние, вычисления
- `.html` - структура UI, привязка к данным
- `.scss` - визуальные стили, адаптивность
- `.config.ts` - документация, API, примеры
- `.const.ts` - переиспользуемые данные

---

## 🔧 Техническая архитектура

### 2. Импорты и зависимости (слоистая архитектура)

```typescript
// 🌐 Angular Core (базовый слой)
import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

// 🎨 UI библиотеки (слой представления)
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
// ... другие Ng Zorro модули

// 🧩 Внутренние UI компоненты (слой UI системы)
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { ShowcaseComponent } from '../../../shared/components/ui/showcase/showcase.component';

// 📄 Конфигурация и данные (слой данных)
import { BUTTON_CONTROL_DOCUMENTATION } from './button-control-aurora.config';
import { ICON_PRESETS } from './icon-presets.const';
```

**Архитектурные принципы:**

- **Dependency Inversion:** Зависимость от абстракций (интерфейсов), не от конкретных реализаций
- **Single Responsibility:** Каждый модуль отвечает за одну область
- **Слоистость:** Четкое разделение на Core → UI → Business → Data

---

## 📊 Структура данных и состояния

### 3. Типизация и интерфейсы

```typescript
// 🏷️ Локальный интерфейс конфигурации
interface ButtonConfig {
  type: ButtonType; // Тип кнопки
  size: ButtonSize; // Размер
  shape: 'default' | 'circle' | 'square' | 'round';
  variant: string; // Вариант отображения
  disabled: boolean; // Состояния
  loading: boolean;
  block: boolean;
  text: string; // Контент
  icon?: string;
  bgColor?: string; // Кастомизация
  textColor?: string;
}
```

**Принципы типизации:**

- **Type Safety:** Строгая типизация предотвращает ошибки
- **Domain Driven:** Типы отражают предметную область
- **Composition:** Интерфейсы compose из примитивных типов

### 4. Реактивное состояние (Angular Signals)

```typescript
export class ButtonControlAuroraComponent implements OnDestroy {
  // 🎯 Основное состояние (Single Source of Truth)
  buttonConfig = signal<ButtonConfig>({
    type: 'primary',
    size: 'default',
    // ... начальные значения
  });

  // 💬 UI состояние
  message = signal<string>('');

  // 🎨 Кастомизация
  bgColor = signal<string>('');
  textColor = signal<string>('');

  // 🎭 Конфигурация иконки
  iconConfig = signal<AvIconConfig>({
    type: null,
    size: 16,
    // ... настройки иконки
  });

  // 📚 Статическая конфигурация
  readonly documentationConfig = BUTTON_CONTROL_DOCUMENTATION;
  readonly iconPresets = ICON_PRESETS;
}
```

**Архитектурные решения:**

- **Signals over RxJS:** Проще отладка, лучше производительность для UI
- **Immutability:** Состояние изменяется через `.set()` и `.update()`
- **Readonly конфиги:** Статические данные защищены от изменений
- **Separation of Concerns:** Разные аспекты в разных сигналах

---

## ⚙️ Бизнес-логика и вычисления

### 5. Computed values (Производные данные)

```typescript
// 🎨 Динамические стили на основе конфигурации
buttonStyle = computed(() => {
  const config = this.buttonConfig();
  const style: any = {
    opacity: config.disabled ? 0.6 : 1,
    cursor: config.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
  };

  // Применяем кастомные цвета
  if (this.bgColor()) style.backgroundColor = this.bgColor();
  if (this.textColor()) style.color = this.textColor();

  return style;
});

// 📝 Генерация кода для копирования
generatedCode = computed(() => {
  const config = this.buttonConfig();
  const icon = this.iconConfig();

  // Сложная логика построения HTML и TypeScript кода
  const htmlLines = [`<button av-button`, `  avType="${config.type}"`];
  // ... детальное построение кода

  return {
    html: htmlLines.join('\n'),
    typescript: tsCode,
  };
});

// 🎯 Код для showcase (агрегация)
codeForShowcase = computed(() => {
  const code = this.generatedCode();
  return `HTML:\n${code.html}\n\nTypeScript:\n${code.typescript}`;
});
```

**Принципы computed values:**

- **Реактивность:** Автоматическое пересчет при изменении зависимостей
- **Мемоизация:** Кэширование результатов для производительности
- **Композиция:** Сложные computed строятся из простых
- **Чистые функции:** Без side effects, детерминированные результаты

---

## 🔄 Методы и взаимодействие

### 6. Обработка пользовательских действий

```typescript
// 🔧 Обновление конфигурации кнопки
updateButtonConfig(property: keyof ButtonConfig, value: any): void {
  const currentConfig = this.buttonConfig();
  this.buttonConfig.set({
    ...currentConfig,
    [property]: value,
  });
  this.showMessage('Настройки кнопки обновлены! 🎨');
}

// 🎭 Обработка изменений иконки
onIconConfigChange(newConfig: AvIconConfig): void {
  this.iconConfig.set(newConfig);
  // Синхронизация с основной конфигурацией
  if (newConfig.type) {
    this.updateButtonConfig('icon', newConfig.type);
  }
  this.showMessage('Настройки иконки обновлены! 🎨');
}

// 📋 Копирование в буфер обмена
copyToClipboard(text: string, type: string): void {
  navigator.clipboard
    .writeText(text)
    .then(() => this.showMessage(`${type} код скопирован! 📋`))
    .catch(() => this.showMessage('Ошибка копирования 😞'));
}
```

**Паттерны обработки событий:**

- **Command Pattern:** Каждое действие - отдельный метод
- **Immutable Updates:** Состояние обновляется неизменяемо
- **Error Handling:** Явная обработка ошибок с пользовательским feedback
- **Side Effects:** Уведомления пользователю о результате действий

### 7. Управление lifecycle и ресурсами

```typescript
export class ButtonControlAuroraComponent implements OnDestroy {
  // ⏰ Константы времени
  private readonly MESSAGE_TIMEOUT = 3000;

  // 🔗 Управление таймерами
  private messageTimer: ReturnType<typeof setTimeout> | null = null;

  private showMessage(msg: string): void {
    // Очистка предыдущего таймера (предотвращение утечек)
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
    }

    this.message.set(msg);

    // Установка нового таймера с сохранением ссылки
    this.messageTimer = setTimeout(() => {
      this.message.set('');
      this.messageTimer = null;
    }, this.MESSAGE_TIMEOUT);
  }

  ngOnDestroy(): void {
    // ♻️ Очистка ресурсов
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
      this.messageTimer = null;
    }
  }
}
```

**Принципы управления ресурсами:**

- **RAII (Resource Acquisition Is Initialization):** Ресурсы создаются и уничтожаются в паре
- **No Memory Leaks:** Явная очистка таймеров и подписок
- **Graceful Shutdown:** Корректное завершение работы компонента

---

## 🎨 UI Architecture (Template Structure)

### 8. Showcase Component Integration

```html
<av-showcase [config]="showcaseConfig" [generatedCodeInput]="codeForShowcase()">
  <!-- 🎮 Контролы (слева) -->
  <div showcase-tabs>
    <nz-tabset [nzAnimated]="false">
      <nz-tab nzTitle="🎮 Playground">...</nz-tab>
      <nz-tab nzTitle="💻 Код">...</nz-tab>
      <nz-tab nzTitle="📚 Примеры">...</nz-tab>
      <nz-tab nzTitle="📖 API">...</nz-tab>
    </nz-tabset>
  </div>

  <!-- 🎯 Результат (справа) -->
  <div showcase-result class="live-preview">...</div>

  <!-- 📝 Описание (внизу) -->
  <div showcase-description>...</div>

  <!-- 📚 Примеры (внизу) -->
  <div showcase-examples>...</div>

  <!-- 📖 Документация (внизу) -->
  <div showcase-docs>
    <control-documentation [config]="documentationConfig"></control-documentation>
  </div>
</av-showcase>
```

**UI Архитектурные принципы:**

- **Content Projection:** Showcase компонент предоставляет слоты для контента
- **Separation of Concerns:** Логика отделена от представления
- **Reusable Layout:** Универсальный макет для всех Control компонентов
- **Progressive Enhancement:** Дополнительные секции добавляются по необходимости

### 9. Документация Integration (DRY Principle)

```html
<!-- 📚 Примеры из конфигурации -->
<div *ngFor="let example of documentationConfig.usageExamples; let i = index">
  <h4>{{ example.title }}</h4>
  <p>{{ example.description }}</p>
  <pre><code>{{ example.htmlCode }}</code></pre>
  <pre *ngIf="example.tsCode"><code>{{ example.tsCode }}</code></pre>
</div>

<!-- 📖 API из конфигурации -->
<table>
  <tr *ngFor="let input of documentationConfig.apiDetails.inputs">
    <td><code>{{ input.name }}</code></td>
    <td><code>{{ input.type }}</code></td>
    <td>{{ input.description }}</td>
  </tr>
</table>

<!-- 💻 Интерактивный пример -->
<div *ngIf="documentationConfig.interactiveExample">
  <h4>{{ documentationConfig.interactiveExample.title }}</h4>
  <pre><code>{{ generatedCode().html }}</code></pre>
</div>
```

**DRY принципы в шаблоне:**

- **Single Source of Truth:** Все данные из `documentationConfig`
- **No Hardcoding:** Нет захардкоженных строк в шаблоне
- **Dynamic Content:** Табы генерируются из конфигурации
- **Conditional Rendering:** Контент показывается только если он есть в конфиге

---

## 📦 Конфигурация и документация

### 10. Универсальная документация (button-control-aurora.config.ts)

```typescript
export const BUTTON_CONTROL_DOCUMENTATION: ControlDocumentationConfig = {
  // 🏷️ Метаданные компонентов
  demoComponent: {
    name: 'ButtonControlAuroraComponent',
    path: 'src/app/pages/ui-demo/button-control-aurora/',
    description: 'Демонстрационная страница...',
    icon: 'general/av_page',
  },

  controlComponent: {
    name: 'ButtonDirective (av-button)',
    path: 'src/app/shared/components/ui/button/button.directive.ts',
    description: 'Основная директива...',
    icon: 'general/av_component',
  },

  // 📝 Описание функционала
  mainDescription: {
    componentTitle: 'ButtonDirective (av-button)',
    shortDescription: 'Мощная директива...',
    detailedDescription: 'Директива av-button предоставляет...',
    keyFeatures: ['🎨 Поддержка типов: primary, danger, default', '🔄 Варианты отображения...'],
  },

  // 🔧 API документация
  apiDetails: {
    inputs: [
      {
        name: 'avType',
        type: '"primary" | "danger" | "default"',
        defaultValue: '"primary"',
        description: 'Тип кнопки...',
        required: false,
      },
    ],
    outputs: [
      /* ... */
    ],
    methods: [
      /* ... */
    ],
  },

  // 📚 Примеры использования
  usageExamples: [
    {
      title: 'Базовая кнопка',
      description: 'Простейший вариант...',
      htmlCode: `<button av-button avType="primary">...</button>`,
      tsCode: `// Никакого дополнительного кода...`,
    },
  ],

  // 💻 Примеры кода для табов
  codeExamples: [
    {
      title: 'Базовые примеры использования',
      description: 'Визуальные примеры...',
      htmlCode: `<!-- Primary кнопки -->...`,
      tsCode: `// Никакой дополнительный код...`,
    },
  ],

  // 🎮 Интерактивный пример
  interactiveExample: {
    title: 'Интерактивный пример',
    description: 'Код, генерируемый на основе настроек...',
  },

  // 📋 Архитектурные заметки
  architectureNotes: [
    {
      type: 'info',
      title: 'Интеграция с дизайн-системой',
      content: 'Компонент использует глобальные стили...',
    },
  ],
};
```

**Принципы конфигурации:**

- **Documentation as Code:** Документация живет рядом с кодом
- **Typed Configuration:** Строгая типизация предотвращает ошибки
- **Hierarchical Structure:** Логическое разделение на секции
- **Extensibility:** Легко добавить новые секции и поля

---

## 🎭 Стили и темизация

### 11. SCSS Architecture

```scss
// 🧩 Импорты и миксины
@use '../../../../styles/abstracts/ui-demo-mixins' as mixins;

// 🌐 Базовые стили (через миксин)
@include mixins.control-demo-base-styles;

// 🎯 Компонент-специфичные стили
.button-controls {
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
  padding: 16px;
  border-radius: 8px;
}

.button-preview {
  padding: 48px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;

  // 🎨 Стили для директивы
  button[av-button] {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    // 🔘 Особые формы
    &.av-btn--shape-circle,
    &.av-btn--shape-square {
      gap: 0;
      padding: 0;
    }
  }
}

// 🌙 Темная тема (только структурные стили)
:host-context(.dark-theme) {
  .live-preview {
    background: #262626;
    border-color: #434343;
  }

  .button-preview {
    background: #1f1f1f;
    border-color: #434343;
  }

  .button-info {
    background: #1f1f1f;
    color: rgba(255, 255, 255, 0.85);
  }
}
```

**SCSS Архитектурные принципы:**

- **ITCSS (Inverted Triangle CSS):** От общего к частному
- **BEM Methodology:** Блок-Элемент-Модификатор для CSS классов
- **Mixins Reusability:** Переиспользование через миксины
- **Theme Separation:** Темы изолированы в отдельные блоки
- **No Business Logic:** Только структурные стили в темной теме

---

## 🚀 Паттерны для рефакторинга других компонентов

### 12. Чек-лист архитектуры (для копирования в другие компоненты)

#### ✅ **Файловая структура:**

- [ ] `component.ts` - основная логика
- [ ] `component.html` - шаблон с showcase
- [ ] `component.scss` - стили + темная тема
- [ ] `config.ts` - универсальная документация
- [ ] `*.const.ts` - извлеченные константы

#### ✅ **Импорты (порядок важен):**

```typescript
// 1. Angular Core
import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

// 2. Angular Forms
import { FormsModule } from '@angular/forms';

// 3. External UI Libraries (Ng Zorro)
import { NzButtonModule } from 'ng-zorro-antd/button';

// 4. Shared UI Components
import { ShowcaseComponent } from '@shared/components/ui/showcase';
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';

// 5. Target Directive/Component
import { YourDirective } from '@shared/components/ui/your-directive';

// 6. Local Configuration
import { YOUR_CONTROL_DOCUMENTATION } from './your-control.config';
```

#### ✅ **Состояние (Angular Signals):**

```typescript
export class YourControlAuroraComponent implements OnDestroy {
  // 🎯 Основная конфигурация
  yourConfig = signal<YourConfig>({
    /* начальные значения */
  });

  // 💬 UI состояние
  message = signal<string>('');

  // 📚 Статические конфигурации
  readonly documentationConfig = YOUR_CONTROL_DOCUMENTATION;

  // ⚙️ Computed values
  yourStyle = computed(() => {
    /* логика стилей */
  });
  generatedCode = computed(() => {
    /* генерация кода */
  });
  codeForShowcase = computed(() => {
    /* код для showcase */
  });
}
```

#### ✅ **Методы (стандартный набор):**

```typescript
// 🔧 Обновление конфигурации
updateYourConfig(property: keyof YourConfig, value: any): void {
  const current = this.yourConfig();
  this.yourConfig.set({ ...current, [property]: value });
  this.showMessage('Настройки обновлены! 🎨');
}

// 📋 Копирование кода
copyToClipboard(text: string, type: string): void {
  navigator.clipboard.writeText(text)
    .then(() => this.showMessage(`${type} скопирован! 📋`))
    .catch(() => this.showMessage('Ошибка копирования 😞'));
}

// 💬 Уведомления
private showMessage(msg: string): void { /* реализация */ }

// ♻️ Очистка ресурсов
ngOnDestroy(): void { /* очистка таймеров */ }
```

#### ✅ **HTML шаблон (стандартная структура):**

```html
<av-showcase [config]="showcaseConfig" [generatedCodeInput]="codeForShowcase()">
  <!-- Контролы -->
  <div showcase-tabs>
    <nz-tabset [nzAnimated]="false">
      <nz-tab nzTitle="🎮 Playground"><!-- Ваши контролы --></nz-tab>
      <nz-tab nzTitle="💻 Код"><!-- Из documentationConfig --></nz-tab>
      <nz-tab nzTitle="📚 Примеры"><!-- Из documentationConfig --></nz-tab>
      <nz-tab nzTitle="📖 API"><!-- Из documentationConfig --></nz-tab>
    </nz-tabset>
  </div>

  <!-- Результат -->
  <div showcase-result class="live-preview">
    <!-- Ваш компонент с конфигурацией -->
  </div>

  <!-- Документация -->
  <div showcase-docs>
    <control-documentation [config]="documentationConfig"></control-documentation>
  </div>
</av-showcase>
```

#### ✅ **Конфигурация (config.ts):**

```typescript
export const YOUR_CONTROL_DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    /* метаданные демо */
  },
  controlComponent: {
    /* метаданные целевого компонента */
  },
  mainDescription: {
    /* описание функционала */
  },
  apiDetails: {
    /* inputs, outputs, methods */
  },
  usageExamples: [
    /* примеры для таба Примеры */
  ],
  codeExamples: [
    /* примеры для таба Код */
  ],
  interactiveExample: {
    /* настройки playground */
  },
  architectureNotes: [
    /* архитектурные заметки */
  ],
};
```

---

## 📈 Метрики качества архитектуры

### 13. КПИ успешного рефакторинга

#### **🎯 Код-качество:**

- **Цикломатическая сложность:** ≤ 10 на метод
- **Строк кода в методе:** ≤ 20 строк
- **Уровень вложенности:** ≤ 3 уровня
- **TypeScript строгость:** `strict: true`

#### **🔄 Переиспользование:**

- **DRY коэффициент:** 0% дублирования документации
- **Общие компоненты:** ShowcaseComponent, ControlDocumentationComponent
- **Общие стили:** ui-demo-mixins
- **Общие константы:** вынесены в `.const.ts`

#### **⚡ Производительность:**

- **Bundle size:** компонент + зависимости ≤ 100KB
- **Initial render:** ≤ 100ms
- **Computed recalculations:** только при изменении зависимостей
- **Memory leaks:** 0 (проверяется в ngOnDestroy)

#### **🧪 Тестируемость:**

- **Unit test coverage:** ≥ 80%
- **Pure functions:** все computed - чистые функции
- **Mocking ease:** зависимости инжектируются
- **Snapshot testing:** для generated code

#### **♿ Доступность:**

- **ARIA attributes:** автоматически через директивы
- **Keyboard navigation:** полная поддержка
- **Screen readers:** семантическая разметка
- **Color contrast:** соответствие WCAG 2.1 AA

#### **📱 Адаптивность:**

- **Mobile first:** корректная работа на всех устройствах
- **Responsive design:** showcase адаптируется
- **Touch support:** для мобильных устройств
- **Progressive enhancement:** базовая функциональность без JavaScript

---

## 🎓 Заключение

**ButtonControlAuroraComponent** представляет собой эталонную архитектуру для всех UI Control компонентов в системе. Следуя этим принципам и паттернам, вы обеспечите:

- **🏗️ Единообразие:** Все компоненты следуют одной архитектуре
- **🔄 Переиспользование:** Максимальное использование общих компонентов
- **📚 Документированность:** Встроенная документация по принципу DRY
- **⚡ Производительность:** Оптимизированное реактивное состояние
- **🧪 Тестируемость:** Четкое разделение ответственности
- **♿ Доступность:** Соответствие современным стандартам
- **🎨 Темизация:** Поддержка светлой и темной тем

Используйте этот документ как чек-лист при рефакторинге других компонентов системы.
