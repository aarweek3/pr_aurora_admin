/**
 * Документация и примеры кода для ColorComponentAuroraComponent
 * Вынесено из основного компонента для улучшения читаемости и сопровождения
 */

// --- Документация для интеграции PickerComponent ---

export const IMPORT_DOC = `import { PickerComponent } from '@shared/components/ui/picker/picker.component';
import { CustomColor, PickerMode } from '@shared/components/ui/picker/picker.types';

@Component({
  standalone: true,
  imports: [PickerComponent],
  // ...
})`;

export const SETUP_DOC = `import { signal } from '@angular/core';
import { CustomColor, PickerMode } from '@shared/components/ui/picker/picker.types';

export class MyComponent {
  // Инициализация состояния color picker
  selectedColor = signal<string>('#1890ff');
  selectedMode = signal<PickerMode>('custom-and-picker');

  // Кастомные цвета для палитры
  customColors = signal<CustomColor[]>([
    { name: 'Primary', value: '#1890ff', category: 'primary' },
    { name: 'Success', value: '#52c41a', category: 'primary' },
    { name: 'Warning', value: '#faad14', category: 'primary' }
  ]);

  // Обработка изменений цвета
  onColorChange(color: string) {
    console.log('Color changed:', color);
  }
}`;

export const TEMPLATE_DOC = `<!-- Базовое использование picker -->
<av-picker
  [mode]="selectedMode()"
  [(selectedColor)]="selectedColor"
  [customColors]="customColors()"
  [allowTransparent]="false"
  [showInput]="true"
  (colorChange)="onColorChange($event)">
</av-picker>

<!-- С обёрткой field-group -->
<av-field-group label="Выберите цвет" [collapsible]="true">
  <av-picker
    mode="custom-and-picker"
    [(selectedColor)]="selectedColor"
    [customColors]="customColors()">
  </av-picker>
</av-field-group>`;

export const MODES_DOC = `// Доступные режимы работы PickerComponent
type PickerMode = 'custom-only' | 'picker-only' | 'custom-and-picker';

// custom-only - Только кастомная палитра цветов
<av-picker mode="custom-only" [customColors]="myColors"></av-picker>

// picker-only - Только системный color picker
<av-picker mode="picker-only"></av-picker>

// custom-and-picker - Комбинация палитры + picker (по умолчанию)
<av-picker mode="custom-and-picker" [customColors]="myColors"></av-picker>`;

export const FULL_TS_DOC = `import { Component, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { PickerComponent } from '@shared/components/ui/picker/picker.component';
import { CustomColor, PickerMode } from '@shared/components/ui/picker/picker.types';
import { ButtonDirective } from '@shared/components/ui/button/button.directive';
import { IconComponent } from '@shared/components/ui/icon/icon.component';

@Component({
  selector: 'app-color-picker-example',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzRadioModule,
    PickerComponent,
    ButtonDirective,
    IconComponent
  ],
  templateUrl: './color-picker-example.component.html',
  styleUrl: './color-picker-example.component.scss'
})
export class ColorPickerExampleComponent implements OnDestroy {
  // Основное состояние
  selectedColor = signal<string>('#1890ff');
  selectedMode = signal<PickerMode>('custom-and-picker');

  // Кастомные цвета с категориями
  customColors = signal<CustomColor[]>([
    { name: 'Primary', value: '#1890ff', category: 'primary' },
    { name: 'Success', value: '#52c41a', category: 'primary' },
    { name: 'Warning', value: '#faad14', category: 'primary' },
    { name: 'Error', value: '#ff4d4f', category: 'primary' },
    { name: 'Purple', value: '#722ed1', category: 'secondary' },
    { name: 'Cyan', value: '#13c2c2', category: 'secondary' },
    { name: 'Orange', value: '#fa541c', category: 'secondary' },
    { name: 'Lime', value: '#a0d911', category: 'secondary' }
  ]);

  // Доступные режимы
  modes: { value: PickerMode; label: string }[] = [
    { value: 'custom-only', label: 'Только кастомные цвета' },
    { value: 'picker-only', label: 'Только color picker' },
    { value: 'custom-and-picker', label: 'Комбинация' }
  ];

  // Автогенерация кода
  generatedCode = computed(() => {
    const mode = this.selectedMode();
    const color = this.selectedColor();

    return \`<av-picker
  mode="\${mode}"
  [(selectedColor)]="selectedColor"
  \${mode !== 'picker-only' ? '[customColors]="customColors"' : ''}
  [allowTransparent]="false"
  [showInput]="true">
</av-picker>\`;
  });

  // Обработка изменений
  onColorChange(color: string): void {
    console.log('Selected color:', color);
  }

  onModeChange(mode: PickerMode): void {
    this.selectedMode.set(mode);
  }

  // Очистка ресурсов
  ngOnDestroy(): void {
    // Очистка при необходимости
  }
}`;

export const FULL_HTML_DOC = `<div class="color-picker-demo">
  <!-- Панель настроек -->
  <div class="settings-panel">
    <div class="setting-group">
      <label>Режим работы:</label>
      <nz-radio-group
        [ngModel]="selectedMode()"
        (ngModelChange)="onModeChange($event)">
        <label nz-radio
               *ngFor="let mode of modes"
               [nzValue]="mode.value">
          {{ mode.label }}
        </label>
      </nz-radio-group>
    </div>
  </div>

  <!-- Color Picker -->
  <div class="picker-container">
    <av-picker
      [mode]="selectedMode()"
      [(selectedColor)]="selectedColor"
      [customColors]="customColors()"
      [allowTransparent]="false"
      [showInput]="true"
      (colorChange)="onColorChange($event)">
    </av-picker>
  </div>

  <!-- Демонстрация результатов -->
  <div class="demo-results">
    <button av-button
            avType="primary"
            [style.background-color]="selectedColor()"
            [style.border-color]="selectedColor()">
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

  <!-- Генерированный код -->
  <div class="generated-code">
    <pre><code>{{ generatedCode() }}</code></pre>
  </div>
</div>`;

export const FULL_SCSS_DOC = `.color-picker-demo {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  .settings-panel {
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;

    .setting-group {
      display: flex;
      flex-direction: column;
      gap: 12px;

      label {
        font-weight: 600;
        color: #262626;
      }
    }
  }

  .picker-container {
    display: flex;
    justify-content: center;
    padding: 20px;
    background: #fafafa;
    border-radius: 8px;
    border: 1px dashed #d9d9d9;
  }

  .demo-results {
    display: flex;
    gap: 24px;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: #f0f2f5;
    border-radius: 8px;
    flex-wrap: wrap;

    .color-value {
      font-size: 24px;
      font-weight: 800;
      font-family: 'Fira Code', monospace;
    }
  }

  .generated-code {
    padding: 16px;
    background: #1e293b;
    border-radius: 8px;

    pre {
      margin: 0;
      color: #e2e8f0;
      font-family: 'Fira Code', monospace;
      font-size: 14px;
      overflow-x: auto;
    }
  }
}

// Темная тема
@media (prefers-color-scheme: dark) {
  .color-picker-demo {
    background: #1f2937;

    .settings-panel {
      background: #374151;
    }

    .picker-container {
      background: #374151;
      border-color: #4b5563;
    }

    .demo-results {
      background: #374151;
    }
  }
}`;

export const USAGE_EXAMPLES = `// 1. Базовые примеры
<av-picker mode="custom-only" [customColors]="brandColors"></av-picker>
<av-picker mode="picker-only"></av-picker>
<av-picker mode="custom-and-picker"></av-picker>

// 2. С настройками
<av-picker
  mode="custom-and-picker"
  [(selectedColor)]="myColor"
  [customColors]="myColors"
  [allowTransparent]="true"
  [showInput]="true"
  [showAlpha]="false">
</av-picker>

// 3. В форме
<av-field-group label="Цвет темы" [collapsible]="true">
  <av-picker
    mode="custom-only"
    [(selectedColor)]="themeColor"
    [customColors]="themeColors">
  </av-picker>
</av-field-group>

// 4. Компактный режим
<av-picker
  avSize="compact"
  mode="custom-and-picker"
  [(selectedColor)]="accentColor"
  [showWrapper]="false">
</av-picker>`;

export const API_EXAMPLE = `// ========================================
// PICKER COMPONENT API - Полная документация
// ========================================

// 1. БАЗОВОЕ ИСПОЛЬЗОВАНИЕ
<av-picker></av-picker>
<av-picker mode="custom-only"></av-picker>
<av-picker [(selectedColor)]="myColor"></av-picker>

// 2. ОБЯЗАТЕЛЬНЫЕ ПАРАМЕТРЫ
// Нет обязательных параметров - все имеют значения по умолчанию

// 3. ОСНОВНЫЕ ПАРАМЕТРЫ
mode: PickerMode                    // Режим: 'custom-only' | 'picker-only' | 'custom-and-picker'
[(selectedColor)]: string           // Двустороннее связывание выбранного цвета
[customColors]: CustomColor[]       // Массив кастомных цветов для палитры

// 4. ДОПОЛНИТЕЛЬНЫЕ ПАРАМЕТРЫ
[avSize]: 'default' | 'compact'     // Размер компонента
[allowTransparent]: boolean         // Разрешить прозрачный цвет
[showInput]: boolean                // Показать поле ввода HEX
[showAlpha]: boolean                // Поддержка альфа-канала
[avTitle]: string                   // Заголовок компонента
[showWrapper]: boolean              // Показать обёртку
[showBorder]: boolean               // Показать границу
[defaultColor]: string              // Цвет по умолчанию

// 5. СОБЫТИЯ
(colorChange): string               // Событие изменения цвета

// 6. ТИПЫ ДАННЫХ
type PickerMode = 'custom-only' | 'picker-only' | 'custom-and-picker';

interface CustomColor {
  name: string;                     // Название цвета
  value: string;                    // HEX значение (#1890ff)
  category?: string;                // Категория (опционально)
}

interface PickerConfig {
  mode: PickerMode;
  customColors?: CustomColor[];
  allowTransparent?: boolean;
  defaultColor?: string;
  showInput?: boolean;
  showAlpha?: boolean;
}

// 7. ПРИМЕРЫ РЕЖИМОВ
// Только кастомные цвета
<av-picker
  mode="custom-only"
  [customColors]="[
    { name: 'Brand', value: '#1890ff', category: 'primary' },
    { name: 'Success', value: '#52c41a', category: 'status' }
  ]">
</av-picker>

// Только системный picker
<av-picker
  mode="picker-only"
  [showAlpha]="true">
</av-picker>

// Комбинированный режим
<av-picker
  mode="custom-and-picker"
  [customColors]="brandColors"
  [allowTransparent]="true"
  [showInput]="true">
</av-picker>

// 8. КАСТОМНЫЕ ЦВЕТА ПО КАТЕГОРИЯМ
const DESIGN_SYSTEM_COLORS: CustomColor[] = [
  // Primary colors
  { name: 'Primary', value: '#1890ff', category: 'primary' },
  { name: 'Success', value: '#52c41a', category: 'primary' },
  { name: 'Warning', value: '#faad14', category: 'primary' },
  { name: 'Error', value: '#ff4d4f', category: 'primary' },

  // Secondary colors
  { name: 'Purple', value: '#722ed1', category: 'secondary' },
  { name: 'Cyan', value: '#13c2c2', category: 'secondary' },
  { name: 'Orange', value: '#fa8c16', category: 'secondary' },

  // Neutral colors
  { name: 'White', value: '#ffffff', category: 'neutral' },
  { name: 'Gray', value: '#8c8c8c', category: 'neutral' },
  { name: 'Black', value: '#000000', category: 'neutral' }
];

// 9. ИНТЕГРАЦИЯ С ФОРМАМИ
import { FormControl } from '@angular/forms';

export class FormExample {
  colorControl = new FormControl('#1890ff');
}

<av-picker [(selectedColor)]="colorControl.value"></av-picker>

// 10. СТИЛИЗАЦИЯ
// Компонент поддерживает CSS переменные для кастомизации
.av-picker {
  --av-picker-bg: #1e293b;         // Фон обёртки
  --av-picker-border: #cbd5e1;     // Цвет границы
  --av-picker-radius: 8px;         // Скругление углов
}`;

export const COLOR_PALETTES = `// ========================================
// ГОТОВЫЕ ЦВЕТОВЫЕ ПАЛИТРЫ
// ========================================

// Палитра Aurora Design System
export const AURORA_COLORS: CustomColor[] = [
  { name: 'Primary', value: '#1890ff', category: 'primary' },
  { name: 'Success', value: '#52c41a', category: 'primary' },
  { name: 'Warning', value: '#faad14', category: 'primary' },
  { name: 'Error', value: '#ff4d4f', category: 'primary' },
  { name: 'Info', value: '#1890ff', category: 'primary' }
];

// Расширенная палитра
export const EXTENDED_COLORS: CustomColor[] = [
  ...AURORA_COLORS,
  { name: 'Purple', value: '#722ed1', category: 'secondary' },
  { name: 'Cyan', value: '#13c2c2', category: 'secondary' },
  { name: 'Pink', value: '#eb2f96', category: 'secondary' },
  { name: 'Orange', value: '#fa541c', category: 'secondary' },
  { name: 'Lime', value: '#a0d911', category: 'secondary' }
];

// Нейтральные цвета
export const NEUTRAL_COLORS: CustomColor[] = [
  { name: 'White', value: '#ffffff', category: 'neutral' },
  { name: 'Light Gray', value: '#f0f0f0', category: 'neutral' },
  { name: 'Gray', value: '#8c8c8c', category: 'neutral' },
  { name: 'Dark Gray', value: '#595959', category: 'neutral' },
  { name: 'Black', value: '#000000', category: 'neutral' }
];

// Градации основного цвета
export const BLUE_SHADES: CustomColor[] = [
  { name: 'Blue 1', value: '#e6f7ff', category: 'blue' },
  { name: 'Blue 2', value: '#bae7ff', category: 'blue' },
  { name: 'Blue 3', value: '#91d5ff', category: 'blue' },
  { name: 'Blue 4', value: '#69c0ff', category: 'blue' },
  { name: 'Blue 5', value: '#40a9ff', category: 'blue' },
  { name: 'Blue 6', value: '#1890ff', category: 'blue' },
  { name: 'Blue 7', value: '#096dd9', category: 'blue' },
  { name: 'Blue 8', value: '#0050b3', category: 'blue' },
  { name: 'Blue 9', value: '#003a8c', category: 'blue' },
  { name: 'Blue 10', value: '#002766', category: 'blue' }
];`;
