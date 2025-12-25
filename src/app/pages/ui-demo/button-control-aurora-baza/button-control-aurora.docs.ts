/**
 * Документация и примеры кода для ButtonControlAuroraComponent
 * Вынесено из основного компонента для улучшения читаемости и сопровождения
 */

// --- Документация для интеграции ButtonDirective ---

export const IMPORT_DOC = `import { ButtonDirective } from '@shared/components/ui/button/button.directive';

@Component({
  standalone: true,
  imports: [ButtonDirective],
  // ...
})`;

export const SETUP_DOC = `import { ButtonType, ButtonSize } from '@shared/components/ui/button/button.directive';

export class MyComponent {
  // Конфигурация кнопки
  buttonType: ButtonType = 'primary';
  buttonSize: ButtonSize = 'default';
  isLoading = false;
  isDisabled = false;

  // Обработчик клика
  handleClick() {
    console.log('Button clicked!');
  }
}`;

export const TEMPLATE_DOC = `<!-- Базовое использование -->
<button av-button avType="primary" avSize="default">
  Кнопка
</button>

<!-- С состояниями -->
<button av-button
  avType="primary"
  [avLoading]="isLoading"
  [disabled]="isDisabled"
  (clicked)="handleClick()">
  Сохранить
</button>

<!-- С иконкой -->
<button av-button avType="primary">
  <av-icon type="actions/av_check_mark" [size]="16"></av-icon>
  Подтвердить
</button>`;

export const PRESETS_DOC = `// Типы кнопок
type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link' | 'danger';

// Размеры кнопок
type ButtonSize = 'small' | 'default' | 'large' | 'square';

// Формы кнопок
type ButtonShape = 'default' | 'circle' | 'square' | 'round' | 'rounded' | 'rounded-big';

// Варианты стилей
type ButtonVariant = 'filled' | 'default' | 'dashed' | 'ghost';

// ========================================
// ВИЗУАЛЬНОЕ СРАВНЕНИЕ ВАРИАНТОВ
// ========================================
//
// Заливка (filled):     [████ Кнопка ████]  ← Полный цветной фон + белый текст
// Обводка (default):    [┌─── Кнопка ───┐]  ← Только рамка + цветной текст
// Пунктир (dashed):     [┊··· Кнопка ···┊]  ← Пунктирная рамка + цветной текст
// Прозрачный (ghost):   [    Кнопка    ]    ← Только цветной текст (без фона и рамки)
//
// Ghost вариант - самый минималистичный, идеален для toolbar и второстепенных действий
`;

export const FULL_TS_DOC = `import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonDirective, ButtonType, ButtonSize } from '@shared/components/ui/button/button.directive';
import { IconComponent } from '@shared/components/ui/icon/icon.component';

@Component({
  selector: 'app-button-example',
  standalone: true,
  imports: [CommonModule, ButtonDirective, IconComponent],
  templateUrl: './button-example.component.html',
  styleUrl: './button-example.component.scss'
})
export class ButtonExampleComponent {
  // Состояние кнопки
  isLoading = signal(false);
  isDisabled = signal(false);

  // Конфигурация
  buttonType = signal<ButtonType>('primary');
  buttonSize = signal<ButtonSize>('default');

  // Обработчик события
  async handleSave() {
    this.isLoading.set(true);
    try {
      await this.saveData();
      console.log('Данные сохранены');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async saveData(): Promise<void> {
    // Имитация сохранения
    return new Promise(resolve => setTimeout(resolve, 2000));
  }
}`;

export const FULL_HTML_DOC = `<div class="button-examples">
  <!-- Базовые типы -->
  <div class="example-section">
    <h3>Типы кнопок</h3>
    <button av-button avType="primary">Primary</button>
    <button av-button avType="default">Default</button>
    <button av-button avType="dashed">Dashed</button>
    <button av-button avType="text">Text</button>
    <button av-button avType="link">Link</button>
    <button av-button avType="danger">Danger</button>
  </div>

  <!-- Варианты стилей -->
  <div class="example-section">
    <h3>Варианты (Primary)</h3>
    <button av-button avType="primary" class="av-btn--variant-filled">Заливка</button>
    <button av-button avType="primary" class="av-btn--variant-default">Обводка</button>
    <button av-button avType="primary" class="av-btn--variant-dashed">Пунктир</button>
    <button av-button avType="primary" class="av-btn--variant-ghost">Прозрачный</button>
  </div>

  <!-- Варианты (Danger) -->
      [type]="iconConfig().type"
  <!-- Варианты (Danger) -->
  <div class="example-section">
    <h3>Варианты (Danger)</h3>
    <button av-button avType="danger" class="av-btn--variant-filled">Заливка</button>
    <button av-button avType="danger" class="av-btn--variant-default">Обводка</button>
    <button av-button avType="danger" class="av-btn--variant-dashed">Пунктир</button>
    <button av-button avType="danger" class="av-btn--variant-ghost">Прозрачный</button>
  </div>

  <!-- Размеры -->
  <div class="example-section">
    <h3>Размеры</h3>
    <button av-button avType="primary" avSize="small">Small</button>
    <button av-button avType="primary" avSize="default">Default</button>
    <button av-button avType="primary" avSize="large">Large</button>
  </div>

  <!-- Формы -->
  <div class="example-section">
    <h3>Формы кнопок</h3>
    <button av-button avType="primary" avShape="default">Default</button>
    <button av-button avType="primary" avShape="rounded">Rounded</button>
    <button av-button avType="primary" avShape="rounded-big">Rounded Big</button>
    <button av-button avType="primary" avShape="round">Round (Pill)</button>
    <button av-button avType="primary" avShape="circle">
      <av-icon type="actions/av_check_mark" [size]="16"></av-icon>
    </button>
    <button av-button avType="primary" avShape="square">
      <av-icon type="actions/av_check_mark" [size]="16"></av-icon>
    </button>
  </div>

  <!-- С иконками -->
  <div class="example-section">
    <h3>Кнопки с иконками</h3>
    <button av-button avType="primary">
      <av-icon type="actions/av_check_mark" [size]="16"></av-icon>
      Подтвердить
    </button>
    <button av-button avType="default">
      <av-icon type="actions/av_close" [size]="16"></av-icon>
      Отмена
    </button>
    <button av-button avType="danger">
      <av-icon type="actions/av_delete" [size]="16"></av-icon>
      Удалить
    </button>
  </div>

  <!-- Состояния -->
  <div class="example-section">
    <h3>Состояния</h3>
    <button av-button avType="primary" [avLoading]="isLoading()">
      Загрузка...
    </button>
    <button av-button avType="primary" [disabled]="true">
      Отключена
    </button>
    <button av-button avType="primary" [avBlock]="true">
      На всю ширину (Block)
    </button>
  </div>
</div>`;

export const FULL_SCSS_DOC = `.button-examples {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .example-section {
    display: flex;
    flex-direction: column;
    gap: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }

    button {
      margin-right: 12px;
      margin-bottom: 12px;

      &:last-child {
        margin-right: 0;
      }
    }
  }
}`;

export const USAGE_EXAMPLE = `// Базовые примеры использования
<button av-button avType="primary">Кнопка</button>
<button av-button avType="default" avSize="large">Большая кнопка</button>
<button av-button avType="danger" [avLoading]="true">Удаление...</button>

// С иконками
<button av-button avType="primary">
  <av-icon type="actions/av_add" [size]="16"></av-icon>
  Добавить
</button>

// Разные формы
<button av-button avType="primary" avShape="round">Pill Button</button>
<button av-button avType="primary" avShape="circle">
  <av-icon type="actions/av_check_mark" [size]="16"></av-icon>
</button>

// Варианты стилей
<button av-button avType="primary" class="av-btn--variant-default">
  Primary Обводка
</button>
<button av-button avType="danger" class="av-btn--variant-dashed">
  Danger Пунктир
</button>

// С обработчиком событий
<button av-button avType="primary" (clicked)="handleSave()">
  Сохранить
</button>`;

export const API_EXAMPLE = `// ========================================
// BUTTON DIRECTIVE API - Полная документация
// ========================================

// 1. БАЗОВОЕ ИСПОЛЬЗОВАНИЕ
<button av-button>Кнопка</button>
<button av-button avType="primary">Primary Button</button>
<button av-button avType="primary" avSize="large">Large Primary</button>

// 2. ПАРАМЕТРЫ ДИРЕКТИВЫ

// avType - Тип кнопки
type ButtonType = 'primary' | 'default' | 'dashed' | 'text' | 'link' | 'danger';
<button av-button avType="primary">Primary</button>
<button av-button avType="danger">Danger</button>

// avSize - Размер кнопки
type ButtonSize = 'small' | 'default' | 'large' | 'square';
<button av-button avSize="small">Small</button>
<button av-button avSize="default">Default</button>
<button av-button avSize="large">Large</button>

// avShape - Форма кнопки
type ButtonShape = 'default' | 'circle' | 'square' | 'round' | 'rounded' | 'rounded-big';
<button av-button avShape="default">Default (0px)</button>
<button av-button avShape="rounded">Rounded (4px)</button>
<button av-button avShape="rounded-big">Rounded Big (12px)</button>
<button av-button avShape="round">Round (Pill)</button>
<button av-button avShape="circle">○</button>  // Круг (1:1)
<button av-button avShape="square">□</button>  // Квадрат (1:1)

// avLoading - Состояние загрузки
<button av-button [avLoading]="true">Загрузка...</button>
<button av-button [avLoading]="isLoading()">Сохранить</button>

// avBlock - На всю ширину
<button av-button [avBlock]="true">Block Button</button>

// disabled - Отключена
<button av-button [disabled]="true">Disabled</button>
<button av-button [disabled]="isDisabled()">Save</button>

// avIconOnly - Только иконка
<button av-button [avIconOnly]="true">
  <av-icon type="actions/av_check_mark"></av-icon>
</button>

// 3. ВАРИАНТЫ СТИЛЕЙ (через CSS классы)

// Заливка (по умолчанию)
<button av-button avType="primary">Primary Filled</button>

// Обводка
<button av-button avType="primary" class="av-btn--variant-default">
  Primary Обводка
</button>

// Пунктир
<button av-button avType="primary" class="av-btn--variant-dashed">
  Primary Пунктир
</button>

// Прозрачный
<button av-button avType="primary" class="av-btn--variant-ghost">
  Primary Прозрачный
</button>

// 4. СПЕЦИАЛЬНЫЕ КОМБИНАЦИИ

// Primary + Default (обводка)
<button av-button avType="primary" class="av-btn--variant-default">
  Primary Outlined
</button>

// Primary + Dashed (пунктир)
<button av-button avType="primary" class="av-btn--variant-dashed">
  Primary Dashed
</button>

// Danger + Default (обводка)
<button av-button avType="danger" class="av-btn--variant-default">
  Danger Outlined
</button>

// Danger + Dashed (пунктир)
<button av-button avType="danger" class="av-btn--variant-dashed">
  Danger Dashed
</button>

// Primary + Ghost (прозрачный)
<button av-button avType="primary" class="av-btn--variant-ghost">
  Primary Ghost
</button>

// Danger + Ghost (прозрачный)
<button av-button avType="danger" class="av-btn--variant-ghost">
  Danger Ghost
</button>

// ========================================
// ДЕТАЛЬНОЕ ОПИСАНИЕ ВАРИАНТОВ GHOST
// ========================================
// Прогрессивное усиление яркости при взаимодействии

// Primary - Ghost (светлая тема):
// - Прозрачный фон, без рамки
// - Обычное: Средняя яркость (#40a9ff - светло-синий)
// - При наведении: Полная яркость (#1890ff - яркий синий) + лёгкий фон (8%)
// - При нажатии: Тёмный (#096dd9) + выраженный фон (15%)

// Danger - Ghost (светлая тема):
// - Прозрачный фон, без рамки
// - Обычное: Средняя яркость (#ff7875 - светло-красный)
// - При наведении: Полная яркость (#ff4d4f - яркий красный) + лёгкий фон (8%)
// - При нажатии: Тёмный (#d9363e) + выраженный фон (15%)

// Primary - Ghost (тёмная тема):
// - Прозрачный фон, без рамки
// - Обычное: Средняя яркость (#3c9ae8 - светло-синий)
// - При наведении: Полная яркость (#177ddc - яркий тёмно-синий) + лёгкий фон (12%)
// - При нажатии: Тёмный (#1765ad) + выраженный фон (20%)

// Danger - Ghost (тёмная тема):
// - Прозрачный фон, без рамки
// - Обычное: Средняя яркость (#d32029 - светло-красный)
// - При наведении: Полная яркость (#a61d24 - яркий тёмно-красный) + лёгкий фон (12%)
// - При нажатии: Тёмный (#7c1823) + выраженный фон (20%)

// Эффект "просыпания" кнопки:
// Ненавязчивая → Яркая → Насыщенная

// Примеры использования Ghost вариантов:// Примеры использования Ghost вариантов:
<button av-button avType="primary" class="av-btn--variant-ghost">
  <av-icon type="settings/av_cog" [size]="16"></av-icon>
  Настройки
</button>

<button av-button avType="danger" class="av-btn--variant-ghost">
  <av-icon type="actions/av_delete" [size]="16"></av-icon>
  Удалить
</button>

// Ghost варианты идеально подходят для:
// - Второстепенных действий
// - Toolbar кнопок
// - Inline действий внутри текста
// - Минималистичного дизайна без визуального шума

// 5. КНОПКИ С ИКОНКАМИ

// Иконка + Текст
<button av-button avType="primary">
  <av-icon type="actions/av_check_mark" [size]="16"></av-icon>
  Подтвердить
</button>

// Только иконка (круг)
<button av-button avType="primary" avShape="circle">
  <av-icon type="actions/av_add" [size]="16"></av-icon>
</button>

// Только иконка (квадрат)
<button av-button avType="primary" avShape="square">
  <av-icon type="settings/av_cog" [size]="16"></av-icon>
</button>

// Размеры иконок адаптируются:
// - Small button: иконка 14px
// - Default button: иконка 16px
// - Large button: иконка 20px

// 6. СОБЫТИЯ

// clicked - Событие клика (альтернатива стандартному (click))
<button av-button (clicked)="handleClick()">Click Me</button>

// Стандартный (click) также работает
<button av-button (click)="handleClick()">Click Me</button>

// 7. КАСТОМНАЯ СТИЛИЗАЦИЯ

// Цвет фона
<button av-button [style.background-color]="'#52c41a'">
  Custom Green
</button>

// Цвет текста
<button av-button [style.color]="'#ff4d4f'">
  Custom Text Color
</button>

// Комбинированная стилизация
<button av-button
  avType="default"
  [style.background-color]="'#f0f5ff'"
  [style.color]="'#1890ff'"
  [style.border-color]="'#91d5ff'">
  Custom Styled
</button>

// 8. АДАПТИВНОСТЬ

// Автоматическое центрирование иконок
// Для кнопок с текстом: gap между иконкой и текстом
// Для кнопок только с иконкой (circle/square): gap = 0, идеальное центрирование

// 9. ТЕМНАЯ ТЕМА

// Все кнопки автоматически поддерживают тёмную тему
// Цвета адаптируются через :host-context(.dark-theme)

// 10. ПОЛНЫЙ ПРИМЕР

<button av-button
  avType="primary"
  avSize="large"
  avShape="rounded"
  class="av-btn--variant-default"
  [avLoading]="isLoading()"
  [disabled]="isDisabled()"
  (clicked)="handleSave()">
  <av-icon type="actions/av_save" [size]="20"></av-icon>
  Сохранить изменения
</button>`;
