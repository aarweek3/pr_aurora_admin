import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { HelpCopyContainerComponent } from '../../../shared/components/ui/container-help-copy-ui/container-help-copy-ui.component';
import { WrapperUiComponent } from '../../../shared/components/ui/wrapper-ui/wrapper-ui.component';

@Component({
  selector: 'app-wrapper-ui-test',
  standalone: true,
  imports: [
    CommonModule,
    WrapperUiComponent,
    HelpCopyContainerComponent,
    NzTabsModule,
    NzCardModule,
    NzGridModule,
    NzCollapseModule,
  ],
  templateUrl: './wrapper-ui-test.component.html',
  styleUrl: './wrapper-ui-test.component.scss',
})
export class WrapperUiTestComponent {
  // Примеры кода
  readonly usageExample = `<av-wrapper-ui>
  <div wrapper-header>
    <h1>Заголовок страницы</h1>
    <p>Описание или дополнительная информация</p>
  </div>

  <div wrapper-body>
    <p>Основной контент страницы</p>
    <!-- Ваш контент здесь -->
  </div>
</av-wrapper-ui>`;

  readonly apiCode = `/**
 * @component av-wrapper-ui
 * Универсальный контейнер для страниц приложения
 */
export interface WrapperUiProps {
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

  readonly advancedExample = `<!-- С настройками -->
<av-wrapper-ui
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

  readonly scrollExample = `<av-wrapper-ui>
  <div wrapper-header>
    <h1>Длинный контент</h1>
  </div>
  <div wrapper-body>
    ${Array.from(
      { length: 50 },
      (_, i) => `<p>Параграф ${i + 1} - контент для демонстрации скролла</p>`,
    ).join('\n    ')}
  </div>
</av-wrapper-ui>`;

  readonly importExample = `// app.component.ts или любой другой компонент
import { Component } from '@angular/core';
import { WrapperUiComponent } from '@shared/components/ui/wrapper-ui/wrapper-ui.component';
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
    <av-wrapper-ui>
      <div wrapper-header>
        <h1>Моя страница</h1>
        <p>Пример использования wrapper-ui</p>
      </div>

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
export class ExampleComponent {}`;
}
