export const IMPORT_EXAMPLE = `// app.component.ts или любой другой компонент
import { Component } from '@angular/core';
import { WrapperUiComponent, WrapperUiConfigHeader } from '@shared/components/ui/wrapper-ui/wrapper-ui.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    WrapperUiComponent,  // 👈 Добавьте сюда!
    NzButtonModule,
    NzCardModule,
  ],
  template: \`
    <av-wrapper-ui [headerConfig]="headerConfig">
      <div wrapper-body>
        <nz-card nzTitle="Карточка 1">
          <p>Контент карточки 1</p>
          <button nz-button nzType="primary">Кнопка</button>
        </nz-card>

        <nz-card nzTitle="Карточка 2" style="margin-top: 16px">
          <p>Контент карточки 2</p>
        </nz-card>
      </div>
    </av-wrapper-ui>
  \`,
})
export class ExampleComponent {
  headerConfig: WrapperUiConfigHeader = {
    title: 'Моя страница 🎨',
    description: 'Пример использования wrapper-ui с конфигурацией',
    componentName: 'ExampleComponent',
    componentPath: 'src/app/pages/example/example.component.ts',
    note: '💡 Новый способ использования через headerConfig'
  };
}`;

export const USAGE_EXAMPLE = `// Способ 1: Через конфигурацию (рекомендуется для demo-страниц)
import { WrapperUiConfigHeader } from '@shared/components/ui/wrapper-ui/wrapper-ui.component';

headerConfig: WrapperUiConfigHeader = {
  title: 'Моя страница 🎨',
  description: 'Описание страницы',
  componentName: 'MyComponent',
  componentPath: 'src/app/pages/my-page/my-page.component.ts'
};

<av-wrapper-ui [headerConfig]="headerConfig">
  <div wrapper-body>
    <p>Основной контент</p>
  </div>
</av-wrapper-ui>

// Способ 2: Через content projection (для production)
<av-wrapper-ui>
  <div wrapper-header>
    <h1>Заголовок страницы</h1>
    <p>Описание или дополнительная информация</p>
  </div>
  <div wrapper-body>
    <p>Основной контент страницы</p>
  </div>
</av-wrapper-ui>`;

export const ADVANCED_EXAMPLE = `<!-- С конфигурацией header и настройками -->
const headerConfig: WrapperUiConfigHeader = {
  title: 'Advanced Page 🚀',
  description: 'Страница с кастомными настройками',
  componentName: 'AdvancedComponent',
  componentPath: 'src/app/pages/advanced/advanced.component.ts',
  note: '⚠️ Экспериментальный компонент'
};

<av-wrapper-ui
  [headerConfig]="headerConfig"
  [headerFixed]="false"
  [bodyScroll]="true"
  maxWidth="1400px"
  [padding]="24"
  [bordered]="true"
>
  <div wrapper-header>
    <div class="page-header">
      <h1>Настраиваемый контейнер</h1>
      <button>Действие</button>
    </div>
  </div>

  <div wrapper-body>
    <div class="content">
      <!-- Ваш контент -->
    </div>
  </div>
</av-wrapper-ui>`;

export const API_DOC = `/**
 * @interface WrapperUiConfigHeader
 * Конфигурация для автоматической генерации header
 */
export interface WrapperUiConfigHeader {
  /** Заголовок страницы (обязательно) */
  title: string;

  /** Описание страницы */
  description?: string;

  /** Название компонента (например: "WrapperUiComponent") */
  componentName?: string;

  /** Путь к файлу компонента */
  componentPath?: string;

  /** Дополнительная заметка (например: "⚠️ Экспериментальный компонент") */
  note?: string;

  /** Компонент контрол: название и путь */
  controlComponent?: {
    name: string;
    path: string;
  };

  /** Путь к файлу документации */
  docsPath?: string;
}

/**
 * @component av-wrapper-ui
 * Универсальный контейнер для страниц приложения
 */
export interface WrapperUiProps {
  /** Конфигурация header (альтернатива content projection) */
  headerConfig?: WrapperUiConfigHeader | null;  // default: null

  /** Фиксированный header (sticky) */
  headerFixed?: boolean;        // default: true

  /** Максимальная ширина контейнера */
  maxWidth?: string;             // default: '1400px'

  /** Граница между header и body */
  bordered?: boolean;            // default: true
}`;

export const FULL_INTEGRATION_EXAMPLE = `// 🚀 ПОЛНЫЙ ПРИМЕР ИНТЕГРАЦИИ: Showcase + WrapperUI + Picker
// Это полная архитектурная схема для создания demo-страниц в Aurora Admin

// ===========================================
// 1️⃣ СТРУКТУРА ФАЙЛОВ
// ===========================================
/*
src/app/pages/ui-demo/my-demo-page/
├── my-demo-page.component.ts     // Главный компонент
├── my-demo-page.component.html   // HTML шаблон
├── my-demo-page.component.scss   // Стили
├── my-demo-page.docs.ts          // Документация
└── README.md                     // Описание компонента
*/

// ===========================================
// 2️⃣ TYPESCRIPT КОМПОНЕНТ (my-demo-page.component.ts)
// ===========================================
import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { ButtonDirective } from '../../../shared/components/ui/button/button.directive';
import { IconComponent } from '../../../shared/components/ui/icon/icon.component';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { PickerComponent } from '../../../shared/components/ui/picker/picker.component';
import { ShowcaseComponent, ShowcaseConfig } from '../../../shared/components/ui/showcase/showcase.component';
import { CustomColor, PickerMode } from '../../../shared/components/ui/picker/picker.types';
import {
  API_EXAMPLE,
  USAGE_EXAMPLES,
  IMPORT_DOC,
  SETUP_DOC
} from './my-demo-page.docs';

@Component({
  selector: 'app-my-demo-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,      // 🎯 Главный архитектурный компонент
    PickerComponent,        // 🎨 Демонстрируемый UI компонент
    ButtonDirective,
    IconComponent,
    HelpCopyContainerComponent,
    NzRadioModule,
    NzCheckboxModule,
    NzCollapseModule,
  ],
  templateUrl: './my-demo-page.component.html',
  styleUrl: './my-demo-page.component.scss',
})
export class MyDemoPageComponent implements OnDestroy {
  // 📋 КОНФИГУРАЦИЯ SHOWCASE (главное!)
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'My UI Component Demo 🎨',
      componentName: 'MyDemoPageComponent',
      componentPath: 'src/app/pages/ui-demo/my-demo-page/my-demo-page.component.ts',
      controlComponent: {
        name: 'PickerComponent',  // Какой UI компонент демонстрируем
        path: 'src/app/shared/components/ui/picker/picker.component.ts',
      },
      docsPath: 'src/app/pages/ui-demo/my-demo-page/my-demo-page.docs.ts',
      description: 'Демонстрация возможностей PickerComponent с живыми примерами.',
      note: '💡 Используйте ShowcaseComponent для всех demo-страниц',
    },
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],  // 60/40 split
    resultBlocks: {
      preview: { title: '🎯 Живой пример' },
      code: { title: '📄 Генерированный код' },
      description: { title: '📋 Настройки', autoParams: true },
    },
  };

  // 🎛️ СОСТОЯНИЕ UI КОМПОНЕНТА (signals)
  selectedColor = signal<string>('#1890ff');
  selectedMode = signal<PickerMode>('custom-and-picker');
  allowTransparent = signal<boolean>(false);
  showInput = signal<boolean>(true);

  // 🎨 ДАННЫЕ ДЛЯ ДЕМОНСТРАЦИИ
  customColors = signal<CustomColor[]>([
    { name: 'Primary', value: '#1890ff', category: 'primary' },
    { name: 'Success', value: '#52c41a', category: 'primary' },
    { name: 'Warning', value: '#faad14', category: 'primary' },
    { name: 'Error', value: '#ff4d4f', category: 'primary' },
  ]);

  modes: { value: PickerMode; label: string }[] = [
    { value: 'custom-only', label: 'Только кастомные цвета' },
    { value: 'picker-only', label: 'Только color picker' },
    { value: 'custom-and-picker', label: 'Комбинация' },
  ];

  // 📊 COMPUTED СВОЙСТВА (автогенерация кода)
  generatedCode = computed(() => {
    const mode = this.selectedMode();
    const color = this.selectedColor();
    const allowTransp = this.allowTransparent();
    const showInp = this.showInput();

    return \`<av-picker
  mode="\${mode}"
  [(selectedColor)]="selectedColor"
  [customColors]="customColors"
  [allowTransparent]="\${allowTransp}"
  [showInput]="\${showInp}">
</av-picker>\`;
  });

  currentParams = computed(() => ({
    'Выбранный цвет': this.selectedColor(),
    'Режим работы': this.selectedMode(),
    'Прозрачность': this.allowTransparent() ? 'Разрешена' : 'Запрещена',
    'Поле ввода': this.showInput() ? 'Показано' : 'Скрыто',
  }));

  // 🛠️ МЕТОДЫ УПРАВЛЕНИЯ
  onColorChange(color: string): void {
    this.selectedColor.set(color);
  }

  resetToDefaults(): void {
    this.selectedColor.set('#1890ff');
    this.selectedMode.set('custom-and-picker');
    this.allowTransparent.set(false);
    this.showInput.set(true);
  }

  // 📚 СТАТИЧНАЯ ДОКУМЕНТАЦИЯ (из .docs.ts)
  readonly apiExample = API_EXAMPLE;
  readonly usageExamples = USAGE_EXAMPLES;
  readonly importDoc = IMPORT_DOC;
  readonly setupDoc = SETUP_DOC;

  // 🧹 ОЧИСТКА РЕСУРСОВ
  ngOnDestroy(): void {
    // Очистка таймеров, подписок и т.д.
  }
}

// ===========================================
// 3️⃣ HTML ШАБЛОН (my-demo-page.component.html)
// ===========================================
/*
<av-showcase [config]="showcaseConfig">
  <!-- 🎯 PREVIEW: Живая демонстрация -->
  <div preview class="demo-preview">
    <div class="picker-container">
      <av-picker
        [mode]="selectedMode()"
        [(selectedColor)]="selectedColor"
        [customColors]="customColors()"
        [allowTransparent]="allowTransparent()"
        [showInput]="showInput()"
        (colorChange)="onColorChange($event)">
      </av-picker>
    </div>

    <!-- Применение цвета к UI элементам -->
    <div class="color-demo">
      <button av-button
              avType="primary"
              [style.background-color]="selectedColor()">
        Пример кнопки
      </button>

      <av-icon type="system/av_star"
               [size]="48"
               [color]="selectedColor()">
      </av-icon>

      <div class="color-value" [style.color]="selectedColor()">
        {{ selectedColor() }}
      </div>
    </div>
  </div>

  <!-- 📄 CODE: Автогенерированный код -->
  <div code>
    <av-help-copy-container
      title="Генерированный код"
      [content]="generatedCode()"
      bgColor="#1e293b">
    </av-help-copy-container>
  </div>

  <!-- 📋 DESCRIPTION: Настройки -->
  <div description class="settings-panel">
    <div class="settings-section">
      <h4>🎛️ Настройки</h4>

      <!-- Режим работы -->
      <div class="setting-group">
        <label>Режим работы:</label>
        <nz-radio-group
          [ngModel]="selectedMode()"
          (ngModelChange)="selectedMode.set($event)">
          <label nz-radio
                 *ngFor="let mode of modes"
                 [nzValue]="mode.value">
            {{ mode.label }}
          </label>
        </nz-radio-group>
      </div>

      <!-- Опции -->
      <div class="setting-group">
        <label nz-checkbox
               [(ngModel)]="allowTransparent">
          Разрешить прозрачность
        </label>

        <label nz-checkbox
               [(ngModel)]="showInput">
          Показать поле ввода HEX
        </label>
      </div>

      <!-- Быстрые действия -->
      <div class="action-buttons">
        <button av-button
                avType="default"
                (click)="resetToDefaults()">
          Сброс
        </button>
      </div>

      <!-- Текущие параметры -->
      <div class="params-list">
        <div *ngFor="let param of currentParams() | keyvalue">
          <span>{{ param.key }}:</span>
          <code>{{ param.value }}</code>
        </div>
      </div>
    </div>
  </div>

  <!-- 📚 EXAMPLES: Примеры использования -->
  <div examples>
    <nz-collapse nzAccordion>
      <nz-collapse-panel nzHeader="🚀 Базовая интеграция">
        <av-help-copy-container
          title="Импорт и настройка"
          [content]="importDoc"
          bgColor="#1e293b">
        </av-help-copy-container>
      </nz-collapse-panel>

      <nz-collapse-panel nzHeader="💡 Примеры использования">
        <av-help-copy-container
          title="Практические примеры"
          [content]="usageExamples"
          bgColor="#1e293b">
        </av-help-copy-container>
      </nz-collapse-panel>
    </nz-collapse>
  </div>

  <!-- 📖 DOCS: Техническая документация -->
  <div docs>
    <nz-collapse nzAccordion>
      <nz-collapse-panel nzHeader="📋 API Reference">
        <av-help-copy-container
          title="Полная документация API"
          [content]="apiExample"
          bgColor="#0a0e1a">
        </av-help-copy-container>
      </nz-collapse-panel>
    </nz-collapse>
  </div>
</av-showcase>
*/

// ===========================================
// 4️⃣ ДОКУМЕНТАЦИЯ (my-demo-page.docs.ts)
// ===========================================
/*
export const IMPORT_DOC = \`import { PickerComponent } from '@shared/components/ui/picker/picker.component';
import { CustomColor, PickerMode } from '@shared/components/ui/picker/picker.types';

@Component({
  standalone: true,
  imports: [PickerComponent],
})\`;

export const SETUP_DOC = \`selectedColor = signal<string>('#1890ff');
selectedMode = signal<PickerMode>('custom-and-picker');\`;

export const USAGE_EXAMPLES = \`<av-picker mode="custom-only"></av-picker>
<av-picker mode="picker-only"></av-picker>
<av-picker mode="custom-and-picker"></av-picker>\`;

export const API_EXAMPLE = \`interface PickerProps {
  mode: PickerMode;
  selectedColor: string;
  customColors: CustomColor[];
}\`;
*/

// ===========================================
// 5️⃣ МАРШРУТИЗАЦИЯ (ui-demo.routes.ts)
// ===========================================
/*
{
  path: 'my-demo-page',
  loadComponent: () =>
    import('./my-demo-page/my-demo-page.component').then(
      (c) => c.MyDemoPageComponent
    ),
},
*/

// ===========================================
// 6️⃣ МЕНЮ (sidebar-default.config.ts)
// ===========================================
/*
{
  id: 'my-demo-page',
  title: 'My Demo Page',
  icon: 'editor/av_paint',
  href: '/ui-demo/my-demo-page',
  badge: { text: '🎨', intent: 'info' },
},
*/

// ===========================================
// 🎯 КЛЮЧЕВЫЕ ПРИНЦИПЫ АРХИТЕКТУРЫ
// ===========================================

/**
 * 1. ShowcaseComponent - ОСНОВА всех demo-страниц
 *    - Унифицированная структура
 *    - Автоматическая генерация header
 *    - 3-блочная система: preview + code + description
 *    - Встроенные секции examples + docs
 *
 * 2. WrapperUiComponent - архитектурный фундамент
 *    - Автоматически используется внутри ShowcaseComponent
 *    - Управляет layout и header
 *    - Responsive дизайн
 *
 * 3. Signals + Computed - реактивность
 *    - Все состояние через signals
 *    - Автогенерация кода через computed
 *    - Живые обновления параметров
 *
 * 4. Документация в отдельных файлах
 *    - .docs.ts файлы для каждого компонента
 *    - Переиспользуемые блоки кода
 *    - Техническая документация API
 *
 * 5. Стандартизированная структура
 *    - Единообразные пути и названия
 *    - Консистентная навигация
 *    - Автоматическая интеграция в меню
 */`;
