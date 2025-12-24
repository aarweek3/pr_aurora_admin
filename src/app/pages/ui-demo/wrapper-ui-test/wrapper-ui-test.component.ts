import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import {
  ShowcaseComponent,
  ShowcaseConfig,
} from '../../../shared/components/ui/showcase/showcase.component';

@Component({
  selector: 'app-wrapper-ui-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ShowcaseComponent,
    HelpCopyContainerComponent,
    NzTabsModule,
    NzCardModule,
    NzGridModule,
    NzCollapseModule,
    NzButtonModule,
    NzSwitchModule,
    NzFormModule,
    NzInputModule,
    NzSliderModule,
  ],
  templateUrl: './wrapper-ui-test.component.html',
  styleUrl: './wrapper-ui-test.component.scss',
})
export class WrapperUiTestComponent {
  // Конфигурация showcase
  readonly showcaseConfig: ShowcaseConfig = {
    headerConfig: {
      title: 'Wrapper UI Test 🎁',
      description:
        'Демонстрация универсального компонента av-wrapper-ui с полной структурой playground',
      componentName: 'WrapperUiComponent',
      componentPath: 'src/app/shared/components/ui/wrapper-ui/wrapper-ui.component.ts',
    },
    resultTitle: '🎨 Интерактивный результат',
    showExamples: true,
    showDocs: true,
    columnSplit: [14, 10],
  };

  // Настройки wrapper-ui
  headerFixed = true;
  maxWidth = '1400px';
  bordered = true;

  // Примеры кода
  readonly usageExample = `// Способ 1: Через конфигурацию (рекомендуется для demo-страниц)
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

  readonly apiCode = `/**
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

  /** Скролл у body */
  bodyScroll?: boolean;          // default: true

  /** Максимальная ширина контейнера */
  maxWidth?: string;             // default: '1400px'

  /** Боковые отступы (px) */
  padding?: number;              // default: 20

  /** Граница между header и body */
  bordered?: boolean;            // default: true
}`;

  readonly advancedExample = `<!-- С конфигурацией header и настройками -->
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

  readonly importExample = `// app.component.ts или любой другой компонент
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
}
