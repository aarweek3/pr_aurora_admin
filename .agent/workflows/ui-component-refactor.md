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
3.  **Файлы**: Создайте 4 основных файла:
    - `[name]-control-aurora.component.ts` (Логика)
    - `[name]-control-aurora.component.html` (Шаблон)
    - `[name]-control-aurora.component.scss` (Стили)
    - `[name]-control-aurora.docs.ts` (Документация и константы)

## ЭТАП 2: Логика Компонента (.ts)

Используйте следующий шаблон для TypeScript файла.

```typescript
// Imports...
import { Component, computed, signal } from '@angular/core';
import { ShowcaseComponent, ShowcaseConfig } from '.../showcase.component';
import { ..._DOC } from './[name]-control-aurora.docs';

// Interface for component configuration
interface ComponentConfig {
  prop1: string;
  prop2: boolean;
  // ...
}

@Component({
  selector: 'app-[name]-control-aurora',
  standalone: true,
  imports: [ShowcaseComponent, ...], // Import modules needed for controls & preview
  templateUrl: './....html',
  styleUrl: './....scss',
})
export class [Name]ControlAuroraComponent {
  // 1. Showcase Configuration
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

  // 2. State Management (Signals)
  config = signal<ComponentConfig>({
    prop1: 'default',
    prop2: true,
  });

  // 3. Helper for updates
  updateConfig(key: keyof ComponentConfig, value: any) {
    this.config.update(c => ({ ...c, [key]: value }));
  }

  // 4. Code Generation
  generatedCode = computed(() => {
    const c = this.config();
    return `<av-component
  [prop1]="'${c.prop1}'"
  [prop2]="${c.prop2}"
></av-component>`;
  });

  // Docs linking
  readonly apiDoc = API_DOC;
  // ... other docs
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
