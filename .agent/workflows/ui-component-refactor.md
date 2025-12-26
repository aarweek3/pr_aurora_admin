---
description: Руководство по рефакторингу UI компонентов в стандарт "Aurora Control" с использованием AvShowcaseComponent.
---

# UI Component Refactoring Workflow (Gold Standard)

Этот workflow описывает пошаговый процесс преобразования устаревших демонстрационных компонентов (UI Demo) в новый унифицированный формат "Aurora Control", использующий `AvShowcaseComponent`.

Этот стандарт обеспечивает единообразие внешнего вида, наличие интерактивного Playground, генерацию кода и встроенную документацию.

## ЭТАП 1: Подготовка и Структура

1.  **Анализ**: Определите компонент для рефакторинга (например, `OldUiComponent`) и выделите все его настраиваемые свойства (`@Input`).
2.  **Целевая папка**: Создайте новую папку в `src/app/pages/ui-demo/`, следуя неймингу `[name]-control-aurora`.
    - Пример: `dialog-control-aurora`
3.  **Файлы**: Создайте 5 основных файлов:
    - `[name]-control-aurora.component.ts` (Логика)
    - `[name]-control-aurora.component.html` (Шаблон)
    - `[name]-control-aurora.component.scss` (Стили)
    - `[name]-control-aurora.config.ts` (Конфигурация для ControlDocumentationComponent)
    - `[name]-control-aurora.docs.ts` (Дополнительная документация и константы, опционально)

## ЭТАП 1.5: Конфигурация Документации (.config.ts)

**ВАЖНО**: Файл `.config.ts` является центральным источником всей документации компонента и используется компонентом `ControlDocumentationComponent`.

**УНИФИЦИРОВАННОЕ ИМЕНОВАНИЕ**: Используйте константу `DOCUMENTATION` для всех компонентов вместо уникальных имен (`BUTTON_CONTROL_DOCUMENTATION`, `SEARCH_CONTROL_DOCUMENTATION` и т.д.). Это обеспечивает:

- ✅ Единообразие кода во всех компонентах
- ✅ Упрощение рефакторинга и копирования
- ✅ Предсказуемость структуры проекта
- ✅ Отсутствие конфликтов имен (файлы изолированы в своих папках)

Создайте файл `[name]-control-aurora.config.ts` со следующей структурой:

```typescript
import { ControlDocumentationConfig } from "@shared/components/ui/control-documentation";

/**
 * Конфигурация документации для [Name]ControlAurora
 * Используется унифицированное имя DOCUMENTATION для всех компонентов
 */
export const DOCUMENTATION: ControlDocumentationConfig = {
  // 1. Информация о демонстрационном компоненте
  demoComponent: {
    name: "[Name]ControlAuroraComponent",
    path: "src/app/pages/ui-demo/[name]-control-aurora/",
    description: "Демонстрационная страница с интерактивными возможностями управления",
    icon: "general/av_page",
  },

  // 2. Информация о целевом компоненте/директиве
  controlComponent: {
    name: "TargetDirective (av-target)",
    path: "src/app/shared/components/ui/target/target.directive.ts",
    description: "Основная директива для создания...",
    icon: "general/av_component",
  },

  // 3. Основное описание компонента
  mainDescription: {
    componentTitle: "TargetDirective (av-target)",
    shortDescription: "Краткое описание в одно предложение",
    detailedDescription: "Подробное описание функциональности, возможностей и назначения компонента",
    keyFeatures: [
      "🎨 Ключевая особенность 1",
      "🔄 Ключевая особенность 2",
      "📏 Ключевая особенность 3",
      // ... до 8-10 пунктов
    ],
  },

  // 4. Детальное API (самая важная секция)
  apiDetails: {
    inputs: [
      {
        name: "propName",
        type: '"value1" | "value2" | "value3"',
        defaultValue: '"value1"',
        description: "Описание назначения свойства",
        required: false,
      },
      // ... все @Input() свойства
    ],
    outputs: [
      {
        name: "eventName",
        type: "EventType",
        description: "Описание события",
      },
      // ... все @Output() события
    ],
    methods: [
      {
        name: "methodName",
        parameters: "param1: string, param2?: number",
        returnType: "void",
        description: "Описание публичного метода",
      },
      // ... все публичные методы
    ],
  },

  // 5. Примеры использования (для вкладки "Примеры")
  usageExamples: [
    {
      title: "Базовый пример",
      description: "Простейший вариант использования",
      htmlCode: `<av-target>Content</av-target>`,
      tsCode: `// TypeScript код, если нужен`,
    },
    {
      title: "Продвинутый пример",
      description: "Использование с дополнительными опциями",
      htmlCode: `<av-target [prop]="value">...</av-target>`,
      tsCode: `export class MyComponent {
  value = 'example';
}`,
    },
  ],

  // 6. Примеры кода (для вкладки "Код")
  codeExamples: [
    {
      title: "Визуальные примеры",
      description: "Различные конфигурации компонента",
      htmlCode: `<!-- Пример 1 -->
<av-target type="primary">Primary</av-target>

<!-- Пример 2 -->
<av-target type="danger">Danger</av-target>`,
      tsCode: `// Дополнительный код, если требуется`,
    },
  ],

  // 7. Интерактивный пример (ссылка на Playground)
  interactiveExample: {
    title: "Интерактивный пример",
    description: "Код, генерируемый на основе настроек в Playground",
  },

  // 8. Архитектурные заметки
  architectureNotes: [
    {
      type: "info",
      title: "Интеграция с дизайн-системой",
      content: "Описание интеграции с глобальными стилями",
    },
    {
      type: "warning",
      title: "Важное предупреждение",
      content: "Что нужно учитывать при использовании",
    },
    {
      type: "tip",
      title: "Совет по производительности",
      content: "Рекомендации по оптимизации",
    },
  ],
};
```

**Использование в компоненте**:

```typescript
// В [name]-control-aurora.component.ts
import { DOCUMENTATION } from './[name]-control-aurora.config';

export class [Name]ControlAuroraComponent {
  readonly documentationConfig = DOCUMENTATION;
  // ...
}
```

**Использование в шаблоне**:

❌ **УСТАРЕВШИЙ СПОСОБ** (вкладка API):

```html
<!-- В [name]-control-aurora.component.html -->
<nz-tab nzTitle="📖 API">
  <control-documentation [config]="documentationConfig"></control-documentation>
</nz-tab>
```

✅ **ПРАВИЛЬНЫЙ СПОСОБ** (нижняя секция документации):

```html
<!-- В конце [name]-control-aurora.component.html, перед закрывающим </av-showcase> -->

  <!-- BOTTOM: Documentation -->
  <div showcase-docs>
    <control-documentation [config]="documentationConfig"></control-documentation>
  </div>
</av-showcase>
```

**Важно**: Документация теперь отображается в нижней части страницы как отдельная секция, а не как вкладка в табах. Это обеспечивает лучшую видимость и доступность API документации.

**Отладка документации**:

```typescript
// В [name]-control-aurora.component.ts добавьте ngOnInit для отладки
import { Component, computed, OnInit, signal } from '@angular/core';

export class [Name]ControlAuroraComponent implements OnInit {
  readonly documentationConfig = DOCUMENTATION;

  ngOnInit() {
    console.log('[Name]ControlAuroraComponent Init');
    console.log('Documentation Config:', this.documentationConfig);
    console.log('Usage Examples:', this.documentationConfig?.usageExamples);
  }
}
```

## ЭТАП 2: Логика Компонента (.ts)

Используйте следующий шаблон для TypeScript файла.

```typescript
// Imports...
import { Component, computed, signal } from '@angular/core';
import { ShowcaseComponent, ShowcaseConfig } from '.../showcase.component';
import { ControlDocumentationComponent } from '@shared/components/ui/control-documentation';
import { DOCUMENTATION } from './[name]-control-aurora.config';

// Interface for component configuration
interface ComponentConfig {
  prop1: string;
  prop2: boolean;
  // ...
}

@Component({
  selector: 'app-[name]-control-aurora',
  standalone: true,
  imports: [
    ShowcaseComponent,
    ControlDocumentationComponent,
    // ... Import modules needed for controls & preview
  ],
  templateUrl: './....html',
  styleUrl: './....scss',
})
export class [Name]ControlAuroraComponent {
  // 1. Documentation Configuration (from .config.ts)
  readonly documentationConfig = DOCUMENTATION;

  // 2. Showcase Configuration
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Component Name 🎨', // E.g., Button Control Aurora
      componentName: '[Name]ControlAuroraComponent',
      componentPath: 'src/app/pages/ui-demo/...',
      controlComponent: {
          name: 'TargetComponent', // E.g., AvButtonDirective
          path: 'src/app/shared/...',
      },
      docsPath: 'src/app/pages/ui-demo/...',
      description: 'Краткое описание компонента.',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10], // Ratio between Playground and Preview
    resultBlocks: {
      preview: { title: '🔴 Live Demo' },
      code: { title: '📄 Генерированный код' },
      description: { title: '📋 Текущие настройки', autoParams: true },
    },
  };

  // 3. State Management (Signals)
  config = signal<ComponentConfig>({
    prop1: 'default',
    prop2: true,
  });

  // 4. Helper for updates
  updateConfig(key: keyof ComponentConfig, value: any) {
    this.config.update(c => ({ ...c, [key]: value }));
  }

  // 5. Code Generation
  generatedCode = computed(() => {
    const c = this.config();
    return `<av-component
  [prop1]="'${c.prop1}'"
  [prop2]="${c.prop2}"
></av-component>`;
  });
}
```

## ЭТАП 3: Шаблон (.html)

Используйте слоты `av-showcase` для организации контента.

```html
<av-showcase [config]="showcaseConfig" [generatedCodeInput]="generatedCode()">
  <!-- TAB 1: PLAYGROUND (Controls) -->
  <div showcase-tabs>
    <nz-tabset [nzAnimated]="false">
      <nz-tab nzTitle="🎮 Playground">
        <div class="demo-form">
          <!-- Section 1 -->
          <h3 class="form-section-title">Basic Settings</h3>

          <div class="control-group">
            <label class="control-label">Prop 1:</label>
            <input nz-input [ngModel]="config().prop1" (ngModelChange)="updateConfig('prop1', $event)" />
          </div>

          <!-- Toggle -->
          <div class="control-group checkbox-group">
            <label nz-checkbox [ngModel]="config().prop2" (ngModelChange)="updateConfig('prop2', $event)"> Enable Feature </label>
          </div>
        </div>
      </nz-tab>

      <nz-tab nzTitle="📚 Примеры">
        <!-- Use av-help-copy-container for code blocks -->
        <av-help-copy-container [content]="exampleDoc" ...></av-help-copy-container>
      </nz-tab>

      <nz-tab nzTitle="📖 API">
        <control-documentation [config]="documentationConfig"></control-documentation>
      </nz-tab>
    </nz-tabset>
  </div>

  <!-- RESULT: LIVE PREVIEW -->
  <div showcase-result>
    <div class="preview-container">
      <!-- ACTUAL COMPONENT BEING TESTED -->
      <app-target-component [prop1]="config().prop1" [prop2]="config().prop2"></app-target-component>
    </div>
  </div>

  <!-- RESULT: DESCRIPTION (Bottom Params List) -->
  <div showcase-description>
    <div class="config-summary">
      <div class="config-grid">
        <div class="config-item">
          <span class="config-label">Prop 1</span>
          <span class="config-value">{{ config().prop1 }}</span>
        </div>
        <!-- ... -->
      </div>
    </div>
  </div>

  <!-- USAGE EXAMPLES (Bottom Section) -->
  <div showcase-examples>
    <div class="demo-form">
      <!-- Example 1 -->
      <div class="example-block" style="margin-bottom: 32px">
        <h4>1. Базовый пример</h4>
        <!-- Live Component -->
        <div style="padding: 24px; border: 1px solid #f0f0f0; border-radius: 6px; margin-bottom: 16px; background: white">
          <app-target-component [(value)]="exampleSignal"></app-target-component>
        </div>
        <!-- Code Block -->
        <pre style="..."><code>...</code></pre>
      </div>
    </div>
  </div>
</av-showcase>
```

## ЭТАП 3.1: Настройка Примеров Использования (Usage Examples)

Для отображения секции "Примеры использования" (как в `ButtonControlAuora` или `SearchControlAurora`):

1.  **Включите опцию в конфиге**:
    В `showcaseConfig` установите `showExamples: true`.

2.  **Добавьте сигналы для примеров (.ts)**:
    Если примеры интерактивны, создайте отдельные сигналы для них, чтобы они не зависели от главного Playground.

    ```typescript
    exampleValue1 = signal("");
    exampleValue2 = signal("Initial");
    ```

3.  **Используйте слот `showcase-examples` (.html)**:
    Разместите контент примеров внутри `div` с атрибутом `showcase-examples`.

    ```html
    <div showcase-examples>
      <div class="demo-form">
        <div class="example-block">
          <h4>Заголовок примера</h4>
          <p>Описание...</p>

          <!-- Живой пример с отдельным состоянием -->
          <div class="live-example-container">
            <app-target-component [(value)]="exampleValue1"></app-target-component>
          </div>

          <!-- Блок кода (можно копировать из .config.ts) -->
          <pre><code>...</code></pre>
        </div>
      </div>
    </div>
    ```

4.  **Убедитесь, что `ControlDocumentationComponent` подключен**:
    Для вкладок "Код" и "API" используйте `<control-documentation [config]="documentationConfig">`. Это заменит старые `av-help-copy-container` для стандартных секций.

````

## ЭТАП 4: Документация (.docs.ts)

Вынесите все большие текстовые блоки в отдельный файл.

```typescript
export const IMPORT_DOC = \`import { TargetComponent } from '...';\`;

export const SETUP_DOC = \`// Setup logic here\`;

export const USAGE_EXAMPLE = \`// Usage example code\`;

export const API_DOC = \`
@Input() prop1: string; // Description
@Input() prop2: boolean; // Description
\`;
````

## ЭТАП 5: Интеграция

1.  **Routing**: Убедитесь, что для компонента есть маршрут в `ui-demo.routes.ts`.
2.  **Navigation**: Добавьте пункт меню в `sidebar-default.config.ts`, желательно в секцию "New" или отсортированную группу.

## ЭТАП 6: Проверка

1.  Запустите приложение.
2.  Проверьте работу всех контролов в Playground — изменения должны мгновенно отражаться в Preview.
3.  Проверьте генерацию кода — она должна соответствовать текущим настройкам.
4.  Проверьте копирование кода и примеров.
5.  Убедитесь, что документация отображается в нижней секции страницы.

---

## ПРИЛОЖЕНИЕ: Общие шаблоны кода для быстрого создания компонентов

### A. Базовый шаблон .component.ts

```typescript
import { CommonModule } from "@angular/common";
import { Component, computed, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NzCheckboxModule } from "ng-zorro-antd/checkbox";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzRadioModule } from "ng-zorro-antd/radio";
import { NzSelectModule } from "ng-zorro-antd/select";
import { NzSwitchModule } from "ng-zorro-antd/switch";
import { NzTabsModule } from "ng-zorro-antd/tabs";

import { ControlDocumentationComponent } from "@shared/components/ui/control-documentation";
import { YourTargetComponent } from "@shared/components/ui/your-target";
import { ShowcaseComponent, ShowcaseConfig } from "@shared/components/ui/showcase/showcase.component";
import { DOCUMENTATION } from "./your-name-control-aurora.config";

// Interface для конфигурации компонента
interface YourComponentConfig {
  // Основные свойства
  label: string;
  variant: "default" | "primary" | "secondary";
  size: "small" | "medium" | "large";
  shape: "default" | "rounded" | "circle";

  // Логические свойства
  disabled: boolean;
  loading: boolean;
  visible: boolean;

  // Цветовые свойства
  color: string;
  backgroundColor: string;

  // Размерные свойства
  width: string | number | null;
  height: string | number | null;
  customRadius: string | number | null;
}

@Component({
  selector: "app-your-name-control-aurora",
  standalone: true,
  imports: [CommonModule, FormsModule, ShowcaseComponent, ControlDocumentationComponent, YourTargetComponent, NzTabsModule, NzSelectModule, NzSwitchModule, NzCheckboxModule, NzRadioModule, NzInputModule],
  templateUrl: "./your-name-control-aurora.component.html",
  styleUrl: "./your-name-control-aurora.component.scss",
})
export class YourNameControlAuroraComponent implements OnInit {
  // 1. Documentation Configuration (from .config.ts)
  readonly documentationConfig = DOCUMENTATION;

  ngOnInit() {
    console.log("YourNameControlAuroraComponent Init");
    console.log("Documentation Config:", this.documentationConfig);
    console.log("Usage Examples:", this.documentationConfig?.usageExamples);
  }

  // 2. Showcase Configuration
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: "Your Component Control Aurora 🎨",
      componentName: "YourNameControlAuroraComponent",
      componentPath: "src/app/pages/ui-demo/your-name-control-aurora/your-name-control-aurora.component.ts",
      controlComponent: {
        name: "YourTargetComponent (av-your-target)",
        path: "src/app/shared/components/ui/your-target/your-target.component.ts",
      },
      docsPath: "src/app/pages/ui-demo/your-name-control-aurora/your-name-control-aurora.config.ts",
      description: "Краткое описание вашего компонента и его назначения.",
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],
    resultBlocks: {
      preview: { title: "🔴 Live Preview" },
      code: { title: "📄 Генерированный код" },
      description: { title: "📋 Текущие настройки", autoParams: true },
    },
  };

  // 3. State Management (Signals)
  config = signal<YourComponentConfig>({
    // Значения по умолчанию
    label: "Example Label",
    variant: "default",
    size: "medium",
    shape: "default",
    disabled: false,
    loading: false,
    visible: true,
    color: "#1890ff",
    backgroundColor: "#ffffff",
    width: null,
    height: null,
    customRadius: null,
  });

  // 4. Dropdown Options (для select и radio групп)
  readonly variants = [
    { value: "default", label: "Default" },
    { value: "primary", label: "Primary" },
    { value: "secondary", label: "Secondary" },
  ];

  readonly sizes = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  readonly shapes = [
    { value: "default", label: "Default" },
    { value: "rounded", label: "Rounded" },
    { value: "circle", label: "Circle" },
  ];

  // 5. Helper Methods
  updateConfig(key: keyof YourComponentConfig, value: any) {
    this.config.update((c) => ({ ...c, [key]: value }));
  }

  // 6. Code Generation
  generatedCode = computed(() => {
    const c = this.config();
    let props: string[] = [];

    // Добавляем свойства только если они отличаются от значений по умолчанию
    if (c.label !== "Example Label") props.push(`label="${c.label}"`);
    if (c.variant !== "default") props.push(`[variant]="'${c.variant}'"`);
    if (c.size !== "medium") props.push(`[size]="'${c.size}'"`);
    if (c.shape !== "default") props.push(`[shape]="'${c.shape}'"`);
    if (c.disabled) props.push(`[disabled]="true"`);
    if (c.loading) props.push(`[loading]="true"`);
    if (!c.visible) props.push(`[visible]="false"`);

    // Кастомные размеры
    if (c.width) props.push(`[width]="'${c.width}'"`);
    if (c.height) props.push(`[height]="'${c.height}'"`);
    if (c.customRadius) props.push(`[customRadius]="'${c.customRadius}'"`);

    const propsString = props.length > 0 ? "\n  " + props.join("\n  ") + "\n" : "";
    return `<av-your-target${propsString}>\n  Content here\n</av-your-target>`;
  });

  // 7. Example Data (для секции примеров)
  exampleValue1 = signal("");
  exampleValue2 = signal("Initial Value");

  updateExampleValue1(value: string) {
    this.exampleValue1.set(value);
  }
}
```

### B. Базовый шаблон .component.html

```html
<av-showcase [config]="showcaseConfig" [generatedCodeInput]="generatedCode()">
  <!-- TAB SECTION: PLAYGROUND (Controls) -->
  <div showcase-tabs>
    <nz-tabset [nzAnimated]="false">
      <nz-tab nzTitle="🎮 Playground">
        <div class="demo-form">
          <!-- Основные настройки -->
          <h3 class="form-section-title">Основные настройки</h3>

          <div class="control-group">
            <label class="control-label">Заголовок:</label>
            <input nz-input [ngModel]="config().label" (ngModelChange)="updateConfig('label', $event)" placeholder="Введите заголовок..." />
          </div>

          <div class="control-group">
            <label class="control-label">Вариант:</label>
            <nz-select [ngModel]="config().variant" (ngModelChange)="updateConfig('variant', $event)" style="width: 100%">
              @for (variant of variants; track variant.value) {
              <nz-option [nzValue]="variant.value" [nzLabel]="variant.label"></nz-option>
              }
            </nz-select>
          </div>

          <div class="control-group">
            <label class="control-label">Размер:</label>
            <nz-select [ngModel]="config().size" (ngModelChange)="updateConfig('size', $event)" style="width: 100%">
              @for (size of sizes; track size.value) {
              <nz-option [nzValue]="size.value" [nzLabel]="size.label"></nz-option>
              }
            </nz-select>
          </div>

          <div class="control-group">
            <label class="control-label">Форма:</label>
            <nz-select [ngModel]="config().shape" (ngModelChange)="updateConfig('shape', $event)" style="width: 100%">
              @for (shape of shapes; track shape.value) {
              <nz-option [nzValue]="shape.value" [nzLabel]="shape.label"></nz-option>
              }
            </nz-select>
          </div>

          <!-- Логические настройки -->
          <h3 class="form-section-title">Состояния</h3>

          <div class="control-group checkbox-group">
            <label nz-checkbox [ngModel]="config().disabled" (ngModelChange)="updateConfig('disabled', $event)"> Отключено </label>
          </div>

          <div class="control-group checkbox-group">
            <label nz-checkbox [ngModel]="config().loading" (ngModelChange)="updateConfig('loading', $event)"> Загрузка </label>
          </div>

          <div class="control-group checkbox-group">
            <label nz-checkbox [ngModel]="config().visible" (ngModelChange)="updateConfig('visible', $event)"> Видимый </label>
          </div>

          <!-- Кастомные размеры -->
          <h3 class="form-section-title">Кастомные размеры</h3>

          <div class="control-group">
            <label class="control-label">Ширина (Width):</label>
            <input nz-input [ngModel]="config().width" (ngModelChange)="updateConfig('width', $event)" placeholder="auto, 100px, 50%..." />
          </div>

          <div class="control-group">
            <label class="control-label">Высота (Height):</label>
            <input nz-input [ngModel]="config().height" (ngModelChange)="updateConfig('height', $event)" placeholder="auto, 40px, 3rem..." />
          </div>
        </div>
      </nz-tab>
    </nz-tabset>
  </div>

  <!-- RESULT: LIVE PREVIEW -->
  <div showcase-result>
    <div class="preview-container">
      <av-your-target [label]="config().label" [variant]="config().variant" [size]="config().size" [shape]="config().shape" [disabled]="config().disabled" [loading]="config().loading" [visible]="config().visible" [width]="config().width" [height]="config().height" [customRadius]="config().customRadius"> Пример содержимого компонента </av-your-target>
    </div>
  </div>

  <!-- RESULT: DESCRIPTION -->
  <div showcase-description>
    <div class="config-summary">
      <div class="config-grid">
        <div class="config-item">
          <span class="config-label">Заголовок</span>
          <span class="config-value">{{ config().label }}</span>
        </div>
        <div class="config-item">
          <span class="config-label">Вариант</span>
          <span class="config-value">{{ config().variant }}</span>
        </div>
        <div class="config-item">
          <span class="config-label">Размер</span>
          <span class="config-value">{{ config().size }}</span>
        </div>
        <div class="config-item">
          <span class="config-label">Форма</span>
          <span class="config-value">{{ config().shape }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- USAGE EXAMPLES -->
  <div showcase-examples>
    <div class="demo-form">
      <div class="example-block">
        <h4>1. Базовый пример</h4>
        <p>Простое использование компонента с минимальными настройками:</p>

        <div style="padding: 24px; border: 1px solid #f0f0f0; border-radius: 6px; margin-bottom: 16px; background: white">
          <av-your-target [(value)]="exampleValue1"> Базовый компонент </av-your-target>
        </div>

        <pre><code>&lt;av-your-target [(value)]="value"&gt;
  Базовый компонент
&lt;/av-your-target&gt;</code></pre>
      </div>

      <div class="example-block">
        <h4>2. Продвинутый пример</h4>
        <p>Использование с дополнительными настройками:</p>

        <div style="padding: 24px; border: 1px solid #f0f0f0; border-radius: 6px; margin-bottom: 16px; background: white">
          <av-your-target variant="primary" size="large" shape="rounded" [(value)]="exampleValue2"> Продвинутый компонент </av-your-target>
        </div>

        <pre><code>&lt;av-your-target
  variant="primary"
  size="large"
  shape="rounded"
  [(value)]="advancedValue"&gt;
  Продвинутый компонент
&lt;/av-your-target&gt;</code></pre>
      </div>
    </div>
  </div>

  <!-- BOTTOM: Documentation -->
  <div showcase-docs>
    <control-documentation [config]="documentationConfig"></control-documentation>
  </div>
</av-showcase>
```

### C. Базовый шаблон .component.scss

```scss
// Стили для демо-компонента
.demo-form {
  padding: 16px;

  .form-section-title {
    color: #1890ff;
    font-size: 14px;
    font-weight: 600;
    margin: 16px 0 12px 0;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 8px;

    &:first-child {
      margin-top: 0;
    }
  }

  .control-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;

    &.checkbox-group {
      flex-direction: row;
      align-items: center;
      margin-bottom: 12px;
    }

    .control-label {
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
      font-size: 13px;
    }

    .control-hint {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
    }
  }
}

.preview-container {
  padding: 24px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  background: white;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.config-summary {
  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }

  .config-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: #fafafa;
    border-radius: 4px;
    border: 1px solid #f0f0f0;

    .config-label {
      font-weight: 500;
      color: #666;
    }

    .config-value {
      color: #1890ff;
      font-weight: 600;
    }
  }
}

.example-block {
  margin-bottom: 32px;

  h4 {
    color: #1890ff;
    margin-bottom: 8px;
  }

  p {
    color: #666;
    margin-bottom: 16px;
  }

  pre {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 6px;
    border: 1px solid #e8e8e8;
    overflow-x: auto;

    code {
      font-family: "Fira Code", "Consolas", monospace;
      font-size: 13px;
    }
  }
}
```

### D. Минимальный шаблон .config.ts

```typescript
import { ControlDocumentationConfig } from "@shared/components/ui/control-documentation";

export const DOCUMENTATION: ControlDocumentationConfig = {
  demoComponent: {
    name: "YourNameControlAuroraComponent",
    path: "src/app/pages/ui-demo/your-name-control-aurora/",
    description: "Демонстрационная страница с интерактивными возможностями управления",
    icon: "general/av_page",
  },

  controlComponent: {
    name: "YourTargetComponent (av-your-target)",
    path: "src/app/shared/components/ui/your-target/your-target.component.ts",
    description: "Основной компонент для...",
    icon: "general/av_component",
  },

  mainDescription: {
    componentTitle: "YourTargetComponent (av-your-target)",
    shortDescription: "Краткое описание компонента в одно предложение",
    detailedDescription: "Подробное описание функциональности, возможностей и назначения компонента. Здесь можно рассказать о том, для чего предназначен компонент и как он работает.",
    keyFeatures: ["🎨 Поддержка различных стилевых вариантов", "📏 Множественные размеры (small, medium, large)", "🔄 Реактивное обновление состояния", "⚡ Высокая производительность", "🎯 Простое API", "🛡️ TypeScript поддержка"],
  },

  apiDetails: {
    inputs: [
      {
        name: "label",
        type: "string",
        defaultValue: "''",
        description: "Текст заголовка компонента",
        required: false,
      },
      {
        name: "variant",
        type: '"default" | "primary" | "secondary"',
        defaultValue: '"default"',
        description: "Стилевой вариант компонента",
        required: false,
      },
      {
        name: "size",
        type: '"small" | "medium" | "large"',
        defaultValue: '"medium"',
        description: "Размер компонента",
        required: false,
      },
      {
        name: "disabled",
        type: "boolean",
        defaultValue: "false",
        description: "Отключает взаимодействие с компонентом",
        required: false,
      },
    ],
    outputs: [
      {
        name: "valueChange",
        type: "EventEmitter<string>",
        description: "Событие изменения значения",
      },
    ],
    methods: [],
  },

  usageExamples: [
    {
      title: "Базовый пример",
      description: "Простейший вариант использования",
      htmlCode: `<av-your-target>Контент</av-your-target>`,
      tsCode: `// TypeScript код не требуется`,
    },
    {
      title: "С настройками",
      description: "Использование с дополнительными опциями",
      htmlCode: `<av-your-target
  variant="primary"
  size="large"
  [disabled]="false">
  Контент компонента
</av-your-target>`,
      tsCode: `export class MyComponent {
  // Дополнительные свойства
}`,
    },
  ],

  codeExamples: [
    {
      title: "Различные варианты",
      description: "Примеры разных конфигураций",
      htmlCode: `<!-- Default -->
<av-your-target>Default</av-your-target>

<!-- Primary -->
<av-your-target variant="primary">Primary</av-your-target>

<!-- Large -->
<av-your-target size="large">Large</av-your-target>`,
      tsCode: `// Компонент готов к использованию`,
    },
  ],

  interactiveExample: {
    title: "Интерактивный пример",
    description: "Код, генерируемый на основе настроек в Playground",
  },

  architectureNotes: [
    {
      type: "info",
      title: "Интеграция с дизайн-системой",
      content: "Компонент следует принципам Aurora UI и интегрирован с глобальными стилями системы.",
    },
    {
      type: "tip",
      title: "Рекомендации по использованию",
      content: "Для лучшей производительности используйте компонент с OnPush стратегией изменений.",
    },
  ],
};
```

Эти шаблоны можно копировать и адаптировать для быстрого создания новых Aurora Control компонентов.
